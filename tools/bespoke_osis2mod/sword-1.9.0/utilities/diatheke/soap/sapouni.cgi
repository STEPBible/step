#!/usr/bin/perl

# /****************************************************************************
# *
# *  sapouni.cgi -	CGI SOAP interface to diatheke
# *
# * $Id: sapouni.cgi 2833 2013-06-29 06:40:28Z chrislit $
# *
# * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
# *	CrossWire Bible Society
# *	P. O. Box 2528
# *	Tempe, AZ  85280-2528
# *
# * This program is free software; you can redistribute it and/or modify it
# * under the terms of the GNU General Public License as published by the
# * Free Software Foundation version 2.
# *
# * This program is distributed in the hope that it will be useful, but
# * WITHOUT ANY WARRANTY; without even the implied warranty of
# * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# * General Public License for more details.
# *
# */

#version 1.0

package sapouni;
$sapouni = "nice /usr/bin/diatheke";  # location of diatheke command line program -- if you are using a MS Windows server, you might need to remove the "nice"

$sword_path = "/home/sword";  # SWORD_PATH environment variable you want to use
$maxverses = 0; # maximum number of verses diatheke will return per query (prevents people from asking for Gen1:1-Rev22:21; 0 for unlim.)
$defversion = "KJV"; # book to query when none is selected, but a verse/search is entered
$deflocale = "abbr";  # this is just the default for cases where user has not selected a locale and his browser does not reveal one -- you can also set locale using locael=<locale> in the GET URL


###############################################################################
## You should not need to edit anything below this line.
## Unless you want to modify functionality of course. :)
###############################################################################

$ENV{'SWORD_PATH'} = $sword_path;

use SOAP::Transport::HTTP;

SOAP::Transport::HTTP::CGI
    -> dispatch_to('sapouni')
    -> handle;

package sapouni;

sub biblequery {
    my ($class, $books, $key, $options, $encoding, $markup, $searchtype, $locale, $script, $max) = @_;

    if ($key eq "") {
	$key = "Jn 3:16";
    }

    @booklist = split ' ', $books;
    
    $n = scalar(@booklist);
    if ($n == 0) {
	@booklist[0] = $defversion;
	$n++;
    }

    $query = "";

    if ($options ne "") {
	$query .= " -o \"$options\"";
    }

    if ($encoding ne "") {
	$query .= " -e \"$encoding\"";
    }
    else {
	$query .= " -e UTF8";
    }

    if ($markup ne "") {
	$query .= " -f \"$markup\"";
    }
    else {
	$query .= " -f ThML";
    }

    if ($searchtype ne "") {
	$query .= " -s \"$searchtype\"";
    }

    if ($locale ne "") {
	$query .= " -l \"$locale\"";
    }
    else {
	$query .= " -l $deflocale";
    }

    if ($script ne "") {
	$query .= " -t \"$script\"";
    }
    
    if ($max ne "" && $max ne 0) {
	$query .= " -m \"$max\"";
    }

    $rval = "";
    for ($i = 0; $i < $n; $i++) {   
	$line = "$sapouni $query -b $booklist[$i] -k \"$key\" 2> /dev/null";
	
	# uncomment to print the command line send to Diatheke (for debugging)
	# $rval .= "$line\n";

	$line = `$line`;
	chomp($line);
	
	$rval .= "$line\n";
    }	

    return "$rval";
}
