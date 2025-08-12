/******************************************************************************
 *
 *  versemgrtest.cpp -	
 *
 * $Id: versemgrtest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <versificationmgr.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

using std::cout;
using std::endl;

int main(int argc, char **argv) {

	const char *v11n = (argc > 1) ? argv[1] : "KJV";

	VersificationMgr *vmgr = VersificationMgr::getSystemVersificationMgr();
	const VersificationMgr::System *system = vmgr->getVersificationSystem(v11n);
	int bookCount = system->getBookCount();
	const VersificationMgr::Book *lastBook = system->getBook(bookCount-1);
	int chapMax = lastBook->getChapterMax();
	int verseMax = lastBook->getVerseMax(chapMax);
	long offsetMax = system->getOffsetFromVerse(bookCount-1, chapMax, verseMax);

	cout << "Versification System: " << v11n << "\n";
	cout << "Book Count: " << bookCount << "\n";
	cout << "Last Book: " << lastBook->getLongName() << " (" << lastBook->getOSISName() << ")\n";
	cout << "  Chapter Max: " << chapMax << "\n";
	cout << "    Verse Max: " << verseMax << "\n";
	cout << "       Offset: " << offsetMax << "\n\n";
	cout << "Offset, Book, Chapter, Verse\n";

	int book, chapter, verse;
	for (long offset = 0; offset <= offsetMax; offset++) {
		system->getVerseFromOffset(offset, &book, &chapter, &verse);
		cout << offset << ": " << book << ", " << chapter << ", " << verse << "\n";
	}
	
	cout << endl;

	return 0;
}
