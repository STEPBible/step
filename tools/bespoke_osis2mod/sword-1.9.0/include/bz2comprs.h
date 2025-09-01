/******************************************************************************
 *
 * bz2comprs.h -	class Bzip2Compress, a driver class that provides bzip2
 *			compression (Burrows–Wheeler with Huffman coding)
 *
 * $Id: bz2comprs.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef BZ2COMPRS_H
#define BZ2COMPRS_H

#include <swcomprs.h>

#include <defs.h>

SWORD_NAMESPACE_START

class SWDLLEXPORT Bzip2Compress : public SWCompress {

protected:
public:
	Bzip2Compress();
	virtual ~Bzip2Compress();

	virtual void encode(void);
	virtual void decode(void);
};

SWORD_NAMESPACE_END
#endif
