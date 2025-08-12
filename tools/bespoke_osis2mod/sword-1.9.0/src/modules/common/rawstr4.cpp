/******************************************************************************
 *
 *  rawstr4.cpp -	code for class 'RawStr'- a module that reads raw text
 *			files:  ot and nt using indexs ??.bks ??.cps ??.vss
 *			and provides lookup and parsing functions based on
 *			class StrKey
 *
 * $Id: rawstr4.cpp 3822 2020-11-03 18:54:47Z scribe $
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

#include <stdio.h>
#include <fcntl.h>
#include <errno.h>
#include <stdlib.h>
#include <sys/types.h>

#include <utilstr.h>
#include <rawstr4.h>
#include <sysdata.h>
#include <swlog.h>
#include <filemgr.h>
#include <swbuf.h>
#include <stringmgr.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * RawStr Statics
 */

int RawStr4::instance = 0;
const char RawStr4::nl = '\n';
const int RawStr4::IDXENTRYSIZE = 8;


/******************************************************************************
 * RawStr Constructor - Initializes data for instance of RawStr
 *
 * ENT:	ipath - path of the directory where data and index files are located.
 *		be sure to include the trailing separator (e.g. '/' or '\')
 *		(e.g. 'modules/texts/rawtext/webster/')
 */

RawStr4::RawStr4(const char *ipath, int fileMode, bool caseSensitive) : caseSensitive(caseSensitive)
{
	SWBuf buf;

	lastoff = -1;
	path = 0;
	stdstr(&path, ipath);

	if (fileMode == -1) { // try read/write if possible
		fileMode = FileMgr::RDWR;
	}
		
	buf.setFormatted("%s.idx", path);
	idxfd = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	buf.setFormatted("%s.dat", path);
	datfd = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	if (!datfd || datfd->getFd() < 0) {
// couldn't find datafile but this might be fine if we're
// merely instantiating a remote InstallMgr SWMgr
SWLOGD("Couldn't open file: %s. errno: %d", buf.c_str(), errno);
	}

	instance++;
}


/******************************************************************************
 * RawStr Destructor - Cleans up instance of RawStr
 */

RawStr4::~RawStr4()
{
	if (path)
		delete [] path;

	--instance;

	FileMgr::getSystemFileMgr()->close(idxfd);
	FileMgr::getSystemFileMgr()->close(datfd);
}


/******************************************************************************
 * RawStr4::getidxbufdat	- Gets the index string at the given idx offset
 *						NOTE: buf is allocated and must be freed by
 *							calling function
 *
 * ENT:	ioffset	- offset in dat file to lookup
 *		buf		- address of pointer to allocate for storage of string
 */

void RawStr4::getIDXBufDat(long ioffset, char **buf) const
{
	int size;
	char ch;
	if ((unsigned long)datfd > 0) {
		datfd->seek(ioffset, SEEK_SET);
		for (size = 0; datfd->read(&ch, 1) == 1; size++) {
			if ((ch == '\\') || (ch == 10) || (ch == 13))
				break;
		}
		*buf = (*buf) ? (char *)realloc(*buf, size*2 + 1) : (char *)malloc(size*2 + 1);
		if (size) {
			datfd->seek(ioffset, SEEK_SET);
			datfd->read(*buf, size);
		}
		(*buf)[size] = 0;
		if (!caseSensitive) toupperstr_utf8(*buf, size*2);
	}
	else {
		*buf = (*buf) ? (char *)realloc(*buf, 1) : (char *)malloc(1);
		**buf = 0;
	}
}


/******************************************************************************
 * RawStr4::getidxbuf	- Gets the index string at the given idx offset
 *						NOTE: buf is allocated and must be freed by
 *							calling function
 *
 * ENT:	ioffset	- offset in idx file to lookup
 *		buf		- address of pointer to allocate for storage of string
 */

