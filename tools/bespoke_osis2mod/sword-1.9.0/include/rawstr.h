/*****************************************************************************
 *
 * rawstr.h -	class RawStr: a helper class for modules with string
 *		keys, uncompressed, with entry sizes specified by to 2 bytes
 *
 * $Id: rawstr.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef RAWSTR_H
#define RAWSTR_H

#include <defs.h>
#include <sysdata.h>

SWORD_NAMESPACE_START

class SWBuf;
class FileDesc;

class SWDLLEXPORT RawStr {

private:
	static int instance;		// number of instantiated RawStr objects or derivitives
	char *path;
	bool caseSensitive;
	mutable long lastoff;	 // for caching and optimizing
	

protected:
	FileDesc *idxfd;
	FileDesc *datfd;
	void doSetText(const char *key, const char *buf, long len = -1);
	void doLinkEntry(const char *destkey, const char *srckey);
	static const int IDXENTRYSIZE;

public:
	static const char nl;
	RawStr(const char *ipath, int fileMode = -1, bool caseSensitive = false);
	virtual ~RawStr();
	void getIDXBuf(long ioffset, char **buf) const;
	void getIDXBufDat(long ioffset, char **buf) const;
	signed char findOffset(const char *key, SW_u32 *start, SW_u16 *size, long away = 0, SW_u32 *idxoff = 0) const;
	void readText(SW_u32 start, SW_u16 *size, char **idxbuf, SWBuf &buf) const;
	static signed char createModule(const char *path);
};

SWORD_NAMESPACE_END
#endif
