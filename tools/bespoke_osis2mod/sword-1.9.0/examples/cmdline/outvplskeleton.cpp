/******************************************************************************
 *
 *  outvplskeleton.cpp -This example shows how to output a skeleton of 
 *			verse references from a SWORD module. 
 *
 * Gen.1.1
 * Gen.1.2
 * ...
 *
 * Class SWMgr manages installed modules for a frontend.
 * The developer may use this class to query what modules are installed
 * and to retrieve an (SWModule *) for any one of these modules
 *
 * SWMgr makes its modules available as an STL Map.
 * The Map definition is typedef'ed as ModMap
 * ModMap consists of: FIRST : SWBuf moduleName
 *                     SECOND: SWModule *module
 *
 * $Id: outvplskeleton.cpp Refdoc $
 *
 * Copyright 2008-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <markupfiltmgr.h>


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	SWMgr manager(new MarkupFilterMgr(sword::FMT_XHTML, sword::ENC_UTF8));

	const char *bookName = (argc > 1) ? argv[1] : "KJV";
	SWModule *b = manager.getModule(bookName);
	if (!b) return -1;
	SWModule &book = *b;
	book.setProcessEntryAttributes(false);
	VerseKey *vk = SWDYNAMIC_CAST(VerseKey, book.getKey());
	for (book = TOP; !book.popError() && !book.getRawEntryBuf().size(); book++);
	if (!book.getRawEntryBuf().size()) return -2; 	// empty module
	for (;!book.popError(); book++) {
		if (vk) cout << vk->getOSISRef();
		else    cout << book.getKeyText();
		cout << "\n";
	}

	return 0;
}
