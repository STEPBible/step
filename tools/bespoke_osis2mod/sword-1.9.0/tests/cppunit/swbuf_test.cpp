/******************************************************************************
 *
 *  swbuf_test.cpp -	
 *
 * $Id: swbuf_test.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include "swbuf.h"
using namespace sword;
using namespace std;

class SWBufTest : public CppUnit::TestFixture  {
CPPUNIT_TEST_SUITE( SWBufTest );
CPPUNIT_TEST( testEquality );
CPPUNIT_TEST( testAppendString );
CPPUNIT_TEST( testAppendChar );
CPPUNIT_TEST( testInsertString );
CPPUNIT_TEST( testInsertChar );
CPPUNIT_TEST_SUITE_END();

public:
	void setUp() {
	}	
	void tearDown()  {
	}

	void testEquality() {
		SWBuf s1("Hi, this is a test!");
		SWBuf s2("Hi, this is a test!");
		
		CPPUNIT_ASSERT( s1 == s2 );
		CPPUNIT_ASSERT( s1 == "Hi, this is a test!" );
		CPPUNIT_ASSERT( !(s1 == "Hi, this is a wrong test!") );
	}
	void testAppendString() {
		SWBuf t;
		
		for (int i = 0; i < 5000; ++i) {
			t.append("a");
			t.append("b");
			t.append("ccccc",1);
		}		
		CPPUNIT_ASSERT( t.length() == 3*5000 );
		
		char c = 'a';
		for (int i = 0; i < 5000; ++i) { //check whether the append calls worked right
			CPPUNIT_ASSERT( t[i] == c );
			
			c = (c=='a') ? 'b' : ((c=='b') ? 'c' : 'a');
		}
	}
	void testAppendChar() {
		SWBuf t;
		
		for (int i = 0; i < 5000; ++i) {
			t.append('a');
			t.append('b');
			t.append('c');
		}		
		CPPUNIT_ASSERT( t.length() == 3*5000 );
		
		char c = 'a';
		for (int i = 0; i < 5000; ++i) { //check whether the append calls worked right
			CPPUNIT_ASSERT( t[i] == c );
			
			c = (c=='a') ? 'b' : ((c=='b') ? 'c' : 'a');
		}
	}
	
	void testInsertString() {
		SWBuf t = "end";
		
		for (int i = 0; i < 5000; ++i) {
			t.insert(0, "a");
			t.insert(1, "b");
			t.insert(2, "ccccccc", 0, 1); //only one c
		}		
		CPPUNIT_ASSERT( t.length() == 3*5000+3 );
		
		char c = 'a';
		for (int i = 0; i < 5000; ++i) { //check whether the append calls worked right
			CPPUNIT_ASSERT( t[i] == c );
			
			c = (c=='a') ? 'b' : ((c=='b') ? 'c' : 'a');
		}
		//check if end is at the end
		CPPUNIT_ASSERT( t[3*5000+0] == 'e');
		CPPUNIT_ASSERT( t[3*5000+1] == 'n');
		CPPUNIT_ASSERT( t[3*5000+2] == 'd');
	}
	
	void testInsertChar() {
		SWBuf t = "end";
		
		for (int i = 0; i < 5000; ++i) {
			t.insert(0, 'a');
			t.insert(1, 'b');
			t.insert(2, 'c');
		}		
		CPPUNIT_ASSERT( t.length() == 3*5000+3 );
		
		char c = 'a';
		for (int i = 0; i < 5000; ++i) { //check whether the insert calls worked right
			CPPUNIT_ASSERT( t[i] == c );
			
			c = (c=='a') ? 'b' : ((c=='b') ? 'c' : 'a');
		}
		//check if end is at the end
		CPPUNIT_ASSERT( t[3*5000+0] == 'e');
		CPPUNIT_ASSERT( t[3*5000+1] == 'n');
		CPPUNIT_ASSERT( t[3*5000+2] == 'd');
	}	
	
};

CPPUNIT_TEST_SUITE_REGISTRATION(SWBufTest);
