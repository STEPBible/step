/******************************************************************************
 *
 *  bz2comprs.cpp -	Bzip2Compress, a driver class that provides bzip2
 *			compression (Burrows–Wheeler with Huffman coding)
 *				
 * $Id: bz2comprs.cpp 3754 2020-07-10 17:45:48Z scribe $
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
#include <stdio.h>
#include <bz2comprs.h>
#include <bzlib.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * Bzip2Compress Constructor - Initializes data for instance of Bzip2Compress
 *
 */

Bzip2Compress::Bzip2Compress() : SWCompress() {
	level = 9;
}


/******************************************************************************
 * Bzip2Compress Destructor - Cleans up instance of Bzip2Compress
 */

Bzip2Compress::~Bzip2Compress() {
}


/******************************************************************************
 * Bzip2Compress::Encode - This function "encodes" the input stream into the
 *			output stream.
 *			The GetChars() and SendChars() functions are
 *			used to separate this method from the actual
 *			i/o.
 * 		NOTE:	must set zlen for parent class to know length of
 * 			compressed buffer.
 */

void Bzip2Compress::encode(void) {
	direct = 0;	// set direction needed by parent [Get|Send]Chars()

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


	zlen = (long) (len*1.01)+600;
	char *zbuf = new char[zlen+1];
	if (len)
	{
		//printf("Doing compress\n");
		if (BZ2_bzBuffToBuffCompress(zbuf, (unsigned int*)&zlen, buf, (unsigned int)len, level, 0, 0) != BZ_OK)
		{
			printf("ERROR in compression\n");
		}
		else {
			sendChars(zbuf, zlen);
		}
	}
	else
	{
		fprintf(stderr, "ERROR: no buffer to compress\n");
	}
	delete [] zbuf;
	free (buf);
}


/******************************************************************************
 * Bzip2Compress::Decode - This function "decodes" the input stream into the
 *			output stream.
 *			The GetChars() and SendChars() functions are
 *			used to separate this method from the actual
 *			i/o.
 */

void Bzip2Compress::decode(void) {
	direct = 1;	// set direction needed by parent [Get|Send]Chars()

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
		unsigned int blen = (unsigned int)(zlen*20);	// trust compression is less than 1000%
		char *buf = new char[blen]; 
		//printf("Doing decompress {%s}\n", zbuf);
		slen = 0;
		switch (BZ2_bzBuffToBuffDecompress(buf, &blen, zbuf, (unsigned int)zlen, 0, 0)){
			case BZ_OK: sendChars(buf, blen); slen = blen; break;
			case BZ_MEM_ERROR: fprintf(stderr, "ERROR: not enough memory during decompression.\n"); break;
			case BZ_OUTBUFF_FULL: fprintf(stderr, "ERROR: not enough room in the out buffer during decompression.\n"); break;
			case BZ_DATA_ERROR: fprintf(stderr, "ERROR: corrupt data during decompression.\n"); break;
			default: fprintf(stderr, "ERROR: an unknown error occurred during decompression.\n"); break;
		}
		delete [] buf;
	}
	else {
		fprintf(stderr, "ERROR: no buffer to decompress!\n");
	}
	//printf("Finished decoding\n");
	free (zbuf);
}

SWORD_NAMESPACE_END
