/******************************************************************************
 *
 *  xzcomprs.cpp -	XzCompress, a driver class that provides xz (LZMA2)
 *			compression
 *				
 * $Id: xzcomprs.cpp 3775 2020-08-15 10:28:11Z scribe $
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
#include <xzcomprs.h>

#define LZMA_API_STATIC
#include <lzma.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * XzCompress Constructor - Initializes data for instance of XzCompress
 *
 */

XzCompress::XzCompress() : SWCompress() {
	level = 3;
	
	// start with the estimated memory usage for our preset
	memlimit = lzma_easy_decoder_memusage(level | LZMA_PRESET_EXTREME);
	
	// and round up to a power of 2--
	// bit twiddle hack to determine next greatest power of 2 from:
	// http://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2
	memlimit--;
	memlimit |= memlimit >> 1;
	memlimit |= memlimit >> 2;
	memlimit |= memlimit >> 4;
	memlimit |= memlimit >> 8;
	memlimit |= memlimit >> 16;
	memlimit++;

	// double that for safety's sake
	memlimit <<= 1;
}


/******************************************************************************
 * XzCompress Destructor - Cleans up instance of XzCompress
 */

XzCompress::~XzCompress() {
}


/******************************************************************************
 * XzCompress::Encode - This function "encodes" the input stream into the
 *			output stream.
 *			The GetChars() and SendChars() functions are
 *			used to separate this method from the actual
 *			i/o.
 * 		NOTE:	must set zlen for parent class to know length of
 * 			compressed buffer.
 */

void XzCompress::encode(void) {

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

	zlen = (long)lzma_stream_buffer_bound(len);
	char *zbuf = new char[zlen+1];
	size_t zpos = 0;

	if (len) {
		//printf("Doing compress\n");
		switch (lzma_easy_buffer_encode(level | LZMA_PRESET_EXTREME, LZMA_CHECK_CRC64, NULL, (const uint8_t*)buf, (size_t)len, (uint8_t*)zbuf, &zpos, (size_t)zlen)) {
		        case LZMA_OK: sendChars(zbuf, zpos);  break;
			case LZMA_BUF_ERROR: fprintf(stderr, "ERROR: not enough room in the out buffer during compression.\n"); break;
			case LZMA_UNSUPPORTED_CHECK: fprintf(stderr, "ERROR: unsupported_check error encountered during decompression.\n"); break;
			case LZMA_OPTIONS_ERROR: fprintf(stderr, "ERROR: options error encountered during decompression.\n"); break;
			case LZMA_MEM_ERROR: fprintf(stderr, "ERROR: not enough memory during compression.\n"); break;
			case LZMA_DATA_ERROR: fprintf(stderr, "ERROR: corrupt data during compression.\n"); break;
			case LZMA_PROG_ERROR: fprintf(stderr, "ERROR: program error encountered during decompression.\n"); break;
			default: fprintf(stderr, "ERROR: an unknown error occurred during compression.\n"); break;
		}
	}
	else {
		fprintf(stderr, "ERROR: no buffer to compress\n");
	}
	delete [] zbuf;
	free (buf);
}


/******************************************************************************
 * XzCompress::Decode - This function "decodes" the input stream into the
 *			output stream.
 *			The GetChars() and SendChars() functions are
 *			used to separate this method from the actual
 *			i/o.
 */

void XzCompress::decode(void) {
	direct = 1;	// set direction needed by parent [Get|Send]Chars()

	// get buffer
	char chunk[1024];
	char *zbuf = (char *)calloc(1, 1024);
	char *chunkbuf = zbuf;
	int chunklen;
	unsigned long zlen = 0;
	while((chunklen = getChars(chunk, 1023))) {
		memcpy(chunkbuf, chunk, chunklen);
		zlen += chunklen;
		if (chunklen < 1023)
			break;
		else	zbuf = (char *)realloc(zbuf, zlen + 1024);
		chunkbuf = zbuf + zlen;
	}

	//printf("Decoding complength{%ld} uncomp{%ld}\n", zlen, blen);
	if (zlen) {
		unsigned long blen = zlen*20;	// trust compression is less than 2000%
		char *buf = new char[blen]; 
		//printf("Doing decompress {%s}\n", zbuf);
		slen = 0;
		size_t zpos = 0;
		size_t bpos = 0;

		switch (lzma_stream_buffer_decode((uint64_t *)&memlimit, 0, NULL, (const uint8_t*)zbuf, &zpos, (size_t)zlen, (uint8_t*)buf, &bpos, (size_t)&blen)){
			case LZMA_OK: sendChars(buf, bpos); slen = bpos; break;
			case LZMA_FORMAT_ERROR: fprintf(stderr, "ERROR: format error encountered during decompression.\n"); break;
			case LZMA_OPTIONS_ERROR: fprintf(stderr, "ERROR: options error encountered during decompression.\n"); break;
			case LZMA_DATA_ERROR: fprintf(stderr, "ERROR: corrupt data during decompression.\n"); break;
			case LZMA_NO_CHECK: fprintf(stderr, "ERROR: no_check error encountered during decompression.\n"); break;
			case LZMA_UNSUPPORTED_CHECK: fprintf(stderr, "ERROR: unsupported_check error encountered during decompression.\n"); break;
			case LZMA_MEMLIMIT_ERROR: fprintf(stderr, "ERROR: memlimit error encountered during decompression.\n"); break;
			case LZMA_MEM_ERROR: fprintf(stderr, "ERROR: not enough memory during decompression.\n"); break;
			case LZMA_BUF_ERROR: fprintf(stderr, "ERROR: not enough room in the out buffer during decompression.\n"); break;
			case LZMA_PROG_ERROR: fprintf(stderr, "ERROR: program error encountered during decompression.\n"); break;
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


/******************************************************************************
 * XzCompress::SetLevel - This function sets the compression level of the
 *			compressor.
 */

void XzCompress::setLevel(int l) {
	level = l;

	// having changed the compression level, we need to adjust our memlimit accordingly,
	// as in the constructor:

	// start with the estimated memory usage for our preset
	memlimit = lzma_easy_decoder_memusage(level | LZMA_PRESET_EXTREME);
	
	// and round up to a power of 2--
	// bit twiddle hack to determine next greatest power of 2 from:
	// http://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2
	memlimit--;
	memlimit |= memlimit >> 1;
	memlimit |= memlimit >> 2;
	memlimit |= memlimit >> 4;
	memlimit |= memlimit >> 8;
	memlimit |= memlimit >> 16;
	memlimit++;

	// double that for safety's sake
	memlimit <<= 1;
};

SWORD_NAMESPACE_END
