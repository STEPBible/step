/******************************************************************************
 *
 *  no13.c -	Strips ascii 13 chars out of a file
 *
 * $Id: no13.c 2833 2013-06-29 06:40:28Z chrislit $
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
#include <fcntl.h>
#include <stdio.h>

main(int argc, char **argv)
{
	int fd, loop;
	char ch;
	char breakcnt = 0;

	if (argc != 2) {
		fprintf(stderr, "This program writes to stdout, so to be useful,\n\tit should be redirected (e.g no13 bla > bla.dat)\nusage: %s <filename>\n", argv[0]);
		exit(1);
	}
	fd = open(argv[1], O_RDONLY, S_IREAD|S_IWRITE|S_IRGRP|S_IROTH);
	while (read(fd, &ch, 1) == 1) {
		if (ch == 0x0d) {	// CR
			breakcnt++;
			continue;
		}
		if (ch == 0x1a)	// Ctrl-Z
			continue;

		if (ch != 0x0a) {	// LF
			if (breakcnt > 1) {
				for (loop = breakcnt; loop > 0; loop--)
					putchar(0x0d);
				putchar(0x0a);
			}
			breakcnt=0;
		}
		putchar(ch);
	}
	close(fd);
}
