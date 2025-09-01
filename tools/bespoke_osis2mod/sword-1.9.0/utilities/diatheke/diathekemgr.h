/******************************************************************************
 *
 *  diathekemgr.h -	DiathekeMgr
 *
 * $Id: diathekemgr.h 3754 2020-07-10 17:45:48Z scribe $
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

#ifndef DIATHEKEMGR_H
#define DIATHEKEMGR_H

#include <swmgr.h>
#include "diafiltmgr.h"

//enum PlatformIDs { WIN32S = 0, WIN9X, WINNT, WINCE };

class DiathekeMgr : public SWMgr {
	SWFilter *arshaping;
	SWFilter *bidireorder;
    SWOptionFilter *transliterator;

#ifdef WIN32
	char platformID;
#endif

protected:
	virtual void addRenderFilters(SWModule *module, ConfigEntMap &section);
	virtual signed char load();
	virtual void addGlobalOptionFilters(SWModule * module, ConfigEntMap & section);

public:
	bool shape;
	bool bidi;

	unsigned char Markup(unsigned char m = FMT_UNKNOWN) { return ((DiathekeFilterMgr*)filterMgr)->Markup(m); }
	void setEncoding(unsigned char e = ENC_UNKNOWN) { ((EncodingFilterMgr*)filterMgr)->setEncoding(e); }
	unsigned char getEncoding() { return ((EncodingFilterMgr*)filterMgr)->getEncoding(); }

	DiathekeMgr(SWConfig * iconf = NULL, SWConfig * isysconfig = NULL, bool autoload = false, char enc = ENC_UTF8, char mark = FMT_PLAIN, bool bidi = false, bool shape = false);
	virtual ~DiathekeMgr();
};

#endif
 
