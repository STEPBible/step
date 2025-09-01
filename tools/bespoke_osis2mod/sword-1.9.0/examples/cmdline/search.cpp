/******************************************************************************
 *
 *  search.cpp -	This simple example shows how to perform a search on a
 *			SWORD module. It amounts to a simple commandline
 *			search tool with a usage like:
 *
 *				search KJV "swift hear slow speak"
 *
 * $Id: search.cpp 3787 2020-08-30 12:00:38Z scribe $
 *
 * Copyright 1997-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <stdio.h>
#include <rawtext.h>
#include <swmgr.h>
#include <versekey.h>
#include <markupfiltmgr.h>
#include <regex.h> // GNU
#include <iostream>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

// FROM swmodule.h
	/*
	 *			>=0 - regex; (for backward compat, if > 0 then used as additional REGEX FLAGS)
	 *			-1  - phrase
	 *			-2  - multiword
	 *			-3  - entryAttrib (eg. Word//Lemma./G1234/)	 (Lemma with dot means check components (Lemma.[1-9]) also)
	 *			-4  - Lucene
	 *			-5  - multilemma window; set 'flags' param to window size (NOT DONE)
	 */

char SEARCH_TYPE=-2;
int flags = 0
// for case insensitivity
| REG_ICASE
// for enforcing strict verse boundaries
//| SEARCHFLAG_STRICTBOUNDARIES
// for use with entryAttrib search type to match whole entry to value, e.g., G1234 and not G12345
//| SEARCHFLAG_MATCHWHOLEENTRY
;

char printed = 0;
void percentUpdate(char percent, void *userData) {
	char maxHashes = *((char *)userData);
	
	while ((((float)percent)/100) * maxHashes > printed) {
		std::cerr << "=";
		printed++;
		std::cerr.flush();
	}
/*
	std::cout << (int)percent << "% ";
*/
	std::cout.flush();
}


int main(int argc, char **argv)
{
//	SWMgr manager(0, 0, true, new MarkupFilterMgr(FMT_RTF, ENC_RTF));
	SWMgr manager;
	SWModule *target;
	ListKey listKey;
	ListKey *scope = 0;
	ModMap::iterator it;

	if ((argc < 3) || (argc > 5)) {
		fprintf(stderr, "\nusage: %s <modname> <\"search string\"> [\"search_scope\"] [\"search again for string in previous result set\"]\n"
							 "\tExample: search KJV \"swift hear slow speak\"\n\n", argv[0]);

		exit(-1);
	}


	SWBuf searchTerm = argv[2];
	manager.setGlobalOption("Greek Accents", "Off");
	manager.setGlobalOption("Strong's Numbers", "Off");
	manager.setGlobalOption("Hebrew Vowel Points", "Off");
	manager.setGlobalOption("Headings", "On");
	manager.filterText("Greek Accents", searchTerm);

	it = manager.Modules.find(argv[1]);
	if (it == manager.Modules.end()) {
		fprintf(stderr, "Could not find module [%s].  Available modules:\n", argv[1]);
		for (it = manager.Modules.begin(); it != manager.Modules.end(); ++it) {
			fprintf(stderr, "[%s]\t - %s\n", (*it).second->getName(), (*it).second->getDescription());
		}
		exit(-1);
	}

	target = (*it).second;

	ListKey maybeScope;
	if (argc > 3) {			// if min / max specified
		SWKey *k = target->getKey();
		VerseKey *parser = SWDYNAMIC_CAST(VerseKey, k);
		VerseKey kjvParser;
		if (!parser) parser = &kjvParser;	// use standard KJV parsing as fallback
		maybeScope = parser->parseVerseList(argv[3], *parser, true);
		scope = &maybeScope;
	}

	std::cerr << "[0=================================50===============================100]\n ";
	char lineLen = 70;
	listKey = target->search(searchTerm.c_str(), SEARCH_TYPE, flags, scope, 0, &percentUpdate, &lineLen);
	std::cerr << std::endl;
	if (argc > 4) {			// example: if a second search term is supplied, search again for a second search term, limiting to previous results
		scope = &listKey;
		printed = 0;
		std::cerr << " ";
		listKey = target->search(argv[4], SEARCH_TYPE, flags, scope, 0, &percentUpdate, &lineLen);
		std::cerr << std::endl;
	}

	// Simply print of all results
	std::cout << "\n" << listKey.getShortRangeText() << "\n" << std::endl;
// we don't want to sort by verse if we've been given scores
//	listKey.sort();
	for (listKey = TOP; !listKey.popError(); listKey.nextElement()) {
		SWKey *k = listKey.getElement();
		std::cout << k->getShortRangeText();
//		std::cout << (const char *)listKey;
		if (k->userData) std::cout << " : " << (SW_u64)k->userData << "%";
		std::cout << std::endl;
	}

	return 0;

}
