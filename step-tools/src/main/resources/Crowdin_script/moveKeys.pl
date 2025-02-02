#!/usr/bin/perl
use warnings;
use strict;

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

my $number_args = $#ARGV + 1;  
if ($number_args != 2) {  
    print "Please provide\n";
    print "    1. the file with strings that need to be moved.\n";
    print "    2. the file to extract keys.\n";
    exit;  
}

my $inputKeyFile = $ARGV[0];
my $inputExtractFile = $ARGV[1];
my %keys;
open (FH, '<', $inputKeyFile) or die "Could not open input file: $inputKeyFile";
while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = trim($_);
	if ($line =~ m/=/) {
        $keys{$`} = 1;
        print "found1 $`\n";
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
my $output = $inputExtractFile . '.new1';
open (OF1, '>', $output);
$output = $inputExtractFile . '.new2';
open (OF2, '>', $output);

while (<FH>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = trim($_);
    if (length($line) == 0) {
        next;
    }
	if ($line =~ m/=/) {
        my $curKey = $`;
        print "found $curKey\n";
        if (exists($keys{$curKey})) {
            print OF2 "$line\n";
        }
        else {
            print OF1 "$line\n";
        }
	}
  	else {
        if ($line =~ m/^\#/) {

        }
        else {
            print "cannot find = char in $line in $inputExtractFile\n";
            exit;
        }
    }
}
close (FH);
