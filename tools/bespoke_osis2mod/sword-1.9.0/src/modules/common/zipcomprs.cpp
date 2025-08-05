/******************************************************************************
 *
 *  zipcomprs.cpp -	ZipCompress, a driver class that provides zlib
 *			compression
 *				
 * $Id: zipcomprs.cpp 3814 2020-10-17 18:09:17Z scribe $
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


#include <stdlib.h>
#include <string.h>
#include <filemgr.h>
#include <swlog.h>
#include <zipcomprs.h>
#include <zlib.h>
#include <utilstr.h>
#ifndef WIN32
#include <utime.h>
#else
#include <windows.h>
#include <time.h>
#endif
extern "C" {
#include "zlib.h"
}

/* This untar code is largely lifted from zlib untgz.c
 * written by "Pedro A. Aranda Gutirrez" <paag@tid.es>
 * adaptation to Unix by Jean-loup Gailly <jloup@gzip.org>
 */
namespace {


#define BLOCKSIZE 512
#define REGTYPE	 '0'		/* regular file */
#define AREGTYPE '\0'		/* regular file */
#define DIRTYPE  '5'		/* directory */


struct tar_header {			/* byte offset */
	char name[100];		/*   0 */
	char mode[8];			/* 100 */
	char uid[8];			/* 108 */
	char gid[8];			/* 116 */
	char size[12];			/* 124 */
	char mtime[12];		/* 136 */
	char chksum[8];		/* 148 */
	char typeflag;			/* 156 */
	char linkname[100];		/* 157 */
	char magic[6];			/* 257 */
	char version[2];		/* 263 */
	char uname[32];		/* 265 */
	char gname[32];		/* 297 */
	char devmajor[8];		/* 329 */
	char devminor[8];		/* 337 */
	char prefix[155];		/* 345 */
						/* 500 */
};


union tar_buffer {
	char               buffer[BLOCKSIZE];
	struct tar_header  header;
};


int getoct(char *p, int width) {
	int result = 0;
	char c;

	while (width--) {
		c = *p++;
		if (c == ' ') continue;
		if (c ==  0 ) break;
		result = result * 8 + (c - '0');
	}
	return result;
}


int untar (gzFile in, const char *dest) {
	union  tar_buffer buffer;
	int    len;
	int    err;
	int    getheader = 1;
	int    remaining = 0;
	int    outFD = 0;
	sword::SWBuf  fname;
	time_t tartime;

	while (1) {
		len = gzread(in, &buffer, BLOCKSIZE);
		if (len < 0)
			sword::SWLog::getSystemLog()->logError(gzerror(in, &err));
		/*
		* Always expect complete blocks to process
		* the tar information.
		*/
		if (len != BLOCKSIZE)
			sword::SWLog::getSystemLog()->logError("gzread: incomplete block read");

		/*
		* If we have to get a tar header
		*/
		if (getheader == 1) {
			/*
			* if we met the end of the tar
			* or the end-of-tar block,
			* we are done
			*/
			if ((len == 0)  || (buffer.header.name[0]== 0)) break;

			tartime = (time_t)getoct(buffer.header.mtime,12);
			fname = dest;
			if (!fname.endsWith("/") && !fname.endsWith("\\")) fname += '/';
			fname += buffer.header.name;

			switch (buffer.header.typeflag) {
			case DIRTYPE: {
				sword::SWBuf dummyFile = fname + "dummyFile";
				sword::FileMgr::createParent(dummyFile);
				break;
			}
			case REGTYPE:
			case AREGTYPE:
				remaining = getoct(buffer.header.size,12);
				if (remaining) {
					outFD = sword::FileMgr::createPathAndFile(fname);
				}
				else {
					if (outFD > 0) {
						sword::FileMgr::closeFile(outFD);
						outFD = 0;
					}
				}
				/*
				* could have no contents
				*/
				getheader = (remaining) ? 0 : 1;
				break;
			default:
				break;
			}
		}
		else	{
			unsigned int bytes = (remaining > BLOCKSIZE) ? BLOCKSIZE : remaining;

			if (outFD > 0) {
				if (sword::FileMgr::write(outFD, &buffer,sizeof(char)*bytes) != (int) bytes) {
					sword::SWLog::getSystemLog()->logError("error writing %s skipping...", fname.c_str());
					sword::FileMgr::closeFile(outFD);
					sword::FileMgr::removeFile(fname);
				}
			}
			remaining -= bytes;
			if (remaining == 0) {
				getheader = 1;
				if (outFD > 0) {

					// All this logic is simply the set the file timestamp
					// ugh
					sword::FileMgr::closeFile(outFD);
#ifdef WIN32
					HANDLE hFile;
					FILETIME ftm,ftLocal;
					SYSTEMTIME st;
					struct tm localt;

					localt = *localtime(&tartime);

					hFile = CreateFileW((const wchar_t *)sword::utf8ToWChar(fname).getRawData(), GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);

					st.wYear = (WORD)localt.tm_year+1900;
					st.wMonth = (WORD)localt.tm_mon;
					st.wDayOfWeek = (WORD)localt.tm_wday;
					st.wDay = (WORD)localt.tm_mday;
					st.wHour = (WORD)localt.tm_hour;
					st.wMinute = (WORD)localt.tm_min;
					st.wSecond = (WORD)localt.tm_sec;
					st.wMilliseconds = 0;
					SystemTimeToFileTime(&st,&ftLocal);
					LocalFileTimeToFileTime(&ftLocal,&ftm);
					SetFileTime(hFile,&ftm,NULL,&ftm);
					CloseHandle(hFile);
#else
					struct utimbuf settime;
					settime.actime = settime.modtime = tartime;
					utime(fname.c_str(), &settime);
#endif
					outFD = 0;
				}
			}
		}
	}
	return 0;
}

}  // end anon namespace

