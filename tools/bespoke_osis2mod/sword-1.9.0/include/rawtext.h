/******************************************************************************
 *
 * rawtext.h -	class RawText: a module driver for Bible modules stored
 * 		uncompressed with entry sizes specified with 2 bytes
 *
 * $Id: rawtext.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef RAWTEXT_H
#define RAWTEXT_H

#include <rawverse.h>
#include <swtext.h>

#include <defs.h>

SWORD_NAMESPACE_START

class RawStr;

class SWDLLEXPORT RawText : public SWText, public RawVerse {

public:
	RawText(const char *ipath, const char *iname = 0, const char *idesc = 0, SWDisplay *idisp = 0, SWTextEncoding encoding = ENC_UNKNOWN, SWTextDirection dir = DIRECTION_LTR, SWTextMarkup markup = FMT_UNKNOWN, const char *ilang = 0, const char *versification = "KJV");
	virtual ~RawText();
	virtual SWBuf &getRawEntryBuf() const;
	virtual void increment(int steps = 1);
	virtual void decrement(int steps = 1) { increment(-steps); }
	// write interface ----------------------------
	virtual bool isWritable() const;
	static char createModule(const char *path, const char *v11n = "KJV") { return RawVerse::createModule(path, v11n); }
	virtual void setEntry(const char *inbuf, long len = -1);	// Modify current module entry
	virtual void linkEntry(const SWKey *linkKey);	// Link current module entry to other module entry
	virtual void deleteEntry();	// Delete current module entry
	// end write interface ------------------------

	virtual bool isLinked(const SWKey *k1, const SWKey *k2) const;
	virtual bool hasEntry(const SWKey *k) const;
	

	SWMODULE_OPERATORS

};

SWORD_NAMESPACE_END
#endif
