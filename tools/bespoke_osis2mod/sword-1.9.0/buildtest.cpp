/******************************************************************************
 *
 *  buildtest.cpp -	This is a dumby program which does nothing useful but
 *			links to the SWORD engine to confirm basic things were
 *			built ok.
 *
 * $Id: buildtest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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
#include <rawtext.h>
//#include <zcom.h>
#include <rawcom.h>
//#include <rawfiles.h>
#ifndef NO_SWORD_NAMESPACE
using sword::VerseKey;
using sword::RawText;
using sword::RawCom;
using sword::SWKey;
#endif
using std::cout;

int main(int argc, char **argv)
{
	int loop;
	int max;
	VerseKey mykey;
//	RawText text("src/modules/texts/rawtext/sve/", "Sven Text", "Sven Text");
	RawText text("src/modules/texts/rawtext/webster/", "Webster", "Webster Text");
//	RawText text("src/modules/texts/rawtext/orthjbc/", "Webster", "Webster Text");
//	RawText text("src/modules/texts/rawtext/kjv/", "KJV", "KJV Text");
//	RawText text("src/modules/texts/rawtext/vnt/", "VNT", "Valera Spanish NT");
//	RawCom  commentary("src/modules/comments/rawcom/rwp/", "RWP", "Robertson's Word Pictures");
	RawCom  commentary("src/modules/comments/rawcom/mhc/", "MHC", "Matthew Henry's Commentary on the Whole Bible");
//	RawFiles  commentary("src/modules/comments/rawfiles/personal/", "MHC", "Matthew Henry's Commentary on the Whole Bible");


	if (argc > 3)
		mykey.setAutoNormalize(false);  // Turn off autonormalize if 3 args to allow for intros
				// This is kludgy but at lease you can try it
				// with something like: sword "Matthew 1:0" 1 1


	mykey = (argc < 2) ? "James    1:19" : argv[1];
	mykey.setPersist(true);
	text.setKey(mykey);
	commentary.setKey(mykey);


	max = (argc < 3) ? 1 : atoi(argv[2]);


	cout << "\n";


	for (loop = 0; loop < max; loop++) {
		cout << (SWKey &)text << ":\n";
		text.display();
		cout << "\n";
		cout << "-------------\n";
		commentary.display();
		cout << "\n";
		cout << "==========================\n";
		mykey++;
	}
	cout << "\n\n";
}
