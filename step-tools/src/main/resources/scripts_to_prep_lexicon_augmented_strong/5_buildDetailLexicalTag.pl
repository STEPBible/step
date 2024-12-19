#!/usr/bin/perl
use strict;                     # Good practice
use warnings;                   # Good practice

sub getLexTags {
    our %lexTags;
    my $unitedReason = "";
    my $lastStrongNum = "";
    my $stepGloss = "";
    my $strFreq = "0";
    my $strFreqList = "0";
    my $unicodeAccented = "";
    my $transliteration = "";
    my $searchResultRange = "";
    while (<FH>) {
        chomp($_);
        $_ =~ s/\r//;
        my $line = $_;
        if ($line =~ m/==========$/) {
            if (($unitedReason ne "") && ($lastStrongNum ne "")) {
                $lexTags{$lastStrongNum} = "[\"$unitedReason\",\"$lastStrongNum\",\"$stepGloss\",$strFreq,\"$unicodeAccented\",\"$transliteration\",\"$strFreqList\"]";
            }
            $lastStrongNum = "";
            $unitedReason = "";
            $stepGloss = "";
            $strFreq = "0";
            $strFreqList = "0";
            $unicodeAccented = "";
            $transliteration = "";
            $searchResultRange = "";
        }
        elsif ($line =~ m/^\@dStrNo=\t/) {
            $lastStrongNum = $';
            $unitedReason = "";
            $stepGloss = "";
            $strFreq = "0";
            $unicodeAccented = "";
            $transliteration = "";
        }
        elsif ($line =~ m/^\@STEP_UnitedReason=\t/) {
            $unitedReason = $';
        }
        elsif ($line =~ m/^\@StrFreq=\t/) {
            $strFreq = $';
            if ($strFreq !~ /^\d+$/) {
                $strFreq = 10000;
            }
        }
        elsif ($line =~ m/^\@StrFreqList=\t/) {
            $strFreqList = $';
        }
        elsif ($line =~ m/^\@StepGloss=\t/) {
            $stepGloss = $';
        }
        elsif ($line =~ m/^\@STEPUnicodeAccented=\t/) {
            $unicodeAccented = $';
        }
        elsif ($line =~ m/^\@STEPTranslit=\t/) {
            $transliteration = $';
        }        
    }
}

# main program

my $number_args = $#ARGV + 1;  
if ($number_args != 2) {  
    print "Please provide the two file names as command line arguments:\n";
    print "   1. lexicon file to analyze and add DetailLexicalTag\n";
    print "   2. lexicon file of the other language to analyze.\n";
    exit;  
}
my $inputFile = $ARGV[0];
open (FH, '<', $inputFile) or die "Could not open 1st input file";
my $outputFile = $inputFile . ".out";
open (OUT, '>', $outputFile) or die "Could not open output file";

our %lexTags = ();
getLexTags();
close FH;
$inputFile = $ARGV[1];
open (FH, '<', $inputFile) or die "Could not open 2nd input file";
getLexTags();
close FH;
$inputFile = $ARGV[0];
open (FH, '<', $inputFile) or die "Could not open 1st input file";

my $lastStrongNum = "";
my $lexicalGroup = "";
my $stepRelatedNos2 = "";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
    my $line = $_;
    if ($line =~ m/==========$/) {
        if (($lexicalGroup ne "") && ($lastStrongNum ne "")) {
            my @x = split(/[, ]/, $lexicalGroup);
            my $result = "";
            for(@x){
                if ($_ ne "") {
                    if (defined $lexTags{$_}) {
                        if ($result ne "") { $result .= ","; }
                        $result .= $lexTags{$_};
                    }
                    else {
                        print "no lex tag for $_\n";
                    }
                }
            }
            if ($result ne "") {
                print OUT "\@STEP_DetailLexicalTag=\t[" . $result . "]\n";
            }
        }
        $lastStrongNum = "";
        $lexicalGroup = "";
        $stepRelatedNos2 = "";
    }
    elsif ($line =~ m/^\@dStrNo=\t/) {
        $lastStrongNum = $';
        $lexicalGroup = "";
        $stepRelatedNos2 = "";
    }
    elsif ($line =~ m/^\@STEP_LexicalGroup=\t/) {
        $lexicalGroup = $';
    }
    elsif ($line =~ m/^\@STEPRelatedNos2=\t/) {
        $stepRelatedNos2 = $';
    }
    elsif ($line =~ m/^\@StrFreq=\t/) {
        if ($' =~ m/\D/) {
            print "strfreq change from: $line ";
            $line = "\@StrFreq=\t10000";
            print "to $line\n";
        }
    }
    if (($line ne "") && ($line !~ m/^\@STEP_DetailLexicalTag=\t/)) {
        print OUT $line . "\n";
    }
}
print "DetailLexicalTag has been added to: $outputFile\n";