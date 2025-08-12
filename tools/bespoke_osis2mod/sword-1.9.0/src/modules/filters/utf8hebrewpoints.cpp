/******************************************************************************
 *
 *  utf8hebrewpoints.cpp -	SWFilter descendant to remove UTF-8 Hebrew
 *				vowel points
 *
 * $Id: utf8hebrewpoints.cpp 2980 2013-09-14 21:51:47Z scribe $
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

#include <stdlib.h>
#include <stdio.h>
#include <utf8hebrewpoints.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Hebrew Vowel Points";
	static const char oTip[]  = "Toggles Hebrew Vowel Points";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"On", "Off", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


UTF8HebrewPoints::UTF8HebrewPoints() : SWOptionFilter(oName, oTip, oValues()) {
}


UTF8HebrewPoints::~UTF8HebrewPoints(){};


char UTF8HebrewPoints::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if (!option) {
		//The UTF-8 range 0xD6 0xB0 to 0xD6 0xBF excluding 0xD6 0xBE consist of Hebrew cantillation marks so block those out.
		SWBuf orig = text;
		const unsigned char* from = (unsigned char*)orig.c_str();
		for (text = ""; *from; from++) {
			if ((*from == 0xD6) && (*(from + 1) >= 0xB0 && *(from + 1) <= 0xBF) && (*(from + 1) != 0xBE)) {
				from++;
			}
			else {
     			        text += *from;
                        }
		}
     	}
	return 0;
}


SWORD_NAMESPACE_END
