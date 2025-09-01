/******************************************************************************
 *
 * teixhtml.h -	class TEIXHTML: a RenderFilter to render XHTML from modules
 * 		marked up in TEI
 *
 * $Id: teixhtml.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2012-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef TEIXHTML_H
#define TEIXHTML_H

#include <swbasicfilter.h>

SWORD_NAMESPACE_START

/** this filter converts TEI text to XHTML text
 */
class SWDLLEXPORT TEIXHTML : public SWBasicFilter {

private:
	bool renderNoteNumbers;

protected:
	class MyUserData : public BasicFilterUserData {
	public:
		bool isBiblicalText;
		SWBuf lastHi;
		
		SWBuf version;
		MyUserData(const SWModule *module, const SWKey *key);
	};

	virtual BasicFilterUserData *createUserData(const SWModule *module, const SWKey *key) {
		return new MyUserData(module, key);
	}
	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);
public:
	TEIXHTML();
	void setRenderNoteNumbers(bool val = true) { renderNoteNumbers = val; }
	virtual const char *getHeader() const;
};

SWORD_NAMESPACE_END
#endif
