/******************************************************************************
 *
 *  step2vpl.cpp -	Utility to export a STEP module as VPL
 *
 * $Id: step2vpl.cpp 3754 2020-07-10 17:45:48Z scribe $
 *
 * Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
	#pragma warning( disable: 4996 )
#endif

#include <iostream>
#include <string>
#include <stdio.h>
#include <sys/stat.h>

#include <fcntl.h>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#include <filemgr.h>
#include <lzsscomprs.h>

using namespace std;
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

long SECTIONSLEVELSTART = 38;
long SECTIONSLEVELSIZE = 29;

long VIEWABLEBLOCKSTART = 0;
long VIEWABLEBLOCKSIZE = 0;

typedef struct {
	short versionRecordSize;
	short publisherID;
	short bookID;
	short setID;
	char conversionProgramVerMajor;
	char conversionProgramVerMinor;
	char leastCompatSTEPVerMajor;
	char leastCompatSTEPVerMinor;
	char encryptionType;
	char editionID;
	short modifiedBy;
} Version;

typedef struct {
	short sectionsHeaderRecordSize;
	long levelEntriesCount; // this is listed as nonGlossBlocksCount in spec!
	long glossEntriesCount;
	short levelEntriesSize;
	long reserved;
} SectionsHeader;

typedef struct {
	short viewableHeaderRecordSize;
	long viewableBlocksCount; // this is listed as nonGlossBlocksCount in spec!
	long glossBlocksCount;
	char compressionType; // 0 - none; 1 - LZSS
	char reserved1;
	short blockEntriesSize;
	short reserved2;
} ViewableHeader;

typedef struct {
	short vSyncHeaderRecordSize;
	short startBookNumber;
	short endBookNumber;
	short bookPointerEntriesSize;
	short syncPointEntriesSize;
	long reserved1_1;
	short reserved1_2;
} VSyncHeader;

typedef struct {
	long offset;
	long uncompressedSize;
	long size;
} ViewableBlock;
		
typedef struct {
	long offset;	// offset into VSYNC.IDX to first VSyncPoint
	short count;	// number of VSyncPoints for this book
} VSyncBooksInfo;
		
typedef struct {
	short chapter;
	short verse;
	long offset;	// offset into SECTIONS.IDX
} VSyncPoint;

typedef struct {
	long parentOffset; // many of these are 0 if glossary
	long previousOffset; 
	long nextOffset;
	long viewableOffset;
	short startLevel;
	char level;
	long nameOffset;
	long outSync_1;
	short outSync_2;
} SectionLevelInfo;

void readVersion(int fd, Version *versionRecord);
void readHeaderControlWordAreaText(int fd, char **buf);
void readViewableHeader(int fd, ViewableHeader *viewableHeaderRecord);
void readVSyncHeader(int fd, VSyncHeader *vSyncHeaderRecord);
void readVSyncBooksInfo(int fd, VSyncHeader *, VSyncBooksInfo **vSyncBooksInfo);
void readViewableBlock(int fd, ViewableBlock *vb);
void readViewableBlockText(int fd, ViewableBlock *vb, char **buf);
void readSectionsHeader(int fd, SectionsHeader *sectionsHeaderRecord);
void readSectionLevelInfo(int fd, SectionLevelInfo *sli);
void readSectionName(int fd, SectionLevelInfo *sli, char **name);
void displayBook(int fdbook, int fdviewable, int fdvsync, int fdsections, VSyncBooksInfo *vSyncBooksInfo);
void extractVerseText(int fdviewable, int fdbook, SectionLevelInfo *sectionLevelInfo, char **verseText);
void cleanBuf(char *buf);

SWCompress *compress = 0;

int main(int argc, char **argv) {

	compress = new LZSSCompress();
	char *buf;
	Version versionRecord;
	VSyncHeader vSyncHeaderRecord;
	VSyncBooksInfo *vSyncBooksInfo;
	SectionsHeader sectionsHeaderRecord;
	ViewableHeader viewableHeaderRecord;
	

	if (argc < 2) {
		cerr << "usage: "<< *argv << " <database to step module>\n";
		exit (-1);
	}

	string bookpath = argv[1];
	string fileName;

	if ((argv[1][strlen(argv[1])-1] != '/') &&
		(argv[1][strlen(argv[1])-1] != '\\'))
		bookpath += "/";

	fileName = bookpath + "Book.dat";
	int fdbook = FileMgr::openFileReadOnly(fileName.c_str());

	if (fdbook < 1) {
		cerr << "error, couldn't open file: " << fileName << "\n";
		exit (-2);
	}

	readVersion(fdbook, &versionRecord);
	readHeaderControlWordAreaText(fdbook, &buf);
	delete [] buf;


	fileName = bookpath + "Viewable.idx";
	int fdviewable = FileMgr::openFileReadOnly(fileName.c_str());

	if (fdviewable < 1) {
		cerr << "error, couldn't open file: " << fileName << "\n";
		exit (-3);
	}

	readVersion(fdviewable, &versionRecord);
	readViewableHeader(fdviewable, &viewableHeaderRecord);

	VIEWABLEBLOCKSTART = lseek(fdviewable, 0, SEEK_CUR);
	VIEWABLEBLOCKSIZE = viewableHeaderRecord.blockEntriesSize;


	fileName = bookpath + "Vsync.idx";
	int fdvsync = FileMgr::openFileReadOnly(fileName.c_str());

	if (fdvsync < 1) {
		cerr << "error, couldn't open file: " << fileName << "\n";
		exit (-4);
	}

	fileName = bookpath + "Sections.idx";
	int fdsections = FileMgr::openFileReadOnly(fileName.c_str());

	if (fdsections < 1) {
		cerr << "error, couldn't open file: " << fileName << "\n";
		exit (-4);
	}
	readVersion(fdsections, &versionRecord);
	readSectionsHeader(fdsections, &sectionsHeaderRecord);
	SECTIONSLEVELSTART = lseek(fdsections, 0, SEEK_CUR);
	SECTIONSLEVELSIZE = sectionsHeaderRecord.levelEntriesSize;

	readVersion(fdvsync, &versionRecord);
	readVSyncHeader(fdvsync, &vSyncHeaderRecord);
	readVSyncBooksInfo(fdvsync, &vSyncHeaderRecord, &vSyncBooksInfo);
	int bookCount = vSyncHeaderRecord.endBookNumber - vSyncHeaderRecord.startBookNumber;
	for (int i = 0; i <= bookCount; i++) {
		displayBook(fdbook, fdviewable, fdvsync, fdsections, &vSyncBooksInfo[i]);
	}
		
	close(fdviewable);
	close(fdvsync);
	close(fdsections);
	close(fdbook);

}



void readVersion(int fd, Version *versionRecord) {

	read(fd, &(versionRecord->versionRecordSize), 2);
	read(fd, &(versionRecord->publisherID), 2);
	read(fd, &(versionRecord->bookID), 2);
	read(fd, &(versionRecord->setID), 2);
	read(fd, &(versionRecord->conversionProgramVerMajor), 1);
	read(fd, &(versionRecord->conversionProgramVerMinor), 1);
	read(fd, &(versionRecord->leastCompatSTEPVerMajor), 1);
	read(fd, &(versionRecord->leastCompatSTEPVerMinor), 1);
	read(fd, &(versionRecord->encryptionType), 1);
	read(fd, &(versionRecord->editionID), 1);
	read(fd, &(versionRecord->modifiedBy), 2);

	int skip = versionRecord->versionRecordSize - 16/*sizeof(struct Version*/;

	if (skip) {
		char *skipbuf = new char[skip];
		read(fd, skipbuf, skip);
		delete [] skipbuf;
	}
}


