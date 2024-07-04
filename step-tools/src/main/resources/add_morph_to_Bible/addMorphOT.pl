#
use strict;
use warnings;
use utf8;

our %altBookName;
$altBookName{"Exod"} = "Exo";
$altBookName{"Deut"} = "Deu";
$altBookName{"Ezek"} = "Eze";
$altBookName{"Esth"} = "Est";
$altBookName{"Ezra"} = "Ezr";
$altBookName{"Ps"} = "Psa";
$altBookName{"Prov"} = "Pro";
$altBookName{"1Sam"} = "1Sa";
$altBookName{"2Sam"} = "2Sa";
$altBookName{"1Kgs"} = "1Ki";
$altBookName{"2Kgs"} = "2Ki";
$altBookName{"Judg"} = "Jdg";
$altBookName{"Zech"} = "Zec";
$altBookName{"Matt"} = "Mat";
$altBookName{"Mark"} = "Mar";
$altBookName{"Mark"} = "Mrk";
$altBookName{"Luke"} = "Luk";
$altBookName{"John"} = "Jhn";
$altBookName{"Acts"} = "Act";
$altBookName{"1Cor"} = "1Co";
$altBookName{"2Cor"} = "2Co";
$altBookName{"Phil"} = "Php";
$altBookName{"1Thess"} = "1Th";
$altBookName{"2Thess"} = "2Th";
$altBookName{"1Tim"} = "1Ti";
$altBookName{"2Tim"} = "2Ti";
$altBookName{"Titus"} = "Tit";
$altBookName{"Phlm"} = "Phm";
$altBookName{"1Pet"} = "1Pe";
$altBookName{"2Pet"} = "2Pe";
$altBookName{"1John"} = "1Jn";
$altBookName{"2John"} = "2Jn";
$altBookName{"3John"} = "3Jn";
$altBookName{"Joel"} = "Joe";
$altBookName{"2Chr"} = "2Ch";
$altBookName{"1Chr"} = "1Ch";
$altBookName{"Eccl"} = "Ecc";
$altBookName{"Jonah"} = "Jon";
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
$altBookName{"Jude"} = "Jud";
$altBookName{"Josh"} = "Jos";
$altBookName{"Ruth"} = "Rut";
$altBookName{"Song"} = "Sng";
$altBookName{"Ezek"} = "Ezk";
$altBookName{"Joel"} = "Jol";
$altBookName{"Amos"} = "Amo";
$altBookName{"Obad"} = "Oba";
$altBookName{"Nah"} = "Nam";
$altBookName{"Zeph"} = "Zep";

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

sub trimStrong {
    my $string = shift;
	$string = trim($string);
	if ($string =~ /([GH])(\d{1,5})/) {
		return $1 . sprintf("%04d", $2);
	}
    return $string;
}

sub getOrderFromRootDStrong {
	my $rootStrongs = shift;
	my $strongNum = shift;
#	print "rootStrongs $rootStrongs, strong: $strongNum\n";
	my $strongOrder = 0;
	$rootStrongs =~ s/,/ /g;
	$rootStrongs =~ s/  / /g;
	my @splitStrongs = split(' ', $rootStrongs);
	for my $i (0 .. $#splitStrongs) {
		my @splitUnderscore = split("_", $splitStrongs[$i]);
		my $rootWord = trimStrong($splitUnderscore[0]);
		if ($rootWord ne $strongNum) { next; }
		my $numOfElements = scalar @splitUnderscore;
#		print "num: $numOfElements $rootStrongs\n";
		if ($numOfElements == 1) {
			return 0, $strongNum;
		}
		if ($numOfElements == 2) {
			$strongOrder = index("ABCDEFGHIJKLMNOPQRSTUVWXYZ", $splitUnderscore[1]) + 1;
			return $strongOrder, $strongNum;

		}
	}
	return $strongOrder, $strongNum;
}

