/******************************************************************************
 *
 * osisfootnotes.h -	class OSISFootnotes: an OptionFilter which handles
 * 			footnotes in modules marked up in OSIS
 *
 * $Id: osisfootnotes.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef OSISFOOTNOTES_H
#define OSISFOOTNOTES_H

#include <swoptfilter.h>

SWORD_NAMESPACE_START

/** This Filter shows/hides footnotes in a OSIS text
 */
class SWDLLEXPORT OSISFootnotes : public SWOptionFilter {
public:
	OSISFootnotes();
	virtual ~OSISFootnotes();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
};

SWORD_NAMESPACE_END
#endif
