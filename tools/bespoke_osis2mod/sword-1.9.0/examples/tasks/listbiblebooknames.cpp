/******************************************************************************
 *
 *  verseranges.cpp -	This example demonstrates how to work with contiguous
 *			verse ranges using VerseKey
 *
 * $Id$
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


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	cout << "\n";

	const char *modName = (argc > 1) ? argv[1] : "KJV";
	SWMgr manager;
	SWModule *bible = manager.getModule(modName);
	if (!bible) {
		cout << modName << " module is not installed.\nPlease install to show versification (v11n) from this specific Bible.\nShowing builtin KJV v11n scheme..\n\n";
	}

	VerseKey *vk = (bible) ? (VerseKey *)bible->getKey() : new VerseKey();

	for ((*vk) = TOP; !vk->popError(); vk->setBook(vk->getBook()+1)) {
		if (!bible || bible->hasEntry(vk)) {
			cout << vk->getBookName() << "\n";
		}
	}

	// if we 'new'ed a VerseKey unassociated with a module, above, then we should delete it.
	if (!bible) delete vk;

	return 0;
}

