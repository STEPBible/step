/******************************************************************************
 *
 * encfiltmgr.h -	class SWEncodingMgr: a FilterMgr which applies
 *			appropriate EncodingFilters to obtain a requested
 *			encoding
 *
 * $Id: encfiltmgr.h 3808 2020-10-02 13:23:34Z scribe $
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

#ifndef ENCFILTERMGR_H
#define ENCFILTERMGR_H

#include <swmodule.h>
#include <swfiltermgr.h>

SWORD_NAMESPACE_START

class SWFilter;

/** This class is like a normal SWMgr,
 * but you can additonally specify which encoding
 * you want to use.
 */

class SWDLLEXPORT EncodingFilterMgr : public SWFilterMgr {

protected:
	SWFilter *latin1utf8;
	SWFilter *scsuutf8;
	SWFilter *utf16utf8;
	SWFilter *targetenc;


	/*
	 * current encoding value
	 */
	char encoding;

public:


	/** Constructor of SWEncodingMgr.
	 *
	 * @param encoding The desired encoding.
	 */
	EncodingFilterMgr(char encoding = ENC_UTF8);

	/**
	 * The destructor of SWEncodingMgr.
	 */
	~EncodingFilterMgr();

	/** Encoding sets/gets the encoding after initialization
	 * 
	 * DEPRECATED: use setEncoding / getEncoding
	 *
	 * @return The current encoding format.
	 */

	char Encoding(char enc) { if (enc != ENC_UNKNOWN) setEncoding(enc); return getEncoding(); }

	/** getEncoding gets the encoding after initialization
	 * 
	 * @return The current encoding format.
	 */
	char getEncoding() const { return encoding; }

	/** setEncoding sets the encoding after initialization
	 * 
	 * @param enc The new encoding or ENC_UNKNOWN if you just want to get the current markup.
	 */
	void setEncoding(char enc);

	/**
	 * Adds the raw filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the raw filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */
	virtual void addRawFilters(SWModule *module, ConfigEntMap &section);

	/**
	 * Adds the encoding filters which are defined in "section" to the SWModule object "module".
	 * @param module To this module the encoding filter(s) are added
	 * @param section We use this section to get a list of filters we should apply to the module
	 */
	virtual void addEncodingFilters(SWModule *module, ConfigEntMap &section);
};

SWORD_NAMESPACE_END
#endif
