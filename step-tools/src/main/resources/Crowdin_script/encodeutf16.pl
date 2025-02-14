#!/usr/bin/perl
use warnings;
use strict;
use Encode qw( encode );

sub trim {
    my $string = shift;
    $string =~ s/^[\t\s]+|[\t\s]+$//g;
    return $string;
}

FORLOOP: for my $inputFile (glob "SearchBundle_*.properties") {
	open (FH, "<:encoding(UTF-8)", $inputFile) or die "Could not open input file: $inputFile";
	my $outFile = $inputFile . ".out";
	open (FO, '>', $outFile) or die "Could not open input file: $outFile";
	print FO "# Already processed by encodeutf16.pl\n";
	while (<FH>) {
		chomp($_);
		$_ =~ s/\r//;
		my $line = trim($_);
		if ($line =~ m/already processed by encodeutf16\.pl/i) {
			print "Skip $inputFile because it is already processed\n";
			close FO;
			unlink $outFile;
			next FORLOOP;
		}
		if (($line =~ m/=/) && ($line !~ m/\\u[0123456abcdefABCDEF]{4}/i)) {
			print FO $` . "=";
			my $restOfLine = $';
			my @splt = split(//, $restOfLine);
			my $numOfElement = scalar @splt;
			for (my $i = 0; $i < $numOfElement; $i++) {
				if (index(" abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%<>,./", $splt[$i]) == -1) {
					print FO "\\u";
					my $utf16 = sprintf "%04X", ord $splt[$i];
					print FO $utf16;
				}
				else {
					print FO $splt[$i];
				}
			}
		}
		else {
			print FO $line
		}
		print FO "\n";
	}
	close (FH);
	close (FO);
	unlink $inputFile;
	rename $outFile, $inputFile;
	print "processed file: $inputFile\n";
}
exit;