sub removeDups {
	my @arrayOfWordsInfo = @{$_[0]};
	my %strongs = ();
	my %strongCount = ();
	for my $i (0 .. $#arrayOfWordsInfo) {
        # These are the parts that were added: $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $rootWord . ";" . $altStrong);
		my @partsOfPossibleDup1 = split(';', $arrayOfWordsInfo[$i]);
		if (exists($strongs{$partsOfPossibleDup1[0]})) {
			$strongCount{$partsOfPossibleDup1[0]} ++;
			my $previousOccurIndex = $strongs{$partsOfPossibleDup1[0]};
			if ($previousOccurIndex == -1) { next; }  # -1 means the strong number is already checked
            $strongs{$partsOfPossibleDup1[0]} = -1; # mark this strong number has occur more than once, has been checked
			my $allSame = 1;
            my @partsOfPossibleDup2 = split(';', $arrayOfWordsInfo[$previousOccurIndex]);
            if (($partsOfPossibleDup1[0] eq $partsOfPossibleDup2[0]) && # strongNum
                ($partsOfPossibleDup1[2] ne $partsOfPossibleDup2[2])) { # morph
                if (exists($partsOfPossibleDup1[4]) && ($partsOfPossibleDup2[4])) {
                    if ($partsOfPossibleDup1[4] ne $partsOfPossibleDup2[4]) { # altStrong
                        $allSame = 0;
                    }
                }
                else {
                    $allSame = 0;
                }
            }
            else {
                for my $j (($i + 1) .. $#arrayOfWordsInfo) {
	                my @partsOfPossibleDup2 = split(';', $arrayOfWordsInfo[$j]);
    	            if (($partsOfPossibleDup1[0] eq $partsOfPossibleDup2[0]) && # strongNum
                        ($partsOfPossibleDup1[2] ne $partsOfPossibleDup2[2]) ) { # morph
                        if (exists($partsOfPossibleDup1[4]) && ($partsOfPossibleDup2[4])) {
                            if ($partsOfPossibleDup1[4] ne $partsOfPossibleDup2[4]) { # altStrong
                                $allSame = 0;
                                last;
                            }
                        }
                        else {
                            $allSame = 0;
                   	        last;
                        }
					}
                }
			}
			if ($allSame) {
				my @parts3 = split(';', $arrayOfWordsInfo[$previousOccurIndex]);
				$arrayOfWordsInfo[$previousOccurIndex] = $parts3[0] . ";*;" . $parts3[2] . ";" . $parts3[3];
       			for my $k ($i .. $#arrayOfWordsInfo) {
                    my @parts4 = split(';', $arrayOfWordsInfo[$k]);
                    if ($partsOfPossibleDup1[0] eq $parts4[0]) { # strongNum
				        $arrayOfWordsInfo[$k] = $parts4[0] . ";*;" . $parts4[2] . ";" . $parts4[3];
                    }
                }
			}
		}
		else {
			$strongs{$partsOfPossibleDup1[0]} = $i;
			$strongCount{$partsOfPossibleDup1[0]} = 1;
		}
	}
	for my $i (0 .. $#arrayOfWordsInfo) {
		my @parts = split(';', $arrayOfWordsInfo[$i]);
		if ((exists($strongCount{$parts[0]})) && ($strongCount{$parts[0]} == 1)) {
			#print "xx: $i $parts[0], $parts[2], $parts[3], $strongCount{$parts[0]}\n";
		    $arrayOfWordsInfo[$i] = $parts[0] . ";*;" . $parts[2] . ";" . $parts[3];
		}
	}
    return @arrayOfWordsInfo;
}

sub getAltBookName {
	our %altBookName;
	my $ref = shift;
	my $pos = index($ref, '.');
	if ($pos > -1) {
		if (exists($altBookName{ substr($ref, 0, $pos) })) {
			return $altBookName{ substr($ref, 0, $pos) } . '.' . substr($ref, $pos + 1);
		}
	}
	return "";
}

