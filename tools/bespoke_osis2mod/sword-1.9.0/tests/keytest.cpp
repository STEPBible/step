/******************************************************************************
 *
 *  keytest.cpp -	
 *
 * $Id: keytest.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 1996-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <versekey.h>
#include <rawtext.h>
#include <rawcom.h>
#include <echomod.h>
#include <stdlib.h>

#include <localemgr.h>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main(int argc, char **argv)
{
	int loop;
	int max;

	VerseKey yo("Gen.1.1", "Gen.1.2");
	std::cout << yo.getRangeText();
	if (argc > 1)
		LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(argv[1]);

	VerseKey	bla;
	long index;


	if (argc < 2) 
		bla = "James    1:19";
	else	bla = argv[2];

	std::cout << "\n Headings: " << (bool)bla.isIntros() << "\n";
	std::cout << " (.Index(Index()+1))\n";

	max = (argc < 4) ? 10 : atoi(argv[3]);

	for (loop = 0; loop < max; loop++) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")";
		bla.setIndex(index+1);
		std::cout << "-> " << (const char *)bla << "\n";
	}

	std::cout << "-----------------\n";
	std::cout << "\n (.Index(Index()-1))\n";
	if (argc < 2) 
		bla = "James    1:19";
	else	bla = argv[2];

	for (loop = max; loop; loop--) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")";
		bla.setIndex(index-1);
		std::cout << "-> " << (const char *)bla << "\n";
	}

	std::cout << "-----------------\n";
	bla.setIntros(true);
	std::cout << "\n Headings: " << (bool)bla.isIntros() << "\n";
	std::cout << " key++\n";

	if (argc < 2) 
		bla = "Matthew  1:5";
	else	bla = argv[2];

	for (loop = 0; loop < max && !bla.popError(); loop++,bla++) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";
	bla.setIntros(true);
	std::cout << "\n Headings: " << (bool)bla.isIntros() << "\n";
	std::cout << " key--\n";

	if (argc < 2) 
		bla = "Matthew  1:5";
	else	bla = argv[2];

	for (loop = max; loop && !bla.popError(); loop--, bla--) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";

	if (argc < 2) 
		bla = "Genesis  1:5";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla--) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";

	if (argc < 2) 
		bla = "Malachi  4:2";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla++) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";

	if (argc < 2) 
		bla = "Revelation of John  22:17";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla++) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}


	std::cout << "-----------------\n";
	std::cout << "-------- Headings ---------\n";

	bla.setIntros(true);

	if (argc < 2) 
		bla = "Matthew  1:5";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla--) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";

	if (argc < 2) 
		bla = "Genesis  1:5";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla--) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";

	if (argc < 2) 
		bla = "Malachi  4:2";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla++) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "-----------------\n";

	if (argc < 2) 
		bla = "Revelation of John  22:17";
	else	bla = argv[2];

	for (loop = max; loop; loop--, bla++) {
		index = bla.getIndex();
		std::cout << (const char *)bla << "(" << index << ")\n";
	}

	std::cout << "\n\n";

	std::cout << "-------- Error Check ------------\n\n";
	bla = "Revelation of John 23:19";
	std::cout << "bla = \"Revelation of John 23:19\"\n";
	std::cout << "(const char *)bla = " << (const char *)bla << "\n";
	std::cout << "bla.popError() = " << (int)bla.popError() << " \n";
	std::cout << "bla++ \n";
	bla++;
	std::cout << "bla.popError() = " << (int)bla.popError() << " \n";

	bla.setIntros(false);
	for (bla = BOTTOM; !bla.popError(); bla.setBook(bla.getBook()-1))
		std::cout << (const char *)bla << "\n";
	bla.setTestament(1);
	bla = BOTTOM;
	std::cout << bla.getTestamentIndex() << "\n";
	std::cout << bla.getIndex() << "\n";
	std::cout << bla << "\n";
	bla.setTestament(2);
	bla = BOTTOM;
	std::cout << bla.getTestamentIndex() << "\n";
	std::cout << bla.getIndex() << "\n";
	std::cout << bla << "\n";
	return 0;
}
