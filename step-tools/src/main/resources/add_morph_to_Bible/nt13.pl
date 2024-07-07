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

sub removeDups {
	# Below is the line that create the array.
    #  p u s h (@arryOfWordsInfo, $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $relatedWordInfo . ";" . $sStrongInstance . ";" . $additionalInfo);
    our %versionSpecificAltStrong;
	my @arrayOfWordsInfo = @{$_[0]};
    my $tmp = shift;
    my $ref = shift;
	my %strongs = ();
	for my $i (0 .. $#arrayOfWordsInfo) {
		my @partsOfPossibleDup1 = split(';', $arrayOfWordsInfo[$i]);
		if (exists($strongs{$partsOfPossibleDup1[0]})) {
			my $previousOccurIndex = $strongs{$partsOfPossibleDup1[0]};
			if ($previousOccurIndex == -1) { next; }  # -1 means the strong number is already checked
			$strongs{$partsOfPossibleDup1[0]} = -1; # mark this strong number has occur more than once, has been checked
			my $allSame = 1;
            my @partsOfPossibleDup2 = split(';', $arrayOfWordsInfo[$previousOccurIndex]);
            if (($partsOfPossibleDup1[0] eq $partsOfPossibleDup2[0]) && # strongNum
				($partsOfPossibleDup1[2] ne $partsOfPossibleDup2[2])) { # morph
                $allSame = 0;
            }
            else {
                for my $j (($i + 1) .. $#arrayOfWordsInfo) {
					my @partsOfPossibleDup2 = split(';', $arrayOfWordsInfo[$j]);
					if (($partsOfPossibleDup1[0] eq $partsOfPossibleDup2[0]) && # strongNum
						($partsOfPossibleDup1[2] ne $partsOfPossibleDup2[2])) { # morph
						$allSame = 0;
						last;
					}
				}
			}
			if ($allSame) {
				my @parts3 = split(';', $arrayOfWordsInfo[$previousOccurIndex]);
				$arrayOfWordsInfo[$previousOccurIndex] = $parts3[0] . ";*;" . $parts3[2] . ";" . $parts3[3] . ";";
				my $numOfParts3 = scalar @parts3;
				if ($numOfParts3 > 4) {
					$arrayOfWordsInfo[$previousOccurIndex] .= $parts3[4] . ";"; 
					if ($numOfParts3 > 5) {
						$arrayOfWordsInfo[$previousOccurIndex] .= $parts3[5];
					}
				}
			}
		}
		else {
			$strongs{$partsOfPossibleDup1[0]} = $i;
		}
	}
	for my $i (0 .. $#arrayOfWordsInfo) {
		my @parts = split(';', $arrayOfWordsInfo[$i]);
        my $key = $ref . "-" . $parts[0];
        if (exists($versionSpecificAltStrong{$key})) {
#            print "FOUND key $key -$versionSpecificAltStrong{$key}-\n";
#            print "1: $arrayOfWordsInfo[$i]\n";
            my $numOfParts = scalar @parts;
            my $part6 = "";
            if ($numOfParts == 6) {
                $part6 = $parts[5];
            }
            my $parts5 = $parts[4];
            $parts5 =~ s/$parts[0]/$versionSpecificAltStrong{$key}/;
            $arrayOfWordsInfo[$i] = $versionSpecificAltStrong{$key} . ";" . $parts[1] . ";" . $parts[2] . ";" . $parts[3] . ";" . $parts5 . ";" . $part6;
#            push(@arrayOfWordsInfo, $versionSpecificAltStrong{$key} . ";" . $parts[1] . ";" . $parts[2] . ";" . $parts[3] . ";" . $parts[4] . ";" . $part6);
#            print "2: $arrayOfWordsInfo[$i]\n";
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
    our %versionSpecificWordOccurrence;
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
	my $strongsWithDifferentOccurrences = "";
    my $strongsWithVersionSpecificOccurrences = "";
    if (exists($strongCount{"G3391"}) && exists($strongCount{"G1520"})) {
        print "$ref adding " . $strongCount{"G3391"} . " to " . $strongCount{"G1520"} . "\n";
        $strongCount{"G1520"} += $strongCount{"G3391"};
        delete $strongCount{"G3391"};
    }
	OUTER: for my $strongNum (sort keys %strongCount) {
		my $countOfSameStrongInDB = 0;
		my $countOfSameSStrongInstance = 0;
		for my $i ( 0 .. $#{ $passages{$ref} } ) {
			my @parts = split(";", $passages{$ref}[$i]);
			# Below is the line that create the array.
		    #  p u s h (@arryOfWordsInfo, $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $relatedWordInfo . ";" . $sStrongInstance . ";" . $additionalInfo);
			if ($strongNum eq $parts[0]) { # morph
				if (($parts[1] eq "*") || ($parts[1] eq "0")) { next OUTER; } # strongOrder
				$countOfSameStrongInDB ++;
			}
			my @sStrongInstance = split("_", $parts[4]); # sStrongInstance 
			if (scalar @sStrongInstance == 2) {
				if ($strongNum eq trimStrong($sStrongInstance[0])) {
					if (index("ABCDEFGHIJKLMNOPQRSTUVWXYZ", $sStrongInstance[1]) > -1) {
						$countOfSameSStrongInstance ++;
					}
				}
			}
		}
		if (($countOfSameStrongInDB > 1) && ($countOfSameStrongInDB != $strongCount{$strongNum})) {
            my $key = $ref . '-' . $strongNum . '-' . $strongCount{$strongNum};
            if (exists($versionSpecificWordOccurrence{$key})) {
                $strongsWithVersionSpecificOccurrences .= " " . $strongNum;
            }
			elsif ($countOfSameSStrongInstance != $strongCount{$strongNum}) {
				$strongsToSkip .= " " . $strongNum;
				my $glossToPrint = "";
				if (exists($gloss{$strongNum})) {
					$glossToPrint = $gloss{$strongNum};
				}
				printError($strongNum, $ref . "\t" . $strongNum . "\t" . $glossToPrint . "\t\tunmatch count\t" . $strongCount{$strongNum} . " in Bible\t" . $countOfSameStrongInDB . " in DB");
			}
			else {
				$strongsWithDifferentOccurrences .= " " . $strongNum;
				#print "found matching sStrongInstance count $ref,$strongNum\n"
			}
		}
	}
	return $strongsToSkip . " ;" . $strongsWithDifferentOccurrences . " ;" . $strongsWithVersionSpecificOccurrences . " ";
}

sub printError {
	my $strongNum = shift;
	my $errorMsg = shift;
	my $posOfCheckStrong = index(" G0846 G1510 G3588 G3778 G5101 G1096 G2532 G1473 G3739 G4771 G3956 G2192 G5100 ", " " . $strongNum . " ");
	if ($posOfCheckStrong == -1) {
		print ERROUT "$errorMsg\n";
	}
}

sub addMorphToVerse {
    my $ref = shift;
	my $verse = shift;
	my $len = length($verse);
    my $updatedVerse = "";
	my $curPos = 0;
	my $lastOutPos = 0;
	my %strongCount = ();
	my @results = split(";", getStrongsToSkip($ref, $verse));
	my $strongsToSkip = $results[0];
	my $strongsWithDifferentCount = $results[1];
    my $strongsWithVersionSpecificOccurrences = $results[2];
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
				my $stringAfterStrongNum = substr($verse, $lastOutPos, 50);
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
						my $useAltCount = 0;
						if (index($strongsWithDifferentCount, $currentStrong) > -1) {
							$useAltCount = 1;
						}
                        my $useSpecificCount = 0;
						if (index($strongsWithVersionSpecificOccurrences, $currentStrong) > -1) {
							$useSpecificCount = 1;
						}
						my $morph = findMorph($ref, $currentStrong, $strongCount{$currentStrong}, $stringAfterStrongNum, $useAltCount, $useSpecificCount);
						if ($morph eq "") {
							my $glossToPrint = "";
							if (exists($gloss{$currentStrong})) {
								$glossToPrint = $gloss{$currentStrong};
							}
							printError($currentStrong, $ref . "\t" . $currentStrong . "\t" . $glossToPrint . "\t" . $stringAfterStrongNum . "\tnomorph");
							if ($numOfStrongsInWord > 1) {
								$morph = "NoMorph";
							}
						}
						elsif (($morph ne "SKIP") && ($morph ne "")) {
							if ($newMorphs ne "") {
								$newMorphs .= " ";
							}
							$newMorphs .= $morph;
						}
					}
                }
                if ($newMorphs ne "") {
                    $updatedVerse .= " morph=" . $quote . $newMorphs . $quote;
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
	my $stringAfterStrongNum = shift;
	my $useAltCount = shift;
    my $useSpecificCount = shift;
	our %passages;
	our %strongWithOneMorph;
	our %strongInDefCount;
	our $foundBoth;
	our %gloss;
    our %versionSpecificWordOccurrence;

    if ($useSpecificCount) {
        my $key = $ref . '-' . $strong . '-' . $occurrenceInVerse;
        if (exists($versionSpecificWordOccurrence{$key})) {
            $occurrenceInVerse = $versionSpecificWordOccurrence{$key};
#            print "found $key $versionSpecificWordOccurrence{$key}\n";
        }
        else {
            print "$key is not found in versionSpecificWordOcurrence\n";
        }
    }

	my $foundCount = 0;
	my $found = 0;
	my $countOfSameSStrongInstance = 0;
	my $numOfDefs = $#{ $passages{$ref} };
	for my $i ( 0 .. $numOfDefs ) {
		# Below is the line that create the array.
	    #  p u s h (@arryOfWordsInfo, $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $relatedWordInfo . ";" . $sStrongInstance . ";" . $additionalInfo);
		my @parts = split(';', $passages{$ref}[$i]);
		my $numOfParts = scalar @parts;
		if ($useAltCount) {
			my @sStrongInstance = split("_", $parts[4]); # sStrongInstance 
			if (scalar @sStrongInstance == 2) {
				if ($strong eq trimStrong($sStrongInstance[0])) {
					if (index("ABCDEFGHIJKLMNOPQRSTUVWXYZ", $sStrongInstance[1]) > -1) {
						$countOfSameSStrongInstance ++;
						if ($occurrenceInVerse == $countOfSameSStrongInstance) {
							return $parts[2];
						}
					}
				}
			}
		}
		else {
			if ($strong eq $parts[0]) { # strongNum
				if (($parts[1] eq '0') || # strongOrder
					($parts[1] eq '*') || 
					($parts[1] eq $occurrenceInVerse)) {
					return $parts[2]; # morph
				}
			}
			elsif (($numOfParts > 5) && (index($parts[5], $strong) > -1)) { # additionalInfo
				my @partsOfAltStrong = split(',', $parts[5]); # additionalInfo
				for my $j ( 0 .. $#partsOfAltStrong ) {
					if ($strong eq trimStrong($partsOfAltStrong[$j])) {
						my @altStrongToCheck = split("_", trim($partsOfAltStrong[$j]));
						my $numOfElements = scalar @altStrongToCheck;
						if ($numOfElements == 1) {
							return $parts[2]; # morph
						}
						if ($numOfElements == 2) {
							my $checkChar = uc($altStrongToCheck[1]);
							my $strongOrder = index("ABCDEFGHIJKLMNOPQRSTUVWXYZ", $checkChar) + 1;
							if ($strongOrder eq $occurrenceInVerse) {
								return $parts[2]; # morph
							}
						}
					}
				}
			}
		}
	}
our %altStrongMe = (    "G2254" => [ "G3165", "G1473" ], # ἡμῖν (hēmin) 'to us' (G2254) # μέ (me) 'me-alone' (G3165)
                    "G3427" => [ "G3165", "G1473" ], # μοί (moi) 'to me-alone' (G3427)
                    "G3450" => [ "G3165", "G1473" ], # μοῦ (mou) 'of me-alone' (G3450)

                    "G1700" => [ "G1473" ],    #        ἐμοῦ (emou) 'of me' (G1700) # ἐγώ (egō) 'I myself' (G1473)
                    "G1691" => [ "G1473" ],    #        ἐμέ (eme) 'me' (G1691)
                    "G1698" => [ "G1473" ],    #        ἐμοί (emoi) 'I' (G1698)
                    "G2248" => [ "G1473" ],    #        ἡμᾶς (hēmas) 'us' (G2248)
                    "G2249" => [ "G1473" ],    #        ἡμεῖς (hēmeis) 'we' (G2249)
                    "G3165" => [ "G1473" ],    #        μέ (me) 'me-alone' (G3165)
                    "G2257" => [ "G1473" ] );  #        ἡμῶν (hēmōn) 'of us' (G2257)

our %altStrongOther = ( "G4571" => [ "G4771" ],    #    σέ (se) 'you' (G4571)  # σύ (su) 'you' (G4771)
                    "G4671" => [ "G4771" ],    #    σοί (soi) 'you' (G4671)
                    "G4675" => [ "G4771" ],    #    σοῦ (sou) 'you' (G4675)
                    "G5209" => [ "G4771" ],    #    ὑμᾶς (humas) 'you' (G5209)
                    "G5210" => [ "G4771" ],    #    ὑμεῖς (humeis) 'you' (G5210)
                    "G5213" => [ "G4771" ],    #    ὑμῖν (humin) 'to you' (G5213)
                    "G5216" => [ "G4771" ],    #    ὑμῶν (humōn) 'of you' (G5216)

                    "G2046" => [ "G4483" ], #  ἐρῶ (erō) 'to say' (G2046) # ἐρέω (ereō) 'to say' (G4483) # λέγω (legō) 'to say' (G3004G)
                    "G3440" => [ "G3441" ],    # μόνον (monon) 'only' (G3440) # μόνος (monos) 'alone' (G3441)
                    "G2117" => [ "G2112" ],    # εὐθύς (euthus) 'Straight' (G2117) # ὐθέως (eutheōs) 'immediately' (G2112)
                    "G4053" => [ "G4054", "G4055" ],    # περισσότερον (perissoteron) 'more excessive' # (G4054) περισσότερος (perissoteros) 'more excessive' (G4055)
                    "G2904" => [ "G2908", "G2909" ],    # κράτος (kratos) 'power' (G2904) # kreîsson (κρείσσων G2908) - greater # kreíttōn (κρείττων G2909)
                    "G5123" => [ "G5124" ],    #  τουτέστι (toutesti) 'that is' (G5123) # τοῦτο (touto) 'that' (G5124)
                    "G1492" => [ "G6063" ],    # εἴδω (eidō) 'to perceive: understand' (G1492) # know / perceive
                    "G3117" => [ "G3112" ],    # μακρός (makros) 'long/distant' (G3117) # μακράν (makran) 'far' (G3112)
                    "G2419" => [ "G2414" ],    # Ἱερουσαλήμ (hierousalēm) 'Jerusalem' (G2419) # Ἱεροσόλυμα (hierosoluma) 'Jerusalem' (G2414)
                    "G4236" => [ "G4240" ],    #  praiótēs (G4236) gentleness # πραΰτης (prautēs) 'gentleness' (G4240)
                    "G5035" => [ "G5036" ],    #  ταχύ (tachu) 'quickly' (G5035) # ταχύς (tachus) 'quick' (G5036)
                    "G0196" => [ "G0197" ],    #  ἀκριβέστατος (akribestatos) 'strictest' (G0196) # ἀκριβέστερον (akribesteron) 'stricter' (G0197)
                    "G5100" => [ "G5101" ],    #  τις (tis) 'one' (G5100) # τίς (tis) 'which?' (G5101)
					"G3362" => [ "G3361" ],    #  ἐὰν μή (ean mē) 'unless' G3362 # μή (mē) 'not' (G3361)
                    "G3391" => [ "G1520"],     # μία (mia) 'first' (G3391) # εἷς (heis) 'one' (G1520)

# Added for NASB
                    # Added G1492 and G2396 for NASB
					"G3708" => [ "G3700", "G1492", "G2396" ],    #  ὀπτάνομαι (optanomai) 'to appear' (G3700) # ὁράω (horaō) 'to see: see'
                    # Added G2046 for NASB
                    "G3004" => [ "G2036", "G2046" ],    # λέγω (legō) 'to say' (G3004G) # εἶπον (eipon) 'to say' (G2036)
                    # Added G4118 for NASB
                    "G4183" => [ "G4119", "G4118" ],    # πολύς (polus) 'much' (G4183) # πλείων, πλεῖον (pleiōn pleion) 'greater' (G4119)
                    "G2413" => [ "G2411"],
                    "G2068" => [ "G5315"],
                    "G1508" => [ "G1487"],
                    "G3062" => [ "G3063"],
                    "G4277" => [ "G4280"],
                    "G6033" => [ "G5100", "G1759"],
                    "G0199" => [ "G0197"],
                    "G0848" => [ "G1438"],
                    "G5036" => [ "G5032"],
                    "G1897" => [ "G1966"],
                    "G2234" => [ "G2236"],
                );

    if ($strong eq "G2532") {
		return "CONJ";
	}
	elsif (($strong eq "G4057") || ($strong eq "G3569")) {
		return "ADV";
	}
	elsif ($strong eq "G4387") {
		return "ADV-C";
	}
    my @foundAltStrongs = ();
    if (exists($altStrongMe{$strong})) {
        if (index($foundBoth, $ref) > -1) {
			print WARNOUT "skip G1473 and G3165 in verse,$strong,$ref\n";
			return "SKIP";
		}
        @foundAltStrongs = @{ $altStrongMe{$strong} };
    }
    elsif (exists($altStrongOther{$strong})) {
        @foundAltStrongs = @{ $altStrongOther{$strong} };
    }
   	for my $i (0 .. $#foundAltStrongs) {
        #print "recursion $strong,$ref, $foundAltStrongs[$i], $occurrenceInVerse, $stringAfterStrongNum, $useAltCount\n";
   		my $result = findMorph($ref, $foundAltStrongs[$i], $occurrenceInVerse, $stringAfterStrongNum, $useAltCount, $useSpecificCount);
		if ($result ne "") {
			return $result;
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
	my $ref = $origRef;
	if (!exists $passages{$ref}) {
		$ref = getAltBookName($ref);
		if (!exists $passages{$ref}) {
			if (exists $altPassage2{$ref}) {
				my $altRef = $altPassage2{$ref};
				print "ref: $ref alt: $altRef\n";
				if (exists $passages{$altRef}) {
					return augmentVerse($altPassage2{$ref}, $verse);
				}
			}
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
	our $foundG3165;
	our $foundG1473;
	our $foundBoth;
	my @sp1 = split("\t", $line);
	my $numOfElement1 = scalar @sp1;
	if ($numOfElement1 < 12) { return; }
	my @nextLines = ();
	my @multiStrongs = split(',', $sp1[11]);
	my $numOfStrongs = scalar @multiStrongs;
	if ($numOfStrongs > 1) {
		my @multiMorphs = split('\+', $sp1[3]);
		my $numOfMorphs = scalar @multiMorphs;
		if ($numOfMorphs > 1) {
			my $min = ($numOfStrongs, $numOfMorphs)[$numOfStrongs > $numOfMorphs];
			for (my $i = 1; $i < $min; $i++) {
				my $currentMorph = trim($multiStrongs[$i]);
				if ($currentMorph eq "+") {
					next;
				}
				my $newLine = $sp1[0] . "\t" . $sp1[1] . "\t" . $sp1[2] ."\t" . trim($multiMorphs[$i]) .
					"\t" . $sp1[4] . "\t" . $sp1[5] . "\t" . $sp1[6] . "\t" . $sp1[7] . "\t" . $sp1[8] . 
					"\t" . $sp1[9] . "\t" . $sp1[10] . "\t" . $currentMorph . "\t";
				if ( ($numOfElement1 > 12) && ($i == ($numOfStrongs - 1)) ) {
					$newLine .= $sp1[12];
				}
				$newLine .= "\t" . "combined";
				push(@nextLines, $newLine);
			}
			$sp1[11] = trim($multiStrongs[0]);
			$sp1[3] = trim($multiMorphs[0]);
			$sp1[13] = "combined";
			$numOfElement1 = 14;
		}
	}
	my @sp2 = split("#", $sp1[0]);
	my $numOfElement2 = scalar @sp2;
	if ($numOfElement2 != 2) { return; }
	my $ref = checkAndAddAltPassage($sp2[0]);
	if ($lastPassage eq "") {
		$lastPassage = $ref;
	}
	elsif ($ref ne $lastPassage) {
		$passages{$lastPassage} = [ removeDups(\@arryOfWordsInfo, $lastPassage) ];
		if ($foundG3165 && $foundG1473) {
			$foundBoth .= " " . $lastPassage;
		}
		$lastPassage = $ref;
		$foundG3165 = 0;
		$foundG1473 = 0;
		@arryOfWordsInfo = ();
	}
	my @sp3 = split("=", $sp1[3]);
	my $numOfElement3 = scalar @sp3;
	if ($numOfElement3 != 2) { return; }
	my $morph = $sp3[1];
	my $strongNum = $sp1[11];
	my @sp4 = split("_", $strongNum);
	my $numOfElement4 = scalar @sp4;
	my $strongOrder = 0;
	if ($numOfElement4 > 2) { return; }
	elsif ($numOfElement4 == 2) {
		my $checkChar = uc($sp4[1]);
		$strongOrder = index("ABCDEFGHIJKLMNOPQRSTUVWXYZ", $checkChar) + 1;
	}
	$strongNum = trimStrong($sp4[0]);
	if ($sp1[4] ne "") {
		$gloss{$strongNum} = $sp1[4];
		my $pos = index($sp1[4], "=");
		if ($pos > -1) {
			$gloss{$strongNum} = substr($sp1[4], $pos + 1);
		}
	}
	if ($strongNum eq "G3165") {
		if (($numOfElement1 != 14) || ($sp1[13] ne "combined")) {
			$foundG3165 = 1;
		}
	}
	elsif ($strongNum eq "G1473") {
		if (($numOfElement1 != 14) || ($sp1[13] ne "combined")) {
			$foundG1473 = 1;
		}
	}
	my $relatedWordInfo = $sp1[10];
	my $sStrongInstance = "";
	if (($numOfElement1 > 11) && (defined($sp1[11]))) {
		$sStrongInstance = $sp1[11];
	}
	my $additionalInfo = "";
	if (($numOfElement1 > 12) && (defined($sp1[12]))) {
		$additionalInfo = $sp1[12];
	}
	push(@arryOfWordsInfo, $strongNum . ";" . $strongOrder. ";" . $morph . ";" . $relatedWordInfo . ";" . $sStrongInstance . ";" . $additionalInfo);
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

sub processVersionSpecificWordOccurrence {
    our %versionSpecificWordOccurrence = ();
    my $name_of_version_specific_word_occurrence = shift;
    open VERSPEC_IN, "<", $name_of_version_specific_word_occurrence or die "can't open file with version specific word occurrence\n";
    while (my $line = <VERSPEC_IN>) {
        chomp($line);
	    if ($line =~ /^#/) { next; }
    	my @sp1 = split(",", $line);
	    my $numOfElement1 = scalar @sp1;
        if ($numOfElement1 < 3) { next; }
        my $ref = $sp1[0];
        my $strong = $sp1[1];
        for (my $i = 2; $i < $numOfElement1; $i ++) {
        	my @sp2 = split(" ", $sp1[$i]);
    	    my $numOfElement2 = scalar @sp2;
            for (my $j = 0; $j < $numOfElement2; $j ++) {
                my $key = $ref . '-' . $strong . '-' . $sp2[$j];
                $versionSpecificWordOccurrence{$key} = $i - 1;
            }
        }
    }
    close(VERSPEC_IN);
}

sub processVersionSpecificAltStrong {
    our %versionSpecificAltStrong = ();
    my $name_of_version_specific_alt_strong = shift;
    open VERALTSTRONG_IN, "<", $name_of_version_specific_alt_strong or die "can't open file with version specific alt strong\n";
    while (my $line = <VERALTSTRONG_IN>) {
        chomp($line);
	    if ($line =~ /^#/) { next; }
    	my @sp1 = split(",", $line);
	    my $numOfElement1 = scalar @sp1;
        if ($numOfElement1 != 3) { next; }
        my $ref = $sp1[0];
        my $strong = $sp1[1];
        my $altStrong = $sp1[2];
        my $key = $ref . '-' . trimStrong($strong);
        $versionSpecificAltStrong{$key} = trimStrong($altStrong);
#        print "ver spec $key : $versionSpecificAltStrong{$key}\n";
    }
    close(VERALTSTRONG_IN);
}


# main
my $num_args = $#ARGV + 1;
if (($num_args < 3) && ($num_args > 5)) {
    print "\nUsage: name.pl name_of_file_with_morph name_of_Bible_without_morph name_of_output_file name_of_version_specific_word_occurrence name_of_version_specific_alt_strong\n";
	print "name_of_version_specific_word_occurrence and name_of_version_specific_alt_strong are optional.\n";
    exit;
}
my $name_of_file_with_morph = $ARGV[0];
my $name_of_file_without_morph = $ARGV[1];
my $output_file_name = $ARGV[2];
# Read whole file in memory
open MORPH_IN, "<", $name_of_file_with_morph or die "can't open file with morph\n";
my $outFile =  $output_file_name . '.txt';
open (OUT, ">:encoding(UTF-8)", $outFile);
my $errorFile = $output_file_name . ".err.txt";
open (ERROUT, ">:encoding(UTF-8)", $errorFile);
my $warnFile = $output_file_name . ".warn.txt";
open (WARNOUT, ">:encoding(UTF-8)", $warnFile);
print WARNOUT "";
our %versionSpecificWordOccurrence = ();
our %versionSpecificAltStrong = ();
if ($num_args >= 4) {
    processVersionSpecificWordOccurrence($ARGV[3]);
}
if ($num_args == 5) {
    processVersionSpecificAltStrong($ARGV[4]);
}
use open ':std', ':encoding(UTF-8)';
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
$foundBoth .= " ";
$passages{$lastPassage} = [ removeDups(\@arryOfWordsInfo, $lastPassage) ];
close (MORPH_IN);
for (keys %strongWithOneMorph) {
	my $trimmedStrongWithMorph = trim($strongWithOneMorph{$_});
	my @morphs = split(' ', $trimmedStrongWithMorph);
	if ((scalar @morphs > 1) || (substr($morphs[0], 0, 1) eq "V") || (substr($morphs[0], 0, 1) eq "N") || (substr($morphs[0], 0, 2) eq "A-")) {
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

# for(keys %passages){
# 	my $ref = $_;
# 	print("words of $ref is:\n");
# 	for my $i ( 0 .. $#{ $passages{$ref} } ) {
# 		print "     $i = $passages{$ref}[$i]\n";
# 	}
# 	print "\n";
# }
# exit;
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
	if ($posStartVerseTag > -1) {
		$curPos = $posStartVerseTag + 5;
		my $inVerseTag = 0;
		REVSEARCH: for (my $revCount = 1; $revCount < 100; $revCount ++) {
			my $curChar = substr($allLines, $posStartVerseTag - $revCount, 1);
			if ($curChar eq "<") {
				my $foundStartOfTag = substr($allLines, $posStartVerseTag - $revCount + 1, 5);
				if ($foundStartOfTag eq "verse") {
					$inVerseTag = 1;
				}
				else {
					print "found: " . $foundStartOfTag . "\n";
				}
				last REVSEARCH;
			}
		}
		if ($inVerseTag) {
			my $quote = substr($allLines, $curPos, 1);
			$curPos ++;
			my $posOfQuote = index($allLines, $quote, $curPos);
			if ($posOfQuote > -1) {
				my $curRef = substr($allLines, $curPos, $posOfQuote - $curPos);
				$curPos = $posOfQuote + 1;
				my $posOfTagClosure = index($allLines, "/>", $curPos);
				if ($posOfTagClosure > -1) {
					$curPos = $posOfTagClosure + 2;
					my $startOfVerse = $curPos;
					my $posEndVerseTag = index($allLines, '<verse eID=', $curPos);
					if ($posEndVerseTag > -1) {
						$curPos = $posEndVerseTag + 11;
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
								print OUT substr($allLines, $lastOutPos, $startOfVerse - $lastOutPos);
								print OUT augmentVerse($curRef, substr($allLines, $startOfVerse, $posEndVerseTag - $startOfVerse));
								print OUT substr($allLines, $posEndVerseTag, $posOfQuote + 3 - $posEndVerseTag);
								$lastOutPos = $posOfQuote + 3;
							}
						}
						else { print "no end quote for end verse tag\n"; }
					}
					else { print "no end verse $curRef\n"; }				
				}
				else { print "cannot curPosfind end tag\n"; }
			}
			else { print "unmatch quote for begin verse tag\n"; }
		}
	}
	else {
		last;
	}
}
print OUT substr($allLines, $lastOutPos, $len - $lastOutPos);