void readSectionsHeader(int fd, SectionsHeader *sectionsHeaderRecord) {

	read(fd, &(sectionsHeaderRecord->sectionsHeaderRecordSize), 2);
	read(fd, &(sectionsHeaderRecord->levelEntriesCount), 4);
	read(fd, &(sectionsHeaderRecord->glossEntriesCount), 4);
	read(fd, &(sectionsHeaderRecord->levelEntriesSize), 2);
	read(fd, &(sectionsHeaderRecord->reserved), 4);

	int skip = sectionsHeaderRecord->sectionsHeaderRecordSize - 16/*sizeof(struct ViewableHeader)*/;

	if (skip) {
		char *skipbuf = new char[skip];
		read(fd, skipbuf, skip);
		delete [] skipbuf;
	}
}


void readViewableHeader(int fd, ViewableHeader *viewableHeaderRecord) {

	read(fd, &(viewableHeaderRecord->viewableHeaderRecordSize), 2);
	read(fd, &(viewableHeaderRecord->viewableBlocksCount), 4);
	read(fd, &(viewableHeaderRecord->glossBlocksCount), 4);
	read(fd, &(viewableHeaderRecord->compressionType), 1);
	read(fd, &(viewableHeaderRecord->reserved1), 1);
	read(fd, &(viewableHeaderRecord->blockEntriesSize), 2);
	read(fd, &(viewableHeaderRecord->reserved2), 2);

	int skip = viewableHeaderRecord->viewableHeaderRecordSize - 16/*sizeof(struct ViewableHeader)*/;

	if (skip) {
		char *skipbuf = new char[skip];
		read(fd, skipbuf, skip);
		delete [] skipbuf;
	}
}


