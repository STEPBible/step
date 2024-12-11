#!/usr/bin/perl
use LWP::Simple qw($ua get);    # From CPAN
use JSON qw( decode_json );     # From CPAN
use strict;                     # Good practice
use warnings;                   # Good practice
use Scalar::Util qw(looks_like_number);
use Data::Dumper;               # Perl core module

sub testSearch {
    our %altBookName;
    my $strongNum = shift;
    my $passage1 = shift;
    my $passage2 = shift;
    my $originalArticle = shift;
    my $version = shift;
    my $server = shift;
    my $detailLexStrongs = shift;

  	$ua->timeout(30);
    my $firstPassage = "";
    my $lastPassage = "";
    if ($passage1 =~ /(.+\d)[abcd]$/) {
       $passage1 = $1;
    }
    my $searchJoins = "";
    my $searchString = "%7Cstrong%3D" . $strongNum;
    my $numOfJoins = 1;
    my %seen = ();
    $seen{$strongNum} = "";
    foreach my $elem (@$detailLexStrongs) {
        if (defined $elem) { 
            next if defined $seen{ $elem };
            $seen{ $elem } = "";
            $numOfJoins ++;
            if ($searchJoins eq "") {
                $searchJoins = "%7CsrchJoin=(1o2";
            }
            else {
                $searchJoins .= "o" . $numOfJoins;
            }
            $searchString .= "%7Cstrong%3D" . $elem;
            
        }
        else {
            print "\nelse $strongNum $elem\n";exit;
        }
    }
    if ($searchJoins ne "") {
        $searchJoins .= ")";
    }
    my $testURL = $server . '/rest/search/masterSearch/version%3D' . $version . 
        $searchJoins . 
        $searchString .
        '/NHVUG//////en?lang=en-US';
    #print "\n$testURL\n";
    
	my $json;
	while (not defined $json) {
		$json = get( $testURL );
		if (not defined $json) { 
			print "json not defined " . $passage1 . "\n";
			sleep 10;
		}
	}
 
    my $total = 0;
    my $lastPage = 0;
    if ($json ne "") {
        my $decoded_json = decode_json( $json );
        $total = $decoded_json->{'total'};
        if ($total == 0) {
            print $version . ",,," . $total . ",";
            return substr($originalArticle, index($originalArticle, "\@") + 1);
        }
        if ($total > 0) {
            my @dr = @{ $decoded_json->{'results'}};
            $firstPassage = $dr[0]->{'osisId'};
            if ($total > 1) {
                my $lastPage = int($total / 60);
                if ($lastPage > 0) {
                    $lastPage ++;
                    my $testURL2 = $server . '/rest/search/masterSearch/version%3D' . $version . 
                        $searchJoins . 
                        $searchString . 
                        '/NHVUG//' . $lastPage . '////en?lang=en-US';
                    my $json2;
                    while (not defined $json2) {
                        $json2 = get( $testURL2 );
                        if (not defined $json2) { 
                            print "json not defined " . $passage1 . "\n";
                            sleep 10;
                        }
                    }
                    my $decoded_json2 = decode_json( $json2 );
                    my $total2 = $decoded_json2->{'total'};
                    if ($total2 > 0) {
                        @dr = @{ $decoded_json2->{'results'}};
                    }
                }
                my $size = @dr - 1;
                if ($size > -1) {
                    $lastPassage = $dr[$size]->{'osisId'};
                }
            }
        }
    }
    print $version . "," . $firstPassage . "," . $lastPassage . "," . $total . ",";
    if ($firstPassage eq "") { return ""; }
    if ($lastPassage eq "") {
        return $firstPassage;
    }
    my @parts1 = split('\.', $firstPassage);
    my $bookName1 = $parts1[0];
    if (defined $altBookName{$bookName1}) {
        $bookName1 = $altBookName{$bookName1};
    }
    my @parts2 = split('\.', $lastPassage);
    my $bookName2 = $parts2[0];
    if (defined $altBookName{$bookName2}) {
        $bookName2 = $altBookName{$bookName2};
    }
    if ($bookName1 ne $bookName2) {
        return $firstPassage . "-" . $lastPassage;
    }    
    if ((defined $parts1[1]) && (defined $parts2[1])) {
        my $chapter1 = $parts1[1];
        my $chapter2 = $parts2[1];
        my $lastPart = "";
        if (defined $parts2[2]) {
            $lastPart = $parts2[2];
        }
        if ($chapter1 eq $chapter2) {
            return $firstPassage . "-" . $lastPart;
        }
        else {
            return $firstPassage . "-" . $chapter2 . "." . $lastPart;
        }
    }
    return $firstPassage . "-" . $lastPassage;
}

# main
my $number_args = $#ARGV + 1;  
if ($number_args != 2) {  
    print "Please provide the following as command line argument.\n";
    print "   1. the file name of the lexicon file (Greek or Hebrew), run the program once for Greek and then a second time for Hebrew\n";
    print "   2. the URL for the program to lookup the DStrong words\n";
    exit;  
}
my $inputFile = $ARGV[0];
my $url = $ARGV[1];
our %altBookName;
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
$altBookName{"Jud"} = "Jude";  # usually it is Judg, but it is different for STEP_Article
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
$altBookName{"Jos"} = "Josh";
$altBookName{"Sng"} = "Song";
$altBookName{"Jdg"} = "Judg";
$altBookName{"Rut"} = "Ruth";

