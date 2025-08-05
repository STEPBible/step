/******************************************************************************
 *
 *  mod2vpl.cpp -	Utility to export a module in VPL format
 *
 * $Id: mod2vpl.cpp 3063 2014-03-04 13:04:11Z chrislit $
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

#include <swmgr.h>
#include <swmodule.h>
#include <swkey.h>
#include <versekey.h>
#include <stdio.h>
#include <iostream>

#ifndef NO_SWORD_NAMESPACE
using sword::SWMgr;
using sword::VerseKey;
using sword::SWModule;
using sword::SWKey;
using sword::SW_POSITION;
using sword::ModMap;
#endif

void cleanbuf(char *buf) {
	char *from = buf;
	char *to = buf;

	while (*from) {
		if ((*from != 10) && (*from != 13)) {
			*to++ = *from++;
		}
		else {
			from++;
		}
	}
	*to = 0;
}

int main(int argc, char **argv) {
	char *buffer = 0;

	if (argc < 2) {
		fprintf(stderr, "usage: %s <Mod Name> [0|1 - prepend verse reference to each line]\n", argv[0]);
		exit(-1);
	}

	SWMgr mgr;

	ModMap::iterator it = mgr.Modules.find(argv[1]);
	if (it == mgr.Modules.end()) {
		fprintf(stderr, "error: %s: couldn't find module: %s \n", argv[0], argv[1]);
		exit(-2);
	}

	bool vref = false;
	if (argc > 2)
		vref = (argv[2][0] == '0') ? false : true;


	SWModule *mod = it->second;

	SWKey *key = (*mod);
	VerseKey *vkey = 0;
	SWTRY {
		vkey = dynamic_cast<VerseKey *>(key);
	}
	SWCATCH (...) {}

	if (!vkey) {
		fprintf(stderr, "error: %s: %s module is not keyed to verses \n", argv[0], argv[1]);
		exit(-3);
	}

	vkey->setIntros(true);	// turn on mod/testmnt/book/chap headings

	(*mod) = TOP;

	while (!mod->popError()) {
		buffer = new char [ mod->renderText().length() + 1 ];
		strcpy(buffer, mod->renderText());
		cleanbuf(buffer);
		if (vref) {
			if ((strlen(buffer) > 0) && (vref)) {
				std::cout << (const char *)(*vkey) << " ";
				std::cout << buffer << std::endl;
			}
		}
		else std::cout << buffer << std::endl;

		delete [] buffer;
		(*mod)++;
	}
}
