#!/usr/bin/perl
# This script collects the Bible names of different languages from the JSWord BibleNames_xx.properties files

use utf8;
use warnings;
use strict;

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

use open qw( :std :encoding(UTF-8) );
my $number_args = $#ARGV + 1;  
if ($number_args != 1) {  
    print "Please provide the file name of a BibleNames_xx.properties file from the JSword repository.\n";  
    exit;  
}
my $pathName = $ARGV[0];
open (IF, '<', $pathName) or die "Could not open input file: $pathName";
binmode(IF, ":utf8");

open (OF, '>>', "book-lang.txt") or die "Could not open output file: book-lang.txt";
binmode(OF, ":utf8");

my $lang = "en";
if ($pathName =~ /BibleNames_([_a-zA-Z]+)\.properties$/) {
	$lang = $1;
}
print "language is $lang\n";

my $bookList = " Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev ";

while (<IF>) {
    chomp($_);
    $_ =~ s/\r//;
	my $line = $_;
	if ($line =~ /(^[123A-Z][SKCTPJa-z][a-z]+)\.Full\s?=/) {
		my $curBookName = trim($1);
	my $afterMatch = trim($');
		my $testBookName = "\\s" . $curBookName . "\\s";
		if ($bookList =~ /$testBookName/) {
			print OF '$langBook{"' . $lang . '-' . $curBookName . '"} = "' . $afterMatch . '"' . "\n";
		}
	}
}
