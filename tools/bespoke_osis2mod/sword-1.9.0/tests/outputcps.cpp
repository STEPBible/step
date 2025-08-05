/******************************************************************************
 *
 *  outputcps.cpp -	
 *
 * $Id: outputcps.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2004-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <versekey.h>

/*
This program requires versekey.h to be changed locally so that
otbks, otcps, ntbks and ntcps are public
*/

using namespace sword;

int
main(int argc, char *argv[])
{
	int i;
	long offset1, offset2, otoffset;
	int *vmaxarray;
	int vmax;
	sword::VerseKey *tk = new sword::VerseKey("Genesis 0:0");
	
	//tk->Testament(1);
	//tk->Book(1);
	//tk->Chapter(0);
	//tk->Verse(0);
	//printf("bcv %d %d:%d\n", tk->Book(), tk->Chapter(), tk->Verse());
	printf("{0, 0}, // Module Header\n");
	printf("{1, 0}, // OT Header\n");
	while (tk->Testament() == 1)
	{
		offset1 = tk->otbks[tk->Book()];
		if (tk->Chapter() == 1) {
			offset2 = tk->otcps[(int)offset1];
			printf("{%d, 0}, // %s:0\n", offset2, tk->getBookName());
		}
		offset2 = tk->otcps[(int)offset1 + tk->Chapter()];
		vmaxarray = tk->builtin_books[tk->Testament()-1][tk->Book()-1].versemax;
		vmax = vmaxarray[tk->Chapter()-1];

		printf("{%d, %d}, // %s:%d\n", offset2, vmax, tk->getBookName(), tk->Chapter());
		tk->Chapter(tk->Chapter()+1);
		otoffset = offset2+vmax+1;
	}
	printf("{%d, 0}, // NT Header\n", otoffset);
	while (!tk->Error())
	{
		offset1 = tk->ntbks[tk->Book()];
		if (tk->Chapter() == 1) {
			offset2 = tk->ntcps[(int)offset1]+otoffset;
			printf("{%d, 0}, // %s:0\n", offset2-1, tk->getBookName());
		}
		offset2 = tk->ntcps[(int)offset1 + tk->Chapter()] + otoffset;
		vmaxarray = tk->builtin_books[tk->Testament()-1][tk->Book()-1].versemax;
		vmax = vmaxarray[tk->Chapter()-1];

		printf("{%d, %d}, // %s:%d\n", offset2-1, vmax, tk->getBookName(), tk->Chapter());
		tk->Chapter(tk->Chapter()+1);
	}
	delete tk;
  return 0;
}
