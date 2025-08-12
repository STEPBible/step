/******************************************************************************
 *
 *  sub.c -	This little utility substitutes all occurances of a string
 *		with another string.  Is this useful?  Maybe not.  But it's
 *		been here since r2 so it seems a shame to remove it :)
 *		Currently not built by build system
 *
 * $Id: sub.c 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 1997-2009 CrossWire Bible Society (http://www.crosswire.org)
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
#include <stdlib.h>

main(int argc, char **argv)
{
	FILE *fp;
	char *buf;
	int size;

	if ((argc < 3) || (argc > 4)) {
		fprintf(stderr, "usage: %s <string> <substitute string> [filename]\n", *argv);
		exit(-1);
	}

	if (argc > 3)
		fp = fopen(argv[3], "r");
	else	fp = stdin;

	size = strlen(argv[1]);
	buf = (char *)calloc(size + 1, 1);

	while ((buf[size - 1] = fgetc(fp)) != EOF) {
		if (!strcmp(buf, argv[1])) {
			printf("\n%s", argv[2]);
			memset(buf, 0, size);
			continue;
		}
		if (*buf) {
			printf("%c", *buf);
		}
		memmove(buf, &buf[1], size);
	}
	buf[size - 1] = 0;
	printf("%s", buf);
}
