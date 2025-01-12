#!/usr/bin/perl
use Data::Dumper;               # Perl core module
use warnings;
use strict;
require './leningrad.pl';

sub collectWordsUsedByAStrong {
    my $strongNum = shift;
	my $version = shift;
	my $testament = shift;
	if ($testament eq "OT") {
		$testament = '%7Creference%3DGen-Mal';
	}
	elsif ($testament eq "NT") {
		$testament = '%7Creference%3DMatt-Rev';
	}
	else {
		$testament = "";
	}
	my $server = "http://localhost:8080";
	#if ( 	((($version eq "SBLG") || ($version eq "LXX")) && ($strongNum =~ m/^H\d/)) ||
	#		((($version eq "OHB") || ($version eq "THOT")) && ($strongNum =~ m/^G\d/)) ) {
	#		return;
	#}
	my $secondStrongNum = $strongNum;
	if ($strongNum =~ m/^([GH]\d{1,5})[A-Za-z]/) {
		$secondStrongNum = $1 . ',' . $secondStrongNum;
	}
	my $page = 1;
	my $numOfVerseFound = 0;
	my $numOfVerseFoundByServer = 0;
	my $noVersesInResponse = 0;
	my %wordCounts = ();
	do {
		my $command = 'curl -s ' . $server . '/rest/search/masterSearch/version%3D' . $version . $testament . '%7Cstrong%3D' . $strongNum . '//NONE/' . $page . '/' . $secondStrongNum . '/false//en?lang=en-US';
		my $output = `$command`;
		my @lines = split ('"osisId":"', $output);
		if ($#lines == 0) {
			if ($output !~ /masterVersion/) {
				print "x,x,";
			}
			else {
				print "0,0,";
			}
			return;
		}
		foreach (@lines) {
            my $curLine = $_;
			if ($_ =~ m/"total":(\d{1,5}),/) {
				$numOfVerseFoundByServer = $1;
				if ($numOfVerseFoundByServer == 0) { $noVersesInResponse = 1; }
			}
			else {
				$numOfVerseFound ++;
                my $dataToScan = $curLine;
				my $curVerse = "";
				my $posOfQuote = index($curLine, "\"");
				if ($posOfQuote > 1) {
					$curVerse = substr($curLine, 0, $posOfQuote);
				}
                while ($dataToScan ne "") {
                    if ($dataToScan =~ /<span[^>]+strong=(['"])/) {
						$dataToScan = $';
						my $quoteChar = $1;
						if ($dataToScan =~ /$quoteChar/) {
							my $strongNumsFound = $`;
							$dataToScan = $';
							if (index($strongNumsFound, $strongNum) > -1) {
								if ($dataToScan =~ />([^<]+)</) {
									my $foundWords = lc $1;
									$foundWords =~ s/“//g;
									$foundWords =~ s/"//g;
									$foundWords =~ s/’//g;
									$foundWords =~ s/'//g;
									$foundWords =~ s/\.//g;
									$foundWords =~ s/,//g;
									$foundWords =~ s/\)//g;
									$foundWords =~ s/\(//g;
									$foundWords =~ s/\[//g;
									$foundWords =~ s/\]//g;
									$foundWords =~ s/”//g;
									$foundWords =~ s/‘//g;
									$foundWords =~ s/!//g;
									$foundWords =~ s/{//g;
									$foundWords =~ s/}//g;
									$foundWords =~ s/\?//g;
									$foundWords =~ s/^\s+|\s+$//g;
									if (exists($wordCounts{$foundWords})) {
										$wordCounts{$foundWords} ++;
									} 
									else {
										$wordCounts{$foundWords} = 1;
									}
									$dataToScan = $';
								}
								else {
										print "found $strongNum - $strongNumsFound - $dataToScan\n";
												exit;
								}
							}
						}
                    }
                    else {
                        $dataToScan = "";
                    }
                }
			}
		}
		$page ++;
	} while (($numOfVerseFound < $numOfVerseFoundByServer) && ($noVersesInResponse == 0));
	foreach my $key (keys %wordCounts) {
		if (($key =~ /’s$/) || ($key =~ /s$/)) {
			my $withoutSEnding = $`;
			if (exists($wordCounts{$withoutSEnding})) {
				$wordCounts{$withoutSEnding} += $wordCounts{$key};
				delete($wordCounts{$key});
			}
		}
	}
	my $first = 1;
	my $totalForWord = 0;
	foreach my $name (sort { $wordCounts{$b} <=> $wordCounts{$a} or $a cmp $b } keys %wordCounts) {
		$totalForWord = $totalForWord + $wordCounts{$name};
	}
	print "$totalForWord,$numOfVerseFoundByServer,";
}

my $inputFile = $ARGV[0];
my $testament = $ARGV[1];
my $specificStrong = $ARGV[2];
open (FH, '<', $inputFile) or die "Could not open input file";
my %passagesForBasicStrong;
my %numOfPassagesForBasicStrong;
my @allVersions = ("ESV", "KJV", "NASB2020", "BSB", "HCSB", "RV_th", "WEB_th",
    "ASV-TH", "ChiUn", "ChiUns", "NASB1995", "RWebster", "spaBES2018eb", "AraSVD");
my @hebrewVersions = ("THOT", "OHB", "SP", "SPMT");
my @greekVersions = ("SBLG", "THGNT", "TR", "Byz", "WHNU", "Elzevir", "Antoniades", "KhmKCB", "LXX_th");
my @greekVersionsOTNT = ("ABEn", "ABGk");

print "Strong,";
foreach (@allVersions) {
    print "$_ - c,$_ - v,";
}
foreach (@hebrewVersions) {
    print "$_ - c,$_ - v,";
}
foreach (@greekVersions) {
    print "$_ - c,$_ - v,";
}
foreach (@greekVersionsOTNT) {
    print "$_ - c OT,$_ - v OT,$_ - c NT,$_ - v NT,";
}
print "\n";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
        my $lastStrongNum = $line;
        if ($lastStrongNum =~ m/^[GH]\d{1,5}/) {
            if ( (!defined $testament) ||
                (($testament eq "NT") && ($lastStrongNum =~ m/^G\d{1,5}/)) ||
                (($testament eq "OT") && ($lastStrongNum =~ m/^H\d{1,5}/)) ) {
				if ( (!defined $specificStrong) ||
					($lastStrongNum eq $specificStrong) ) {
                    print "$lastStrongNum,";
                    foreach (@allVersions) {
					    collectWordsUsedByAStrong($lastStrongNum, $_, "");
                    }
                    foreach (@hebrewVersions) {
                        if ($lastStrongNum =~ m/^H\d/) {
					        collectWordsUsedByAStrong($lastStrongNum, $_, "");
                        }
                        else { print ",,"; }
                    }
                    foreach (@greekVersions) {
                        if ($lastStrongNum =~ m/^G\d/) {
					        collectWordsUsedByAStrong($lastStrongNum, $_, "");
                        }
                        else { print ",,"; }
                    }
                    foreach (@greekVersionsOTNT) {
                        if ($lastStrongNum =~ m/^G\d/) {
					        collectWordsUsedByAStrong($lastStrongNum, $_, "OT");
					        collectWordsUsedByAStrong($lastStrongNum, $_, "NT");
                        }
                        else { print ",,,,"; }
                    }

                    print "\n";
				}
            }
		}
}
