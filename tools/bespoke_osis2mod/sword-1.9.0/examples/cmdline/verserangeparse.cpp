/******************************************************************************
 *
 *  verserangeparse.cpp -	This example shows
 *				how to parse a verse reference
 *
 * $Id: verserangeparse.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2006-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <versekey.h>
#include <listkey.h>
#include <swmodule.h>
#include <markupfiltmgr.h>

using sword::SWMgr;
using sword::VerseKey;
using sword::ListKey;
using sword::SWModule;
using sword::SW_POSITION;
using sword::FMT_PLAIN;
using sword::MarkupFilterMgr;
using std::cout;
using std::endl;

int main(int argc, char **argv)
{
	const char *range = (argc > 1) ? argv[1] : "Mat 2:10,12-15";

	VerseKey parser;
	ListKey result;

	result = parser.parseVerseList(range, parser, true);

	// let's iterate the key and display
	for (result = TOP; !result.popError(); result++) {
		cout << result << "\n";
	}
	cout << endl;

	// Now let's output a module with the entries from the result
	
	// we'll initialize our library of books
	SWMgr library(new MarkupFilterMgr(FMT_PLAIN));	// render plain without fancy markup

	// Let's get a book;
	SWModule *book = library.getModule("KJV");

	// couldn't find our test module
	if (!book) return -1;

	// now let's iterate the book and display
	for (result = TOP; !result.popError(); result++) {
		book->setKey(result);
		cout << "*** " << book->getKeyText() << ": " << book->renderText() << "\n";
	}

	return 0;
}
