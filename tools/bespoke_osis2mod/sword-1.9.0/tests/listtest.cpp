/******************************************************************************
 *
 *  listtest.cpp -	
 *
 * $Id: listtest.cpp 2893 2013-07-16 03:07:02Z scribe $
 *
 * Copyright 1999-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <stdio.h>
#include <iostream>
#include <stdlib.h>
#include <listkey.h>
#include <versekey.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
using namespace std;
#endif

int main(int argc, char **argv)
{
	// simple bounds check on verse first before we try this with listkey
	SWKey text;
	VerseKey vk("jn 1:1", "jn 1:12");
	vk = "jas 1:19";
	cout << "\nError should be set: " << ((vk.popError()) ? "set":"not set");
	text = (const char *)vk;
	cout << "\nshould be jn 1.12: " << text << "\n";
	vk = "mat 1:19";
	cout << "\nError should be set: " << ((vk.popError()) ? "set":"not set");
	text = (const char *)vk;
	cout << "\nshould be jn 1.1: " << text << "\n";
	vk = "jn 1:7";
	cout << "\nError should not be set: " << ((vk.popError()) ? "set":"not set");
	text = (const char *)vk;
	cout << "\nshould be jn 1.7: " << text << "\n";

	// complex listkey in listkey text
	ListKey lk, lk2;

	// c-tor bound setting
	VerseKey vk2("jude", "jude");

	lk << text;
	lk << text;
	lk << text;
	lk << "James 1:19";
	lk << "yoyo";
	lk << vk;
	lk2 << "test1";
	lk2 << lk;
	lk2 << vk2;
	lk2 << "test2";
	for (lk2 = TOP; !lk2.popError(); lk2++) {
		cout << (const char *) lk2 << "\n";
	}

	cout << "\n\n---------\n";

	lk2 = VerseKey().parseVerseList("1jn-2jn;mk1.9", 0, true);

	// c-tor not bound setting, just parsing to jn.1.1
	VerseKey yoyo("john");
	yoyo = MAXCHAPTER;
	cout << "should be jn.21.1: " << yoyo << "\n";

	lk2 << yoyo;
/*

	for (int i = 0; i < 2; i++) {
	VerseKey x, y;
	ListKey lk3;
	x = "rev";
	y = x;
	x = "mat";
	VerseKey newElement;
	newElement.LowerBound(x);
	newElement.UpperBound(y);
	lk3 << newElement;

	lk2 << lk3;
	}

*/

	for (lk2 = TOP; !lk2.popError(); lk2++)
		cout << (const char *) lk2 << "\n";

	lk.clear();
	lk << "john 3:16";
	cout << "\nCount should be 1: " << lk.getCount();

	lk = vk.parseVerseList("mat;mark;luke", vk, true);
	lk = (VerseKey)"mark 3:16";
	cout << "\nError should not be set: " << ((lk.popError()) ? "set":"not set");
	lk = (VerseKey)"john 3:16";
	cout << "\nError should be set: " << ((lk.popError()) ? "set":"not set");
	lk = vk.parseVerseList("mk 3:16", vk, true);
	lk = (VerseKey)"john 3:16";
	cout << "\nError should be set: " << ((lk.popError()) ? "set":"not set");
	lk = (VerseKey)"mark 3:16";
	cout << "\nError should not be set: " << ((lk.popError()) ? "set":"not set");

	cout << "\n\n";
	return 0;
}
