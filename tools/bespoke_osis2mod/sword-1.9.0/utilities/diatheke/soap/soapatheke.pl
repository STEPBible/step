#!/usr/bin/perl

#******************************************************************************
#
#  soapatheke.pl -	This is a demo SOAP app and has no other purpose.
#
# $Id: soapatheke.pl 2841 2013-06-29 10:58:08Z chrislit $
#
# Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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

use SOAP::Lite;

my ($books, $key, $options, $encoding, $markup, $searchtype, $locale, $script, $max) = @ARGV;

# uncomment to see parameters being passed to the SOAP server (for debugging)
# print "$books\n$key\n$options\n$encoding\n$markup\n$searchtype\n$locale\n$script\n$max\n";

print SOAP::Lite
    -> uri('http://bible.gotjesus.org/sapouni')
    -> proxy('http://bible.gotjesus.org/cgi-bin/sapouni.cgi')
    -> biblequery($books, $key, $options, $encoding, $markup, $searchtype, $locale, $script, $max)
    -> result;