sub getStrongsToSkip { # get a list of Strongs that have a different number in the DB Translators Amalgamated OT+NT DB and in the verse.
# When the count of a Strong word is different in the DB and the verse, the tag has to be added manually.
	my $ref = shift;
	my $verse = shift;
	my $len = length($verse);
	my $curPos = 0;
	my %strongCount = ();
	our %passages;
	our %strongWithOneMorph;
	our %gloss;
	while($curPos <= $len) {
		my $posStartLemmaTag = index($verse, '<w lemma=', $curPos);
		if ($posStartLemmaTag > -1) {
			$curPos = $posStartLemmaTag + 9;
			my $quote = substr($verse, $curPos, 1);
			$curPos ++;
			my $posOfQuote = index($verse, $quote, $curPos);
			if ($posOfQuote > -1) {
				my $curStrongs = substr($verse, $curPos, $posOfQuote - $curPos);
				$curStrongs =~ s/strong://g;
				my @strongsInWord = split(' ', $curStrongs);
				foreach (@strongsInWord) {
					my $currentStrong = trimStrong($_);
					if (!exists($strongWithOneMorph{$currentStrong})) {
						if (exists($strongCount{$currentStrong})) {
							$strongCount{$currentStrong} ++;
						}
						else {
							$strongCount{$currentStrong} = 1;
						}
					}
				}
				$curPos = $posOfQuote + 1;
			}
			else { print "no end quote for lemma tag\n"; }
		}
		else {
			last;
		}
	}
	my $strongsToSkip = "";
	OUTER: for my $strongNum (sort keys %strongCount) {
		my $countOfSameStrongInDB = 0;
		for my $i ( 0 .. $#{ $passages{$ref} } ) {
			my @parts = split(";", $passages{$ref}[$i]);
            # These are the parts that were added: $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $rootWord . ";" . $altStrong);
			if ($strongNum eq $parts[0]) {
				if (($parts[1] eq "*") || ($parts[1] eq "0")) { next OUTER; }
				$countOfSameStrongInDB ++;
			}
		}
		if (($countOfSameStrongInDB > 1) && ($countOfSameStrongInDB != $strongCount{$strongNum})) {
			$strongsToSkip .= " " . $strongNum;
            my $glossToPrint = "";
			if (exists($gloss{$strongNum})) {
				$glossToPrint = $gloss{$strongNum};
			}
			print ERROUT "$ref\t$strongNum\t$glossToPrint\t\tunmatch\t$strongCount{$strongNum} in Bible\t$countOfSameStrongInDB in DB\n";
		}
	}
	return $strongsToSkip;
}

sub addMorphToVerse {
    my $ref = shift;
	my $verse = shift;
	my $len = length($verse);
    my $updatedVerse = "";
	my $curPos = 0;
	my $lastOutPos = 0;
	my %strongCount = ();
	my $strongsToSkip = getStrongsToSkip($ref, $verse);
	our %gloss;
	while($curPos <= $len) {
		my $posStartLemmaTag = index($verse, '<w lemma=', $curPos);
		if ($posStartLemmaTag > -1) {
			$curPos = $posStartLemmaTag + 9;
			my $quote = substr($verse, $curPos, 1);
			$curPos ++;
			my $posOfQuote = index($verse, $quote, $curPos);
			if ($posOfQuote > -1) {
				my $curStrongs = substr($verse, $curPos, $posOfQuote - $curPos);
				$curPos = $posOfQuote + 1;
                $updatedVerse .= substr($verse, $lastOutPos, $curPos - $lastOutPos);
                $lastOutPos = $curPos;
				my $stringAfterStrongNum = substr($verse, $lastOutPos, 460); # Might need to add to this number if David keeps adding tags
                $stringAfterStrongNum =~ s/\n//g;
				my $pos1 = index($stringAfterStrongNum, ">");
				if ($pos1 > -1) {
					my $pos2 = index($stringAfterStrongNum, "<", $pos1);
					if ($pos2 > -1) {
						$stringAfterStrongNum = substr($stringAfterStrongNum, $pos1 + 1, $pos2 - $pos1 - 1);
					}
				}
				$curStrongs =~ s/strong://g;
                my @strongsInWord = split(' ', $curStrongs);
                my $newMorphs = "";
				my $numOfStrongsInWord = $#strongsInWord;
                foreach (@strongsInWord) {
                    my $currentStrong = trimStrong($_);
					if (index($strongsToSkip, $currentStrong) == -1) {
						if (exists($strongCount{$currentStrong})) {
							$strongCount{$currentStrong} ++;
						}
						else {
							$strongCount{$currentStrong} = 1;
						}
						my $morph = findMorph($ref, $currentStrong, $strongCount{$currentStrong}, $curStrongs, $stringAfterStrongNum);
#                        print "ref: $ref, $currentStrong, $strongCount{$currentStrong}, $curStrongs, $stringAfterStrongNum\n";
						if ($morph eq "") {
							my $glossToPrint = "";
							if (exists($gloss{$currentStrong})) {
								$glossToPrint = $gloss{$currentStrong};
							}
							print ERROUT "$ref\t$currentStrong\t$glossToPrint\t$stringAfterStrongNum\tnomorph\n";
							if ($numOfStrongsInWord > 1) {
								$morph = "NoMorph";
							}
						}
						if ($morph ne "") {
							if ($newMorphs ne "") {
								$newMorphs .= " ";
							}
							$newMorphs .= $morph;
						}
					}
                }
                if ($newMorphs ne "") {
                    $updatedVerse .= " morph=" . $quote . "TOS:" . $newMorphs . $quote;
                }
			}
			else { print "no end quote for lemma tag\n"; }
		}
		else {
			last;
		}
	}
    $updatedVerse .= substr($verse, $lastOutPos, $len - $lastOutPos);
	return $updatedVerse;
}

