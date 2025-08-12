/******************************************************************************
 *
 *  url_test.cpp -	
 *
 * $Id: url_test.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include "url.h"

using namespace sword;
using namespace std;

class URLTest : public CppUnit::TestFixture  {
CPPUNIT_TEST_SUITE( URLTest );
CPPUNIT_TEST( testProtocol );
CPPUNIT_TEST( testHostName );
CPPUNIT_TEST( testPath );
CPPUNIT_TEST( testParametersMap );
CPPUNIT_TEST( testParameterValue );
CPPUNIT_TEST( testEncode );
CPPUNIT_TEST( testDecode );
CPPUNIT_TEST_SUITE_END();

private:
	sword::URL* m_url1;
	sword::URL* m_url2;
	sword::URL* m_url3;
	
public:
	void setUp() {
		m_url1 = new sword::URL("http://www.crosswire.org/index.jsp?page=help&user=foo&name=bar");
		m_url2 = new sword::URL("ftp://ftp.crosswire.org/sword/wiki/index.jsp?page=help&amp;user=foo&amp;name=foo%20bar");
		m_url3 = new sword::URL("crosswire.org/index.jsp");
	}	
	void tearDown()  {
		delete m_url1;
		delete m_url2;
		delete m_url3;
	}
	
	void testProtocol()
	{
		CPPUNIT_ASSERT( !strcmp(m_url1->getProtocol(), "http") );
		CPPUNIT_ASSERT( !strcmp(m_url2->getProtocol(), "ftp") );
		CPPUNIT_ASSERT( m_url3->getProtocol() && strlen( m_url3->getProtocol() ) == 0 );
	}
	
	void testHostName()
	{
		CPPUNIT_ASSERT( !strcmp(m_url1->getHostName(), "www.crosswire.org") );
		CPPUNIT_ASSERT( !strcmp(m_url2->getHostName(), "ftp.crosswire.org") );
		CPPUNIT_ASSERT( !strcmp(m_url3->getHostName(), "crosswire.org") );
	}

	void testPath()
	{
		CPPUNIT_ASSERT( !strcmp(m_url1->getPath(), "/index.jsp") );
		CPPUNIT_ASSERT( !strcmp(m_url2->getPath(), "/sword/wiki/index.jsp") );
		CPPUNIT_ASSERT( !strcmp(m_url3->getPath(), "/index.jsp") );
	}

	void testParametersMap()
	{	
 		std::map< sword::SWBuf, sword::SWBuf > params = m_url1->getParameters();
		CPPUNIT_ASSERT( !strcmp(params[sword::SWBuf("page")].c_str(), "help") );
		CPPUNIT_ASSERT( !strcmp(params[sword::SWBuf("user")].c_str(),  "foo") );
		CPPUNIT_ASSERT( !strcmp(params[sword::SWBuf("name")].c_str(), "bar") );
	
 		params = m_url2->getParameters(); //test url2 params
		CPPUNIT_ASSERT( !strcmp(params[sword::SWBuf("page")].c_str(), "help") );
		CPPUNIT_ASSERT( !strcmp(params[sword::SWBuf("user")].c_str(),  "foo") );
		CPPUNIT_ASSERT( !strcmp(params[sword::SWBuf("name")].c_str(), "foo bar") );
	
 		params = m_url3->getParameters(); //test url3 params
		CPPUNIT_ASSERT( params.size() == 0 );
	}
	
	void testParameterValue()
	{	
 		CPPUNIT_ASSERT( !strcmp(m_url1->getParameterValue("page"), "help") );
		CPPUNIT_ASSERT( !strcmp(m_url1->getParameterValue("user"), "foo") );
		CPPUNIT_ASSERT( !strcmp(m_url1->getParameterValue("name"), "bar") );
		
		CPPUNIT_ASSERT( !strcmp(m_url2->getParameterValue("page"), "help") );
		CPPUNIT_ASSERT( !strcmp(m_url2->getParameterValue("user"), "foo") );
		CPPUNIT_ASSERT( !strcmp(m_url2->getParameterValue("name"), "foo bar") );
		
		CPPUNIT_ASSERT( m_url3->getParameterValue("page") && strlen(m_url3->getParameterValue("page")) == 0 );
	}	

	void testEncode() {	
		cout << URL::encode("this is a test") << endl;
		
		SWBuf encoded = URL::encode("this is a test");
		CPPUNIT_ASSERT( !strcmp(encoded.c_str(), "this%20is%20a%20test") || !strcmp(encoded.c_str(), "this+is+a+test") );

		CPPUNIT_ASSERT( !strcmp(URL::encode("this-is-a-test").c_str(), "this-is-a-test") );
		CPPUNIT_ASSERT( !strcmp(URL::encode("").c_str(), "") );
	}
	
	void testDecode() {
		CPPUNIT_ASSERT( !strcmp(URL::decode("this%3Eis%3Ea%3Etest").c_str(), "this>is>a>test") );
		CPPUNIT_ASSERT( !strcmp(URL::decode("this%3Eis%3Ea%3Etest%3E").c_str(), "this>is>a>test>") );
		CPPUNIT_ASSERT( !strcmp(URL::decode("%3E%3E%3E%3E%3E%3E%3E%3E%3E%3E%20%20%20%20%20").c_str(), ">>>>>>>>>>     ") );
		CPPUNIT_ASSERT( !strcmp(URL::decode("nothing%20").c_str(), "nothing ") );
		CPPUNIT_ASSERT( !strcmp(URL::decode("nothing").c_str(), "nothing") );
		CPPUNIT_ASSERT( !strcmp(URL::decode("").c_str(), "") );
	}
};

CPPUNIT_TEST_SUITE_REGISTRATION(URLTest);