void readVSyncHeader(int fd, VSyncHeader *vSyncHeaderRecord) {

	read(fd, &(vSyncHeaderRecord->vSyncHeaderRecordSize), 2);
	read(fd, &(vSyncHeaderRecord->startBookNumber), 2);
	read(fd, &(vSyncHeaderRecord->endBookNumber), 2);
	read(fd, &(vSyncHeaderRecord->bookPointerEntriesSize), 2);
	read(fd, &(vSyncHeaderRecord->syncPointEntriesSize), 2);
	read(fd, &(vSyncHeaderRecord->reserved1_1), 4);
	read(fd, &(vSyncHeaderRecord->reserved1_2), 2);

	int skip = vSyncHeaderRecord->vSyncHeaderRecordSize - 16/*sizeof(VSyncHeader)*/;

	if (skip) {
		char *skipbuf = new char[skip];
		read(fd, skipbuf, skip);
		delete [] skipbuf;
	}
}


void readViewableBlockText(int fd, ViewableBlock *vb, char **buf) {
	unsigned long size = vb->size;

	*buf = new char [ ((vb->size > vb->uncompressedSize) ? vb->size : vb->uncompressedSize) + 1 ];
	lseek(fd, vb->offset, SEEK_SET);
	read(fd, *buf, vb->size);

	compress->setCompressedBuf(&size, *buf);
	strcpy(*buf, compress->getUncompressedBuf());
}


void readViewableBlock(int fd, ViewableBlock *vb) {

	read(fd, &(vb->offset), 4);
	read(fd, &(vb->uncompressedSize), 4);
	read(fd, &(vb->size), 4);
}


void readHeaderControlWordAreaText(int fd, char **buf) {
	long headerControlWordAreaSize;
	read(fd, &headerControlWordAreaSize, 4);

	*buf = new char [headerControlWordAreaSize + 1];

	read(fd, *buf, headerControlWordAreaSize);
	(*buf)[headerControlWordAreaSize] = 0;

}

void readVSyncBooksInfo(int fd, VSyncHeader *vSyncHeaderRecord, VSyncBooksInfo **vSyncBooksInfo) {

	int bookCount = vSyncHeaderRecord->endBookNumber - vSyncHeaderRecord->startBookNumber;
	*vSyncBooksInfo = new VSyncBooksInfo[bookCount];
	for (int i = 0; i <= bookCount; i++) {
		read(fd, &(*vSyncBooksInfo)[i].offset, 4);
		read(fd, &(*vSyncBooksInfo)[i].count, 2);
	}
}