sub findMorph {
	my $ref = shift;
	my $strong = shift;
    my $occurrenceInVerse = shift;
	my $strongsInWordString = shift;
	my $stringAfterStrongNum = shift;
	our %passages;
	our %strongWithOneMorph;
	our %strongInDefCount;
	our %gloss;

    my @strongsInWord = split(" ", $strongsInWordString);
	my $foundOccurrenceInVerse = 0;
	my $numOfDefs = $#{ $passages{$ref} };
	for my $i ( 0 .. $numOfDefs ) {
		my @parts = split(';', $passages{$ref}[$i]);
		my $numOfParts = scalar @parts;
		if ($strong eq $parts[0]) {
			$foundOccurrenceInVerse ++;
			if ($parts[1] eq '*') { # * mean only one occurrence of this strong or same morph for all occurrence of this strong
				return $parts[2];
			}
            if ($numOfParts > 3) { # root DStrong is available, see if it can be match by root DStrong
                for my $j ( 0 .. $#strongsInWord ) {
					my $curStrongInWord = trimStrong($strongsInWord[$j]);
                    if (($curStrongInWord ne $strong) && (index($parts[3], $curStrongInWord) > -1)) {
						for my $k ( 0 .. $numOfDefs ) { # see if the root DStrong has only one occurrence
							my @parts2 = split(';', $passages{$ref}[$k]);
							if (($curStrongInWord eq $parts2[0]) && ($parts2[1] eq '*')) { # * mean only one occurrence of this strong or same morph for all occurrence of this strong
#								print "found through root DStrong $ref, $strong, $occurrenceInVerse, $parts[2]\n";exit;
								return $parts[2];
							}
						}
                    }
                }
            }
			if ($occurrenceInVerse == $foundOccurrenceInVerse) {
#				print "found through same num of occurrence $ref, $strong, $occurrenceInVerse, $parts[2]\n";
				return $parts[2];
			}
		}
        elsif ($numOfParts > 4) { # alternative Strong is available
            my $altStrong = $parts[4];
            if (index($altStrong, $strong) > -1) {
                my @spltAltStrong = split("_", $altStrong);
                if (scalar @spltAltStrong == 2) {
                    my $positionIndicator = uc $spltAltStrong[1];
                    my $altStrongPos = index("ABCDEFGHIJKLMNOPQRSTUVWXYZ", $positionIndicator) + 1;
                    if ($altStrongPos == -1) { print "unexpected position indicator for alt strong $altStrong\n"; exit;}
                    if ($occurrenceInVerse == $altStrongPos) {
#                        print "found match of alt Strong with pos indicator $ref, $strong, $altStrong, $occurrenceInVerse\n";
                        return $parts[2];
                    }
                }
                else {
#                    print "found match of alt Strong $ref, $strong, $altStrong, $occurrenceInVerse\n";
                    return $parts[2];
                }
            }
        }
    }
	if (exists($strongWithOneMorph{$strong})) {
		if ($strongInDefCount{$strong} > 10) {
			print WARNOUT "found at end,$ref, $strong $occurrenceInVerse, $strongWithOneMorph{$strong}, $strongInDefCount{$strong}, $gloss{$strong}, $stringAfterStrongNum\n";
			return $strongWithOneMorph{$strong};
		}
	}
	return "";
}

