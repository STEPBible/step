/******************************************************************************
 *
 * thmllatex.h -	class ThMLLaTeX: a RenderFilter to render LaTeX from
 * 			modules marked up in ThML
 *
 * $Id: thmllatex.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2011-2014 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef THMLLATEX_H
#define THMLLATEX_H

#include <swbasicfilter.h>
#include <utilxml.h>

SWORD_NAMESPACE_START

/** this filter converts ThML text to LaTeX
 */
class SWDLLEXPORT ThMLLaTeX : public SWBasicFilter {

private:
	SWBuf imgPrefix;
	bool renderNoteNumbers;

protected:
	class MyUserData : public BasicFilterUserData {
	public:
		MyUserData(const SWModule *module, const SWKey *key);//: BasicFilterUserData(module, key) {}
		bool inscriptRef;
		bool inSecHead;
		bool isBiblicalText;
		SWBuf version;
		XMLTag startTag;
	};

	virtual BasicFilterUserData *createUserData(const SWModule *module, const SWKey *key) {
		return new MyUserData(module, key);
	}

	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);

public:
	ThMLLaTeX();
	virtual const char *getImagePrefix() { return imgPrefix.c_str(); }
	virtual void setImagePrefix(const char *newImgPrefix) { imgPrefix = newImgPrefix; }
	virtual const char *getHeader() const;
	void setRenderNoteNumbers(bool val = true) { renderNoteNumbers = val; }
};

SWORD_NAMESPACE_END

#endif
