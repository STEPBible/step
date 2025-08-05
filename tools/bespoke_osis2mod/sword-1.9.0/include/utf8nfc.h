/******************************************************************************
 *
 * utf8nfc.h -	class UTF8NFC: a Filter to normalize a UTF8 text stream into
 * 		Normal Form Composed Unicode (NFC)
 *
 * $Id: utf8nfc.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef UTF8NFC_H
#define UTF8NFC_H

#include <swfilter.h>

#include <unicode/utypes.h>
#include <unicode/ucnv.h>
#include <unicode/uchar.h>
#include <unicode/unorm.h>

SWORD_NAMESPACE_START

/** This filter normalizes UTF-8 encoded text to NFC (Normal Form Composed)
 */
class SWDLLEXPORT UTF8NFC : public SWFilter {

private:
	UConverter* conv;
	UErrorCode err;

public:
	UTF8NFC();
	~UTF8NFC();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
};

SWORD_NAMESPACE_END
#endif
