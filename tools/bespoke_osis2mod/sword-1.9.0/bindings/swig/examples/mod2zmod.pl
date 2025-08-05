#!/usr/bin/perl

#******************************************************************************
#
#  mod2zmod.pl -	This program converts a given module into a compressed
#			module of the same type. This is just an example to
#			demomstrate the power of the Perl Sword bindings. The
#			code is almost written the same way the C++ of
#			mod2zmod.cpp code was written
#
# $Id: mod2zmod.pl 2841 2013-06-29 10:58:08Z chrislit $
#
# Copyright 2002-2009 CrossWire Bible Society (http://www.crosswire.org)
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

use Sword;
use strict;

my $appname = "mod2zmod.pl";

sub printUsage()
{
	print "\n$appname - Convert a module into a compressed module of the same type.\n";
	print "Usage: $appname <module> <datapth> [blocktype [compresstype]]\n";
	print("datapath: the directory in which to write the zModule\n");
        print("blockType  : (default 4)\n\t2 - verses\n\t3 - chapters\n\t4 - books\n");
        print("compressType: (default 1):\n\t1 - LZSS\n\t2 - Zip\n\n");

	exit(-1);
}

#main part of the program
if (scalar(@ARGV) < 2 || scalar(@ARGV) > 4) {
	printUsage;
}

#initialization stuff
my $datapath = $ARGV[1];
my $blockType = defined $ARGV[2] ? $ARGV[2] : 4;
my $compressType = defined $ARGV[3] ? $ARGV[3] : 1;
my $mgr = new Sword::SWMgr();
my $module = $mgr->module($ARGV[0]);
my $compressor = ($compressType == 1) ? new Sword::LZSSCompress() : new Sword::ZipCompress();

my $newmod;

if ($module->Type() eq "Biblical Texts") {
	if (!Sword::zText::createModule( $datapath, $blockType )) {
		print "$appname: Couldn't create module in $datapath";
		exit(-1);
	}
        $newmod = new Sword::zText( $datapath, 0, 0, $blockType, $compressor );

} elsif ($module->Type() eq "Lexicons / Dictionaries") {
	if (!Sword::zLD::createModule( $datapath )){
		print "$appname: Couldn't create module in $datapath";
		exit(-1);
	}
	$newmod = new Sword::zLD( $datapath, 0, 0, $blockType, $compressor)
} elsif ($module->Type() eq "Commentaries") {
	if (!Sword::zCom::createModule( $datapath, $blockType )){
		print "$appname: Couldn't create module in $datapath";
		exit(-1);
	}
	$newmod = new Sword::zCom( $datapath, 0, 0, $blockType, $compressor)
}

# now copy the content of the module!

my $buffer;

$module->top();
$module->setSkipConsecutiveLinks(0);
do {
	my $key = $module->Key();
	if (($buffer eq $module->getRawEntry()) &&($buffer ne "")) {
                print "Adding [", $key->getText(), "] link to: \n";
		$newmod->writeLink($key);
	}
	else {
		$buffer = $module->getRawEntry();
		if ($buffer ne "") {
		  $newmod->SetKey($key);
		  $newmod->write($buffer);
		  # print "Added ", $key->getText(), "\n";
		}
		else {
		  print "Skipping empty ", $key->getText(), "\n";
		}
	}
} while($module->next());

print "The new module is now available in $datapath!\n";
