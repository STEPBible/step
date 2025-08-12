/******************************************************************************
 *
 * markupfiltmgr.h -	class SWMarkupMgr: a FilterManager which applied
 * 			the appropriate Markup and Encoding filters to obtain
 * 			a requested Render markup and encoding
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

#ifndef MARKUPFILTMGR_H
#define MARKUPFILTMGR_H

#include <encfiltmgr.h>

SWORD_NAMESPACE_START

/** This class is like a normal SWEncodingMgr,
* but you can additonally specify which markup
* you want to use.
*/
class SWDLLEXPORT MarkupFilterMgr : public EncodingFilterMgr {

protected:
	SWFilter* fromthml;
	SWFilter* fromgbf;
	SWFilter* fromplain;
	SWFilter* fromosis;
	SWFilter* fromtei;

	/**
	 * current markup value
	 */
	char markup;

	void createFilters(char markup);
public:

	/** Constructor of SWMarkupMgr.
	 *
	 * @param encoding The desired encoding.
	 * @param markup The desired markup format.
	 */
	MarkupFilterMgr(char markup = FMT_THML, char encoding = ENC_UTF8);

	/**
	 * The destructor of SWMarkupMgr.
	 */
	~MarkupFilterMgr();

	/** Markup sets/gets the markup after initialization
	 * 
	 * @deprecated Use setMarkup / getMarkup
	 *
	 * @param m The new markup
	 * @return The current (possibly changed) markup format.
	 */
	SWDEPRECATED char Markup(char m = FMT_UNKNOWN) { if (m != FMT_UNKNOWN) setMarkup(m); return getMarkup(); }

	/** getMarkup gets the markup after initialization
	 * 
	 * @return The current markup format.
	 */
	char getMarkup() const { return markup; }

	/** setMarkup sets the markup after initialization
	 * 
	 * @param m The new markup
	 */
	void setMarkup(char m);

	/**
	 * Adds the render filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the render filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */	
	virtual void addRenderFilters(SWModule *module, ConfigEntMap &section);
};

SWORD_NAMESPACE_END
#endif
