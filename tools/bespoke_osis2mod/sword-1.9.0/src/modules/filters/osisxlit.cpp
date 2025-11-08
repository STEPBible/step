/******************************************************************************
 *
 *  osisxlit.cpp -	SWFilter descendant to hide or show xlit values
 *			(encoded transliterations) in an OSIS module
 *
 * $Id: osisxlit.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <osisxlit.h>
#include <utilxml.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Transliterated Forms";
	static const char oTip[]  = "Toggles transliterated forms On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


OSISXlit::OSISXlit() : SWOptionFilter(oName, oTip, oValues()) {
}


OSISXlit::~OSISXlit() {
}


char OSISXlit::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	SWBuf token;
	bool intoken = false;

	const SWBuf orig = text;
	const char * from = orig.c_str();

	if (!option) {
		for (text = ""; *from; ++from) {
			if (*from == '<') {
				intoken = true;
				token = "";
				continue;
			}
			if (*from == '>') {	// process tokens
				intoken = false;
				if (token.startsWith("w ")) {	// Word
					XMLTag wtag(token);
					const char *l = wtag.getAttribute("xlit");
					if (l) {
						wtag.setAttribute("xlit", 0);
						token = wtag;
						token.trim();
						// drop <>
						token << 1;
						token--;
					}
				}
				
				// keep token in text
				text.append('<');
				text.append(token);
				text.append('>');
				
				continue;
			}
			if (intoken) {
				token += *from;
			}
			else	{
				text.append(*from);
			}
		}
	}
	return 0;
}

SWORD_NAMESPACE_END
