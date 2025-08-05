/******************************************************************************
 *
 * swfiltermgr.h -	class SWFilterMgr: used to manage filters on a module
 *
 * $Id: swfiltermgr.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef SWFILTERMGR_H
#define SWFILTERMGR_H

#include <defs.h>
#include <swconfig.h>

SWORD_NAMESPACE_START

class SWModule;
class SWMgr;

/** Class to apply appropriate filter to achieve a desired output
*/
class SWDLLEXPORT SWFilterMgr {

private:
	SWMgr *parentMgr;

public:
	SWFilterMgr();
	virtual ~SWFilterMgr();

	virtual void setParentMgr(SWMgr *parentMgr);
	virtual SWMgr *getParentMgr();

	virtual void addGlobalOptions(SWModule *module, ConfigEntMap &section, ConfigEntMap::iterator start, ConfigEntMap::iterator end);
	virtual void addLocalOptions(SWModule *module, ConfigEntMap &section, ConfigEntMap::iterator start, ConfigEntMap::iterator end);


	/**
	 * Adds the encoding filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the encoding filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */
	virtual void addEncodingFilters(SWModule *module, ConfigEntMap &section);

	/**
	 * Adds the render filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the render filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */
	virtual void addRenderFilters(SWModule *module, ConfigEntMap &section);

	/**
	 * Adds the strip filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the strip filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */
	virtual void addStripFilters(SWModule *module, ConfigEntMap &section);

	/**
	 * Adds the raw filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the raw filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */
	virtual void addRawFilters(SWModule *module, ConfigEntMap &section);

};
SWORD_NAMESPACE_END
#endif
