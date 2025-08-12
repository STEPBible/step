#!/usr/bin/perl

#******************************************************************************
#
#  sword.pl -	This looks like a test program to check binding functionality
#
# $Id: sword.pl 2960 2013-08-13 15:49:39Z greg.hellings $
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

print "Version (should be 1.0): " , $Sword::VERSION , "\n";

print "Create SWConfig object!\n";
$config = new Sword::SWConfig("test.conf");

print "Load\n";
$config->Load();

print "Set value ... ";
print $config->set("Group", "Entry", "Value");
print " finished \n";

print "Get value ... ";
print $config->get("Group", "Entry");
print " finished \n";

$config->Save();

#testing SWMgr
print "testing SWMgr\n";
#$localemgr = Sword::LocaleMgr::getSystemLocaleMgr();
#$localemgr->setDefaultLocaleName("de");

$mgr = new Sword::SWMgr();
print "init ... ";
#$module = $mgr->module("GerLut1545-temp");
$module = $mgr->getModule("WEB");
print "Printing WEB Module information: \n";
print "Name:\t", $module->getName(),"\nDescription:\t", $module->getDescription(), "\nLang:\t", $module->getLanguage(), "\n";

$key = new Sword::VerseKey("Matthew 3:16");
#$key->setPersist(1);
$module->setKey($key);

for ($i = 0; $i < 15; $i++) {
  print "(", $module->getKeyText() ,")\t", $module->stripText(), "\n";
  $key->increment();
  $module->setKey($key);
}
$key->increment(103);
$module->setKey($key);
print "(", $module->getKeyText() ,")\t", $module->stripText(), "\n";

#testing write interface
$key->setText("John 3:16");
$module->setKey($key);
$module->setEntry("This is a test entry! This tests the write abilities of the Sword Perl classes", 78);
print "(", $module->getKeyText() ,")\t", $module->stripText(), "\n";

print "Searching for God: ";
$list = $module->doSearch("God");
print $list->getCount(), " entries found!\n";
#for ( $i = 0; $i < $list->Count(); $i++) {
#  print "(", $i, ")\t", $list->GetElement()->getText(), "\n";
#  $list->next();
#}

print "Creating new module! Writing search result...";
#Sword::RawText::createModule("/usr/share/sword/modules/texts/ztext/testmodule/");
#$newmod = new Sword::RawText("/usr/share/sword/modules/texts/ztext/testmodule/");

#$key->setText("Genesis 1:1");
$newkey = $key->clone();
#$newmod->SetKey($newkey);
#
#for ($i = 0; $i < $list->Count(); $i++, $list->next()) {
#	$key->setText($list->GetElement()->getText());
#	$newkey->setText($list->GetElement()->getText());	
#
#	$newmod->write( $module->StripText() );
#}

print "Now create the LD module\n";

 mkdir("ldmod");
Sword::zText::createModule("ldmod/",4);

print "first step}\n";

$newmod = new Sword::zText("ldmod/");

print "Created module;\n";

$newkey = $newmod->createKey();
#$newkey->setPersist(1);
$newkey->setText(" ");
$module->setKey($newkey);

print "Loop! \n";

for ($i = 0; $i < $list->getCount(); $i++) {
	print $list->getElement()->getText() . "\n";

        $key->setText($list->getElement()->getText());
        $newkey->setText($list->getElement()->getText());

	$newmod->setKey($newkey);

	$entry = $module->stripText();
        $newmod->setEntry( $entry, length $entry );
	$list->increment();
}

