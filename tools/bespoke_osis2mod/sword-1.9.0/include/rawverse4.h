/******************************************************************************
 *
 * rawverse4.h -	class RawVerse4: a helper class for module drivers
 *			which store uncompressed text, use 4 bytes entry size
 *			and use VerseKey as their keytype
 *
 * $Id: rawverse4.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2007-2013 CrossWire Bible Society (http://www.crosswire.org)
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


#ifndef RAWVERSE4_H
#define RAWVERSE4_H


#include <defs.h>

SWORD_NAMESPACE_START

class FileDesc;
class SWBuf;

class SWDLLEXPORT RawVerse4 {

private:
	static int instance;		// number of instantiated RawVerse objects or derivitives

protected:
	FileDesc *idxfp[2];
	FileDesc *textfp[2];

	char *path;
	void doSetText(char testmt, long idxoff, const char *buf, long len = -1);
	void doLinkEntry(char testmt, long destidxoff, long srcidxoff);

public:
	static const char nl;
	RawVerse4(const char *ipath, int fileMode = -1);
	virtual ~RawVerse4();
	void findOffset(char testmt, long idxoff, long *start,	unsigned long *end) const;
	void readText(char testmt, long start, unsigned long size, SWBuf &buf) const;
	static char createModule(const char *path, const char *v11n = "KJV");
};

SWORD_NAMESPACE_END
#endif
