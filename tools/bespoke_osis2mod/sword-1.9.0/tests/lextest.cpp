/******************************************************************************
 *
 *  lextest.cpp -	
 *
 * $Id: lextest.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <rawld.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif
using std::cout;
using std::endl;

int main(int argc, char **argv)
{
	RawLD::createModule("tmp/lextest");
	RawLD lex("tmp/lextest");

	lex.setKey("b");
	lex << "entry for b";

	lex.setKey("a");
	lex << "entry for a";

	lex = TOP;
	cout << lex.getKeyText() << endl;
	lex++;
	cout << lex.getKeyText() << endl;

	lex.setKey("a");
	lex.deleteEntry();

//	lex.setKey("a");
//	lex << "y";

	lex = BOTTOM;
	return 0;
}
