#!/usr/bin/perl
#******************************************************************************
#
#  localecap.pl -	This tool is only for locales in Latin-1, not UTF-8
#
# $Id: localecap.pl 2841 2013-06-29 10:58:08Z chrislit $
#
# Copyright 2001-2009 CrossWire Bible Society (http://www.crosswire.org)
#	CrossWire Bible Society
#	P. O. Box 2528
#	Tempe, AZ  85280-2528
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the
# Free Software Foundation version 2.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#


use locale;

$abbrevs = 0;

open (INPUT, "$ARGV[0]") or print "Give the locale file as an argument.\n";
@loc = <INPUT>;
close (INPUT);
open (OUTPUT, ">$ARGV[0]");
foreach $line (@loc) {

    if ($line =~ /\[Book Abbrevs\]/) {
	$abbrevs = 1;
    }
    elsif ($abbrevs == 1) {
	$line = uc($line);
    }
    print OUTPUT $line;
}
close (OUTPUT);