void RawStr4::getIDXBuf(long ioffset, char **buf) const
{
	SW_u32 offset;
	
	if ((unsigned long)idxfd > 0) {
		idxfd->seek(ioffset, SEEK_SET);

		idxfd->read(&offset, 4);
		offset = swordtoarch32(offset);

		getIDXBufDat(offset, buf);
		
/* What the heck is this supposed to do??????
		for (trybuf = targetbuf = *buf; *trybuf; trybuf++, targetbuf++) {
			*targetbuf = *trybuf;
		}
		*targetbuf = 0;
		trybuf = 0;
		if (!caseSensitive) toupperstr_utf8(targetbuf);
*/
	}
}


/******************************************************************************
 * RawStr4::findoffset	- Finds the offset of the key string from the indexes
 *
 * ENT:	key		- key string to lookup
 *		start	- address to store the starting offset
 *		size		- address to store the size of the entry
 *		away		- number of entries before of after to jump
 *					(default = 0)
 *
 * RET: error status -1 general error; -2 new file
 */

signed char RawStr4::findOffset(const char *ikey, SW_u32 *start, SW_u32 *size, long away, SW_u32 *idxoff) const
{
	char *trybuf, *maxbuf, *key = 0, quitflag = 0;
	signed char retval = -1;
	long headoff, tailoff, tryoff = 0, maxoff = 0;
	int diff = 0;
	bool awayFromSubstrCheck = false;

	if (idxfd->getFd() >=0) {
		tailoff = maxoff = idxfd->seek(0, SEEK_END) - 8;

		retval = (tailoff >= 0) ? 0 : -2;	// if NOT new file
		if (*ikey && retval != -2) {
			headoff = 0;

			stdstr(&key, ikey, 3);
			if (!caseSensitive) toupperstr_utf8(key, (unsigned int)(strlen(key)*3));

			int keylen = (int)strlen(key);
			bool substr = false;

			trybuf = maxbuf = 0;
			getIDXBuf(maxoff, &maxbuf);

			while (headoff < tailoff) {
				tryoff = (lastoff == -1) ? headoff + ((((tailoff / 8) - (headoff / 8))) / 2) * 8 : lastoff;
				lastoff = -1;
				getIDXBuf(tryoff, &trybuf);

				if (!*trybuf && tryoff) {		// In case of extra entry at end of idx (not first entry)
					tryoff += (tryoff > (maxoff / 2))?-8:8;
					retval = -1;
					break;
				}

				diff = strcmp(key, trybuf);

				if (!diff)
					break;

				if (!strncmp(trybuf, key, keylen)) substr = true;

				if (diff < 0)
					tailoff = (tryoff == headoff) ? headoff : tryoff;
				else headoff = tryoff;

				if (tailoff == headoff + 8) {
					if (quitflag++)
						headoff = tailoff;
				}
			}

			// didn't find exact match
			if (headoff >= tailoff) {
				tryoff = headoff;
				if (!substr && ((tryoff != maxoff)||(strncmp(key, maxbuf, keylen)<0))) {
					awayFromSubstrCheck = true;
					away--;	// if our entry doesn't startwith our key, prefer the previous entry over the next
				}
			}
			if (trybuf)
				free(trybuf);
			delete [] key;
                        if (maxbuf)
                        	free(maxbuf);
		}
		else	tryoff = 0;

		idxfd->seek(tryoff, SEEK_SET);

		SW_u32 tmpStart, tmpSize;
		*start = *size = tmpStart = tmpSize = 0;
		idxfd->read(&tmpStart, 4);
		idxfd->read(&tmpSize, 4);
		if (idxoff)
			*idxoff = (SW_u32)tryoff;

		*start = swordtoarch32(tmpStart);
		*size  = swordtoarch32(tmpSize);

		while (away) {
			unsigned long laststart = *start;
			unsigned long lastsize = *size;
			long lasttry = tryoff;
			tryoff += (away > 0) ? 8 : -8;

			bool bad = false;
			if (((tryoff + (away*8)) < -8) || (tryoff + (away*8) > (maxoff+8)))
				bad = true;
			else if (idxfd->seek(tryoff, SEEK_SET) < 0)
				bad = true;
			if (bad) {
				if(!awayFromSubstrCheck)
					retval = -1;
				*start = (SW_u32)laststart;
				*size = (SW_u32)lastsize;
				tryoff = lasttry;
				if (idxoff)
					*idxoff = (SW_u32)tryoff;
				break;
			}
			idxfd->read(&tmpStart, 4);
			idxfd->read(&tmpSize, 4);
			if (idxoff)
				*idxoff = (SW_u32)tryoff;

			*start = swordtoarch32(tmpStart);
			*size  = swordtoarch32(tmpSize);

			if (((laststart != *start) || (lastsize != *size)) && (*size)) 
				away += (away < 0) ? 1 : -1;
		}
	
		lastoff = tryoff;
	}
	else {
		*start = 0;
		*size  = 0;
		if (idxoff)
			*idxoff = 0;
		retval = -1;
	}
	return retval;
}