sub augmentVerse {
	our %passages;
	our %altPassage1;
	our %altPassage2;
	my $origRef = shift;
    my $verse = shift;
    my $name_of_file_without_morph = shift;
    my $ref = $origRef;
	if (!exists $passages{$ref}) {
		$ref = getAltBookName($ref);
    }

    if ($name_of_file_without_morph =~ /THOT/) {
        if (exists $altPassage2{$ref}) {
            my $altRef = $altPassage2{$ref};
            if (($altRef ne $ref) && (exists $passages{$altRef})) {
                #print "THOT ref: $ref alt: $altRef\n";
                $ref = $altRef;
            }
        }
    }
    elsif (!exists $passages{$ref}) {
		my $updatedRef = 0;
        if (exists $altPassage1{$ref}) {
            my $altRef = $altPassage1{$ref};
            print "ref: $ref alt: $altRef\n";
            if (exists $passages{$altRef}) {
                $ref = $altRef;
				$updatedRef = 1;
            }
        }
		if (!$updatedRef) {
	        return $verse;
		}
    }
    return addMorphToVerse($ref, $verse);
}

sub checkAndAddAltPassage {
	our %altBookName;
	our %altPassage1;
	our %altPassage2;
    my $ref = shift;
	my $first = "";
	my $second = "";
	if    ($ref =~ /([^(]+)\(([^)]+)\)/) {
		$first = $1;
		$second = $2;
	}
	elsif ($ref =~ /([^[]+)\[([^]]+)\]/) {
		$first = $1;
		$second = $2;
	}
	elsif ($ref =~ /([^{]+)\{([^}]+)\}/) {
		$first = $1;
		$second = $2;
	}
	if ($first eq "") {
		if ($ref !~ /^[123]?[A-Za-z]{2,6}\.\d{1,3}\.\d{1,3}$/) {
			print "error $ref is not in expected format;\n";
			exit;
		}
		return $ref;
	}
	if ($first !~ /^[123]?[A-Za-z]{2,6}\.\d{1,3}\.\d{1,3}$/) {
		print "error $first is not in expected format;\n";
		exit;
	}
	my $pos = index($first, '.');
	$second = substr($first, 0, $pos + 1) . $second;
	$altPassage1{$first} = $second;
	$altPassage2{$second} = $first;
	return $first;	
}

sub processMorphLine {
	my $line = shift;
	our $lastPassage;
	our %passages;
	our @arryOfWordsInfo;
	our %strongWithOneMorph;
	our %strongInDefCount;
	our %gloss;
	my @sp1 = split("\t", $line);
	my $numOfElement1 = scalar @sp1;
	if ($numOfElement1 < 12) { return; }
	my @nextLines = ();
	my @multiStrongs = split(/[\/\\]/, $sp1[4]); # dStrongs in column E (4)
	my $numOfStrongs = scalar @multiStrongs;
	my $morphLanguageCode = "";
	if ($numOfStrongs > 1) {
		my @multiMorphs = split(/[\/\\]/, $sp1[5]); # Grammar in column F (5)
		my $numOfMorphs = scalar @multiMorphs;
		if ($numOfMorphs > 1) {
			$morphLanguageCode = substr($sp1[5], 0, 1);
			if (($morphLanguageCode ne "H") && ($morphLanguageCode ne "A")) { # unrecognized language code
				print "cannot find language code $sp1[5]\n";
				$morphLanguageCode = "";
			}
			my $min = ($numOfStrongs, $numOfMorphs)[$numOfStrongs > $numOfMorphs];
			for (my $i = 1; $i < $min; $i++) {
				if (trim($multiStrongs[$i]) eq "") { next; }
				my $curMorph = trim($multiMorphs[$i]);
				my $curMorphLangCode = substr($curMorph, 0, 1);
				$curMorph = $morphLanguageCode . $curMorph;
				my $newLine = $sp1[0] . "\t" . $sp1[1] . "\t" . $sp1[2] ."\t" . $sp1[3] ."\t" .
					trim($multiStrongs[$i]) . "\t" . $curMorph . "\t" . $sp1[6] . "\t" . $sp1[7] . "\t" . $sp1[8] . 
					"\t" . $sp1[9] . "\t" . $sp1[10] . "\t" . $sp1[11];
#				print "newline: $multiStrongs[$i], $curMorph, $newLine\n";
				push(@nextLines, $newLine);
			}
			$sp1[4] = trimStrong($multiStrongs[0]);
			$sp1[5] = trim($multiMorphs[0]);
		}
	}
#	print "origLine: $sp1[4] $sp1[5]\n";
	my @sp2 = split("#", $sp1[0]); # ref in column A (0)
	my $numOfElement2 = scalar @sp2;
	if ($numOfElement2 != 2) { return; }
	my $ref = checkAndAddAltPassage($sp2[0]);
	if ($lastPassage eq "") {
		$lastPassage = $ref;
	}
	elsif ($ref ne $lastPassage) {
		#if ($lastPassage eq "Rut.3.5") {
		#	for my $i (0 .. $#arryOfWordsInfo) {
		#		print "$lastPassage $ref $arryOfWordsInfo[$i]\n";
		#	}
		#	exit;
		#}
        $passages{$lastPassage} = [ removeDups(\@arryOfWordsInfo) ];
		$lastPassage = $ref;
		@arryOfWordsInfo = ();
	}
	my $morph = $sp1[5];
	my $strongNum = trimStrong($sp1[4]);
	if ($strongNum eq "") { return; }
	if ($sp1[3] ne "") {
		$gloss{$strongNum} = $sp1[3];
		my $pos = index($sp1[3], "=");
		if ($pos > -1) {
			$gloss{$strongNum} = substr($sp1[3], $pos + 1);
		}
	}
	my ($strongOrder, $rootWord) = getOrderFromRootDStrong($sp1[8], $strongNum); # 8th element is "Root dStrong+Instance"
#		print "strongorder $strongOrder, $rootWord\n";
	if ($strongOrder == -1) { return; }	
    my $altStrong = trim($sp1[9]);
#	print $ref . " " . $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $rootWord . ";" . $altStrong . "\n";
	push(@arryOfWordsInfo, $strongNum . ";" . $strongOrder . ";" . $morph . ";" . $rootWord . ";" . $altStrong);
	if ($morph ne "") {
		if (exists($strongWithOneMorph{$strongNum})) {
			if (index($strongWithOneMorph{$strongNum}, ' ' . $morph . ' ') == -1) {
				$strongWithOneMorph{$strongNum} .= $morph . ' ';
			}
			$strongInDefCount{$strongNum} ++;
		}
		else {
			$strongWithOneMorph{$strongNum} = ' ' . $morph . ' ';
			$strongInDefCount{$strongNum} = 1;
		}
	}
	for (@nextLines) {
		processMorphLine($_);
	}
}

