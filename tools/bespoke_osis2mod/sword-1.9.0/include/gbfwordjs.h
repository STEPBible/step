/***************************************************************************
 *
 * gbfwordjs.h -	class GBFWordJS: an OptionFilter to inject
 * 			JavaScript (mostly onclick events) for modules
 * 			marked up in GBF
 *
 * $Id: gbfwordjs.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2005-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef GBFWORDSJS_H
#define GBFWORDSJS_H

#include <swoptfilter.h>

SWORD_NAMESPACE_START

class SWMgr;
/** This Filter shows/hides strong's numbers in a GBF text
 */
class SWDLLEXPORT GBFWordJS : public SWOptionFilter {
	SWModule *defaultGreekLex;
	SWModule *defaultHebLex;
	SWModule *defaultGreekParse;
	SWModule *defaultHebParse;
	SWMgr *mgr;

public:
	GBFWordJS();
	virtual ~GBFWordJS();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
	void setDefaultModules(SWModule *defaultGreekLex = 0, SWModule *defaultHebLex = 0, SWModule *defaultGreekParse = 0, SWModule *defaultHebParse = 0) {
		this->defaultGreekLex   = defaultGreekLex;
		this->defaultHebLex     = defaultHebLex;
		this->defaultGreekParse = defaultGreekParse;
		this->defaultHebParse   = defaultHebParse;
	}
	void setMgr(SWMgr *mgr) { this->mgr = mgr; }
};

SWORD_NAMESPACE_END
#endif