/******************************************************************************
 * RawStr4::readtext	- gets text at a given offset
 *
 * ENT:
 *	start	- starting offset where the text is located in the file
 *	size		- size of text entry
 *	buf		- buffer to store text
 *
 */

void RawStr4::readText(SW_u32 istart, SW_u32 *isize, char **idxbuf, SWBuf &buf) const
{
	unsigned int ch;
	char *idxbuflocal = 0;
	getIDXBufDat(istart, &idxbuflocal);
	SW_u32 start = istart;

	do {
		if (*idxbuf)
			delete [] *idxbuf;

		buf = "";
		buf.setFillByte(0);
		buf.setSize(++(*isize));

		*idxbuf = new char [ (*isize) ];

		datfd->seek(start, SEEK_SET);
		datfd->read(buf.getRawData(), (int)((*isize) - 1));

		for (ch = 0; buf[ch]; ch++) {		// skip over index string
			if (buf[ch] == 10) {
				ch++;
				break;
			}
		}
		buf = SWBuf(buf.c_str()+ch);
		// resolve link
		if (!strncmp(buf.c_str(), "@LINK", 5)) {
			for (ch = 0; buf[ch]; ch++) {		// null before nl
				if (buf[ch] == 10) {
					buf[ch] = 0;
					break;
				}
			}
			findOffset(buf.c_str() + 6, &start, isize);
		}
		else break;
	}
	while (true);	// while we're resolving links

	if (idxbuflocal) {
		unsigned int localsize = (unsigned int)strlen(idxbuflocal);
		localsize = (localsize < (*isize - 1)) ? localsize : (*isize - 1);
		strncpy(*idxbuf, idxbuflocal, localsize);
		(*idxbuf)[localsize] = 0;
		free(idxbuflocal);
	}
}


/******************************************************************************
 * RawLD::settext	- Sets text for current offset
 *
 * ENT: key	- key for this entry
 *	buf	- buffer to store
 *      len     - length of buffer (0 - null terminated)
 */

