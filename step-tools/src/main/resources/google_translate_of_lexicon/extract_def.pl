#!/usr/bin/perl
use utf8;
use warnings;
use strict;


sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

sub trimLeadingChars {
	my $string = shift;
	$string =~ s/^[-=\s\t]+//g;
	return $string;
}

sub replaceWithMarker {
	our $mrkrCount;
	our @mrkrOrig;
	push (@mrkrOrig, shift);
	my $result = "«411261" . $mrkrCount . "»";
	$mrkrCount ++;
    return $result
}

sub removeStringNotToTranslate {
	my $stringToReview = shift;
	my $pattern1 = shift;
	my $pattern2 = shift;
	our $mrkrCount;
	our @mrkrOrig;
	my $updatedString = "";
	while ($stringToReview ne "") {
		if ($stringToReview =~ /$pattern1/i) {
			$updatedString .= $`; # before match
			my $match1 = $&;
			if ($pattern2 ne "") {
				my $afterMatch = $';
				if ($afterMatch =~ /$pattern2/i) {
					my $beforeMatch = $`;
					$updatedString .= replaceWithMarker($match1 . $beforeMatch . $&); # match1, before match, match
					$stringToReview = $'; # after match;
				}
				else {
					print "cannot find end of ref $afterMatch\n";
					exit;
				}
			}
			else {
				$updatedString .= replaceWithMarker($match1);
				$stringToReview = $'; # after match;
			}
		}
		else {
			$updatedString .= $stringToReview;
			$stringToReview = "";
		}
	}
	return $updatedString;
}

my $number_args = $#ARGV + 1;  
if ($number_args != 1) {  
    print "Please provide the file name of the lexicon file as a command line argument.\n";  
    exit;  
}

my $inputFile = $ARGV[0];
open (FH, '<', $inputFile) or die "Could not open input file: $inputFile";
my $outFile = $inputFile . ".strong.tsv";
open (OFS, '>', $outFile) or die "Could not open output file: $outFile";
$outFile = $inputFile . ".gloss.tsv";
open (OFG, '>', $outFile) or die "Could not open output file: $outFile";
$outFile = $inputFile . ".def.tsv";
open (OFD, '>', $outFile) or die "Could not open output file: $outFile";
$outFile = $inputFile . ".orig.string";
open (OFO, '>', $outFile) or die "Could not open output file: $outFile";
binmode(FH, ":utf8");
binmode(OFG, ":utf8");
binmode(OFD, ":utf8");
binmode(OFO, ":utf8");
my $lastStrongNum = "";
my $lastGloss = "";
our $mrkrCount;
our @mrkrOrig;
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ /^\@dStrNo=\t/) {
		$lastStrongNum = trim($');
	}
	elsif ($line =~ m/^\@StepGloss=\t/) {
		$lastGloss = trim($');
	}
	elsif (($line =~ m/^\@MounceMedDef=\t/) || ($line =~ m/^\@BdbMedDef=\t/)) {
		my $origDef = trimLeadingChars(trim($'));
		$mrkrCount = 0;
		@mrkrOrig = ();
		my $updatedString = removeStringNotToTranslate($origDef, "<ref", '<\/ref>');
		if ($line =~ m/^\@BdbMedDef=\t/) {
			$updatedString = removeStringNotToTranslate($updatedString, "<i>", '<\/i>'); # transliteration in OT def
		}
		$updatedString = removeStringNotToTranslate($updatedString, "<greek>", '<\/greek>');
		$updatedString = removeStringNotToTranslate($updatedString, "<i>", "");
		$updatedString = removeStringNotToTranslate($updatedString, "</i>", "");
#		$updatedString = removeStringNotToTranslate($updatedString, "<b>", "");
#		$updatedString = removeStringNotToTranslate($updatedString, "</b>", "");
#		$updatedString = removeStringNotToTranslate($updatedString, "<br />", "");
#		$updatedString = removeStringNotToTranslate($updatedString, "<br>", "");
		$updatedString = removeStringNotToTranslate($updatedString, "1\\d:[12345]\\d", "");
		$updatedString = removeStringNotToTranslate($updatedString, "1\\d:\\d", "");
		$updatedString = removeStringNotToTranslate($updatedString, "2[0123]:[12345]\\d", "");
		$updatedString = removeStringNotToTranslate($updatedString, "2[0123]:\\d", "");
		$updatedString = removeStringNotToTranslate($updatedString, "\\d:[12345]\\d", "");
		$updatedString = removeStringNotToTranslate($updatedString, "\\d:\\d", "");
		print OFS $lastStrongNum . "\n";
		print OFG $lastGloss . "\n";
		print OFD $updatedString . "\n";
		if ($mrkrCount > 0) {
			print OFO $lastStrongNum . "\t";
			foreach (@mrkrOrig) {
				print OFO $_ . "\t";
			}
			print OFO "\n";
		}
	}
}
print "Extracted definition is in: $outFile\n";