/******************************************************************************
 *
 *  casttest.cpp -	
 *
 * $Id: casttest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <iostream>
#include <versekey.h>
#include <treekeyidx.h>
#include <listkey.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main(int argc, char **argv) {
//	VerseKey x("jas");
	TreeKeyIdx x("jas");
//	ListKey x("jas");
	SWKey *y = &x;
	TreeKeyIdx *v = &x;
//	VerseKey *v = &x;
//	ListKey *v = &x;

//	v = SWDYNAMIC_CAST(VerseKey, y);
	v = SWDYNAMIC_CAST(TreeKeyIdx, y);
//	v = SWDYNAMIC_CAST(ListKey, y);
	std::cout << std::endl;
	if (v)
		std::cout << (const char *)(*v);
	else
		std::cout << "cast failed\n";

	std::cout << std::endl;
	std::cout << std::endl;
	return 0;
}