void displayBook(int fdbook, int fdviewable, int fdvsync, int fdsections, VSyncBooksInfo *vSyncBooksInfo) {
	VSyncPoint vSyncPoint;

	lseek(fdvsync, vSyncBooksInfo->offset, SEEK_SET);

	for (int i = 0; i < vSyncBooksInfo->count; i++) {

		SectionLevelInfo sectionLevelInfo;
		char *sectionName;
		char *verseText;

		read(fdvsync, &(vSyncPoint.chapter), 2);
		read(fdvsync, &(vSyncPoint.verse), 2);
		read(fdvsync, &(vSyncPoint.offset), 4);
		vSyncPoint.offset = SECTIONSLEVELSTART + (vSyncPoint.offset * SECTIONSLEVELSIZE);
		lseek(fdsections, vSyncPoint.offset, SEEK_SET);
		readSectionLevelInfo(fdsections, &sectionLevelInfo);
		readSectionName(fdsections, &sectionLevelInfo, &sectionName);
		cout << sectionName << " ";
		delete [] sectionName;
		extractVerseText(fdviewable, fdbook, &sectionLevelInfo, &verseText);
		cleanBuf(verseText);
		cout << verseText << "\n";
		delete [] verseText;
	}
}


void extractVerseText(int fdviewable, int fdbook, SectionLevelInfo *sectionLevelInfo, char **verseText) {
	char numberBuf[16];
	string startToken;
	ViewableBlock vb;
	int len = 0;
	static long lastEntryOffset = -1;
	static class FreeCachedEntryText {
	public:
		char *entryText;
		FreeCachedEntryText() { entryText = 0; }
		~FreeCachedEntryText() { if (entryText) delete [] entryText; }
	} _freeCachedEntryText;

	if (sectionLevelInfo->viewableOffset != lastEntryOffset) {
		if (_freeCachedEntryText.entryText)
			delete [] _freeCachedEntryText.entryText;
	
		lseek(fdviewable, sectionLevelInfo->viewableOffset, SEEK_SET);
		readViewableBlock(fdviewable, &vb);
		readViewableBlockText(fdbook, &vb, &(_freeCachedEntryText.entryText));
		lastEntryOffset = sectionLevelInfo->viewableOffset;
	}
	sprintf(numberBuf, "%d", sectionLevelInfo->startLevel);
	startToken = "\\stepstartlevel";
	startToken += numberBuf;
	char *start = strstr(_freeCachedEntryText.entryText, startToken.c_str());
	if (start) {
		start += strlen(startToken.c_str());
		char *end = strstr(start, "\\stepstartlevel");
		if (end)
			len = end - start;
		else len = strlen(start);
	}
	*verseText = new char [ len + 1 ];
	strncpy(*verseText, start, len);
	(*verseText)[len] = 0;
}


void readSectionName(int fd, SectionLevelInfo *sli, char **name) {
	short size;
	lseek(fd, sli->nameOffset, SEEK_SET);
	read(fd, &size, 2);
	*name = new char [ size + 1 ];
	read(fd, *name, size);
	(*name)[size] = 0;
}

void readSectionLevelInfo(int fd, SectionLevelInfo *sli) {

	read(fd, &(sli->parentOffset), 4);
	read(fd, &(sli->previousOffset), 4);
	read(fd, &(sli->nextOffset), 4);
	read(fd, &(sli->viewableOffset), 4);
	sli->viewableOffset = VIEWABLEBLOCKSTART + (VIEWABLEBLOCKSIZE * sli->viewableOffset);
	read(fd, &(sli->startLevel), 2);
	read(fd, &(sli->level), 1);
	read(fd, &(sli->nameOffset), 4);
	read(fd, &(sli->outSync_1), 4);
	read(fd, &(sli->outSync_2), 2);
}

void cleanBuf(char *buf) {
	char *from = buf;
	char *to = buf;

	while (*from) {
		if ((*from != 10) && (*from != 13)) {
			*to++ = *from++;
		}
		else {
			from++;
		}
	}
	*to = 0;
}
