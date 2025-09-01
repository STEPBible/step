/******************************************************************************
 *
 *  diathekemgr.cpp -	DiathekeMgr
 *
 * $Id: diathekemgr.cpp 3504 2017-11-01 10:36:18Z scribe $
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

//---------------------------------------------------------------------------
#include <swmodule.h>

#ifdef _ICU_
#include <utf8arshaping.h>
#include <utf8bidireorder.h>
#include <utf8transliterator.h>
#endif

#ifdef WIN32
#include <windows.h>
#endif

#include "diathekemgr.h"

//---------------------------------------------------------------------------
DiathekeMgr::DiathekeMgr (SWConfig * iconfig, SWConfig * isysconfig, bool autoload, char enc, char mark, bool ibidi, bool ishape)
        : SWMgr(iconfig, isysconfig, autoload, new DiathekeFilterMgr(mark, enc))
{
	bidi = ibidi;
	shape = ishape;

#ifdef _ICU_
	arshaping = new UTF8arShaping();
	bidireorder = new UTF8BiDiReorder();
	transliterator = new UTF8Transliterator();
#endif
	load();

#ifdef WIN32
	OSVERSIONINFO osvi;
	memset (&osvi, 0, sizeof(OSVERSIONINFO));
	osvi.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);
	GetVersionEx(&osvi);
	platformID = osvi.dwPlatformId;
#endif

}


DiathekeMgr::~DiathekeMgr()
{
#ifdef _ICU_
        if (arshaping)
                delete arshaping;
        if (bidireorder)
                delete bidireorder;
        if (transliterator)
                delete transliterator;
#endif
}


void DiathekeMgr::addRenderFilters(SWModule *module, ConfigEntMap &section)
{
	SWBuf lang;
	ConfigEntMap::iterator entry;

	lang = ((entry = section.find("Lang")) != section.end()) ? (*entry).second : (SWBuf)"en";

#ifdef _ICU_
	bool rtl;
	rtl = ((entry = section.find("Direction")) != section.end()) ? ((*entry).second == "RtoL") : false;

	if (shape) {
		module->addRenderFilter(arshaping);
	}
	if (bidi && rtl) {
		module->addRenderFilter(bidireorder);
	}
#endif
	SWMgr::addRenderFilters(module, section);
}

signed char DiathekeMgr::load() {
	signed char retval =  SWMgr::load();
#ifdef _ICU_
	optionFilters["UTF8Transliterator"] = transliterator;
	options.push_back(transliterator->getOptionName());
#endif
	return retval;
};

void DiathekeMgr::addGlobalOptionFilters(SWModule *module, ConfigEntMap &section) {

        SWMgr::addGlobalOptionFilters(module, section);
#ifdef _ICU_
        module->addOptionFilter(transliterator);
#endif
};

