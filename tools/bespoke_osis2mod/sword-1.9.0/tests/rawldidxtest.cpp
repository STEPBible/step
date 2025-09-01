/******************************************************************************
 *
 *  rawldidxtest.cpp -	
 *
 * $Id: rawldidxtest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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
#include <rawstr.h>
#include <swmgr.h>
#include <filemgr.h>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main(int argc, char **argv)
{
	if (argc != 2) {
		fprintf(stderr, "usage: %s <lex path>\n\n", *argv);
		exit(-1);
	}
	
	RawStr mod(argv[1]);
     char buf[127];

	sprintf(buf, "%s.idx", argv[1]);
	FileDesc *idxfd = FileMgr::getSystemFileMgr()->open(buf, FileMgr::RDONLY, true);
	long maxoff = idxfd->seek(0, SEEK_END) - 6;
	FileMgr::getSystemFileMgr()->close(idxfd);

	SWBuf last = "";
	bool first = true;
	char *trybuf = 0;
	for (long index = 0; index < maxoff; index+=6) {
		mod.getIDXBuf(index, &trybuf);
		if (!first) {
			if (strcmp(trybuf, last.c_str()) < 0) {
				printf("entry %ld(offset: %ld) (%s) is less than previous entry (%s)\n\n", index/6, index, trybuf, last.c_str());
				exit(-3);
			}
		}
		else first = false;
		last = trybuf;
	}
	if (trybuf)
		delete [] trybuf;

	return 0;
}
