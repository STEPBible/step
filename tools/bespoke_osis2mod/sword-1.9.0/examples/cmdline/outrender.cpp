/******************************************************************************
 *
 *  outrender.cpp -	This example show how to choose an output render
 *			markup and render entries from a SWORD module. The
 *			following snippet outputs a module in HTML output
 *			encoded as UTF8.
 *
 * $Id: outrender.cpp 2980 2013-09-14 21:51:47Z scribe $
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

#include <swmgr.h>
#include <swmodule.h>
#include <versekey.h>
#include <markupfiltmgr.h>


using namespace sword;
using namespace std;


int main(int argc, char **argv) {

	SWMgr manager(new MarkupFilterMgr(sword::FMT_HTMLHREF, sword::ENC_UTF16));

	const char *bookName = (argc > 1) ? argv[1] : "WLC";

	SWModule *b = manager.getModule(bookName);
	if (!b) return -1;

	SWModule &book = *b;
	book.setProcessEntryAttributes(false);
	VerseKey *vk = SWDYNAMIC_CAST(VerseKey, book.getKey());

	// find the first non-zero entry
	for (book = TOP; !book.popError() && !book.getRawEntryBuf().size(); book++);
	if (!book.getRawEntryBuf().size()) return -2; 	// empty module

	for (;!book.popError(); book++) {

		cout << "$$$";
		if (vk) cout << vk->getOSISRef();
		else    cout << book.getKeyText();

		cout << "\n" << book.renderText() << "\n\n";
	}

	return 0;
}

