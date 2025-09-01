/******************************************************************************
 *
 *  refsystest.cpp -	
 *
 * $Id: refsystest.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2004-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <versekey2.h>
#include <stdlib.h>

#include <refsysmgr.h>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif
using std::cout;
using std::endl;

int main(int argc, char **argv)
{
	cout << "Default refsys: " << 
		RefSysMgr::getSystemRefSysMgr()->getDefaultRefSysName() << endl;
	StringList tlist = RefSysMgr::getSystemRefSysMgr()->getAvailableRefSys();
	for (StringList::const_iterator it = tlist.begin(); it != tlist.end(); it++) {
		cout << (*it).c_str() << endl;
	}
	VerseKey2 *testkey;
	testkey = RefSysMgr::getSystemRefSysMgr()->getVerseKey("WEB", "Judith 1:1");
	//testkey = RefSysMgr::getSystemRefSysMgr()->getVerseKey("KJV", "John 3:16");
	if (testkey)
		cout << testkey->getText() << endl;
	else
		cout << "Failed to get key" << endl;
}
