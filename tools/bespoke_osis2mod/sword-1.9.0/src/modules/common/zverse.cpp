/******************************************************************************
 *
 *  zverse.cpp -	code for class 'zVerse'- a module that reads raw text
 *			files:  ot and nt using indexs ??.bks ??.cps ??.vss
 *			and provides lookup and parsing functions based on
 *			class VerseKey for compressed modules
 *
 * $Id: zverse.cpp 3754 2020-07-10 17:45:48Z scribe $
 *
 * Copyright 1996-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <errno.h>
#include <stdlib.h>

#include <utilstr.h>
#include <versekey.h>
#include <zverse.h>
#include <sysdata.h>
#include <swbuf.h>
#include <filemgr.h>
#include <swcomprs.h>


SWORD_NAMESPACE_START

/******************************************************************************
 * zVerse Statics
 */

int zVerse::instance = 0;

const char zVerse::uniqueIndexID[] = {'X', 'r', 'v', 'c', 'b'};

/******************************************************************************
 * zVerse Constructor - Initializes data for instance of zVerse
 *
 * ENT:	ipath - path of the directory where data and index files are located.
 *		be sure to include the trailing separator (e.g. '/' or '\')
 *		(e.g. 'modules/texts/rawtext/webster/')
 *		fileMode - open mode for the files (FileMgr::RDONLY, etc.)
 *		blockType - verse, chapter, book, etc.
 */

zVerse::zVerse(const char *ipath, int fileMode, int blockType, SWCompress *icomp)
{
	// this line, instead of just defaulting, to keep FileMgr out of header
	if (fileMode == -1) fileMode = FileMgr::RDONLY;

	SWBuf buf;

	path = 0;
	cacheBufIdx = -1;
	cacheTestament = 0;
	cacheBuf = 0;
	dirtyCache = false;
	stdstr(&path, ipath);

	if ((path[strlen(path)-1] == '/') || (path[strlen(path)-1] == '\\'))
		path[strlen(path)-1] = 0;

	compressor = (icomp) ? icomp : new SWCompress();

	if (fileMode == -1) { // try read/write if possible
		fileMode = FileMgr::RDWR;
	}
		
	buf.setFormatted("%s/ot.%czs", path, uniqueIndexID[blockType]);
	idxfp[0] = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	buf.setFormatted("%s/nt.%czs", path, uniqueIndexID[blockType]);
	idxfp[1] = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	buf.setFormatted("%s/ot.%czz", path, uniqueIndexID[blockType]);
	textfp[0] = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	buf.setFormatted("%s/nt.%czz", path, uniqueIndexID[blockType]);
	textfp[1] = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	buf.setFormatted("%s/ot.%czv", path, uniqueIndexID[blockType]);
	compfp[0] = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);

	buf.setFormatted("%s/nt.%czv", path, uniqueIndexID[blockType]);
	compfp[1] = FileMgr::getSystemFileMgr()->open(buf, fileMode, true);
	
	instance++;
}


/******************************************************************************
 * zVerse Destructor - Cleans up instance of zVerse
 */

zVerse::~zVerse()
{
	int loop1;

	if (cacheBuf) {
		flushCache();
		free(cacheBuf);
	}

	if (path)
		delete [] path;

	if (compressor)
		delete compressor;

	--instance;

	for (loop1 = 0; loop1 < 2; loop1++) {
		FileMgr::getSystemFileMgr()->close(idxfp[loop1]);
		FileMgr::getSystemFileMgr()->close(textfp[loop1]);
		FileMgr::getSystemFileMgr()->close(compfp[loop1]);
	}
}


/******************************************************************************
 * zVerse::findoffset	- Finds the offset of the key verse from the indexes
 *
 *
 *
 * ENT: testmt	- testament to find (0 - Bible/module introduction)
 *	book	- book      to find (0 - testament    introduction)
 *	chapter	- chapter   to find (0 - book         introduction)
 *	verse	- verse     to find (0 - chapter      introduction)
 *	start	- address to store the starting offset
 *	size	- address to store the size of the entry
 */

