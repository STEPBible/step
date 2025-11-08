/******************************************************************************
 *
 *  main.cpp -	LibSword tests
 *
 * $Id: main.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

//CppUnit includes
#include <cppunit/extensions/TestFactoryRegistry.h>
#include <cppunit/extensions/HelperMacros.h>
#include <cppunit/ui/text/TestRunner.h>
#include <cppunit/CompilerOutputter.h>

#include <iostream>

int main( int argc, char* argv[] ) {
	CppUnit::TextUi::TestRunner runner;
	CppUnit::TestFactoryRegistry &registry = CppUnit::TestFactoryRegistry::getRegistry();
	runner.addTest( registry.makeTest() );

 // Change the default outputter to a compiler error format outputter 
   // uncomment the following line if you need a compiler outputter.
      runner.setOutputter(new CppUnit::CompilerOutputter( &runner.result(), std::cout ) );

   //runner.setOutputter( new CppUnit::XmlOutputter( &runner.result(),
   //                                                    std::cerr ) );
		
  	bool success = runner.run();	
	return success ? 0 : -1;
 }
