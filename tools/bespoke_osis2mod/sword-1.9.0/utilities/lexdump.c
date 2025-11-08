/******************************************************************************
 *
 *  lexdump.c -	This utility outputs a specified ordinal entry from a lex
 *
 * $Id: lexdump.c 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 1999-2013 CrossWire Bible Society (http://www.crosswire.org)
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
	#pragma warning( disable: 4996 )
#endif

#include <ctype.h>
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <errno.h>
#include <stdlib.h>
#include <string.h>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#ifndef O_BINARY
#define O_BINARY 0
#endif

int main(int argc, char **argv) {
	char *tmpbuf;
	int idxfd, datfd;
	long offset;
	unsigned int size;
	char datbuf[255];

	if (argc != 3) {
		fprintf(stderr, "usage: %s <datapath/datafilebasename> <index>\n", argv[0]);
		exit(1);
	}

	tmpbuf = calloc(strlen(argv[1]) + 11,1);
	sprintf(tmpbuf, "%s.idx", argv[1]);
	idxfd = open(tmpbuf, O_RDONLY|O_BINARY);
	sprintf(tmpbuf, "%s.dat", argv[1]);
	datfd = open(tmpbuf, O_RDONLY|O_BINARY);
	free(tmpbuf);

	offset = atoi(argv[2]) * 6;
	lseek(idxfd, offset, SEEK_SET);
	read(idxfd, &offset, 4);
	read(idxfd, &size, 2);
	printf("offset: %ld; size: %d\n", offset, size);
	lseek(datfd, offset, SEEK_SET);
	read(datfd, datbuf, 40);
	datbuf[40] = 0;
	printf("%s\n", datbuf);
	close(datfd);
	close(idxfd);
	return 0;

}
