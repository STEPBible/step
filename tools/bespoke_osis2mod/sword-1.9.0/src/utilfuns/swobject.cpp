/******************************************************************************
 *
 *  swobject.cpp -	code for SWClass used as lowest base class for many
 *			SWORD objects
 *
 * $Id: swobject.cpp 3810 2020-10-10 07:39:02Z scribe $
 *
 * Copyright 2005-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swobject.h>

// hack.  remove this when we figure out our link error
#ifndef __CYGWIN__
#include <utilstr.h>
#else
#include <string.h>
#endif


SWORD_NAMESPACE_START


bool SWClass::isAssignableFrom(const char *className) const {
	// skip class qualifier, like 'const VerseKey'
	const char *space = strchr(className, ' ');
	if (space) className = space + 1;
	for (int i = 0; descends[i]; ++i) {
#ifndef __CYGWIN__
		if (!sword::stricmp(descends[i], className))
#else
		if (!stricmp(descends[i], className))
#endif
			return true;
	}
	return false;
}

/*
static const char *classes[] = {"SWObject", 0};
static const SWClass classdef(classes);

SWObject::SWObject() {
	myClass = &classdef;
}
*/

SWObject::SWObject(const SWClass &assignClassDef) {
	myClass = &assignClassDef;
}


SWORD_NAMESPACE_END

