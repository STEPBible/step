/***************************************************************************
 *
 * greeklexattribs.h -	class GreekLexAttribs: an OptionFilter to handle
 * 			Greek Lexicon attributes for modules marked up
 * 			in TEI
 *
 * $Id: greeklexattribs.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef GREEKLEXATTRIBS_H
#define GREEKLEXATTRIBS_H

#include <swoptfilter.h>

SWORD_NAMESPACE_START

/** an OptionFilter to handle Greek Lexicon attributes for modules marked up in TEI
 */
class SWDLLEXPORT GreekLexAttribs : public SWOptionFilter {
public:
	GreekLexAttribs();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
};

SWORD_NAMESPACE_END
#endif
