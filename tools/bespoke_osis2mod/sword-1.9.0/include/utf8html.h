/******************************************************************************
 *
 * utf8html.h -	class UTF8HTML: a Filter to convert UTF8 multi-byte characters
 * 		into HTML escape sequences
 *
 * $Id: utf8html.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef UTF8HTML_H
#define UTF8HTML_H

#include <swfilter.h>

SWORD_NAMESPACE_START

/** This filter converts UTF-8 text into HTML escape sequences
 */
class SWDLLEXPORT UTF8HTML : public SWFilter {
public:
	UTF8HTML();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
};

SWORD_NAMESPACE_END
#endif
