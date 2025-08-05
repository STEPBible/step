/******************************************************************************
 *
 * strkey.h -	class StrKey: a Key represented by a simple string
 *
 * $Id: strkey.h 3808 2020-10-02 13:23:34Z scribe $
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


#ifndef STRKEY_H
#define STRKEY_H

#include <swkey.h>

#include <defs.h>

SWORD_NAMESPACE_START

/** a standard string key class (used
 * for modules that index on single strings
 * e.g., for lexicons and dictionaries
 */
class SWDLLEXPORT StrKey : public SWKey {

private:
	void init();

public:

	/** c-tor which initialized a StrKey object with a simple string
	 *
	 * @param ikey text key
	 */
	StrKey(const char *ikey = 0);

	virtual ~StrKey();

	SWKEY_OPERATORS

};

SWORD_NAMESPACE_END

#endif
