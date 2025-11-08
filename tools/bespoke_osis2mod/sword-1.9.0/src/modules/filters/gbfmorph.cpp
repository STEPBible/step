/******************************************************************************
 *
 *  gbfmorph.cpp -	SWFilter descendant to hide or show morph tags
 *			in a GBF module
 *
 * $Id: gbfmorph.cpp 3427 2016-07-03 14:30:33Z scribe $
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
#include <gbfmorph.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Morphological Tags";
	static const char oTip[]  = "Toggles Morphological Tags On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


GBFMorph::GBFMorph() : SWOptionFilter(oName, oTip, oValues()) {
}


GBFMorph::~GBFMorph() {
}


char GBFMorph::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if (!option) {	// if we don't want morph tags
		const char *from;
		char token[2048]; // cheese.  Fix.
		int tokpos = 0;
		bool intoken = false;
		bool lastspace = false;

		SWBuf orig = text;
		from = orig.c_str();

		for (text = ""; *from; from++) {
			if (*from == '<') {
				intoken = true;
				tokpos = 0;
				token[0] = 0;
				token[1] = 0;
				token[2] = 0;
				continue;
			}
			if (*from == '>') {	// process tokens
				intoken = false;
				if (*token == 'W' && token[1] == 'T') {	// Morph
				  if ((from[1] == ' ') || (from[1] == ',') || (from[1] == ';') || (from[1] == '.') || (from[1] == '?') || (from[1] == '!') || (from[1] == ')') || (from[1] == '\'') || (from[1] == '\"')) {
				    if (lastspace)
				      text--;
				  }
				  continue;
				}
				// if not a morph tag token, keep token in text
				text += '<';
				text += token;
				text += '>';
				continue;
			}
			if (intoken) {
				if (tokpos < 2045) {
					token[tokpos++] = *from;
					// TODO: why is this + 2 ?
					token[tokpos+2] = 0;
				}
			}
			else {
				text += *from;
				lastspace = (*from == ' ');
			}
		}
	}
	return 0;
}

SWORD_NAMESPACE_END
