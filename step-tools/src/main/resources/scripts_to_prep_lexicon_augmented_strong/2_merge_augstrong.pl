#!/usr/bin/perl

use warnings;
use strict;
use List::MoreUtils qw(firstidx);

sub comp2($$) {
    my %altBookName;
    my @books = ("Gen", "Exod", "Lev", "Num", "Deut", 
        "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr",
        "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song",
        "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos",
        "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal",
        "Matt", "Mark", "Luke", "John",
        "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col",
        "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb",
        "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev");
    $altBookName{"Exo"} = "Exod";
    $altBookName{"Deu"} = "Deut";
    $altBookName{"Eze"} = "Ezek";
    $altBookName{"Est"} = "Esth";
    $altBookName{"Ezr"} = "Ezra";
    $altBookName{"Psa"} = "Ps";
    $altBookName{"Pro"} = "Prov";
    $altBookName{"1Sa"} = "1Sam";
    $altBookName{"2Sa"} = "2Sam";
    $altBookName{"1Ki"} = "1Kgs";
    $altBookName{"2Ki"} = "2Kgs";
    $altBookName{"Jud"} = "Judg";
    $altBookName{"Zec"} = "Zech";
    $altBookName{"Mat"} = "Matt";
    $altBookName{"Mar"} = "Mark";
    $altBookName{"Mrk"} = "Mark";
    $altBookName{"Luk"} = "Luke";
    $altBookName{"Jhn"} = "John";
    $altBookName{"Act"} = "Acts";
    $altBookName{"1Co"} = "1Cor";
    $altBookName{"2Co"} = "2Cor";
    $altBookName{"Php"} = "Phil";
    $altBookName{"1Th"} = "1Thess";
    $altBookName{"2Th"} = "2Thess";
    $altBookName{"1Ti"} = "1Tim";
    $altBookName{"2Ti"} = "2Tim";
    $altBookName{"Tit"} = "Titus";
    $altBookName{"Phm"} = "Phlm";
    $altBookName{"1Pe"} = "1Pet";
    $altBookName{"2Pe"} = "2Pet";
    $altBookName{"1Jn"} = "1John";
    $altBookName{"2Jn"} = "2John";
    $altBookName{"3Jn"} = "3John";
    $altBookName{"Joe"} = "Joel";
    $altBookName{"2Ch"} = "2Chr";
    $altBookName{"1Ch"} = "1Chr";
    $altBookName{"Ecc"} = "Eccl";
    $altBookName{"Jon"} = "Jonah";

    my $a = shift;
    my $b = shift;
    my @partsA = split('\.', $a);
    my @partsB = split('\.', $b);
    my $bookNameA = $partsA[0];
    if (defined $altBookName{$bookNameA}) {
        $bookNameA = $altBookName{$bookNameA};
    }
    my $bookNameB = $partsB[0];
    if (defined $altBookName{$bookNameB}) {
        $bookNameB = $altBookName{$bookNameB};
    }

    my $indexA = firstidx { $_ eq $bookNameA } @books;
    my $indexB = firstidx { $_ eq $bookNameB } @books;
    if ($indexA < 0) {
        print "Book does not exist $bookNameA\n";exit;
    }
    if ($indexB < 0) {
        print "Book does not exist $bookNameB\n";exit;
    }
    if ($indexA != $indexB) {
       return $indexA <=> $indexB;
    }
    if ($partsA[1] != $partsB[1]) {
        return $partsA[1] <=> $partsB[1];
    }
    if (($partsA[2] =~ /^\d+$/) && ($partsB[2] =~ /^\d+$/)) {
        return $partsA[2] <=> $partsB[2];
    }
    else {
        my $firstPartA = $partsA[2];
        my $secondPartA = "";
        if ($partsA[2] =~ /\(/) {
            $secondPartA = '(' . $&;
            $firstPartA = $`;
        }
        elsif ($partsA[2] =~ /[A-Za-z\-]+$/) {
            $secondPartA = $&;
            $firstPartA = $`;
        }
        my $firstPartB = $partsB[2];
        my $secondPartB = "";
        if ($partsB[2] =~ /\(/) {
            $secondPartB = '(' . $&;
            $firstPartB = $`;
        }
        elsif ($partsB[2] =~ /[A-Za-z\-]+$/) {
            $secondPartB = $&;
            $firstPartB = $`;
        }
        if ($firstPartA != $firstPartB) {
            return $firstPartA <=> $firstPartB;
        }
        return $secondPartA cmp $secondPartB;
    }
    return $a cmp $b;
}

my $number_args = $#ARGV + 1;
if ($number_args != 2) {
    print "Please provide the file name of the augstrongs files as a command line argument.\n";
    print "The first file is the augstrong without LXXRefs\n";
    print "The second file is the augstrong with LXXRefs\n";
    exit;  
}
my $lastStrong = "";
my $inputFile = $ARGV[1];  
my %refs;
open (FH, '<', $inputFile) or die "Could not open input file: $inputFile";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ m/^\@AugmentedStrong=\t/) {
        $lastStrong = $';
	}
  	if ($line =~ m/^\@LXXRefs=\t/) {
        my @references = split(' ', $');
        my @sorted = sort {
            comp2($a, $b);
        } @references;
        $refs{$lastStrong} = join (' ', @sorted);
    }
}
close (FH);

$lastStrong = "";
$inputFile = $ARGV[0];
open (FH, '<', $inputFile) or die "Could not open input file: $inputFile";
my $outputFileName = $inputFile . '.merge.out';
open (OF, '>', $outputFileName);
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ m/^============================/) {
        if (defined $refs{$lastStrong}) {
            print OF "\@LXXRefs=\t" . $refs{$lastStrong} . "\n";
            delete $refs{$lastStrong};
        }
		print OF $line . "\n";
	}
	elsif ($line =~ m/^\@AugmentedStrong=\t/) {
        $lastStrong = $';
		print OF $line . "\n";
	}
	elsif ($line =~ m/^\@References=\t/) {
#        print $' . "\n\n";
        my @references = split(' ', $');
        my @sorted = sort {
            comp2($a, $b);
        } @references;
        my $sortedRefs = join (' ', @sorted);
#        print $sortedRefs . "\n\n";
        print OF "\@References=\t" . $sortedRefs . "\n";
	}
    else {
        print OF $line . "\n";
    }
}
close (FH);

foreach my $key (sort keys %refs) {
#    print "The following are added to the output file:\n";
#    print "===============================\n";
#    print "\@AugmentedStrong=\t" . $key . "\n";
#    print "\@LXXRefs=\t" . $refs{$key} . "\n";
    print OF "===============================\n";
    print OF "\@AugmentedStrong=\t" . $key . "\n";
    print OF "\@LXXRefs=\t" . $refs{$key} . "\n";
}
close(OF);

print "Updated augmented Strong information is in new file: $outputFileName\n";
