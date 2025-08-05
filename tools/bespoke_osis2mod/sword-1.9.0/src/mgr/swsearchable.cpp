/******************************************************************************
 *
 *  swsearchable.cpp -	used to provide an interface for objects that
 *			can be searched
 *
 * $Id: swsearchable.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swsearchable.h>
#include <listkey.h>


SWORD_NAMESPACE_START


void SWSearchable::nullPercent(char percent, void *percentUserData) {}


SWSearchable::SWSearchable() {
}


SWSearchable::~SWSearchable() {
}


// special search framework
signed char SWSearchable::createSearchFramework(void (*percent)(char, void *), void *percentUserData) {
	return 0;
}


void SWSearchable::deleteSearchFramework() {
}


bool SWSearchable::isSearchOptimallySupported(const char *istr, int searchType, int flags, SWKey *scope) {
	bool retVal = false;
	search(istr, searchType, flags, scope, &retVal);
	return retVal;
}


SWORD_NAMESPACE_END