void zVerse::findOffset(char testmt, long idxoff, long *start, unsigned short *size, unsigned long *buffnum) const
{
	SW_u32 ulBuffNum    = 0;	          // buffer number
	SW_u32 ulVerseStart = 0;	       // verse offset within buffer
	SW_u16 usVerseSize  = 0;	       // verse size
	// set start to offset in
	// set size to
	// set
	*start = *size = *buffnum = 0;
	//fprintf(stderr, "Finding offset %ld\n", idxoff);
	idxoff *= 10;
	if (!testmt) {
		testmt = ((idxfp[0]) ? 1:2);
	}
	
	// assert we have and valid file descriptor
	if (compfp[testmt-1]->getFd() < 1)
		return;
		
	long newOffset = compfp[testmt-1]->seek(idxoff, SEEK_SET);
	if (newOffset == idxoff) {
		if (compfp[testmt-1]->read(&ulBuffNum, 4) != 4) {
			fprintf(stderr, "Error reading ulBuffNum\n");
			return;
		}
	}
	else return;	
	
	if (compfp[testmt-1]->read(&ulVerseStart, 4) < 2)
	{
		fprintf(stderr, "Error reading ulVerseStart\n");
		return;
	}
	if (compfp[testmt-1]->read(&usVerseSize, 2) < 2)
	{
		fprintf(stderr, "Error reading usVerseSize\n");
		return;
	}

	*buffnum = swordtoarch32(ulBuffNum);
	*start = swordtoarch32(ulVerseStart);
	*size = swordtoarch16(usVerseSize);

}


/******************************************************************************
 * zVerse::zreadtext	- gets text at a given offset
 *
 * ENT:	testmt	- testament file to search in (0 - Old; 1 - New)
 *	start	- starting offset where the text is located in the file
 *	size	- size of text entry + 1 (null)
 *	buf	- buffer to store text
 *
 */

void zVerse::zReadText(char testmt, long start, unsigned short size, unsigned long ulBuffNum, SWBuf &inBuf) const {
	SW_u32 ulCompOffset = 0;	       // compressed buffer start
	SW_u32 ulCompSize   = 0;	             // buffer size compressed
	SW_u32 ulUnCompSize = 0;	          // buffer size uncompressed

	if (!testmt) {
		testmt = ((idxfp[0]) ? 1:2);
	}
	
	// assert we have and valid file descriptor
	if (compfp[testmt-1]->getFd() < 1)
		return;
	
	if (size && 
		!(((long) ulBuffNum == cacheBufIdx) && (testmt == cacheTestament) && (cacheBuf))) {
		//fprintf(stderr, "Got buffer number{%ld} versestart{%ld} versesize{%d}\n", ulBuffNum, ulVerseStart, usVerseSize);

		if (idxfp[testmt-1]->seek(ulBuffNum*12, SEEK_SET)!=(long) ulBuffNum*12)
		{
			fprintf(stderr, "Error seeking compressed file index\n");
			return;
		}
		if (idxfp[testmt-1]->read(&ulCompOffset, 4)<4)
		{
			fprintf(stderr, "Error reading ulCompOffset\n");
			return;
		}
		if (idxfp[testmt-1]->read(&ulCompSize, 4)<4)
		{
			fprintf(stderr, "Error reading ulCompSize\n");
			return;
		}
		if (idxfp[testmt-1]->read(&ulUnCompSize, 4)<4)
		{
			fprintf(stderr, "Error reading ulUnCompSize\n");
			return;
		}

		ulCompOffset  = swordtoarch32(ulCompOffset);
		ulCompSize  = swordtoarch32(ulCompSize);
		ulUnCompSize  = swordtoarch32(ulUnCompSize);

		if (textfp[testmt-1]->seek(ulCompOffset, SEEK_SET)!=(long)ulCompOffset)
		{
			fprintf(stderr, "Error: could not seek to right place in compressed text\n");
			return;
		}
		SWBuf pcCompText;
		pcCompText.setSize(ulCompSize+5);

		if (textfp[testmt-1]->read(pcCompText.getRawData(), ulCompSize)<(long)ulCompSize) {
			fprintf(stderr, "Error reading compressed text\n");
			return;
		}
		pcCompText.setSize(ulCompSize);
		rawZFilter(pcCompText, 0); // 0 = decipher
		
		unsigned long bufSize = ulCompSize;
		compressor->setCompressedBuf(&bufSize, pcCompText.getRawData());

		if (cacheBuf) {
			flushCache();
			free(cacheBuf);
		}
		
		unsigned long len = 0;
		compressor->setUncompressedBuf(0, &len);
		cacheBuf = (char *)calloc(len + 1, 1);
		memcpy(cacheBuf, compressor->getUncompressedBuf(), len);
		cacheBufSize = (int)strlen(cacheBuf);  // TODO: can we just use len?
		cacheTestament = testmt;
		cacheBufIdx = ulBuffNum;
	}	
	
	inBuf = "";
	if ((size > 0) && cacheBuf && ((unsigned)start < cacheBufSize)) {
		inBuf.setFillByte(0);
		inBuf.setSize(size+1);
		strncpy(inBuf.getRawData(), &(cacheBuf[start]), size);
		inBuf.setSize(strlen(inBuf.c_str()));
	}
}


