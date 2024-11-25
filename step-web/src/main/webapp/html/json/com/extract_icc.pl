#!/usr/bin/perl
use utf8;
use warnings;
use strict;

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

my $number_args = $#ARGV + 1;  
if ($number_args != 1) { 
    print "Please provide the file name of the file with ICC links.\n";  
    exit;  
}
use open qw( :std :encoding(UTF-8) );
my $iccLinkFile = $ARGV[0];
open (ICOM, '<', $iccLinkFile) or die "Could not open input file: $iccLinkFile";

my %bookName;
$bookName{"Genesis"} = "gen";
$bookName{"Exodus"} = "exod";
$bookName{"Leviticus"} = "lev";
$bookName{"Numbers"} = "num";
$bookName{"Deuteronomy"} = "deut";
$bookName{"Joshua"} = "josh";
$bookName{"Judges"} = "judg";
$bookName{"Ruth"} = "ruth";
$bookName{"I Samuel"} = "1sam";
$bookName{"II Samuel"} = "2sam";
$bookName{"I Kings"} = "1kgs";
$bookName{"II Kings"} = "2kgs";
$bookName{"I Chronicles"} = "1chr";
$bookName{"II Chronicles"} = "2chr";
$bookName{"Ezra"} = "ezra";
$bookName{"Nehemiah"} = "neh";
$bookName{"Esther"} = "esth";
$bookName{"Job"} = "job";
$bookName{"Psalms"} = "ps";
$bookName{"Proverbs"} = "prov";
$bookName{"Ecclesiastes"} = "eccl";
$bookName{"Song of Solomon"} = "song";
$bookName{"Isaiah"} = "isa";
$bookName{"Jeremiah"} = "jer";
$bookName{"Lamentations"} = "lam";
$bookName{"Ezekiel"} = "ezek";
$bookName{"Daniel"} = "dan";
$bookName{"Hosea"} = "hos";
$bookName{"Joel"} = "joel";
$bookName{"Amos"} = "amos";
$bookName{"Obadiah"} = "obad";
$bookName{"Jonah"} = "jonah";
$bookName{"Micah"} = "mic";
$bookName{"Nahum"} = "nah";
$bookName{"Habakkuk"} = "hab";
$bookName{"Zephaniah"} = "zeph";
$bookName{"Haggai"} = "hag";
$bookName{"Zechariah"} = "zech";
$bookName{"Malachi"} = "mal";
$bookName{"Matthew"} = "matt";
$bookName{"Mark"} = "mark";
$bookName{"Luke"} = "luke";
$bookName{"John"} = "john";
$bookName{"Acts"} = "acts";
$bookName{"Romans"} = "rom";
$bookName{"1 Corinthians"} = "1cor";
$bookName{"II Corinthians"} = "2cor";
$bookName{"Galatians"} = "gal";
$bookName{"Ephesians"} = "eph";
$bookName{"Philippians"} = "phil";
$bookName{"Colossians"} = "col";
$bookName{"I Thessalonians"} = "1thess";
$bookName{"II Thessalonians"} = "2thess";
$bookName{"I Timothy"} = "1tim";
$bookName{"II Timothy"} = "2tim";
$bookName{"Titus"} = "titus";
$bookName{"Philemon"} = "phlm";
$bookName{"Hebrews"} = "heb";
$bookName{"James"} = "jas";
$bookName{"I Peter"} = "1pet";
$bookName{"II Peter"} = "2pet";
$bookName{"I John"} = "1john";
$bookName{"II John"} = "2john";
$bookName{"III John"} = "3john";
$bookName{"Jude"} = "jude";
$bookName{"Revelation"} = "rev";

chomp(my @lines = <ICOM>);
my $lineNum = 0;
for my $i (0 .. $#lines)
{
	chomp($lines[$i]);
	$lines[$i] =~ s/\r//;
	my $curLine = $lines[$i];
	my @parts = split(",", $curLine);
	if ($#parts >= 3) {
		my $book = trim($parts[0]);
		my $chapter = trim($parts[1]);
		my $page = trim($parts[2]);
		my $url = trim($parts[3]);
		if (exists($bookName{$book})) {
			if (($url =~ /http/) && ($chapter =~ /^-?\d+$/)) {
				if ($chapter eq "0") {
					$chapter = "intro";
				}
				elsif ($chapter eq "-1") {
					$chapter = "outline";
				}
				my $fn = $bookName{$book} . '.json1';
				open (OF, '>>', $fn) or die "Could not open output file: $fn";
				print OF '"chapter_' . $chapter . '_icc_url" : "' . $url . '",' . "\n"; 
				if ($page ne "") {
					print OF '"chapter_' . $chapter . '_icc_page" : "' . $page . '",' . "\n";
				}
				close (OF);
			}
		}
		else {
			print "cannot find $book\n";
		}
	}
}
