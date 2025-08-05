/******************************************************************************
 *
 *  vtreekeytest.cpp -	
 *
 * $Id: vtreekeytest.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2009-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */

#include <iostream>
#include <stdio.h>
#include <stdlib.h>

#include <versekey.h>
#include <listkey.h>
#include <localemgr.h>
#include <swmgr.h>
#include <swmodule.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

using std::cout;
using std::endl;

int main(int argc, char **argv) {

	SWMgr mgr;
	SWModule *mod = mgr.getModule("KJVgb");

	VerseKey *key1 = (VerseKey *)mod->createKey();

	key1->setTestament(2);
	key1->setBook(4);
	key1->setChapter(2);
	key1->setVerse(3);

	cout << "\n" << key1->getText() << ":\n\n";

	ListKey keys;
	keys << *key1;

	cout << "\n" << keys.getRangeText() << ":\n\n";

	ListKey keys2 = keys;

	cout << "\n" << keys2.getRangeText() << ":\n\n";

	keys = key1->parseVerseList("Lk.4.5");

	cout << "\n" << key1->getText() << ":\n\n";

	key1->setText("jn.6.7");

	cout << "\n" << key1->getText() << ":\n\n";
	

	mod->setKey("lk.2.3");

	cout << "\n" << mod->getKeyText() << ":\n" << endl;
	cout << mod->getRawEntry() << endl;


	cout << "\nListkey persist key iteration test\n\n";
	keys = key1->parseVerseList("mat1", 0, true);

	for (keys = TOP; !keys.popError(); keys++) {
		cout << "\n" << keys.getText() << ":\n" << endl;
	}


	keys.setPersist(true);

	mod->setKey(keys);

	for ((*mod) = TOP; !mod->popError(); (*mod)++) {
		cout << "\n" << mod->getKeyText() << ":\n" << endl;
	}

	delete key1;

	return 0;
}
