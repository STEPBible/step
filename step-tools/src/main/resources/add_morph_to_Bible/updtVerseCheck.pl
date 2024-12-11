#
use strict;
use warnings;
use utf8;

# main
my $num_args = $#ARGV + 1;
if ($num_args != 4) {
    print "\nUsage: name.pl name_of_def_file name_of_augment_verse_number_file name_of_additional_augment_def_file name_of_output_file\n";
    exit;
}
my $name_of_file_with_morph = $ARGV[0];
my $name_of_augment_verse = $ARGV[1];
my $name_of_additional_augment = $ARGV[2];
my $output_file_name = $ARGV[3];
use open ':std', ':encoding(UTF-8)';
my $lastVerse = "";
my %augWords = ();

# Read whole file in memory
open AUG_IN, "<", $name_of_augment_verse or die "can't open file with augment verse number\n";
open MORPH_IN, "<", $name_of_file_with_morph or die "can't open file with morph\n";
open (OUTORIG, ">:encoding(UTF-8)", $output_file_name . ".orig_lines");
open AUG_IN2, "<", $name_of_additional_augment or die "can't open file with augment def\n";
open (OUT, ">:encoding(UTF-8)", $output_file_name);

while (my $line = <AUG_IN>) {
    chomp($line);
	if ($line =~ /^#/) {
		next;
	}
	my @sp1 = split("\t", $line);
	my $numOfElement = scalar @sp1;
	if ($numOfElement > 2) {
        my @sp2 = @sp1[ 1 .. $#sp1 ];
		$augWords{$sp1[1]} = join("\t", @sp2);
	}
}
close (AUG_IN);

my %def = ();
while (my $line = <MORPH_IN>) {
    chomp($line);
    if ($line =~ /^#/) {
        next;
    }
	my @sp1 = split("\t", $line);
	my $numOfElement = scalar @sp1;
	if ($numOfElement > 10) {
        my $ref = $sp1[0];
		if ($ref =~ /^[123]?[A-Za-z]{2,6}\.\d{1,3}\.\d{1,3}/) {
            if (exists($augWords{$ref})) {
                print OUTORIG "$line\n"; # original line
                $line = $augWords{$ref};
                my @sp2 = split("\t", $line);
                $ref = $sp2[0];
            }
            $def{$ref} = $line;
        }
	}
}

# Read whole file in memory
while (my $line = <AUG_IN2>) {
    chomp($line);
	if ($line =~ /^#/) {
		next;
	}
	my @sp1 = split("\t", $line);
	my $numOfElement = scalar @sp1;
	if ($numOfElement > 10) {
        $def{$sp1[0]} = $line;
 	}
}
close (AUG_IN2);

foreach my $ref (sort keys %def) {
    print OUT "$def{$ref}\n";
}
close (OUT);