open (FH, '<', $inputFile) or die "Could not open input file";
my $outputFile = $inputFile . ".out";
open (OUT, '>', $outputFile) or die "Could not open output file";

my $lastStrongNum = "";
my $stepGloss = '';
my $articleGloss = "";
my $originalArticle = "";
my $articleRef1 = "";
my $articleRef2 = "";
my $needSearchRange = 0;
my @detailLexStrongs = ();
print "Strong,STEP Gloss,Article,Art Ref1,Art Ref2,Lexical Group,";
print "Version,1st ref,Last ref,Total,";
print "Version,1st ref,Last ref,Total,";
print "SearchResultRange\n";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ m/==========$/) {
        if (($needSearchRange) || (($lastStrongNum ne "") && ($articleGloss ne "") &&
            ($articleRef1 ne ""))) {
            my $passage1 = "";
            my $passage2 = "";
            if ($articleRef1 ne "") {
                my @parts = split('\.', $articleRef1);
                my $bookName = $parts[0];
                if (defined $altBookName{$bookName}) {
                    $bookName = $altBookName{$bookName};
                }
                my $passage1 = $bookName; 
                if (defined $parts[1]) {
                    $passage1 .= '.' . $parts[1];
                    if (defined $parts[2]) {
                        $passage1 .= '.' . $parts[2];
                    }
                }
                my $passage2 = $articleRef2;
                if ($articleRef2 ne "") {
                    my @parts = split('\.', $articleRef2);
                    $bookName = $parts[0];
                    
                    if (defined $altBookName{$bookName}) {
                        $bookName = $altBookName{$bookName};
                    }
                    $passage2 = $bookName;
                    if (defined $parts[1]) {
                        $passage2 .= '.' . $parts[1];
                        if (defined $parts[2]) {
                            $passage2 .= '.' . $parts[2];
                        }
                    }
                }
            }
            print $lastStrongNum . "," . $stepGloss . "," . $originalArticle . 
                    "," . $passage1 . "," . $passage2 . "," . join("-", @detailLexStrongs) . ",";
            my @empty = ();
            my $searchRange1 = testSearch($lastStrongNum, $passage1, $passage2, $originalArticle, "ESV", $url, \@empty);
            my $searchRange2 = "";
            if (@detailLexStrongs > 0) {
                $searchRange2 = testSearch($lastStrongNum, $passage1, $passage2, $originalArticle, "ESV", $url, \@detailLexStrongs);
            }
            else {
                print ",,,,";
            }
            if (($searchRange1 ne "") || ($searchRange2 ne "")) {
                my $result = $searchRange1;
                if (($searchRange2 ne "") && ($searchRange1 ne $searchRange2)) {
                    $result .= "@" . $searchRange2;
                }
                print OUT "\@SearchResultRange=\t" . $result . "\n";
                print $result;
            }
            print "\n";
       }
    }
	elsif ($line =~ m/^\@dStrNo=\t/) {
        $lastStrongNum = $';
        $stepGloss = '';
        $articleGloss = "";
        $originalArticle = "";
        $articleRef1 = "";
        $articleRef2 = "";
        $needSearchRange = 0;
        @detailLexStrongs = ();
	}
	elsif ($line =~ m/^\@STEP_Article=\t/) {
        $originalArticle = $';
        if ($originalArticle =~ m/^([^@]+)\@/) {
            $articleGloss = $1;
            $articleRef1 = $';
            $articleRef2 = "";
            if ($articleRef1 =~ m/([\d\w.]+)-(\w+)/) {
                $articleRef1 = $1;
                $articleRef2 = $2;
                if ($articleRef2 =~ /^\d+$/) {
                    if ($articleRef1 =~ /^(.+)\.\d+$/) {
                        $articleRef2 = $1 . '.' . $articleRef2;
                    }
                }
            }
        }
        else {
            print "cannot find @ sign $lastStrongNum\n";
        }
	}
	elsif (($line =~ m/^\@StrFreq=\t0$/) || ($line =~ m/^\@StopWord=\ttrue$/)) {
        $lastStrongNum = "";
        $stepGloss = '';
        $articleGloss = "";
        $originalArticle = "";
        $articleRef1 = "";
        $articleRef2 = "";
        $needSearchRange = 0;
        @detailLexStrongs = ();
    }
	elsif ($line =~ m/^\@StepGloss=\t/) {
        $stepGloss = $';
        $stepGloss =~ s/[,=-]/ /g;
    }
   	elsif ($line =~ m/^\@STEP_LexicalGroup=\t/) {
        @detailLexStrongs = ();
        my @x = split(/[, ]/, $');
        for(@x){
            if ($_ ne "") {
                push(@detailLexStrongs, $_);
            }
        }
    }
   	elsif ( ($line =~ m/^\@STEPRelatedNos2=\t/) ||
            ($line =~ m/^\@SimilarlyNamed=\t/)) {
                $needSearchRange = 1;
    }
    if ($line ne "") {print OUT $line . "\n"; }
}
