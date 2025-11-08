/******************************************************************************
 *
 *  swcomprs.cpp - 	a driver class that provides compression utilities
 *
 * $Id: swcomprs.cpp 3818 2020-10-19 13:41:05Z scribe $
 *
 * Copyright 1996-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <swcomprs.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * SWCompress Constructor - Initializes data for instance of SWCompress
 *
 */

SWCompress::SWCompress()
{
	buf = zbuf = 0;
	level = 6;
	init();
}


/******************************************************************************
 * SWCompress Destructor - Cleans up instance of SWCompress
 */

SWCompress::~SWCompress()
{
	if (zbuf)
		free(zbuf);

	if (buf)
		free(buf);
}


void SWCompress::init()
{
		if (buf)
			free(buf);

		if (zbuf)
			free(zbuf);

		buf    = 0;
		zbuf   = 0;
		direct  = 0;
		zlen    = 0;
		slen    = 0;
		zpos    = 0;
		pos     = 0;
}


void SWCompress::setUncompressedBuf(const char *ibuf, unsigned long *len) {
	if (ibuf) {
		init();
		slen = (len) ? *len : strlen(ibuf);
		buf = (char *) calloc(slen + 1, 1);
		memcpy(buf, ibuf, slen);
	}
	if (!buf) {
		buf = (char *)calloc(1,1); // be sure we at least allocate an empty buf for return;
		direct = 1;
		decode();
		if (len) *len = slen;
	}
}

char *SWCompress::getUncompressedBuf(unsigned long *len) {
	if (!buf) {
		buf = (char *)calloc(1,1); // be sure we at least allocate an empty buf for return;
		direct = 1;
		decode();
	}
	if (len) *len = slen;
	return buf;
}


void SWCompress::setCompressedBuf(unsigned long *len, char *ibuf) {
	if (ibuf) {
		init();
		zbuf = (char *) malloc(*len);
		memcpy(zbuf, ibuf, *len);
		zlen = *len;
	}
	*len = zlen;
}

char *SWCompress::getCompressedBuf(unsigned long *len) {
	if (!zbuf) {
		direct = 0;
		encode();
	}
	if (len) *len = zlen;
	return zbuf;
}


unsigned long SWCompress::getChars(char *ibuf, unsigned long len) {
	if (direct) {
		len = (((zlen - zpos) > (unsigned)len) ? len : zlen - zpos);
		if (len > 0) {
			memmove(ibuf, &zbuf[zpos], len);
			zpos += len;
		}
	}
	else {
//		slen = strlen(buf);
		len = (((slen - pos) > (unsigned)len) ? len : slen - pos);
		if (len > 0) {
			memmove(ibuf, &buf[pos], len);
			pos += len;
		}
	}
	return len;
}
	

unsigned long SWCompress::sendChars(char *ibuf, unsigned long len) {
	if (direct) {
		if (buf) {
//			slen = strlen(buf);
			if ((pos + len) > (unsigned)slen) {
				buf = (char *) realloc(buf, pos + len + 1024);
				memset(&buf[pos], 0, len + 1024);
			}
		}
		else	buf = (char *)calloc(1, len + 1024);
		memmove(&buf[pos], ibuf, len);
		pos += len;
	}
	else {
		if (zbuf) {
			if ((zpos + len) > zlen) {
				zbuf = (char *) realloc(zbuf, zpos + len + 1024);
				zlen = zpos + len + 1024;
			}
		}
		else {
			zbuf = (char *)calloc(1, len + 1024);
			zlen = len + 1024;
		}
		memmove(&zbuf[zpos], ibuf, len);
		zpos += len;
	}
	return len;
}


/******************************************************************************
 * SWCompress::encode	- This function "encodes" the input stream into the
 *						output stream.
 *						The getChars() and sendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 */

void SWCompress::encode(void) {
	cycleStream();
}


/******************************************************************************
 * SWCompress::decode	- This function "decodes" the input stream into the
 *						output stream.
 *						The getChars() and sendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 */

void SWCompress::decode(void) {
	cycleStream();
}


void SWCompress::cycleStream() {
	char buf[1024];
	unsigned long len, totlen = 0;

	do {
		len = getChars(buf, 1024);
		if (len)
			totlen += sendChars(buf, len);
	} while (len == 1024);

	zlen = slen = totlen;
}

SWORD_NAMESPACE_END