# main
my $num_args = $#ARGV + 1;
if ($num_args != 3) {
    print "\nUsage: name.pl name_of_file_with_morph name_of_Bible_without_morph name_of_output_file\n";
    exit;
}
my $name_of_file_with_morph = $ARGV[0];
my $name_of_file_without_morph = $ARGV[1];
my $output_file_name = $ARGV[2];
use open ':std', ':encoding(UTF-8)';
# Read whole file in memory
open MORPH_IN, "<", $name_of_file_with_morph or die "can't open file with morph\n";
my $outFile =  $output_file_name . '.txt';
open (OUT, ">:encoding(UTF-8)", $outFile);
my $errorFile = $output_file_name . ".err.txt";
open (ERROUT, ">:encoding(UTF-8)", $errorFile);
my $warnFile = $output_file_name . ".warn.txt";
open (WARNOUT, ">:encoding(UTF-8)", $warnFile);
print WARNOUT "";
my $lastVerse = "";
our @arryOfWordsInfo = ();
our %passages = ();
our %altPassage1 = ();
our %altPassage2 = ();
our $lastPassage = "";
our $foundG3165 = 0;
our $foundG1473 = 0;
our $foundBoth = " ";
our %strongWithOneMorph = ();
our %strongInDefCount = ();
our %gloss = ();
while (my $line = <MORPH_IN>) {
    chomp($line);
	if ($line =~ /^#/) {
		next;
	}
	processMorphLine($line);
}
$passages{$lastPassage} = [ removeDups(\@arryOfWordsInfo) ];
close (MORPH_IN);
for (keys %strongWithOneMorph) {
	my $trimmedStrongWithMorph = trim($strongWithOneMorph{$_});
	my @morphs = split(' ', $trimmedStrongWithMorph);
	my $num = scalar @morphs;
	if ($num > 1) { # more than one morph
		delete $strongWithOneMorph{$_};
		delete $strongInDefCount{$_};
	}
	else {
		$strongWithOneMorph{$_} = $trimmedStrongWithMorph;
	}
}
#for (keys %strongWithOneMorph) {
#	print "$_ only has morph of $strongWithOneMorph{$_}\n";
#}

