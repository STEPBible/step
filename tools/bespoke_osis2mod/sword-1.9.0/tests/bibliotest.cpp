/******************************************************************************
 *
 *  bibliotest.cpp -	
 *
 * $Id: bibliotest.cpp 2940 2013-08-03 06:53:35Z chrislit $
 *
 * Copyright 2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swmgr.h>
#include <swtext.h>
#include <versekey.h>
#include <iostream>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main(int argc, char **argv) {
	SWMgr mymgr;
	ModMap::iterator it;
	if ( argc > 1 ) {
		SWModule *module = mymgr.Modules[argv[1]];
		std::cout << module->getBibliography() << "\n";
		return 0;
	}
	else {
		std::cout << "Usage: bibliography <ModuleName>"<< "\n";
		return 1;
	}
}
