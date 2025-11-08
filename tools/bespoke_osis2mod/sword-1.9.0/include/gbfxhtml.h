/******************************************************************************
 *
 * gbfxhtml.h -	class GBFXHTML: a RenderFilter to render XHTML from modules
 * 		marked up in GBF
 *
 * $Id: gbfxhtml.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2011-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef GBFXHTML_H
#define GBFXHTML_H

#include <swbasicfilter.h>

SWORD_NAMESPACE_START

/** this filter converts GBF text to classed XHTML text
 */
class SWDLLEXPORT GBFXHTML : public SWBasicFilter {
	bool renderNoteNumbers;
protected:
	class MyUserData : public BasicFilterUserData {
	public:
		MyUserData(const SWModule *module, const SWKey *key);
		bool hasFootnotePreTag;
		SWBuf version;
	};
	virtual BasicFilterUserData *createUserData(const SWModule *module, const SWKey *key) {
		return new MyUserData(module, key);
	}
	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);
public:
	GBFXHTML();
	virtual const char *getHeader() const;
	void setRenderNoteNumbers(bool val = true) { renderNoteNumbers = val; }
};

SWORD_NAMESPACE_END
#endif
