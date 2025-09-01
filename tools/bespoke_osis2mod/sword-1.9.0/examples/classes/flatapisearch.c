/******************************************************************************
 *
 *  flatapisearch.c -	
 *
 * $Id: flatapisearch.c 3102 2014-03-12 04:55:44Z chrislit $
 *
 * Copyright 2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <stdlib.h>

#include <flatapi.h>

int main(int argc, char **argv) {
	if (argc != 3) {
		fprintf(stderr, "\nusage: %s <modname> <\"search terms\">\n"
							 "\tExample: %s KJV \"God love world\"\n\n", argv[0], argv[0]);
		exit(-1);
	}


	SWHANDLE mgr = org_crosswire_sword_SWMgr_new();

	SWHANDLE module = org_crosswire_sword_SWMgr_getModuleByName(mgr, argv[1]);

	if (!module) {
		fprintf(stderr, "Could not find module [%s].  Available modules:\n", argv[1]);
		const struct org_crosswire_sword_ModInfo *modInfos = org_crosswire_sword_SWMgr_getModInfoList(mgr);
		while (modInfos && modInfos->name) {
			fprintf(stderr, "[%s]\t - %s\n", modInfos->name, modInfos->description);
			++modInfos;
		}
		org_crosswire_sword_SWMgr_delete(mgr);
		exit(-1);
	}


	const struct org_crosswire_sword_SearchHit *results = org_crosswire_sword_SWModule_search(module, argv[2], org_crosswire_sword_SWModule_SEARCHTYPE_MULTIWORD, 0, 0, 0);

	printf("==========================\n");
	printf("Parsing: %s\n", argv[2]);
	printf("==========================\n");
	while (results && results->modName) {
		printf("%s\n", results->key);
		++results;
	}
	printf("==========================\n");

	org_crosswire_sword_SWMgr_delete(mgr);

	return 0;
}
