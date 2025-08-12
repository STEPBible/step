/******************************************************************************
 *
 *  genarray.c -	
 *
 * $Id: genarray.c 2837 2013-06-29 08:36:36Z chrislit $
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

#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>

main()
{
	int fd, l1, l2, l3;
	char *fnames[] = {"ot.bks", "ot.cps", "nt.bks", "nt.cps"};
	long val;
	char buf[64];

#ifndef O_BINARY		// O_BINARY is needed in Borland C++ 4.53
#define O_BINARY 0		// If it hasn't been defined than we probably
#endif				// don't need it.


	for (l1 = 0; l1 < 2; l1++) {
		for (l2 = 0; l2 < 2; l2++) {
			l3 = 1;
			sprintf(buf, "%s", fnames[(l1*2)+l2]);
			printf("		// %s\n", fnames[(l1*2)+l2]);
			fd = open(buf, O_RDONLY|O_BINARY, S_IREAD|S_IWRITE|S_IRGRP|S_IROTH);
			while (read(fd, &val, 4) == 4) {
				l3++;
				printf("%ld, ", val/(4 + (l2*2)));
				if (!(l3%7))
					printf("\n");
			}
			close(fd);
			printf("}, \n");
		}
	}
}
