/******************************************************************************
 *
 * lzsscomprs.h -	class LZSSCompress: SWCompress implementation
 * 			using LZSS
 *
 * $Id: lzsscomprs.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef LZSSCOMPRS_H
#define LZSSCOMPRS_H

#include <swcomprs.h>

#include <defs.h>

SWORD_NAMESPACE_START

class SWDLLEXPORT LZSSCompress : public SWCompress
{
class Private;
	Private *p;
public:
	LZSSCompress ();
	virtual ~LZSSCompress();
	virtual void encode(void);
	virtual void decode(void);
};

SWORD_NAMESPACE_END
#endif
