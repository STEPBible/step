/******************************************************************************
 *
 * zverse4.h -		class zVerse4: a helper class for module drivers
 *			which provide 4 byte size entries and use VerseKey
 *			for their entry keys
 *
 * $Id: zverse4.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2000-2014 CrossWire Bible Society (http://www.crosswire.org)
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


#ifndef ZVERSE4_H
#define ZVERSE4_H

#include <defs.h>

SWORD_NAMESPACE_START

class FileDesc;
class SWCompress;
class SWBuf;

class SWDLLEXPORT zVerse4 {

private:
	SWCompress *compressor;

protected:
	static int instance;		// number of instantiated zVerse4 objects or derivitives

	FileDesc *idxfp[2];
	FileDesc *textfp[2];
	FileDesc *compfp[2];
	char *path;
	void doSetText(char testmt, long idxoff, const char *buf, long len = 0);
	void doLinkEntry(char testmt, long destidxoff, long srcidxoff);
	void flushCache() const;
	mutable char *cacheBuf;
	mutable unsigned int cacheBufSize;
	mutable char cacheTestament;
	mutable long cacheBufIdx;
	mutable bool dirtyCache;

public:

#define	VERSEBLOCKS 2
#define	CHAPTERBLOCKS 3
#define	BOOKBLOCKS 4

	static const char uniqueIndexID[];


	// fileMode default = RDONLY
	zVerse4(const char *ipath, int fileMode = -1, int blockType = CHAPTERBLOCKS, SWCompress * icomp = 0);
	virtual ~zVerse4();

	void findOffset(char testmt, long idxoff, long *start, unsigned long *size, unsigned long *buffnum) const;
	void zReadText(char testmt, long start, unsigned long size, unsigned long buffnum, SWBuf &buf) const;
	virtual void rawZFilter(SWBuf &buf, char direction = 0) const { (void) buf; (void) direction; }
	static char createModule(const char *path, int blockBound, const char *v11n = "KJV");
};

SWORD_NAMESPACE_END
#endif
