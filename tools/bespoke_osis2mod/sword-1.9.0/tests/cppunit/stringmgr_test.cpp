/******************************************************************************
 *
 *  stringmgr_test.cpp -	
 *
 * $Id: stringmgr_test.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <cppunit/extensions/HelperMacros.h>

#include <iostream>

#include "stringmgr.h"

using namespace sword;
using namespace std;

class StringMgrTest : public CppUnit::TestFixture  {
CPPUNIT_TEST_SUITE( StringMgrTest );
CPPUNIT_TEST( testUpperLatin1 );
CPPUNIT_TEST( testUpperUTF8 );
CPPUNIT_TEST_SUITE_END();

public:
	void setUp() {
	}	
	void tearDown()  {
	}
	
	void testUpperLatin1() {	
		StringMgr* mgr = StringMgr::getSystemStringMgr();
		
		CPPUNIT_ASSERT( !strcmp(mgr->upperLatin1(""), "") );
		
		char t[10] = "Test!";
		const char* ret = mgr->upperLatin1(t);
		cout << ret << endl;
		CPPUNIT_ASSERT( ret && !strcmp(ret, "TEST!") );
	}
	
	void testUpperUTF8() {
		StringMgr* mgr = StringMgr::getSystemStringMgr();
		if (mgr->hasUTF8Support()) {
			char t[10] = "hi";
			char* ret = mgr->upperUTF8(t);
			CPPUNIT_ASSERT( ret && !strcmp(ret, "HI") );
		}	
	}
};

CPPUNIT_TEST_SUITE_REGISTRATION(StringMgrTest);
