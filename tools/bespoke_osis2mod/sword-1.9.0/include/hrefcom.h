/******************************************************************************
 *
 * hrefcom.h -	class HREFCom: a module driver that supports commentary
 *		entries which don't store their text body, but instead a URL
 *		where the text body can be retrieved.
 *
 * $Id: hrefcom.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 1998-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef HREFCOM_H
#define HREFCOM_H

#include <rawverse.h>
#include <swcom.h>

#include <defs.h>

SWORD_NAMESPACE_START

class SWDLLEXPORT HREFCom : public RawVerse, public SWCom {

private:
	char *prefix;

public:
	HREFCom(const char *ipath, const char *prefix, const char *iname = 0, const char *idesc = 0, SWDisplay * idisp = 0);
	virtual ~HREFCom();
	virtual SWBuf &getRawEntryBuf() const;

	// OPERATORS -----------------------------------------------------------------
	
	SWMODULE_OPERATORS
};

SWORD_NAMESPACE_END
#endif
