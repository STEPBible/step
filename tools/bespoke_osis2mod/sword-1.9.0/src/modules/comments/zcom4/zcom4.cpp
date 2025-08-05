/******************************************************************************
 *
 *  zcom4.cpp -	code for class 'zCom4'- a module that reads compressed
 *		commentary files
 *
 * $Id: zcom4.cpp 3821 2020-11-02 18:33:02Z scribe $
 *
 * Copyright 1996-2014 CrossWire Bible Society (http://www.crosswire.org)
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

#include <ctype.h>
#include <stdio.h>
#include <fcntl.h>

#include <swbuf.h>
#include <zverse4.h>
#include <versekey.h>
#include <zcom4.h>
#include <filemgr.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * zCom4 Constructor - Initializes data for instance of zCom4
 *
 * ENT:	ipath - path to data files
 *		iname - Internal name for module
 *		idesc - Name to display to user for module
 *		iblockType - verse, chapter, book, etc. of index chunks
 *		icomp - Compressor object
 *		idisp - Display object to use for displaying
 */

zCom4::zCom4(const char *ipath, const char *iname, const char *idesc, int iblockType, SWCompress *icomp, SWDisplay *idisp, SWTextEncoding enc, SWTextDirection dir, SWTextMarkup mark, const char *ilang, const char *versification) : zVerse4(ipath, -1, iblockType, icomp), SWCom(iname, idesc, idisp, enc, dir, mark, ilang, versification)/*, SWCompress()*/
{
	blockType = iblockType;
	lastWriteKey = 0;
}

/******************************************************************************
 * zCom4 Destructor - Cleans up instance of zCom4
 */

zCom4::~zCom4() {
	flushCache();

	if (lastWriteKey)
		delete lastWriteKey;
}


bool zCom4::isWritable() const {
	return ((idxfp[0]->getFd() > 0) && ((idxfp[0]->mode & FileMgr::RDWR) == FileMgr::RDWR));
}


/******************************************************************************
 * zCom4::getRawEntry	- Returns the current verse buffer
 *
 * RET: buffer with verse
 */

SWBuf &zCom4::getRawEntryBuf() const {
	long  start = 0;
	unsigned long size = 0;
	unsigned long buffnum = 0;
	const VerseKey &key = getVerseKey();

	findOffset(key.getTestament(), key.getTestamentIndex(), &start, &size, &buffnum);
	entrySize = size;        // support getEntrySize call
			  
	entryBuf = "";
	
	zReadText(key.getTestament(), start, size, buffnum, entryBuf);
	rawFilter(entryBuf, &key);

//	if (!isUnicode())
		prepText(entryBuf);

	return entryBuf;
}


bool zCom4::sameBlock(VerseKey *k1, VerseKey *k2) {
	if (k1->getTestament() != k2->getTestament())
		return false;

	switch (blockType) {
	case VERSEBLOCKS:
		if (k1->getVerse() != k2->getVerse())
			return false;
	case CHAPTERBLOCKS:
		if (k1->getChapter() != k2->getChapter())
			return false;
	case BOOKBLOCKS:
		if (k1->getBook() != k2->getBook())
			return false;
	}
	return true;
}

void zCom4::setEntry(const char *inbuf, long len) {
	VerseKey *key = &getVerseKey();

	// see if we've jumped across blocks since last write
	if (lastWriteKey) {
		if (!sameBlock(lastWriteKey, key)) {
			flushCache();
		}
		delete lastWriteKey;
	}

	doSetText(key->getTestament(), key->getTestamentIndex(), inbuf, len);

	lastWriteKey = (VerseKey *)key->clone();	// must delete
}


void zCom4::linkEntry(const SWKey *inkey) {
	VerseKey *destkey = &getVerseKey();
	const VerseKey *srckey = &getVerseKeyConst(inkey);

	doLinkEntry(destkey->getTestament(), destkey->getTestamentIndex(), srckey->getTestamentIndex());

	if (inkey != srckey) // free our key if we created a VerseKey
		delete srckey;
}

/******************************************************************************
 * zCom4::deleteEntry	- deletes this entry
 *
 * RET: *this
 */

void zCom4::deleteEntry() {

	VerseKey *key = &getVerseKey();
	doSetText(key->getTestament(), key->getTestamentIndex(), "");
}


/******************************************************************************
 * zCom4::increment	- Increments module key a number of entries
 *
 * ENT:	increment	- Number of entries to jump forward
 *
 * RET: *this
 */

void zCom4::increment(int steps) {
	long  start;
	unsigned long size;
	unsigned long buffnum;
	VerseKey *tmpkey = &getVerseKey();

	findOffset(tmpkey->getTestament(), tmpkey->getTestamentIndex(), &start, &size, &buffnum);

	SWKey lastgood = *tmpkey;
	while (steps) {
		long laststart = start;
		unsigned long lastsize = size;
		SWKey lasttry = *tmpkey;
		(steps > 0) ? ++(*key) : --(*key);
		tmpkey = &getVerseKey();

		if ((error = key->popError())) {
			*key = lastgood;
			break;
		}
		long index = tmpkey->getTestamentIndex();
		findOffset(tmpkey->getTestament(), index, &start, &size, &buffnum);
		if (
			(((laststart != start) || (lastsize != size))	// we're a different entry
//				&& (start > 0) 
				&& (size))	// and we actually have a size
				||(!skipConsecutiveLinks)) {	// or we don't want to skip consecutive links
			steps += (steps < 0) ? 1 : -1;
			lastgood = *tmpkey;
		}
	}
	error = (error) ? KEYERR_OUTOFBOUNDS : 0;
}

bool zCom4::isLinked(const SWKey *k1, const SWKey *k2) const {
	long start1, start2;
	unsigned long size1, size2;
	unsigned long buffnum1, buffnum2;
	const VerseKey *vk1 = &getVerseKey(k1);
	const VerseKey *vk2 = &getVerseKey(k2);
	if (vk1->getTestament() != vk2->getTestament()) return false;

	findOffset(vk1->getTestament(), vk1->getTestamentIndex(), &start1, &size1, &buffnum1);
	findOffset(vk2->getTestament(), vk2->getTestamentIndex(), &start2, &size2, &buffnum2);
	return start1 == start2 && buffnum1 == buffnum2;
}

bool zCom4::hasEntry(const SWKey *k) const {
	long start;
	unsigned long size;
	unsigned long buffnum;
	const VerseKey *vk = &getVerseKey(k);

	findOffset(vk->getTestament(), vk->getTestamentIndex(), &start, &size, &buffnum);
	return size;
}

SWORD_NAMESPACE_END