SWORD_NAMESPACE_START

/******************************************************************************
 * ZipCompress Constructor - Initializes data for instance of ZipCompress
 *
 */

ZipCompress::ZipCompress() : SWCompress()
{
//	fprintf(stderr, "init compress\n");
	level = Z_DEFAULT_COMPRESSION;
}


/******************************************************************************
 * ZipCompress Destructor - Cleans up instance of ZipCompress
 */

ZipCompress::~ZipCompress() {
}


/******************************************************************************
 * ZipCompress::encode	- This function "encodes" the input stream into the
 *						output stream.
 *						The getChars() and sendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 * 		NOTE:			must set zlen for parent class to know length of
 * 						compressed buffer.
 */

void ZipCompress::encode(void)
{
/*
ZEXTERN int ZEXPORT compress2 OF((Bytef *dest,   uLongf *destLen,
                                  const Bytef *source, uLong sourceLen,
                                  int level));

     Compresses the source buffer into the destination buffer.  The level
   parameter has the same meaning as in deflateInit.  sourceLen is the byte
   length of the source buffer.  Upon entry, destLen is the total size of the
   destination buffer, which must be at least the value returned by
   compressBound(sourceLen).  Upon exit, destLen is the actual size of the
   compressed buffer.

     compress2 returns Z_OK if success, Z_MEM_ERROR if there was not enough
   memory, Z_BUF_ERROR if there was not enough room in the output buffer,
   Z_STREAM_ERROR if the level parameter is invalid.
*/
	direct = 0;	// set direction needed by parent [get|send]Chars()

	// get buffer
	char chunk[1024];
	char *buf = (char *)calloc(1, 1024);
	char *chunkbuf = buf;
	unsigned long chunklen;
	unsigned long len = 0;
	while((chunklen = getChars(chunk, 1023))) {
		memcpy(chunkbuf, chunk, chunklen);
		len += chunklen;
		if (chunklen < 1023)
			break;
		else	buf = (char *)realloc(buf, len + 1024);
		chunkbuf = buf+len;
	}


	zlen = (long) (len*1.001)+15;
	char *zbuf = new char[zlen+1];
	if (len) {
		//printf("Doing compress\n");
		if (compress2((Bytef*)zbuf, &zlen, (const Bytef*)buf, len, level) != Z_OK) {
			SWLog::getSystemLog()->logError("ERROR in compression");
		}
		else {
			sendChars(zbuf, zlen);
		}
	}
	else {
		SWLog::getSystemLog()->logError("ERROR: no buffer to compress");
	}
	delete [] zbuf;
	free(buf);
}


/******************************************************************************
 * ZipCompress::decode	- This function "decodes" the input stream into the
 *						output stream.
 *						The getChars() and sendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 */

void ZipCompress::decode(void)
{
/*
ZEXTERN int ZEXPORT uncompress OF((Bytef *dest,   uLongf *destLen,
                                   const Bytef *source, uLong sourceLen));
     Decompresses the source buffer into the destination buffer.  sourceLen is
   the byte length of the source buffer. Upon entry, destLen is the total
   size of the destination buffer, which must be large enough to hold the
   entire uncompressed data. (The size of the uncompressed data must have
   been saved previously by the compressor and transmitted to the decompressor
   by some mechanism outside the scope of this compression library.)
   Upon exit, destLen is the actual size of the compressed buffer.
     This function can be used to decompress a whole file at once if the
   input file is mmap'ed.

     uncompress returns Z_OK if success, Z_MEM_ERROR if there was not
   enough memory, Z_BUF_ERROR if there was not enough room in the output
   buffer, or Z_DATA_ERROR if the input data was corrupted.
*/
	direct = 1;	// set direction needed by parent [get|send]Chars()

	// get buffer
	char chunk[1024];
	char *zbuf = (char *)calloc(1, 1024);
	char *chunkbuf = zbuf;
	int chunklen;
	unsigned long zlen = 0;
	while((chunklen = (int)getChars(chunk, 1023))) {
		memcpy(chunkbuf, chunk, chunklen);
		zlen += chunklen;
		if (chunklen < 1023)
			break;
		else	zbuf = (char *)realloc(zbuf, zlen + 1024);
		chunkbuf = zbuf + zlen;
	}

	//printf("Decoding complength{%ld} uncomp{%ld}\n", zlen, blen);
	if (zlen) {
		unsigned long blen = zlen*20;	// trust compression is less than 1000%
		char *buf = new char[blen]; 
		//printf("Doing decompress {%s}\n", zbuf);
		slen = 0;
		switch (uncompress((Bytef*)buf, &blen, (Bytef*)zbuf, zlen)){
			case Z_OK: sendChars(buf, blen); slen = blen; break;
			case Z_MEM_ERROR: SWLog::getSystemLog()->logError("ERROR: not enough memory during decompression."); break;
			case Z_BUF_ERROR: SWLog::getSystemLog()->logError("ERROR: not enough room in the out buffer during decompression."); break;
			case Z_DATA_ERROR: SWLog::getSystemLog()->logError("ERROR: corrupt data during decompression."); break;
			default: SWLog::getSystemLog()->logError("ERROR: an unknown error occurred during decompression."); break;
		}
		delete [] buf;
	}
	else {
		SWLog::getSystemLog()->logError("ERROR: no buffer to decompress!");
	}
	//printf("Finished decoding\n");
	free (zbuf);
}


char ZipCompress::unTarGZ(int fd, const char *destPath) {
	gzFile	f;

	f = gzdopen(fd, "rb");
	if (f == NULL) {
		SWLog::getSystemLog()->logError("Couldn't gzopen file");
		return 1;
	}

	return untar(f, destPath);
}


SWORD_NAMESPACE_END
