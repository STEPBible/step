#!/bin/perl

#******************************************************************************
#
#  makebooklist.pl -
#
# $Id: makebooklist.pl 2841 2013-06-29 10:58:08Z chrislit $
#
# Copyright 2009-2013 CrossWire Bible Society (http://www.crosswire.org)
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

@booklist = `diatheke -b system -k modulelist`;

open TCL, ">:utf8", "biblebot-diatheke-books.tcl";

print TCL "# Diatheke/Tcl 5.0 by Chris Little <chrislit\@crosswire.org>\n\n# Copyright 1999-2009 CrossWire Bible Society (http://www.crosswire.org)\n#	CrossWire Bible Society\n#	P. O. Box 2528\n#	Tempe, AZ  85280-2528\n#\n# This program is free software; you can redistribute it and/or modify it\n# under the terms of the GNU General Public License as published by the\n# Free Software Foundation version 2.\n#\n# This program is distributed in the hope that it will be useful, but\n# WITHOUT ANY WARRANTY; without even the implied warranty of\n# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n# GNU General Public License for more details.\n\n";

foreach $line (@booklist) {
    $line =~ s/[\r\n]+$//;
    if ($line =~ /^Biblical Texts:/) {
	$mode = "bible";
    }
    elsif ($line =~ /^Commentaries:/) {
	$mode = "comm";
    }
    elsif ($line =~ /^Dictionaries:/) {
	$mode = "dict";
    }
    elsif ($line =~ /^Generic books:/) {
	$mode = "genbook";
    }
    elsif ($line =~ /^([^:]+) : (.+)/) {
	$bookid = $1;
	$bookdesc = $2;
	if ($mode eq "bible") {
	    print TCL "bind pub - !$bookid setver_$bookid\nproc setver_$bookid {nick uhost hand channel arg} {\n    global botnick chan bibver\n    set bibver $bookid\n    pub_lookup \$nick \$uhost \$hand \$channel \$arg\n}\n\n";
	    print TCL "bind pub - !s$bookid setver_s$bookid\nproc setver_s$bookid {nick uhost hand channel arg} {\n    global botnick chan bibver\n    set bibver $bookid\n    pub_lookups \$nick \$uhost \$hand \$channel \$arg\n}\n\n";

	    if ($count_bible != 0) {
		$putservtext_bible .= ", ";
	    }
	    if (($count_bible != 0) && ($count_bible % 5 == 0)) {
		$putservtext_bible .= "\n";
	    }
	    $count_bible++;
	    $putservtext_bible .= "$bookdesc (!$bookid)";
	}
	elsif ($mode eq "comm") {
	    print TCL "bind pub - !$bookid setver_$bookid\nproc setver_$bookid {nick uhost hand channel arg} {\n    global botnick chan bibver\n    set bibver $bookid\n    pub_lookupc \$nick \$uhost \$hand \$channel \$arg\n}\n\n";

	    if ($count_comm != 0) {
		$putservtext_comm .= ", ";
	    }
	    if (($count_comm != 0) && ($count_comm % 5 == 0)) {
		$putservtext_comm .= "\n";
	    }
	    $count_comm++;
	    $putservtext_comm .= "$bookdesc (!$bookid)";
	}
	elsif ($mode eq "dict") {
	    print TCL "bind pub - !$bookid setver_$bookid\nproc setver_$bookid {nick uhost hand channel arg} {\n    global botnick chan bibver\n    set bibver $bookid\n    pub_lookupd \$nick \$uhost \$hand \$channel \$arg\n}\n\n";

	    if ($count_dict != 0) {
		$putservtext_dict .= ", ";
	    }
	    if (($count_dict != 0) && ($count_dict % 5 == 0)) {
		$putservtext_dict .= "\n";
	    }
	    $count_dict++;
	    $putservtext_dict .= "$bookdesc (!$bookid)";
	}
	elsif ($mode eq "genbook") {
	    # do nothing until diatheke supports genbooks
	}
    }
}

$putservtext_bible = "\n$putservtext_bible";
$putservtext_bible =~ s/\n/\"\n\tputserv \"NOTICE \$nick :/gs;
$putservtext_bible =~ s/, \"/,\"/gs;
$putservtext_bible .= "\"\n";
$putservtext_bible = "\tputserv \"NOTICE \$nick :Bibles ($count_bible):$putservtext_bible";
$putservtext_bible = "proc printBibles \{nick\} \{\n$putservtext_bible\}\n";

$putservtext_comm = "\n$putservtext_comm";
$putservtext_comm =~ s/\n/\"\n\tputserv \"NOTICE \$nick :/gs;
$putservtext_comm =~ s/, \"/,\"/gs;
$putservtext_comm .= "\"\n";
$putservtext_comm = "\tputserv \"NOTICE \$nick :Commentaries ($count_comm):$putservtext_comm";
$putservtext_comm = "proc printComms \{nick\} \{\n$putservtext_comm\}\n";

$putservtext_dict = "\n$putservtext_dict";
$putservtext_dict =~ s/\n/\"\n\tputserv \"NOTICE \$nick :/gs;
$putservtext_dict =~ s/, \"/,\"/gs;
$putservtext_dict .= "\"\n";
$putservtext_dict = "\tputserv \"NOTICE \$nick :Dictionaries, Lexicons, & Daily Devotionals ($count_dict):$putservtext_dict";
$putservtext_dict = "proc printDicts \{nick\} \{\n$putservtext_dict\}\n";

print TCL $putservtext_bible;
print TCL $putservtext_comm;
print TCL $putservtext_dict;

