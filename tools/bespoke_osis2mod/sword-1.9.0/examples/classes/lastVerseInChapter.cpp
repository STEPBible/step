/******************************************************************************
 *
 *  lastVerseInChapter.cpp -	This example demonstrates how to navigate
 *				verses using VerseKey.  It uselessly iterates
 *				every chapter of the KJV, finds the last verse
 *				and prints out the sole verse in the KJV which
 *				ends in a ',' -- just for fun.
 *
 * $Id: lastVerseInChapter.cpp 2980 2013-09-14 21:51:47Z scribe $
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

#include <swmgr.h>
#include <swmodule.h>
#include <versekey.h>
#include <iostream>


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	SWMgr library;

	SWModule *book = library.getModule("KJV");

	VerseKey *vk = (VerseKey *) book->getKey();
	for (;!vk->popError();vk->setChapter(vk->getChapter()+1)) {
		vk->setVerse(vk->getVerseMax());
		SWBuf text = book->stripText();
		text = text.trim();
		if (text.endsWith(",")) {
			cout << vk->getText() << ":\n\n";
			cout << text << endl;
		}
	}

	return 0;
}

