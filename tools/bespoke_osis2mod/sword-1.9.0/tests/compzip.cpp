/******************************************************************************
 *
 *  compzip.cpp -	
 *
 * $Id: compzip.cpp 3750 2020-07-09 21:29:59Z scribe $
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

#include <ctype.h>
#include <stdio.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#include <filemgr.h>
#include <zipcomprs.h>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

class FileCompress: public ZipCompress {
	int ifd;
	int ofd;
	int ufd;
	int zfd;
public:
	FileCompress(char *);
	~FileCompress();
	unsigned long GetChars(char *, unsigned long len);
	unsigned long SendChars(char *, unsigned long len);
	void encode();
	void decode();
};


FileCompress::FileCompress(char *fname) 
{
	char buf[256];

	ufd  = FileMgr::createPathAndFile(fname);

	sprintf(buf, "%s.zip", fname);
	zfd = FileMgr::createPathAndFile(buf);
}

	
FileCompress::~FileCompress() 
{
	close(ufd);
	close(zfd);
}


unsigned long FileCompress::GetChars(char *buf, unsigned long len) 
{
	return read(ifd, buf, len);
}


unsigned long FileCompress::SendChars(char *buf, unsigned long len) 
{
	return write(ofd, buf, len);
}


void FileCompress::encode() 
{
	ifd = ufd;
	ofd = zfd;

	ZipCompress::encode();
}


void FileCompress::decode() 
{
	ifd = zfd;
	ofd = ufd;

	ZipCompress::decode();
}


int main(int argc, char **argv)
{
	int decomp = 0;
	SWCompress *fobj;
	
	if (argc != 2) {
		fprintf(stderr, "usage: %s <filename|filename.zip>\n", argv[0]);
		exit(1);
	}

	if (strlen(argv[1]) > 4) {
		if (!strcmp(&argv[1][strlen(argv[1])-4], ".zip")) {
			argv[1][strlen(argv[1])-4] = 0;
			decomp = 1;
		}
	}
			
	fobj = new FileCompress(argv[1]);
	
	if (decomp)
		fobj->decode();
	else fobj->encode();

	delete fobj;
	return 0;
}
