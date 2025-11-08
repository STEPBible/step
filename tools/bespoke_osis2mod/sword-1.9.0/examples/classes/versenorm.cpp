/******************************************************************************
 *
 *  versenorm.cpp -	checks normalization of verse to module
 *
 * $Id$
 *
 * Copyright 2012-2013 CrossWire Bible Society (http://www.crosswire.org)
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

        const char *modName = "RusCARS";
        const char *keyTextRegular = "1Sam1.20";
        const char *keyTextNeedsNormalization = "1Sam1.200";


        SWMgr library;
        SWModule *book = library.getModule(modName);
        if (!book) {
                cerr << "Can't find module: " << modName << endl;
                return -1;
        }


	// get two VerseKey objects for a module
        VerseKey *verse = ((VerseKey *)book->createKey());
        VerseKey *verseNormalized = ((VerseKey *)book->createKey());

	// turn off autonormalization for one VerseKey reference
        verse->setAutoNormalize(false);

	// set a reference not requiring normalization to both VerseKey objects
	verse->setText(keyTextRegular);
	verseNormalized->setText(keyTextRegular);

	// check to see if they are equal
        cout << *verse << ((*verse) == (*verseNormalized) ? " == " : " != ") << *verseNormalized << endl;

	// now do the same for a reference which requires normalization in this module's v11n system
	verse->setText(keyTextNeedsNormalization);
	verseNormalized->setText(keyTextNeedsNormalization);

        cout << *verse << ((*verse) == (*verseNormalized) ? " == " : " != ") << *verseNormalized << endl;

	delete verse;
	delete verseNormalized;

        return 0;
}
