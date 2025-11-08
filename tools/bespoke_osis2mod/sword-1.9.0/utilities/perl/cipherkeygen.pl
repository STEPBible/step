#!/usr/bin/perl

#******************************************************************************
#
#  cipherkeygen.pl -	generates a cipher key of the format
#			\d{4}[a-zA-Z]{4}\d{4}[a-zA-Z]{4}
#
# $Id: cipherkeygen.pl 2841 2013-06-29 10:58:08Z chrislit $
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


# let's get a base key of \d{4}[A-Z]{4}\d{4}[A-Z]{4}
$key = int(rand() * 10) . int(rand() * 10) . int(rand() * 10) . int(rand() * 10) . chr(int(rand() * 26) + 0x41) . chr(int(rand() * 26) + 0x41) . chr(int(rand() * 26) + 0x41) . chr(int(rand() * 26) + 0x41) . int(rand() * 10) . int(rand() * 10) . int(rand() * 10) . int(rand() * 10) . chr(int(rand() * 26) + 0x41) . chr(int(rand() * 26) + 0x41) . chr(int(rand() * 26) + 0x41) . chr(int(rand() * 26) + 0x41);

# now randomly lowercase the letters, printing as we go
foreach $c (unpack ("cccccccccccccccc", $key)) {
    $c = chr($c);
    if (rand() < 0.5) {
	$c = lc($c);
    }
    print $c;
}
print "\n";



