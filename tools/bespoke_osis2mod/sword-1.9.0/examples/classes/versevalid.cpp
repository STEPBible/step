/******************************************************************************
 *
 *  versevalid.cpp -	This example demonstrates how to check if a string
 *			is a valid verse reference
 *
 * $Id: verseranges.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2011-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swmgr.h>
#include <swmodule.h>
#include <versekey.h>
#include <localemgr.h>


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	if (argc == 1) {
		std::cerr << "usage: " << argv[0] << " <test string> [locale name] [Bible]\n\n";
		exit(-1);
	}
	cout << "\n";

	const char *testString = argv[1];
	const char *localeName = argc > 2 ? argv[2] : 0;
	const char *bibleName  = argc > 3 ? argv[3] : 0;

	VerseKey *vk = 0;

	if (localeName) {
		LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(localeName);
	}
	if (bibleName) {
		SWMgr manager;
		SWModule *bible = manager.getModule(bibleName);
		if (!bible) {
			cout << bibleName << " not installed for example.  Please install.\n\n";
			exit(-2);
		}
		vk = (VerseKey *)bible->createKey();
	}

	if (!vk) vk = new VerseKey();

	vk->setText(testString);

	std::cout << "error: " << (int)vk->popError() << "\n\n";

	std::cout << "parsed: " << vk->getText() << "\n\n";

	delete vk;

	cout << endl;

	return 0;
}

