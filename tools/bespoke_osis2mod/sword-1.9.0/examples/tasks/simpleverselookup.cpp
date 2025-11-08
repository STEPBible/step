/******************************************************************************
 *
 *  simple.cpp -	This is about the simplest useful example of using the
 *			SWORD engine.
 *
 * After sword is installed, it should compile with something similar to:
 *
 *	g++ -o simple simple.cpp `pkg-config --cflags --libs sword`
 *
 * If you'd like to choose the type of tag markup which sword will output
 *	for you, include:
 *
 *	#include <markupfiltmgr.h>
 *
 * and change your instantiation of SWMgr, below, to (e.g., for HTML):
 *
 *	SWMgr library(0, 0, true, new MarkupFilterMgr(FMT_HTMLHREF));
 *
 * $Id: simpleverselookup.cpp 3481 2017-06-25 11:45:04Z scribe $
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

// Simple example to show James 1:19 from KJV,
// if argv[1] is passed then use this instead of KJV
// if argv[2] is passed then use this instead of James 1:19

#include <swmgr.h>
#include <swmodule.h>
#include <iostream>


using namespace sword;
using std::cout;


int main(int argc, char **argv) {
	// instantiate a SWORD Manager to give access to the installed library of books (modules)
	SWMgr library;

	// try to retrieve a reference to an installed book (module)
	SWModule *book = library.getModule((argc > 1) ? argv[1] : "KJV");

	// set that book's reference key to our desired verse
	book->setKey((argc > 2) ? argv[2] : "James 1:19");

	// ask the book to render the current text
	cout << book->renderText() << "\n";

	return 0;
}