/******************************************************************************
 * zVerse::settext	- Sets text for current offset
 *
 * ENT: testmt	- testament to find (0 - Bible/module introduction)
 *	idxoff	- offset into .vss
 *	buf	- buffer to store
 *      len     - length of buffer (0 - null terminated)
 */

void zVerse::doSetText(char testmt, long idxoff, const char *buf, long len) {

	len = (len < 0) ? strlen(buf) : len;
	if (!testmt) 
		testmt = ((idxfp[0]) ? 1:2);
	if ((!dirtyCache) || (cacheBufIdx < 0)) {
		cacheBufIdx = idxfp[testmt-1]->seek(0, SEEK_END) / 12;
		cacheTestament = testmt;
		if (cacheBuf)
			free(cacheBuf);
		cacheBuf = (char *)calloc(len + 1, 1);
	}
	else cacheBuf = (char *)((cacheBuf)?realloc(cacheBuf, strlen(cacheBuf)+(len + 1)):calloc((len + 1), 1));

	dirtyCache = true;

	SW_u32 start;
	SW_u16 size;
	SW_u32 outBufIdx = (SW_u32)cacheBufIdx;

	idxoff *= 10;
	size = len;

	start = (SW_u32)strlen(cacheBuf);

	if (!size)
		start = outBufIdx = 0;

	outBufIdx = archtosword32(outBufIdx);
	start  = archtosword32(start);
	size   = archtosword16(size);

	compfp[testmt-1]->seek(idxoff, SEEK_SET);
	compfp[testmt-1]->write(&outBufIdx, 4);
	compfp[testmt-1]->write(&start, 4);
	compfp[testmt-1]->write(&size, 2);
	strcat(cacheBuf, buf);
}


void zVerse::flushCache() const {
	if (dirtyCache) {
		SW_u32 idxoff;
		SW_u32 start, outstart;
		SW_u32 size, outsize;
		SW_u32 zsize, outzsize;

		idxoff = (SW_u32)cacheBufIdx * 12;
		if (cacheBuf) {
			size = outsize = zsize = outzsize = (SW_u32)strlen(cacheBuf);
			if (size) {
	//			if (compressor) {
	//				delete compressor;
	//				compressor = new LZSSCompress();
	//			}
				compressor->setUncompressedBuf(cacheBuf);
				unsigned long tmpSize;
				compressor->getCompressedBuf(&tmpSize);
				outzsize = zsize = (SW_u32)tmpSize;

				SWBuf buf;
				buf.setSize(zsize + 5);
				memcpy(buf.getRawData(), compressor->getCompressedBuf(&tmpSize), tmpSize);
				outzsize = zsize = (SW_u32)tmpSize;
				buf.setSize(zsize);
				rawZFilter(buf, 1); // 1 = encipher

				start = outstart = (SW_u32)textfp[cacheTestament - 1]->seek(0, SEEK_END);

				outstart  = archtosword32(start);
				outsize   = archtosword32(size);
				outzsize  = archtosword32(zsize);

				textfp[cacheTestament-1]->write(buf, zsize);

				idxfp[cacheTestament-1]->seek(idxoff, SEEK_SET);
				idxfp[cacheTestament-1]->write(&outstart, 4);
				idxfp[cacheTestament-1]->write(&outzsize, 4);
				idxfp[cacheTestament-1]->write(&outsize, 4);
			}
			free(cacheBuf);
			cacheBuf = 0;
		}
		dirtyCache = false;
	}
}