void RawStr4::doSetText(const char *ikey, const char *buf, long len) {

	SW_u32 start, outstart;
	SW_u32 idxoff;
	SW_u32 endoff;
	SW_s32 shiftSize;
	SW_u32 size;
	SW_u32 outsize;
	char *tmpbuf = 0;
	char *key = 0;
	char *dbKey = 0;
	char *idxBytes = 0;
	char *outbuf = 0;
	char *ch = 0;

	char errorStatus = findOffset(ikey, &start, &size, 0, &idxoff);
	stdstr(&key, ikey, 3);
	if (!caseSensitive) toupperstr_utf8(key, (unsigned int)(strlen(key)*3));

	len = (len < 0) ? strlen(buf) : len;
	getIDXBufDat(start, &dbKey);

	if (strcmp(key, dbKey) < 0) {
	}
	else if (strcmp(key, dbKey) > 0) {
		if (errorStatus != (char)-2)	// not a new file
			idxoff += 8;
		else idxoff = 0;
	}
	else if ((!strcmp(key, dbKey)) && (len>0/*we're not deleting*/)) { // got absolute entry
		do {
			tmpbuf = new char [ size + 2 ];
			memset(tmpbuf, 0, size + 2);
			datfd->seek(start, SEEK_SET);
			datfd->read(tmpbuf, (int)(size - 1));

			for (ch = tmpbuf; *ch; ch++) {		// skip over index string
				if (*ch == 10) {
					ch++;
					break;
				}
			}
			memmove(tmpbuf, ch, size - (unsigned long)(ch-tmpbuf));

			// resolve link
			if (!strncmp(tmpbuf, "@LINK", 5) && (len > 0)) {
				for (ch = tmpbuf; *ch; ch++) {		// null before nl
					if (*ch == 10) {
						*ch = 0;
						break;
					}
				}
				findOffset(tmpbuf + 8, &start, &size, 0, &idxoff);
				++size;
			}
			else break;
		}
		while (true);	// while we're resolving links
	}

	endoff = (SW_u32)idxfd->seek(0, SEEK_END);

	shiftSize = endoff - idxoff;

	if (shiftSize > 0) {
		idxBytes = new char [ shiftSize ];
		idxfd->seek(idxoff, SEEK_SET);
		idxfd->read(idxBytes, shiftSize);
	}

	outbuf = new char [ len + strlen(key) + 5 ];
	sprintf(outbuf, "%s%c%c", key, 13, 10);
	size = strlen(outbuf);
	memcpy(outbuf + size, buf, len);
	size = outsize = size + (SW_u32)len;

	start = outstart = (SW_u32)datfd->seek(0, SEEK_END);

	outstart = archtosword32(start);
	outsize  = archtosword32(size);

	idxfd->seek(idxoff, SEEK_SET);
	if (len>0) {
		datfd->seek(start, SEEK_SET);
		datfd->write(outbuf, (long)size);

		// add a new line to make data file easier to read in an editor
		datfd->write(&nl, 1);
		
		idxfd->write(&outstart, 4);
		idxfd->write(&outsize, 4);
		if (idxBytes) {
			idxfd->write(idxBytes, shiftSize);
			delete [] idxBytes;
		}
	}
	else {	// delete entry
		if (idxBytes) {
			idxfd->write(idxBytes+8, shiftSize-8);
			idxfd->seek(-1, SEEK_CUR);	// last valid byte
			FileMgr::getSystemFileMgr()->trunc(idxfd);	// truncate index
			delete [] idxBytes;
		}
	}

	delete [] key;
	delete [] outbuf;
	free(dbKey);
}


/******************************************************************************
 * RawLD::linkentry	- links one entry to another
 *
 * ENT: testmt	- testament to find (0 - Bible/module introduction)
 *	destidxoff	- dest offset into .vss
 *	srcidxoff		- source offset into .vss
 */

void RawStr4::doLinkEntry(const char *destkey, const char *srckey) {
	char *text = new char [ strlen(destkey) + 7 ];
	sprintf(text, "@LINK %s", destkey);
	doSetText(srckey, text);
	delete [] text;
}


/******************************************************************************
 * RawLD::CreateModule	- Creates new module files
 *
 * ENT: path	- directory to store module files
 * RET: error status
 */

signed char RawStr4::createModule(const char *ipath)
{
	char *path = 0;
	char *buf = new char [ strlen (ipath) + 20 ];
	FileDesc *fd, *fd2;

	stdstr(&path, ipath);

	if ((path[strlen(path)-1] == '/') || (path[strlen(path)-1] == '\\'))
		path[strlen(path)-1] = 0;

	sprintf(buf, "%s.dat", path);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	fd->getFd();
	FileMgr::getSystemFileMgr()->close(fd);

	sprintf(buf, "%s.idx", path);
	FileMgr::removeFile(buf);
	fd2 = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	fd2->getFd();
	FileMgr::getSystemFileMgr()->close(fd2);

	delete [] path;
	
	return 0;
}

SWORD_NAMESPACE_END
