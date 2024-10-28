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
    print "Please provide the file name of the file with Youtube links.\n";  
    exit;  
}
use open qw( :std :encoding(UTF-8) );
my $youtubeListFile = $ARGV[0];
open (IY, '<', $youtubeListFile) or die "Could not open input file: $youtubeListFile";

my %langName;
$langName{"English"} = "en";
$langName{"Ukrainian"} = "uk";
$langName{"Indonesian"} = "id";
$langName{"Polish"} = "pl";
$langName{"Hungarian"} = "hu";
$langName{"Thai"} = "th";
$langName{"Korean"} = "ko";
$langName{"Telegu"} = "te";
$langName{"Japanese"} = "ja";
$langName{"Tamil"} = "ta";
$langName{"Romanian"} = "ro";
$langName{"Italian"} = "it";
$langName{"Russian"} = "ru";
$langName{"German"} = "de";
$langName{"Chinese (Cantonese)"} = "zh_hk";
$langName{"Chinese (Mandarin)"} = "zh";
$langName{"Arabic (Standard)"} = "ar";
$langName{"Arabic (Egyptian)"} = "arz";
$langName{"French"} = "fr";
$langName{"Spanish"} = "es";
$langName{"Portuguese"} = "pt";
$langName{"Hindi"} = "hi";
$langName{"Vietnamese"} = "vi";

my %bookName;
$bookName{"OT Overview"} = "ot";
$bookName{"Genesis 1-11"} = "gen-1";
$bookName{"Genesis 12-50"} = "gen-2";
$bookName{"Exodus 1-18"} = "exod-1";
$bookName{"Exodus 19-40"} = "exod-2";
$bookName{"Leviticus"} = "lev";
$bookName{"Numbers"} = "num";
$bookName{"Deuteronomy"} = "deut";
$bookName{"Joshua"} = "josh";
$bookName{"Judges"} = "judg";
$bookName{"1 Samuel"} = "1sam";
$bookName{"2 Samuel"} = "2sam";
$bookName{"1 & 2 Kings"} = "1kgs,2kgs";
$bookName{"Isaiah 1-39"} = "isa-1";
$bookName{"Isaiah 40-66"} = "isa-2";
$bookName{"Jeremiah"} = "jer";
$bookName{"Ezekiel 1-33"} = "ezek-1";
$bookName{"Ezekiel 34-48"} = "ezek-2";
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
$bookName{"Psalms"} = "ps";
$bookName{"Proverbs"} = "prov";
$bookName{"Job"} = "job";
$bookName{"Song of Songs"} = "song";
$bookName{"Ruth"} = "ruth";
$bookName{"Lamentations"} = "lam";
$bookName{"Ecclesiastes"} = "eccl";
$bookName{"Esther"} = "esth";
$bookName{"Daniel"} = "dan";
$bookName{"Ezra / Nehemiah"} = "ezra,neh";
$bookName{"1 & 2 Chronicles"} = "1chr,2chr";
$bookName{"NT Overview"} = "nt";
$bookName{"Matthew 1-13"} = "matt-1";
$bookName{"Matthew 14-28"} = "matt-2";
$bookName{"Mark"} = "mark";
$bookName{"John 1-12"} = "john-1";
$bookName{"John 13-21"} = "john-2";
$bookName{"Luke 1-9"} = "luke-1";
$bookName{"Luke 10-24"} = "luke-2";
$bookName{"Acts 1-12"} = "acts-1";
$bookName{"Acts 13-28"} = "acts-2";
$bookName{"Romans 1-4"} = "rom-1";
$bookName{"Romans 5-16"} = "rom-2";
$bookName{"1 Corinthians"} = "1cor";
$bookName{"2 Corinthians"} = "2cor";
$bookName{"Galatians"} = "gal";
$bookName{"Ephesians"} = "eph";
$bookName{"Philippians"} = "phil";
$bookName{"Colossians"} = "col";
$bookName{"1 Thessalonians"} = "1thess";
$bookName{"2 Thessalonians"} = "2thess";
$bookName{"1 Timothy"} = "1tim";
$bookName{"2 Timothy"} = "2tim";
$bookName{"Titus"} = "titus";
$bookName{"Philemon"} = "phlm";
$bookName{"Hebrews"} = "heb";
$bookName{"James"} = "jas";
$bookName{"1 Peter"} = "1pet";
$bookName{"2 Peter"} = "2pet";
$bookName{"1-3 John"} = "1john,2john,3john";
$bookName{"Jude"} = "jude";
$bookName{"Revelation 1-11"} = "rev-1";
$bookName{"Revelation 12-22"} = "rev-2";

chomp(my @lines = <IY>);
my $columnNum = 1;
my $lineNum = 0;
for my $i (0 .. $#lines)
{
	chomp($lines[$i]);
	$lines[$i] =~ s/\r//;
}
while (1) {
	my $curLine = $lines[0];
	my @parts1 = split("\t", $curLine);
	if ($#parts1 < $columnNum) {
		last;
	}
	if (exists($langName{$parts1[$columnNum]})) {
		my $langCode = $langName{$parts1[$columnNum]};
		if ($langCode ne "") {
			my $outFile = $langCode . ".json";
			open(OF, '>', $outFile) or die "Could not open output file: $outFile";
			binmode(OF, ":utf8");
			print OF "{";
			my $alreadyOutput = 0;
			for my $i (1 .. $#lines) {
				my @parts2 = split("\t", $lines[$i]);
				if ($#parts2 >= $columnNum) {						
					if (exists($bookName{$parts2[0]})) {
						my $books = $bookName{$parts2[0]};
						my $link = $parts2[$columnNum];
						if ($link eq "(video In development)") {
							next;
						}
						my @multiBooks = split(",", $books);
						for my $j (0 .. $#multiBooks) { 
							my $curBook = $multiBooks[$j];
							my @bookParts = split("-", $curBook);
							if (($#bookParts == 0) || 
							   ((exists($bookParts[1])) && ($bookParts[1] eq "1"))) {
								if ($alreadyOutput) {
									print OF ",\n";
								}
								$alreadyOutput = 1;
								print OF "\"$bookParts[0]\":[";
							}
							print OF "\"$link\"";
							if (($#bookParts == 0) || ((exists($bookParts[1])) && ($bookParts[1] eq "2"))) {
								print OF "]";
							}
							else {
								print OF ",\n";
							}
						}
					}
				}
			}
			print OF "}";
			close(OF);
		}
	}
	$columnNum ++;
}
