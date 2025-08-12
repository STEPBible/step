/******************************************************************************
 *
 * xzcomprs.h -		class XzCompress: an SWCompress class which provides
 * 			xz (LZMA2) compression
 *
 * $Id: xzcomprs.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef XZCOMPRS_H
#define XZCOMPRS_H

#include <swcomprs.h>

#include <defs.h>
#include <sysdata.h>

SWORD_NAMESPACE_START

class SWDLLEXPORT XzCompress : public SWCompress {

private:
	SW_u64 memlimit; // memory usage limit during decompression

public:
	XzCompress();
	virtual ~XzCompress();

	virtual void encode(void);
	virtual void decode(void);
	virtual void setLevel(int l);
};

SWORD_NAMESPACE_END
#endif
