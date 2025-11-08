/******************************************************************************
 *
 *  modwrite.cpp -	
 *
 * $Id: modwrite.cpp 3063 2014-03-04 13:04:11Z chrislit $
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

#include <fcntl.h>
#include <iostream>
#include <fstream>
//#include <string>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#include <swmgr.h>
#include <swmodule.h>
#include <stdio.h>

#ifndef NO_SWORD_NAMESPACE
using sword::SWMgr;
using sword::SWModule;
using sword::ModMap;
using sword::SWKey;
#endif

using std::cerr;

int main(int argc, char **argv)
{
	int action = 0;

	if ((argc < 4) || (argc > 6)) {
		cerr << "usage: " << argv[0] << " <mod_name> <key> <key|buf|""-delete> [0(deflt) - normal; 1 - link]\n";
		exit(-1);
	}

	if (argc > 4)
		action = atoi(argv[4]);

	SWMgr mgr;

	ModMap::iterator it = mgr.Modules.find(argv[1]);
	if (it == mgr.Modules.end()) {
		fprintf(stderr, "error: %s: couldn't find module: %s \n", argv[0], argv[1]);
		exit(-2);
	}

	SWModule *module = it->second;
	module->setKey(argv[2]);

	switch (action) {
	case 0:
		if (strlen(argv[3]))
			(*module) << argv[3];
		else module->deleteEntry();
		break;
	case 1:
		(*module) << (SWKey)argv[3];
		break;
	default:
		cerr << "Unknown action " << action << "\n";
		exit(-3);
	}
}
