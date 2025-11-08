/******************************************************************************
 *
 * utf8nfkd.h -	class UTF8NFKD: a Filter to normalize a UTF8 text stream to
 * 		Unicode Normal Form Decomposed, Compatibility (NFKD)
 *
 * $Id: utf8nfkd.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef UTF8NFKD_H
#define UTF8NFKD_H

#include <swfilter.h>

SWORD_NAMESPACE_START

struct UTF8NFKDPrivate;

class SWDLLEXPORT UTF8NFKD : public SWFilter {

private:
	struct UTF8NFKDPrivate *p;

public:
	UTF8NFKD();
	~UTF8NFKD();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
};

SWORD_NAMESPACE_END
#endif
