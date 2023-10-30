#!/usr/bin/perl

use warnings;
use strict;
use List::MoreUtils qw(firstidx);

my $number_args = $#ARGV + 1;  
if ($number_args != 2) {  
    print "Please provide the file name of the augstrongs file and a list of Strong to ignore as command line arguments.\n";  
    exit;  
}
my $lastStrong = "";
my $inputFile = $ARGV[0];  
my %augStrong;
my %allAugInAStrong;
my %refs;
open (FH, '<', $inputFile) or die "Could not open input file: $inputFile";
my $outputFile = $inputFile . ".out";
open (OUT, '>', $outputFile) or die "Could not open output file";
$inputFile = $ARGV[1];
open (FH2, '<', $inputFile) or die "Could not open input file: $inputFile";
my @strongToSkip = ();
while (<FH2>) {
    chomp($_);
	push(@strongToSkip, $_);
}
close (FH2);
my $skip = 0;
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ m/^\@AugmentedStrong=\t/) {
		my $currentStrong = $';
		if ( grep( /^$currentStrong$/, @strongToSkip ) ) {
 			print "found it $currentStrong\n";
			$skip = 1;
		}
		else {
			$skip = 0;
		}
	}
	if (!($skip)) {
		print OUT $line . "\n";
	}
}
close (FH);
close(OUT);
