/******************************************************************************
 *
 * swcipher.h -		class SWCipher: used for data cipher/decipher
 *
 * $Id: swcipher.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef SWCIPHER_H
#define SWCIPHER_H

#include <sapphire.h>

#include <defs.h>
#include <swbuf.h>

SWORD_NAMESPACE_START

class SWDLLEXPORT SWCipher {

private:
	Sapphire master;
	Sapphire work;

	char *buf;
	bool cipher;
	unsigned long len;

protected:

public:
	SWCipher(unsigned char *key);
	virtual void setCipherKey(const char *key);
	virtual ~SWCipher();
	virtual void setUncipheredBuf(const char *buf = 0, unsigned long len = 0);
	virtual char *getUncipheredBuf();
	virtual void setCipheredBuf(unsigned long *len, const char *buf = 0);
	virtual char *getCipheredBuf(unsigned long *len = 0);
	virtual void encode(void);
	virtual void decode(void);
	static SWBuf personalize(const SWBuf &buf, bool encode);
};

SWORD_NAMESPACE_END
#endif