#for(keys %passages){
#	my $ref = $_;
#		print("words of $ref is:\n");
#		for my $i ( 0 .. $#{ $passages{$ref} } ) {
#			print "     $i = $passages{$ref}[$i]\n";
#		}
#		print "\n";
#}
#exit;
open BIBLE_IN, '<:encoding(UTF-8)', $name_of_file_without_morph;
my $allLines = "";
while (my $line = <BIBLE_IN>) {
	$allLines .= $line;
}
close BIBLE_IN;
my $len = length($allLines);
my $curPos = 0;
my $lastOutPos = 0;
while($curPos <= $len) {
	my $posStartVerseTag = index($allLines, ' sID=', $curPos);
	my $posOfFoundTag = $posStartVerseTag;
	my $posChapterTag = index($allLines,    '<chapter osisID=', $curPos);
	my $isChapterTag = 0;
	if (($posChapterTag > -1) && ($posChapterTag < $posStartVerseTag)) {
		$isChapterTag = 1;
		$posOfFoundTag = $posChapterTag;
	}
	if ($posOfFoundTag > -1) {
		if ($isChapterTag) { $curPos = $posOfFoundTag + 16; }
		else { $curPos = $posOfFoundTag + 5; }
		my $quote = substr($allLines, $curPos, 1);
		$curPos ++;
		my $posOfQuote = index($allLines, $quote, $curPos);
		if ($posOfQuote > -1) {
			my $curRef = substr($allLines, $curPos, $posOfQuote - $curPos);
			if ($isChapterTag) {
				if ($curRef !~ /^Ps\./) {
					next; # There should be no verse 0 that need processing outside of Psalms.
				}
				$curRef .= '.0';
			}
			$curPos = $posOfQuote + 1;
			my $posOfTagClosure;
			if ($isChapterTag) { 
				$posOfTagClosure = index($allLines, '>', $curPos);
				if ($posOfTagClosure > -1) { $curPos = $posOfTagClosure + 1; }
			}
			else {
				$posOfTagClosure = index($allLines, '/>', $curPos);
				if ($posOfTagClosure > -1) { $curPos = $posOfTagClosure + 2; }
			}
			if ($posOfTagClosure > -1) {
				my $posOfStartOfVerse = $curPos;
				if ($isChapterTag) { 
					my $endPosOfTextBeforeVerseOne = index($allLines, '<verse sID=', $curPos); # the first one found would be verse 1, not verse 0.  Verse 0 does not have <verse sID
					if ($endPosOfTextBeforeVerseOne > -1) {
						$endPosOfTextBeforeVerseOne --;
						print OUT substr($allLines, $lastOutPos, $posOfStartOfVerse - $lastOutPos);
						print OUT augmentVerse($curRef, substr($allLines, $posOfStartOfVerse, $endPosOfTextBeforeVerseOne - $posOfStartOfVerse), $name_of_file_without_morph);
						$lastOutPos = $curPos = $endPosOfTextBeforeVerseOne;
					}
				}
				else { 
					my $posOfEndVerse = index($allLines,               '<verse eID=', $curPos);
					if ($posOfEndVerse > -1) {
						$curPos = $posOfEndVerse + 11;
						my $quote = substr($allLines, $curPos, 1) . "/>";
						$curPos ++;
						$posOfQuote = index($allLines, $quote, $curPos);
						if ($posOfQuote > -1) {
							my $endRef = substr($allLines, $curPos, $posOfQuote  - $curPos);
							$curPos = $posOfQuote + 1;
							if ($curRef ne $endRef) {
								print "unmatch $curRef eR: $endRef\n";
								exit;
							}
							else {
								print OUT substr($allLines, $lastOutPos, $posOfStartOfVerse - $lastOutPos);
								print OUT augmentVerse($curRef, substr($allLines, $posOfStartOfVerse, $posOfEndVerse - $posOfStartOfVerse), $name_of_file_without_morph);
								print OUT substr($allLines, $posOfEndVerse, $posOfQuote + 3 - $posOfEndVerse);
								$lastOutPos = $posOfQuote + 3;
							}
						}
						else { print "no end quote for end verse tag\n"; }
					}
					else { print "no end verse $curRef\n"; }
				}
			}
			else { print "cannot curPosfind end tag\n"; }
		}
		else { print "unmatch quote for begin verse tag\n"; }
	}
	else {
		last;
	}
}
print OUT substr($allLines, $lastOutPos, $len - $lastOutPos);
