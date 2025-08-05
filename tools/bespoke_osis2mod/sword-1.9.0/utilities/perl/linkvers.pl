#!/usr/bin/perl

#******************************************************************************
#
#  linkvers.pl -	
#
# $Id: linkvers.pl 2841 2013-06-29 10:58:08Z chrislit $
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

$vplfile = $ARGV[0];

if ($vplfile eq "") {
    die("linkvers.pl Syntax:\n./linkvers.pl <vpl file> [1 - checking mode on].\nMust be run AFTER vpl2mod is completed.\n");
}

$check = $ARGV[1];

open(INF,$vplfile) or die;
while (<INF>) {
    $line = $_;

    $line =~ /([\w ]+:[\d\-]+)\s+(.*)/;
    $vref = $1;

    if ($vref =~ /\-/) {
	$vref =~ /(.*:)(\d+)\-(\d+)/;
	$ch = $1;
	$fv = $2;
	$lv = $3;
	if ($fv + 1 == $lv) {
	    $sv = $lv;
	}
	else {
	    $sv = $fv + 1;
	    $sv .= "-" . $lv;
	}
	$first = $ch . $fv;
	$last = $ch . $sv;

	if ($check ne "") {
	    print "$first\t\t$last\n";
	} else {
	    `addvs -l ./ \"$first\" \"$last\"`;
	}
    }
}
close(INF);




