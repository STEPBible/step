/******************************************************************************
 *
 * swfilter.h -		class SWFilter: the base for all Filters in SWORD
 * 			a Filter manipulates the text stream in some way,
 * 			usually converting text between different markups,
 * 			encoding, to show or hide text features
 * 			for the user, or to strip markup for searching
 *
 * $Id: swfilter.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef SWFILTER_H
#define SWFILTER_H

#include <defs.h>

SWORD_NAMESPACE_START

class SWKey;
class SWBuf;
class SWModule;


class SWModule;

/** Base class for all filters in sword.
* Filters are used to filter/convert text between different formats
* like GBF, HTML, RTF ...
*/
class SWDLLEXPORT SWFilter {
public:
	virtual ~SWFilter() {}

	/** This method processes and appropriately modifies the text given it
	 *	for a particular filter task
	 *
	 * @param text The text to be filtered/converted
	 * @param key Current key That was used.
	 * @param module Current module.
	 * @return 0
	 */
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0) = 0;

	/** This method can supply a header associated with the processing done with this filter.
	 *	A typical example is a suggested CSS style block for classed containers.
	 */
	virtual const char *getHeader() const { return ""; }
};

	SWORD_NAMESPACE_END
#endif
