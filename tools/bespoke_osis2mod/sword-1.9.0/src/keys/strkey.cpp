/******************************************************************************
 *
 *  strkey.cpp -	code for class 'StrKey'- a standard string key class
 *			(used for modules that index on single strings (eg.
 *			cities, names, words, etc.)
 *
 * $Id: strkey.cpp 3808 2020-10-02 13:23:34Z scribe $
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


#include <swmacs.h>
#include <strkey.h>
#include <stdio.h>

SWORD_NAMESPACE_START

static const char *classes[] = {"StrKey", "SWKey", "SWObject", 0};
static const SWClass classdef(classes);

/******************************************************************************
 * StrKey Constructor - initializes instance of StrKey
 *
 * ENT:	ikey - text key (word, city, name, etc.)
 */

StrKey::StrKey(const char *ikey) : SWKey(ikey)
{
	init();
}


void StrKey::init() {
	myClass = &classdef;
}


/******************************************************************************
 * StrKey Destructor - cleans up instance of StrKey
 *
 * ENT:	ikey - text key
 */

StrKey::~StrKey() {
}

SWORD_NAMESPACE_END
