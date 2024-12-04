#!/usr/bin/perl

use warnings;
use strict;

my $number_args = $#ARGV + 1;  
if ($number_args != 2) {  
    print "Please provide the file name of the lexicon file and a list of Strong to ignore as command line arguments.\n";  
    exit;  
}

my %lastVerse;
my %processedStrongNum;
my $inputFile = $ARGV[0];
my $outFile = $inputFile . ".out";
open (FH, '<', $inputFile) or die "Could not open input file: $inputFile";
open (OF, '>', $outFile) or die "Could not open output file: $outFile";
$inputFile = $ARGV[1];
open (FH2, '<', $inputFile) or die "Could not open input file: $inputFile";
my @strongToSkip = ();
while (<FH2>) {
    chomp($_);
	push(@strongToSkip, $_);
}

my $lastStrongNum = "";
my $currNum = "";
my @out = ();
my $foundStrNo = 0;
my $founddStrNo = 0;
my $dStrNoLine = "";
my $strNoLine = "";
my $lineNum = 0;
while (<FH>) {
	$lineNum ++;
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ /==============$/) {
		my $err = "";
		if ((!$foundStrNo) && ($lineNum > 1)) { $err = " StrNo"; print "Did not find $err around line $lineNum\n";}
		if (!$founddStrNo) { $err .= " dStrNo";}
		my $currentStrong = $dStrNoLine;
		$currentStrong =~ s/^\@dStrNo=\t//;
		if ( grep( /^$currentStrong$/, @strongToSkip ) ) {
 			print "found it $currentStrong\n";
		}
		else {
			for (@out) {
				my $outLine = $_;
				if ($outLine =~ /==============$/) {
					print OF $outLine . "\n";
					my $lineToPrint = $dStrNoLine;
					if ($lineToPrint ne "") {
						$lineToPrint =~ s/^\@dStrNo=\t/\@StrNo=\t/;
					}
					else { $lineToPrint = $strNoLine; }
					print OF $lineToPrint . "\n"; 
				}
				elsif ($outLine !~ /^\@StrNo=\t/) {
					print OF $outLine . "\n";
				}
			}
		}
		@out = ();
		$foundStrNo = 0;
		$founddStrNo = 0;
		$dStrNoLine = "";
		$strNoLine = "";
		$currNum = "";
	}
	elsif ($line =~ /^\@StrNo=\t/) {
		my $newLine = $';
		if ($currNum ne "") {
			print "unmatch StrNo: " . $currNum . ", linenum: $lineNum\n";
			$currNum = "";
			exit;
		}
		$foundStrNo = 1;
		$currNum = $newLine;
		$strNoLine = $line;
	}
	elsif ($line =~ m/^\@dStrNo=\t/) {
		my $newNum = $';
		my $newNumChop = $newNum;
		if ($newNum  =~ /([GH]\d+)[A-Z]$/) {
			$newNumChop = $1;
		}
		$dStrNoLine = $line;
		if (($currNum ne $newNumChop) &&
			(uc $currNum ne uc $newNum) && 
			($currNum !~ /^[GH]\d+[abcdefg]$/) &&
			($currNum !~ /^[GH]\d+$/)) {
				print "different num at: " . $lineNum . " " . $currNum . " " . $newNum . "\n";
		}
		$currNum = "";
		$founddStrNo = 1;
	}
	push @out, $line;		
}
my $currentStrong = $dStrNoLine;
$currentStrong =~ s/^\@dStrNo=\t//;
if ( grep( /^$currentStrong$/, @strongToSkip ) ) {
	print "found it $currentStrong\n";
}
else {
	for (@out) {
		my $outLine = $_;
		if ($outLine =~ /==============$/) {
			print OF $outLine . "\n";
			my $lineToPrint = $dStrNoLine;
			if ($lineToPrint ne "") {
				$lineToPrint =~ s/^\@dStrNo=\t/\@StrNo=\t/;
			}
			else { $lineToPrint = $strNoLine; }
			print OF $lineToPrint . "\n"; 
		}
		elsif ($outLine !~ /^\@StrNo=\t/) {
			print OF $outLine . "\n";
		}
	}
}
print "Updated lexicon information is in: $outFile\n";