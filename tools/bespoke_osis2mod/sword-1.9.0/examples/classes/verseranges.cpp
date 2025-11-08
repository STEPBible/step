/******************************************************************************
 *
 *  verseranges.cpp -	This example demonstrates how to work with contiguous
 *			verse ranges using VerseKey
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


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	cout << "\n";

	const char *modName = "KJVA";
	SWMgr manager;
	SWModule *bible = manager.getModule(modName);
	if (!bible) {
		cout << modName << " not installed for example.  Please install.\n\n";
		exit(-1);
	}

	VerseKey *vk = (VerseKey *)bible->createKey();

	// let's set verse ranges for a variety of different contiguous regions

	// set a verse range for the whole Bible
	vk->setLowerBound(*vk);	// vk initially points to TOP, so we don't need to set position first
	vk->setPosition(BOTTOM);
	vk->setUpperBound(*vk);
	cout << vk->getRangeText() << "\n";


	vk->clearBounds();


	// Old Testament
	vk->setPosition(TOP);
	vk->setLowerBound(*vk);

	vk->setTestament(2);
	(*vk)--;

	vk->setUpperBound(*vk);
	cout << vk->getRangeText() << "\n";


	vk->clearBounds();


	// New Testament
	vk->setPosition(TOP);
	vk->setTestament(2);
	vk->setLowerBound(*vk);
	vk->setPosition(BOTTOM);
	vk->setUpperBound(*vk);
	cout << vk->getRangeText() << "\n";


	vk->clearBounds();


	// Current Book
	vk->setText("John 3:16");
	vk->setChapter(1); vk->setVerse(1);
	vk->setLowerBound(*vk);
	vk->setChapter(vk->getChapterMax()); vk->setVerse(vk->getVerseMax());
	vk->setUpperBound(*vk);
	cout << vk->getRangeText() << "\n";


	// -------------------------
	// Shorter syntax using the parser and based on book names, and requires intimate knowledge of VersificationMgr
	// You're probably better off using the above code, but this is here for completeness
	//
	const VersificationMgr::System *refSys = VersificationMgr::getSystemVersificationMgr()->getVersificationSystem(vk->getVersificationSystem());


	// whole Bible
	VerseKey vkBible(refSys->getBook(0)->getOSISName(), refSys->getBook(refSys->getBookCount()-1)->getOSISName(), refSys->getName());
	cout << vkBible.getRangeText() << "\n";

	// OT
	VerseKey vkOT(refSys->getBook(0)->getOSISName(), refSys->getBook(refSys->getBMAX()[0]-1)->getOSISName(), refSys->getName());
	cout << vkOT.getRangeText() << "\n";

	// NT
	VerseKey vkNT(refSys->getBook(refSys->getBMAX()[0])->getOSISName(), refSys->getBook(refSys->getBookCount()-1)->getOSISName(), refSys->getName());
	cout << vkNT.getRangeText() << "\n";

	// Current Book
	vk->setText("John 3:16");
	VerseKey vkCurrentBook(vk->getBookName(), vk->getBookName(), refSys->getName());
	cout << vkCurrentBook.getRangeText() << "\n";


	delete vk;

	cout << endl;

	return 0;
}

