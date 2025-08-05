/***************************************************************************
 *
 * cipherfil.h -	class CipherFilter: an EncodingFilter which can
 * 			encipher and decipher a text stream based on
 * 			a CipherKey
 *
 * $Id: cipherfil.h 3787 2020-08-30 12:00:38Z scribe $
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

#ifndef CIPHERFIL_H
#define CIPHERFIL_H

#include <swfilter.h>

SWORD_NAMESPACE_START

class SWCipher;

class SWDLLEXPORT CipherFilter : public SWFilter {
	SWCipher *cipher;
public:
	CipherFilter(const char *key);
	virtual ~CipherFilter();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule * = 0);
	virtual SWCipher *getCipher();
};

SWORD_NAMESPACE_END
#endif
