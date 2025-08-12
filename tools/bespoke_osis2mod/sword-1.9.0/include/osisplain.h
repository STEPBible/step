/******************************************************************************
 *
 * osisplain.h -	class OSISPlain: a StripFilter for modules marked up
 * 			in OSIS
 *
 * $Id: osisplain.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef OSISPLAIN_H
#define OSISPLAIN_H

#include <swbasicfilter.h>
#include <utilxml.h>

SWORD_NAMESPACE_START

/** this filter converts OSIS text to plain text; primary stripFilter for OSIS
 */
class SWDLLEXPORT OSISPlain : public SWBasicFilter {
public:
protected:
	virtual BasicFilterUserData *createUserData(const SWModule *module, const SWKey *key);
	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);
	virtual bool processStage(char stage, SWBuf &text, char *&from, BasicFilterUserData *userData);
public:
	OSISPlain();
};

SWORD_NAMESPACE_END
#endif
