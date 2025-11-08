/******************************************************************************
 *
 *  keycast.cpp -	
 *
 * $Id: keycast.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <swmgr.h>
#include <iostream>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main (int argc, char* argv[]) {
        SWMgr mgr;

//the commented out code works
/* 
        StringList globalOptions = mgr.getGlobalOptions();
        for (StringList::iterator it = globalOptions.begin(); it != globalOptions.end(); it++) {
                std::cout << *it << std::endl;

                StringList values = mgr.getGlobalOptionValues((*it).c_str());
                for (StringList::iterator it2 = values.begin(); it2 != values.end(); it2++) {
                        std::cout << "\t"<< *it2 << std::endl;
                }
        }
*/

//crashes
	StringList values = mgr.getGlobalOptionValues("Footnotes");
        for (StringList::iterator it2 = values.begin(); it2 != values.end(); it2++) {
              std::cout << "\t"<< *it2 << std::endl;
        }    
};





