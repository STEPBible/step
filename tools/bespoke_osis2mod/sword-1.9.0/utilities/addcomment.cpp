/******************************************************************************
 *
 *  addcomment.cpp -	
 *
 * $Id: addcomment.cpp 3063 2014-03-04 13:04:11Z chrislit $
 *
 * Copyright 1998-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <iostream>
#include <versekey.h>
#include <rawtext.h>
#include <zcom.h>
#include <rawcom.h>
#include <rawfiles.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
	int loop;
	int max;
	RawFiles  personal("modules/comments/rawfiles/personal/", "MINE", "Personal Comments");
	VerseKey mykey;

	if (argc < 3) {
		fprintf(stderr, "usage: %s <\"comment\"> <\"verse\"> [count] [disable AutoNormalization]\n", argv[0]);
		exit(-1);
	}

	if (argc > 4)
		mykey.AutoNormalize(0);  // Turn off autonormalize if 3 args to allow for intros
				// This is kludgy but at lease you can try it
				// with something like: sword "Matthew 1:0" 1 1

	mykey = argv[2];
	mykey.Persist(1);
	personal.setKey(mykey);

	max = (argc < 4) ? 1 : atoi(argv[3]);

	for (loop = 0; loop < max; loop++) {
		personal << argv[1];
		mykey++;
	}
	std::cout << "Added Comment" << std::endl;
	return 0;
}
