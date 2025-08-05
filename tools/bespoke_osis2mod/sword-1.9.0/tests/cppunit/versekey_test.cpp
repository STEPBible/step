/******************************************************************************
 *
 *  versekey_test.cpp -	
 *
 * $Id: versekey_test.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include "localemgr.h"
#include "swbuf.h"
#include "versekey.h"

using namespace sword;
using namespace std;

class VerseKeyTest : public CppUnit::TestFixture  {
CPPUNIT_TEST_SUITE( VerseKeyTest );

CPPUNIT_TEST( testSingleKeyParsing );
CPPUNIT_TEST( testRangeKeyParsing );
CPPUNIT_TEST( testListKeyParsing );

CPPUNIT_TEST( testLessThan );
CPPUNIT_TEST( testLessEqualThan );
CPPUNIT_TEST( testEquality );
CPPUNIT_TEST( testGreaterEqualThan );
CPPUNIT_TEST( testGreaterThan );

CPPUNIT_TEST( testDecrement );
CPPUNIT_TEST( testIncrement );

CPPUNIT_TEST_SUITE_END();

protected:
	SWBuf parseKey(const char* keyValue, const char* locale) {
		sword::VerseKey vk;
		vk.setLocale(locale);
		vk.setText(keyValue);
				
		SWBuf ret( vk.getText() );
		//std::cout << ret.c_str();
		return ret;
	};

	SWBuf parseRangeKey(const char* keyValue, const char* locale) {
		const char* oldLocale = LocaleMgr::getSystemLocaleMgr()->getDefaultLocaleName();
		LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(locale);

		SWBuf ret;
		
		VerseKey DefaultVSKey;
        	DefaultVSKey = "jas3:1";

        	ListKey verses = DefaultVSKey.ParseVerseList(keyValue, DefaultVSKey, true);

		for (int i = 0; i < verses.Count(); i++) {
			VerseKey *element = dynamic_cast<VerseKey *>(verses.GetElement(i));
			if (element) {
				if (ret.length()) {
					ret.append(" ");
				}
				
				ret.appendFormatted( "%s - %s;", (const char*)element->LowerBound(), (const char*)element->UpperBound() );
			}
			else {
				if (ret.length()) {
					ret.append(" ");
				}
				
				ret.appendFormatted("%s;", (const char *)*verses.GetElement(i));
			}
		}
		
// 		cout << ret.c_str() << endl;
		LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(oldLocale);
		return ret;
	};
		
public:
	void setUp() {
/*		m_vk1 = new sword::VerseKey();
		m_vk2 = new sword::VerseKey();
		m_vk3 = new sword::VerseKey();
		
		setLocaleToAll("en");*/
	}	
	void tearDown()  {
/*		delete m_vk1;
		delete m_vk2;
		delete m_vk3;*/
	}
	
	void testSingleKeyParsing() {
		//testing with I John 2:3 and locale en
		CPPUNIT_ASSERT( parseKey("1jn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1 jn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("Ijn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I jn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "1jn 2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "1 jn 2.3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "Ijn 2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "I jn 2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "1jn.2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "1 jn.2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "Ijn.2:3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "I jn.2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "1jn 2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "1 jn 2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey( "Ijn 2:3", "en") 		== "I John 2:3");
		
		CPPUNIT_ASSERT( parseKey("1.jn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn.2.3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn.2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1.jn 2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn 2.3", "en")		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn 2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn 2.3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1.jn.2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn.2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn.2:3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn.2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1.jn 2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn 2:3", "en") 	== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn 2:3", "en") 		== "I John 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn 2:3", "en") 	== "I John 2:3");
		
	
		//testing the same with german locale
		CPPUNIT_ASSERT( parseKey("1jn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1 jn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("Ijn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I jn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "1jn 2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "1 jn 2.3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "Ijn 2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "I jn 2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "1jn.2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "1 jn.2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "Ijn.2:3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "I jn.2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "1jn 2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "1 jn 2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey( "Ijn 2:3", "de") 		== "1. Johannes 2:3");
		
		CPPUNIT_ASSERT( parseKey("1.jn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn.2.3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn.2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1.jn 2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn 2.3", "de")		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn 2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn 2.3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1.jn.2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn.2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn.2:3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn.2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1.jn 2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("1. jn 2:3", "de") 	== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I.jn 2:3", "de") 		== "1. Johannes 2:3");
		CPPUNIT_ASSERT( parseKey("I. jn 2:3", "de") 	== "1. Johannes 2:3");	
	}

	void testRangeKeyParsing() {
		//some range tests with the english locale
		CPPUNIT_ASSERT( parseRangeKey("I. jn 1:1 - 3:10", "en") 	== "I John 1:1 - I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 - 3:10", "en") 		== "I John 1:1 - I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 -3:10", "en") 		== "I John 1:1 - I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1- 3:10", "en") 		== "I John 1:1 - I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1- 3:10", "en") 		== "I John 1:1 - I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1 -3:10", "en") 		== "I John 1:1 - I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 -3:10; 1Jn 3:11", "en") 		== "I John 1:1 - I John 3:10; I John 3:11;");

		//some range tests with german locale
		CPPUNIT_ASSERT( parseRangeKey("I. jn 1:1 - 3:10", "de") 			== "1. Johannes 1:1 - 1. Johannes 3:10;");	
		CPPUNIT_ASSERT( parseRangeKey("1. Joh 1:1 - 3:10", "de") 			== "1. Johannes 1:1 - 1. Johannes 3:10;");	
		CPPUNIT_ASSERT( parseRangeKey("1. Johannes 1:1- 3:10", "de") 	== "1. Johannes 1:1 - 1. Johannes 3:10;");	
		CPPUNIT_ASSERT( parseRangeKey("1. Joh 1:1- 3:10", "de") 			== "1. Johannes 1:1 - 1. Johannes 3:10;");	
		CPPUNIT_ASSERT( parseRangeKey("1. Johannes 1:1 -3:10", "de") 	== "1. Johannes 1:1 - 1. Johannes 3:10;");	
		CPPUNIT_ASSERT( parseRangeKey("1. Joh 1:1 -3:10", "de") 			== "1. Johannes 1:1 - 1. Johannes 3:10;");
	}

	void testListKeyParsing() {
		//some range tests with the english locale
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1  3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1,3:10", "en") 	== "I John 1:1; I John 3:10;"); 
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1, 3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 ,3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 , 3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1;3:10", "en") 	== "I John 1:1; I John 3:10;");  
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1; 3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 ;3:10", "en") 	== "I John 1:1; I John 3:10;");
		CPPUNIT_ASSERT( parseRangeKey("1Jn 1:1 ; 3:10", "en") 	== "I John 1:1; I John 3:10;");
	}
	
	void testLessThan() {
		VerseKey vk1("Luke 1:1");
		VerseKey vk2("Luke 1:1");
		VerseKey vk3("Luke 1:2");
		
		CPPUNIT_ASSERT( !(vk1 < vk2) );
		CPPUNIT_ASSERT( vk1 < vk3 );

		for (int n = 0; n < 30; n++) {//some more stress :)
			vk1 = "Luke 1:1";
			vk3 = vk1;
			
			for (int j = 0; j < 30; ++j) {
				vk1--;
				CPPUNIT_ASSERT( vk1 < vk3 );
				CPPUNIT_ASSERT( vk1 < VerseKey("Revelation") );
				CPPUNIT_ASSERT( !(vk1 < VerseKey("Gen")) );
			}
		}
	}
	void testLessEqualThan() {
		VerseKey vk1("Luke 1:1");
		VerseKey vk2("Luke 1:1");
		VerseKey vk3("Luke 1:2");
		
		CPPUNIT_ASSERT( vk1 <= vk2 );
		CPPUNIT_ASSERT( vk1 <= vk3 );
	
		for (int n = 0; n < 30; n++) { //some more stress
			vk1 = "Luke 1:1";
			vk3 = vk1;
			
			for (int j = 0; j < 30; ++j) {
				CPPUNIT_ASSERT( vk1 <= vk3 );
				CPPUNIT_ASSERT( vk1 <= VerseKey("Revelation") );
				CPPUNIT_ASSERT( !(vk1 <= VerseKey("Gen")) );
				
				vk1--;
			}
		}
	}
	void testEquality() {
		VerseKey vk1("Luke 1:1");
		VerseKey vk2("Luke 1:1");
		VerseKey vk3("Luke 1:2");
		
		CPPUNIT_ASSERT( vk1 == vk2 );
		CPPUNIT_ASSERT( !(vk1 == vk3) );
	}
	void testGreaterEqualThan() {
		VerseKey vk1("Luke 1:3");
		VerseKey vk2("Luke 1:3");
		VerseKey vk3("Luke 1:1");
		
		CPPUNIT_ASSERT( vk1 >= vk2 );
		CPPUNIT_ASSERT( vk1 >= vk3 );
	}
	void testGreaterThan() {
		VerseKey vk1("Luke 1:3");
		VerseKey vk2("Luke 1:1");
		VerseKey vk3("Luke 1:2");
		
		CPPUNIT_ASSERT( vk1 > vk2 );
		CPPUNIT_ASSERT( vk1 > vk3 );
	}

	void testDecrement() {
		VerseKey vk("Matthew 1:1");
		const int delta = 10;
		
		for (int i =0; i < delta; ++i) {
			vk--;
		}
		CPPUNIT_ASSERT( vk == VerseKey("Mal 3:15") );
	}
	void testIncrement() {
		VerseKey vk("Mal 3:15");
		const int delta = 10;
		
		for (int i =0; i < delta; ++i) {
			vk++;
		}
		CPPUNIT_ASSERT( vk == VerseKey("Matthew 1:1") );
	}

};

CPPUNIT_TEST_SUITE_REGISTRATION(VerseKeyTest);
