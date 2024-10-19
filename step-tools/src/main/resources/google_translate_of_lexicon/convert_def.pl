#!/usr/bin/perl
use utf8;
use warnings;
use strict;
require './bookName.pl';

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

sub updtRef {
	our %bookName;
	our %altBookName;
	our %langBook;
	our $lang;
    my $string = shift;
	my $result = $string;
	if ($string =~ />/) {
		my $possibleResult = $` . ">"; # before match
		my $rest1 = $';
		if ($rest1 =~ /[\s\.]/) {
			my $rest2 = " " . $';
			my $curBookName = trim($`);
			if (($curBookName eq "1") || ($curBookName eq "2") || ($curBookName eq "2")) {
				$rest2 = trim($rest2);
				if ($rest2 =~ /[\s\.]/) {
					$rest2 = $';
					$curBookName = $curBookName . trim($`);
				}
			}
			if (exists($altBookName{$curBookName})) {
				$curBookName = $altBookName{$curBookName};
			}
			if (exists($bookName{$curBookName})) {
				
				if (exists($langBook{$lang . "-" . $curBookName})) {
					$result = $possibleResult . $langBook{$lang . "-" . $curBookName} . $rest2;
					$result =~ s/  / /g;
				}
			}
			else {
				print "cannot find book name $curBookName $string\n";
			}				
		}
		else {
			print "cannot find name of book $rest1 $string\n";
		}
	}
	else {
		print "no match $string\n";
	}
    return $result;
}

sub restoreFromOrigString {
	my $curStrong = shift;
	my $counter = shift;
	our %origStrings;
	my $length = scalar( @{ $origStrings{$curStrong} } );
	if ($counter >= $length) {
		print "wrong counter $curStrong $counter $length\n";
	}
	my $result = $origStrings{$curStrong}->[$counter];
	if ($result =~ /<ref=/) {
		$result = updtRef($result);
	}
    return $result;
}

sub restoreStrings {
	my $curStrong = shift;
	my $origString = shift;
    my $toReview = $origString;
	my $updatedString = "";
	$toReview =~ s/4\s11261/411261/g;
	$toReview =~ s/41\s1261/411261/g;
	$toReview =~ s/411\s261/411261/g;
	$toReview =~ s/4112\s61/411261/g;
	$toReview =~ s/41126\s1/411261/g;
	$toReview =~ s/41126\s1/411261/g;
	$toReview =~ s/411261,/411261/g;
	$toReview =~ s/411261\s/411261/g;
#	$toReview =~ s/(411261\d)\s/$1/g;
	while ($toReview ne "") {
		if ($toReview =~ /«\s?411261(\d+)\s?»/) {
			$updatedString .= $`; # before match
			$toReview = $'; # after match;
			$updatedString .= restoreFromOrigString($curStrong, $1);
		}
		else {
			$updatedString .= $toReview;
			$toReview = "";
		}
	}
	$updatedString =~ s/<\s?b\s>/<b>/ig;
	$updatedString =~ s/<\s?\\\s?b\s>/<\\b>/ig;
	$updatedString =~ s/<\s?br\s?>/<br>/ig;
	$updatedString =~ s/<\s?i\s>/<i>/ig;
	$updatedString =~ s/<\s?\\\s?i\s>/<\\i>/ig;
	return $updatedString;
}

my $number_args = $#ARGV + 1;  
if ($number_args != 2) {  
    print "Please provide the file name of:\n     1) The file from Google Translate\n     2) The file with the orignal strings.\n";  
    exit;  
}
use open qw( :std :encoding(UTF-8) );
my $googleTranslateFile = $ARGV[0];
open (IG, '<', $googleTranslateFile) or die "Could not open input file: $googleTranslateFile";
my $origStringsFile = $ARGV[1];
open (IO, '<', $origStringsFile) or die "Could not open input file: $origStringsFile";
my $outFile = $googleTranslateFile . ".tsv";
open (OF, '>', $outFile) or die "Could not open output file: $outFile";
binmode(IG, ":utf8");
binmode(IO, ":utf8");
binmode(OF, ":utf8");

our $lang;
if ($googleTranslateFile =~ /_([_a-zA-Z]+)\./) {
	$lang = $1;
	print "language is $lang\n";
}
else {
	print "Cannot determine language\n";
	exit;
}

my $lastStrongNum = "";
my $lastGloss = "";
our %origStrings = ();
while (<IO>) {
    chomp($_);
    $_ =~ s/\r//;
	my @parts = split("\t", $_);
	my $curStrong = shift @parts;
	$origStrings{$curStrong} = \@parts;
}
while (<IG>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
    my @parts = split("\t", $line);
	my $strong = $parts[0];
	my $gloss = $parts[2];
	my $def = $parts[4];
    if ($#parts != 4) {
		print "Exiting, not 4 element $#parts $line";
		exit;
    }
	my $restored = restoreStrings($strong, $def);
	if ($restored =~ /411261/) {
		print "fix $parts[0] $restored\n";
	}
    print OF "$strong\t$gloss\t" . $restored . "\n";
	my $outFileName = $lang . '_json\\' . $strong . '.json';
	open (OJ, '>', $outFileName) or die "Could not open output file: $outFileName";
	binmode(OJ, ":utf8");
	$gloss =~ s/"/\\"/g;
	$restored =~ s/"/\\"/g;
	print OJ '{"strong":"' . $strong . '","gloss":"' . $gloss . '","def":"' . $restored . '"}';
	close OJ;
}