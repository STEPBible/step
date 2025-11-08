#!/usr/bin/perl

#******************************************************************************
#
#  mkvsmod.pl -	
#
# $Id: mkvsmod.pl 2841 2013-06-29 10:58:08Z chrislit $
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

open (INF, $ARGV[0]);

`addvs -c ./`;
while (<INF>) {
    
    $line = $_;
    $line =~ s/[\r\n]//g;
    $line =~ /(.+\d+:\d+:?) +(.*)/;
    $ref = $1;
    $ver = $2;
    open (BUF, ">buffer");
    print BUF "$ver";
    close (BUF);
    $x = `addvs -a ./ \"$ref\" buffer`;
    print "$ref\n";

}

close (INF);
