/******************************************************************************
 *
 *  vs2osisref.cpp -	Utility to translate a verse reference to an osisRef
 *
 * $Id: vs2osisref.cpp 3063 2014-03-04 13:04:11Z chrislit $
 *
 * Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
#endif

#include <iostream>
#include <versekey.h>
#include <localemgr.h>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

using std::endl;
using std::cerr;
using std::cout;


int main(int argc, char **argv)
{
        if (argc < 2) {
        	cerr << argv[0] << " - parse verse reference to OSISRef markup\n";
	        cerr << "usage: "<< argv[0] << " <verse ref> [verse context] [locale]\n";
        	cerr << "\n\n";
	        exit(-1);
        }


	if (argc > 3) {
		LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(argv[3]);
	}

        VerseKey verseKey = (argc > 2) ? argv[2] : "Gen 1:1";

        std::cout << VerseKey::convertToOSIS(argv[1], &verseKey) << "\n";

	return 0;
}

