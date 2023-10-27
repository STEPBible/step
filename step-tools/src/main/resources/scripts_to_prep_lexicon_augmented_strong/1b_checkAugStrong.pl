#!/usr/bin/perl

use warnings;
use strict;
use List::MoreUtils qw(firstidx);

my $number_args = $#ARGV + 1;  
if ($number_args != 1) {  
    print "Please provide the file name of the augstrongs file as a command line argument.\n";  
    exit;  
}
my $lastStrong = "";
my $inputFile = $ARGV[0];  
my %augStrong;
my %allAugInAStrong;
my %refs;
open (FH, '<', $inputFile) or die "Could not open input file: $inputFile";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ m/^\@AugmentedStrong=\t/) {
		if (!defined $augStrong{$'}) {
			$augStrong{$'} = 1;
            $lastStrong = $';
		}
		else {
            print "$' shows up more than one time\n";
            #exit;
		}
	}
  	if ($line =~ m/^\@LXXRefs=\t/) {
        $refs{$lastStrong} = $';
        my $nonAugStrong = $lastStrong;
        $nonAugStrong =~ s/.{1}$//;
		if (!defined $allAugInAStrong{$nonAugStrong}) {
			$allAugInAStrong{$nonAugStrong} = $lastStrong;
		}
		else {
			$allAugInAStrong{$nonAugStrong} .= "," . $lastStrong;
		}
    }
}
close (FH);

my $countWithSuffix = 0;
my $countWithAddedSuffix = 0;
my $countWithMoreThanOneAddedSuffix = 0;
my %strongHasSuffix;
foreach my $key (sort keys %allAugInAStrong) {
    my %passageAlreadyProsessedForStrong;
    my @spl = split(',', $allAugInAStrong{$key});
    foreach my $i (@spl) {
        my @refsToCheck = split(' ', $refs{$i});
        my %passageAlreadyProsessed;
        foreach my $currentRef (@refsToCheck) {
            if (defined $passageAlreadyProsessed{$currentRef}) {
                print "issue: $i has $currentRef more than once\n";
                next;
            }
            if (defined $passageAlreadyProsessedForStrong{$currentRef}) {
                print "issue: $key $i has $currentRef more than once\n";
                print "Please correct issue and then re-run this script\n";
                #exit;
            }
            $passageAlreadyProsessed{$currentRef} = 1;
            $passageAlreadyProsessedForStrong{$currentRef} = 1;
            if ($currentRef =~ /[A-Za-z]$/) {
                $countWithSuffix ++;
                my $noSuffix = $currentRef;
                $strongHasSuffix{$i} = 1;
                my $suffix = chop($noSuffix);
                my $withDash = $noSuffix . '-';
                foreach my $k (@spl) {
                    my @refsToCheck2 = split(' ', $refs{$k});
                    my $idx = firstidx { (($_ eq $noSuffix) || (index($_, $withDash) == 0)) } @refsToCheck2;
                    if ($idx > -1) {
#                        print "$i $k $idx $currentRef $noSuffix\n";
                        if ($refsToCheck2[$idx] =~ /-/) {
                            $refsToCheck2[$idx] = $refsToCheck2[$idx] . $suffix;
                            $countWithMoreThanOneAddedSuffix ++;
                        }
                        else {
                            $refsToCheck2[$idx] = $refsToCheck2[$idx] . '-' . $suffix;
                            $countWithAddedSuffix ++;
                        }
                        $refs{$k} = join " ", @refsToCheck2;
                    }
                }
            }
        }
        foreach $key (keys %passageAlreadyProsessed) {
            if ($key =~ /[A-Za-z]$/) {
                my $noSuffix = $key;
                chop($noSuffix);
                if (defined $passageAlreadyProsessed{$noSuffix}) {
                    print "issue: $i has $key and $noSuffix.  Please fix before processing\n";
                    exit;
                }
            }
        }
    }
}
my $outputFileName = $inputFile . '.out';
open (OF, '>', $outputFileName);
foreach my $key (sort keys %allAugInAStrong) {
    my @spl = split(',', $allAugInAStrong{$key});
    foreach my $l (@spl) {
        print OF "===============================\n" .
            "\@AugmentedStrong=\t" . $l . "\n" . 
            "\@LXXRefs=\t" . $refs{$l} . "\n";
    }
}
close(OF);
print "Updated augmented Strong information is in new file: $outputFileName\n";
#print "Statistics: references with suffix of an alpha character: $countWithSuffix added suffix: $countWithAddedSuffix More than one suffix: $countWithMoreThanOneAddedSuffix\n";
#foreach my $key (sort keys %strongHasSuffix) {
#        print "$key\n";
#}        
