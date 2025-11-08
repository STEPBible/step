/******************************************************************************
 *
 *  swversion.cpp -	SWVersion: version number utility class
 *
 * $Id: swversion.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swversion.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>


SWORD_NAMESPACE_START


SWVersion SWVersion::currentVersion( SWORD_VERSION_STR );


/******************************************************************************
 * SWVersion c-tor - Constructs a new SWVersion
 *
 * ENT:	version	- const version string
 */

SWVersion::SWVersion(const char *version) {
	char *buf = new char[ strlen(version) + 1 ];
	char *tok;
	major = minor = minor2 = minor3 = -1;
		
	strcpy(buf, version);
	tok = strtok(buf, ".");
	if (tok)
		major = atoi(tok);
	tok = strtok(0, ".");
	if (tok)
		minor = atoi(tok);
	tok = strtok(0, ".");
	if (tok)
		minor2 = atoi(tok);
	tok = strtok(0, ".");
	if (tok)
		minor3 = atoi(tok);
	delete [] buf;
}


/******************************************************************************
 * compare - compares this version to another version
 *
 * ENT:	vi	- other version with which to compare
 *
 * RET:	= 0 if equal;
 * 		< 0 if this version is less than other version;
 * 		> 0 if this version is greater than other version
 */

int SWVersion::compare(const SWVersion &vi) const {
	if (major == vi.major)
		if (minor == vi.minor)
			if (minor2 == vi.minor2)
				if (minor3 == vi.minor3)
					return 0;
				else return minor3 - vi.minor3;
			else	return minor2 - vi.minor2;
		else	return minor - vi.minor;
	else	return major - vi.major;
}


const char *SWVersion::getText() const {

	// 255 is safe because there is no way 4 integers (plus 3 '.'s) can have
	// a string representation that will overrun this buffer
	static char buf[255];

	if (minor > -1) {
		if (minor2 > -1) {
			if (minor3 > -1) {
				sprintf(buf, "%d.%d.%d.%d", major, minor, minor2, minor3);
			}
			else	sprintf(buf, "%d.%d.%d", major, minor, minor2);
		}
		else	sprintf(buf, "%d.%d", major, minor);
	}
	else	sprintf(buf, "%d", major);

	return buf;
}


SWORD_NAMESPACE_END

