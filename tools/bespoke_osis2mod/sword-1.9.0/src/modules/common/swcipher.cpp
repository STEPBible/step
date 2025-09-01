/******************************************************************************
 *
 *  swcipher.cpp -	code for class 'SWCipher'- a driver class that
 *			provides cipher utilities
 *
 * $Id: swcipher.cpp 3755 2020-07-19 18:43:07Z scribe $
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


#include <stdlib.h>
#include <string.h>
#include <swcipher.h>
#include <map>

namespace {
	char lats[] = {
		'b', 'c', 'e', 'a', 'f', 'g', 'i', 'j', 'k', 'l',
		'h', 'm', 'p', 'q', 'B', 'r', 'H', 'o', 's', 't',
		'T', 'u', 'w', 'x', 'y', 'A', 'd', 'C', 'D', 'z',
		'E', 'F', 'I', 'J', 'K', 'G', 'L', 'N', 'O', '7',
		'P', 'Q', 'M', 'R', 'S', 'U', 'V', 'W', 'X', 'Y',
		'9', '0', '1', '2', 'Z', '3', '6', '4', 'n', '8',
		'v', '5'
	};
}

SWORD_NAMESPACE_START

/******************************************************************************
 * SWCipher Constructor - Initializes data for instance of SWCipher
 *
 */

SWCipher::SWCipher(unsigned char *key) {
	SWBuf cipherKey = personalize((const char *)key, false);
	master.initialize((unsigned char *)(const char *)cipherKey, cipherKey.size());
	buf = 0;
}


/******************************************************************************
 * SWCipher Destructor - Cleans up instance of SWCipher
 */

SWCipher::~SWCipher()
{
	if (buf)
		free(buf);
}


void SWCipher::setUncipheredBuf(const char *ibuf, unsigned long ilen) {
	if (ibuf) {
	
		if (buf)
			free(buf);

		if (!ilen) {
		        len = strlen(buf);
			ilen = len + 1;
		}
		else len = ilen;

		buf = (char *) malloc(ilen);
		memcpy(buf, ibuf, ilen);
		cipher = false;
	}

	decode();
}

char *SWCipher::getUncipheredBuf() {

	decode();

	return buf;
}


void SWCipher::setCipheredBuf(unsigned long *ilen, const char *ibuf) {
	if (ibuf) {
	
		if (buf)
			free(buf);
			
		buf = (char *) malloc(*ilen+1);
		memcpy(buf, ibuf, *ilen);
		len = *ilen;
		cipher = true;
	}

	encode();

	*ilen = len;
}

char *SWCipher::getCipheredBuf(unsigned long *ilen) {

	encode();

	if (ilen) *ilen = len;

	return buf;
}


/******************************************************************************
 * SWCipher::encode	- This function "encodes" the input stream into the
 *						output stream.
 *						The GetChars() and SendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 */

void SWCipher::encode(void)
{
	if (!cipher) {
		work = master;
		for (unsigned long i = 0; i < len; i++)
			buf[i] = work.encrypt(buf[i]);
		cipher = true;
	}
}


/******************************************************************************
 * SWCipher::decode	- This function "decodes" the input stream into the
 *						output stream.
 *						The GetChars() and SendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 */

void SWCipher::decode(void)
{
	if (cipher) {
		work = master;
		unsigned long i;
		for (i = 0; i < len; i++)
			buf[i] = work.decrypt(buf[i]);
		buf[i] = 0;
		cipher = false;
	}
}


/******************************************************************************
 * SWCipher::setCipherKey	- setter for a new CipherKey
 *
 */

void SWCipher::setCipherKey(const char *ikey) {
	SWBuf cipherKey = personalize(ikey, false);
	master.initialize((unsigned char *)(const char *)cipherKey, cipherKey.size());
}


/******************************************************************************
 * SWCipher::personalize	- a simple personalization encoding
 *
 * encode - whether to encode or decode
 *
 */
SWBuf SWCipher::personalize(const SWBuf &buf, bool encode) {

	std::map<char, int> charHash;
	for (int i = 0; i < 62; ++i) charHash[lats[i]] = i;

	SWBuf segs[5];
	int segn = 0;
	for (unsigned int i = 0; i < buf.size() && segn < 5; ++i) {
		if (buf[i] == '-') ++segn;
		else segs[segn].append(buf[i]);
	}
	SWBuf result;
	SWBuf chkSum = segs[4];
	if (segs[4].size() < 5) segs[4].size(4);
	for (int i = 0; i < 4; ++i) {
		int csum = 0;
		for (unsigned int j = 0; j < segs[i].size() && j < segs[0].size(); ++j) {
			char hash = charHash[segs[i][j]];
			char obfusHash = charHash[segs[0][j%segs[0].size()]];
			if (encode) {
				obfusHash = hash - (i ? obfusHash : 0);
				if (obfusHash < 0) obfusHash = (62 + obfusHash);
			}
			else {
				obfusHash = hash + (i ? obfusHash : 0);
				obfusHash %= 62;
			}
			if (i) segs[i][j] = lats[(long)obfusHash];
			csum += (encode ? obfusHash : hash);
		}
		segs[4][i] = lats[csum%62];
		if (result.size()) result += "-";
		result += (!encode && !i ? "" : segs[i].c_str());
	}
	if (encode) {
		result += "-";
		result += segs[4];
	}
	return (!encode && chkSum != segs[4]) ? buf : result;
}

SWORD_NAMESPACE_END
