/******************************************************************************
 *
 *  verseposition.cpp -	
 *
 * $Id: verseposition.cpp 2980 2013-09-14 21:51:47Z scribe $
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

        const char *modName = "HunKar";
        SWMgr library;
        SWModule *book = library.getModule(modName);
        if (!book) {
                cerr << "Can't find module: " << modName << endl;
                return -1;
        }
        VerseKey* key = ((VerseKey *)book->getKey());

        key->setIntros(true);
        book->setSkipConsecutiveLinks(true);
        book->setPosition(TOP);

        cout << *key << endl;

        return 0;
}
