/******************************************************************************
 *
 *  cipherfil.cpp -	CipherFilter, a SWFilter descendant to decipher
 *			a module
 *
 * $Id: cipherfil.cpp 3754 2020-07-10 17:45:48Z scribe $
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
#include <cipherfil.h>
#include <swcipher.h>
#include <swbuf.h>


SWORD_NAMESPACE_START


CipherFilter::CipherFilter(const char *key) {
	cipher = new SWCipher((unsigned char *)key);
}


CipherFilter::~CipherFilter() {
	delete cipher;
}


SWCipher *CipherFilter::getCipher() {
	return cipher;
}


char CipherFilter::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if (text.length() > 2) { //check if it's large enough to substract 2 in the next step.
		unsigned long len = text.length();
		if (!key) {	// hack, using key to determine encipher, or decipher
			cipher->setCipheredBuf(&len, text.getRawData()); //set buffer to enciphered text
			cipher->getUncipheredBuf();
			// don't just assign text because we might be compressing binary data
			text.setSize(len + 5);
			memcpy(text.getRawData(), cipher->getUncipheredBuf(), len);
		}
		else if ((unsigned long)key == 1) {
			cipher->setUncipheredBuf(text.getRawData(), len);
			cipher->getCipheredBuf(&len);
			text.setSize(len + 5);
			memcpy(text.getRawData(), cipher->getCipheredBuf(&len), len);
		}
	}
	return 0;
}


SWORD_NAMESPACE_END

