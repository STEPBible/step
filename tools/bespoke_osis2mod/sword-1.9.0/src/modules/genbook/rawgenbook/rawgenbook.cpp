/******************************************************************************
 *
 *  rawgenbook.cpp -	code for class 'RawGenBook'- a module that reads raw
 *			text files: ot and nt using indexs ??.bks ??.cps ??.vss
 *
 * $Id: rawgenbook.cpp 3808 2020-10-02 13:23:34Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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



#include <stdio.h>
#include <fcntl.h>

#include <rawgenbook.h>
#include <rawstr.h>
#include <utilstr.h>
#include <filemgr.h>
#include <sysdata.h>
#include <treekeyidx.h>
#include <versetreekey.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * RawGenBook Constructor - Initializes data for instance of RawGenBook
 *
 * ENT:	iname - Internal name for module
 *	idesc - Name to display to user for module
 *	idisp	 - Display object to use for displaying
 */

RawGenBook::RawGenBook(const char *ipath, const char *iname, const char *idesc, SWDisplay *idisp, SWTextEncoding enc, SWTextDirection dir, SWTextMarkup mark, const char* ilang, const char *keyType)
		: SWGenBook(iname, idesc, idisp, enc, dir, mark, ilang) {

	char *buf = new char [ strlen (ipath) + 20 ];

	path = 0;
	stdstr(&path, ipath);
	verseKey = !strcmp("VerseKey", keyType);

	if (verseKey) setType("Biblical Texts");

	if ((path[strlen(path)-1] == '/') || (path[strlen(path)-1] == '\\'))
		path[strlen(path)-1] = 0;

	delete key;
	key = createKey();


	sprintf(buf, "%s.bdt", path);
	bdtfd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::RDWR, true);

	delete [] buf;

}


/******************************************************************************
 * RawGenBook Destructor - Cleans up instance of RawGenBook
 */

RawGenBook::~RawGenBook() {

	FileMgr::getSystemFileMgr()->close(bdtfd);

	if (path)
		delete [] path;

}


bool RawGenBook::isWritable() const {
	return ((bdtfd->getFd() > 0) && ((bdtfd->mode & FileMgr::RDWR) == FileMgr::RDWR));
}


/******************************************************************************
 * RawGenBook::getRawEntry	- Returns the correct verse when char * cast
 *					is requested
 *
 * RET: string buffer with verse
 */

SWBuf &RawGenBook::getRawEntryBuf() const {

	SW_u32 offset = 0;
	SW_u32 size = 0;

	const TreeKey &key = getTreeKey();

	int dsize;
	key.getUserData(&dsize);
	entryBuf = "";
	if (dsize > 7) {
		memcpy(&offset, key.getUserData(), 4);
		offset = swordtoarch32(offset);

		memcpy(&size, key.getUserData() + 4, 4);
		size = swordtoarch32(size);

		entrySize = size;        // support getEntrySize call

		entryBuf.setFillByte(0);
		entryBuf.setSize(size);
		bdtfd->seek(offset, SEEK_SET);
		bdtfd->read(entryBuf.getRawData(), size);

		rawFilter(entryBuf, 0);	// hack, decipher
		rawFilter(entryBuf, &key);

//		   if (!isUnicode())
			SWModule::prepText(entryBuf);
	}

	return entryBuf;
}


void RawGenBook::setEntry(const char *inbuf, long len) {

	SW_u32 offset = (SW_u32)archtosword32(bdtfd->seek(0, SEEK_END));
	SW_u32 size = 0;
	TreeKeyIdx *key = ((TreeKeyIdx *)&(getTreeKey()));

	char userData[8];

	if (len < 0)
		len = strlen(inbuf);

	bdtfd->write(inbuf, len);

	size = (SW_u32)archtosword32(len);
	memcpy(userData, &offset, 4);
	memcpy(userData+4, &size, 4);
	key->setUserData(userData, 8);
	key->save();
}


void RawGenBook::linkEntry(const SWKey *inkey) {
	const TreeKeyIdx *srcKey = 0;
	TreeKeyIdx *tmpKey = 0;
	TreeKeyIdx *key = ((TreeKeyIdx *)&(getTreeKey()));
	// see if we have a VerseKey * or decendant
	SWTRY {
		srcKey = SWDYNAMIC_CAST(const TreeKeyIdx, inkey);
	}
	SWCATCH ( ... ) {}
	// if we don't have a VerseKey * decendant, create our own
	if (!srcKey) {
		tmpKey = (TreeKeyIdx *)createKey();
		(*tmpKey) = *inkey;
		srcKey = tmpKey;
	}

	key->setUserData(srcKey->getUserData(), 8);
	key->save();

	if (tmpKey) // free our key if we created a VerseKey
		delete tmpKey;
}


/******************************************************************************
 * RawGenBook::deleteEntry	- deletes this entry
 *
 * RET: *this
 */

void RawGenBook::deleteEntry() {
	TreeKeyIdx *key = ((TreeKeyIdx *)&(getTreeKey()));
	key->remove();
}


char RawGenBook::createModule(const char *ipath) {
	char *path = 0;
	char *buf = new char [ strlen (ipath) + 20 ];
	FileDesc *fd;
	signed char retval;

	stdstr(&path, ipath);

	if ((path[strlen(path)-1] == '/') || (path[strlen(path)-1] == '\\'))
		path[strlen(path)-1] = 0;

	sprintf(buf, "%s.bdt", path);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	fd->getFd();
	FileMgr::getSystemFileMgr()->close(fd);

	retval = TreeKeyIdx::create(path);
	delete [] path;
	return retval;	
}


SWKey *RawGenBook::createKey() const {
	TreeKey *tKey = new TreeKeyIdx(path);
	if (verseKey) { SWKey *vtKey = new VerseTreeKey(tKey); delete tKey; return vtKey; }
	return tKey;
}

bool RawGenBook::hasEntry(const SWKey *k) const {
	const TreeKey &key = getTreeKey(k);

	int dsize;
	key.getUserData(&dsize);
	return (dsize > 7) && key.getError() == '\x00';
}

SWORD_NAMESPACE_END
