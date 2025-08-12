/******************************************************************************
 *
 *  flatapilookup.c -	
 *
 * $Id$
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
	if (argc != 4) {
		fprintf(stderr, "\nusage: %s \"<sourceName>\" <\"modName\"> \"<destPath>\"\n"
							 "\tExample: CrossWire KJV ~/library\n\n", argv[0]);
		exit(-1);
	}


	SWHANDLE mgr = org_crosswire_sword_SWMgr_newWithPath(argv[3]);

	SWHANDLE instMgr = org_crosswire_sword_InstallMgr_new("/home/scribe/.sword/InstallMgr", 0);

	org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed(instMgr);

	fprintf(stdout, "Install returned: %d\n", org_crosswire_sword_InstallMgr_remoteInstallModule(instMgr, mgr, argv[1], argv[2]));

	org_crosswire_sword_SWMgr_delete(mgr);
	org_crosswire_sword_InstallMgr_delete(instMgr);

	return 0;
}
