/******************************************************************************
 *
 *  ciphercng.cpp -	This example demonstrates how to change the cipher key
 *			of a module. The change is only in effect for this
 *			run.  This DOES NOT change the cipherkey in the
 *			module's .conf file.
 *
 * $Id: ciphercng.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <stdio.h>
#include <iostream>

#include <swmgr.h>
#include <swmodule.h>


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	if (argc != 2) {
		fprintf(stderr, "usage: %s <modName>\n", *argv);
		exit(-1);
	}

	SWMgr manager;		// create a default manager that looks in the current directory for mods.conf
	ModMap::iterator it;
	it = manager.Modules.find(argv[1]);

	if (it == manager.Modules.end()) {
		fprintf(stderr, "%s: couldn't find module: %s\n", *argv, argv[1]);
		exit(-1);
	}

	SWModule *module = (*it).second;
	string key;

	cout << "\nPress [CTRL-C] to end\n\n";
	while (true) {
		cout << "\nModule text:\n";
		module->setKey("1jn 1:9");
		cout << "[ " << module->getKeyText() << " ]\n";
		cout << module->renderText();
		cout << "\n\nEnter new cipher key: ";
		cin >> key;
		cout << "\nSetting key to: " << key;
		manager.setCipherKey(argv[1], key.c_str());
	}

	return 0;
}
