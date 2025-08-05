/******************************************************************************
 *
 * thmlrtf.h -	class ThMLRTF: a RenderFilter to render RTF from modules
 * 		marked up in ThML
 *
 * $Id: thmlrtf.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef THMLRTF_H
#define THMLRTF_H

#include <swbasicfilter.h>
#include <utilxml.h>

SWORD_NAMESPACE_START

/** this filter converts ThML text to RTF text
 */
class SWDLLEXPORT ThMLRTF : public SWBasicFilter {

protected:
	class MyUserData : public BasicFilterUserData {
	public:
		MyUserData(const SWModule *module, const SWKey *key);
		bool inSecHead;
		SWBuf version;
		bool isBiblicalText;
		XMLTag startTag;
	};

	virtual BasicFilterUserData *createUserData(const SWModule *module, const SWKey *key) {
		return new MyUserData(module, key);
	}

	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);

public:
	ThMLRTF();
};

SWORD_NAMESPACE_END
#endif