/******************************************************************************
 * RawVerse::linkentry	- links one entry to another
 *
 * ENT: testmt	- testament to find (0 - Bible/module introduction)
 *	destidxoff	- dest offset into .vss
 *	srcidxoff		- source offset into .vss
 */

void zVerse::doLinkEntry(char testmt, long destidxoff, long srcidxoff) {
	SW_s32 bufidx;
	SW_s32 start;
	SW_u16 size;

	destidxoff *= 10;
	srcidxoff  *= 10;

	if (!testmt)
		testmt = ((idxfp[1]) ? 1:2);

	// get source
	compfp[testmt-1]->seek(srcidxoff, SEEK_SET);
	compfp[testmt-1]->read(&bufidx, 4);
	compfp[testmt-1]->read(&start, 4);
	compfp[testmt-1]->read(&size, 2);

	// write dest
	compfp[testmt-1]->seek(destidxoff, SEEK_SET);
	compfp[testmt-1]->write(&bufidx, 4);
	compfp[testmt-1]->write(&start, 4);
	compfp[testmt-1]->write(&size, 2);
}


/******************************************************************************
 * RawVerse::CreateModule	- Creates new module files
 *
 * ENT: path	- directory to store module files
 * RET: error status
 */

char zVerse::createModule(const char *ipath, int blockBound, const char *v11n)
{
	char *path = 0;
	char *buf = new char [ strlen (ipath) + 20 ];
	char retVal = 0;
	FileDesc *fd, *fd2;
	SW_s32 offset = 0;
	SW_s16 size = 0;
	VerseKey vk;

	stdstr(&path, ipath);

	if ((path[strlen(path)-1] == '/') || (path[strlen(path)-1] == '\\'))
		path[strlen(path)-1] = 0;

	sprintf(buf, "%s/ot.%czs", path, uniqueIndexID[blockBound]);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	if (fd->getFd() < 1) goto erroropen1;
	FileMgr::getSystemFileMgr()->close(fd);

	sprintf(buf, "%s/nt.%czs", path, uniqueIndexID[blockBound]);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	if (fd->getFd() < 1) goto erroropen1;
	FileMgr::getSystemFileMgr()->close(fd);

	sprintf(buf, "%s/ot.%czz", path, uniqueIndexID[blockBound]);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	if (fd->getFd() < 1) goto erroropen1;
	FileMgr::getSystemFileMgr()->close(fd);

	sprintf(buf, "%s/nt.%czz", path, uniqueIndexID[blockBound]);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	if (fd->getFd() < 1) goto erroropen1;
	FileMgr::getSystemFileMgr()->close(fd);

	sprintf(buf, "%s/ot.%czv", path, uniqueIndexID[blockBound]);
	FileMgr::removeFile(buf);
	fd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	if (fd->getFd() < 1) goto erroropen1;

	sprintf(buf, "%s/nt.%czv", path, uniqueIndexID[blockBound]);
	FileMgr::removeFile(buf);
	fd2 = FileMgr::getSystemFileMgr()->open(buf, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	if (fd2->getFd() < 1) goto erroropen2;

	vk.setVersificationSystem(v11n);
	vk.setIntros(true);

	offset = archtosword32(offset);
	size   = archtosword16(size);

	for (vk = TOP; !vk.popError(); vk++) {
		if (vk.getTestament() < 2) {
			if (fd->write(&offset, 4) != 4) goto writefailure;	//compBufIdxOffset
			if (fd->write(&offset, 4) != 4) goto writefailure;
			if (fd->write(&size, 2) != 2) goto writefailure;
		}
		else {
			if (fd2->write(&offset, 4) != 4) goto writefailure;	//compBufIdxOffset
			if (fd2->write(&offset, 4) != 4) goto writefailure;
			if (fd2->write(&size, 2) != 2) goto writefailure;
		}
	}
	fd2->write(&offset, 4);	//compBufIdxOffset
	fd2->write(&offset, 4);
	fd2->write(&size, 2);

	goto cleanup;

erroropen1:
	retVal = -1;
	goto cleanup1;

erroropen2:
	retVal = -1;
	goto cleanup;

writefailure:
	retVal = -2;

cleanup:
	FileMgr::getSystemFileMgr()->close(fd2);
cleanup1:
	FileMgr::getSystemFileMgr()->close(fd);

	delete [] path;
	delete [] buf;
	
	return retVal;
}


SWORD_NAMESPACE_END
