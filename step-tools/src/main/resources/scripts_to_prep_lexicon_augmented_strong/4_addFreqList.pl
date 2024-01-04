#
use utf8;
use Text::CSV qw( csv) ;

sub trim {
    $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

sub addFreqToStepLexicon {
    my $findPattern = '^@StrNo=\t';
    my $found = 0;
	my $verifyCount = 0;
	my $curCode = "";
	my $previousCode = "";
	my $printNext = 0;
    foreach (@lexiconLines) {
        my $currentLine = $_;
        if ($currentLine =~ /$findPattern/) {
			$previousCode = $curCode;
            $curCode = $';
			if ($printNext) {
				print "     next strong number: $curCode\n";
				$printNext = 0;
			}
            print OUT $currentLine . "\n";
            if ($curCode ne "") {
                if (exists($freqList{$curCode})) {
                    print OUT "\@StrFreqList=\t" . $freqList{$curCode} . "\n";
					#print "$curCode  $freqList{$curCode}\n";
					$verifyCount = $freqCount{$curCode};
                }
				else {
                    print "Frequency count of $curCode is zero for all Bibles\n";
					print "     previous strong number: $previousCode\n";
					$printNext = 1;
					$verifyCount = 0;
                }	
            }
        }
        elsif ($currentLine !~ /^\@StrFreqList=\t/) {
            print OUT $currentLine . "\n";
        }
		elsif ($currentLine =~ /^\@StrFreqList=\t/) {
            my $curList = $';
			my @spl = split(';', $curList);
			my $countOfPrevious = 0;
			for (my $i = 0; $i <= $#spl; $i++) {
				my @tempNum = split('@', trim($spl[$i]));
				my $curNum = trim($tempNum[0]);
				if (($curNum ne "") && ($curNum ne "0")) { 
					$countOfPrevious += $curNum;
#					print "cc $curNum\n";
				}
			}
			if ($verifyCount > 0) {
				if ($verifyCount < $countOfPrevious) {
					my $percentage = abs($countOfPrevious / $verifyCount);
					if ($percentage > 1.3) {
						print "$curCode has over 30% diff. current count: $verifyCount, previous count: $countOfPrevious, percent difference: $percentage\n";
						print "     previous strong number: $previousCode\n";
						$printNext = 1;
					}
				}
			}
		}
    }
}

# main

my $num_args = $#ARGV + 1;
if ($num_args != 3) {
    print "\nUsage: name.pl name_of_freq_input_file name_of_step_lexicon_input_file name_of_output_file\n";
    exit;
}
my $name_of_freq_input_file = $ARGV[0];
my $input_lexicon_file_from_step = $ARGV[1];
my $output_file_name = $ARGV[2];
use open ':std', ':encoding(UTF-8)';
# Read whole file in memory
open FREQ_IN, "<", $name_of_freq_input_file or die "can't open freq file\n";
my $outFile =  $output_file_name . '.txt';
open (OUT, ">:encoding(UTF-8)", $outFile);
open STEP_LEXICON_IN, '<:encoding(UTF-8)', $input_lexicon_file_from_step;
chomp(@lexiconLines = <STEP_LEXICON_IN>);
close STEP_LEXICON_IN;
%freqList; # initialize as global variables because they will be used in subroutine
%freqCount;
my $curStrong = "";

my $header = 1;
while ($line = <FREQ_IN>) {
    chomp($line);
#    print $line . "\n";
    my @spl = split(',', $line);
    if ($header > 0) {
#        for (my $i = 1; $i < $#spl; $i = $i + 2) {
#            my @spl2 = split('-', $spl[$i]);
#            print trim($spl2[0]) . ";";
#        }
#        print "\n";
        $header = 0;
    }
    else {
        $curStrong = trim($spl[0]);
        my $outputString = "";
        my $checkNotZero = 0;
        for (my $i = 1; $i < $#spl; $i = $i + 2) {	
            my $curNum = trim($spl[$i]);
            my $nextNum = trim($spl[$i+1]);
#			print "x: $curNum $nextNum\n";
            if (($curNum eq "") || ($curNum eq "0")) { $outputString .= ";";}
            else {
                if ($curNum eq $nextNum) { $outputString .= "$curNum;";}
                else { $outputString .= "$curNum\@$nextNum;";}
                $checkNotZero += $curNum;
            }
        }
       if ($checkNotZero > 0) {
			$outputString =~ s/\;$//;
            $freqList{$curStrong} = $outputString;
			$freqCount{$curStrong} = $checkNotZero;
#			print "checkNotZero $checkNotZero\n";
        }
    }
}
close (FREQ_IN);
addFreqToStepLexicon();
