#!/usr/bin/perl
use warnings;
use strict;

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

my $number_args = $#ARGV + 1;  
if (($number_args < 2) || ($number_args > 3)) {  
    print "Please provide\n";
    print "    1. the file with strings that need to be moved.\n";
    print "    2. the file to extract keys.\n";
    print "    3. \"inplace\" for update in the first file\n";
    exit;  
}

my $inputKeyFile = $ARGV[0];
my $inputExtractFile = $ARGV[1];
my $inPlaceUpdate = 0;
if ($number_args == 3) {
    if ($ARGV[2] ne "inplace") {
        print "The only acceptable 3rd parameter is \"inplace\"\n";
        exit;
    }
    $inPlaceUpdate = 1;
}
my %keys;
open (FH, '<', $inputKeyFile) or die "Could not open input file: $inputKeyFile";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = trim($_);
	if ($line =~ m/=/) {
        $keys{$`} = 1;
	}
  	else {
        if ($line =~ m/^\#/) {

        }
        else {
            print "cannot find = char in $line in $inputKeyFile\n";
            exit;
        }
    }
}
close (FH);

open (FH, '<', $inputExtractFile) or die "Could not open input file: $inputExtractFile";
my $output1 = $inputExtractFile . '.new1';
open (OF1, '>', $output1);
my $output2 = "";
if (!$inPlaceUpdate) {
    $output2 = $inputExtractFile . '.new2';
    open (OF2, '>', $output2);
}
my $numUpdated = 0;
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = trim($_);
    if (length($line) == 0) {
        print OF1 "\n";
        next;
    }
	if ($line =~ m/=/) {
        my $curKey = $`;
        if (exists($keys{$curKey})) {
            if ($inPlaceUpdate) {
                print OF1 "# $line\n";
                print OF1 "$curKey" . "=Please email patricksptang\@gmail.com \"$curKey\" crowdin key need to be fixed. A screenshot will help.\n";
            }
            else {
                print OF2 "$line\n";
            }
            $numUpdated ++;
        }
        else {
            print OF1 "$line\n";
        }
	}
  	elsif ($line !~ m/^\#/) {
        print "cannot find = char in $line in $inputExtractFile\n";
        exit;
    }
    else {
        print OF1 "$line\n";
    }
}
close (FH);
close (OF1);
print "Updated $numUpdated in $output1";
if (!$inPlaceUpdate) {
    close (OF2);
    print " and $output2\n\n";
    rename $inputExtractFile, $inputExtractFile . ".orig";
    my $index = index ($inputKeyFile, '.');
    my $newFileName = substr($inputKeyFile, 0, $index);
    $index = index ($inputExtractFile, '_');
    my $lang = substr($inputExtractFile, $index);
    $lang = substr($lang, 0, index($lang, "."));
    $newFileName .= $lang . ".properties";
    rename $output1, $inputExtractFile;
    rename $output2, $newFileName;    
}
print "\n";
