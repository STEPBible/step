/******************************************************************************
 *
 *  gbfredletterwords.cpp -	SWFilter descendant to toggle red coloring of
 *				words of Christ in a GBF module
 *
 * $Id: gbfredletterwords.cpp 3427 2016-07-03 14:30:33Z scribe $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <gbfredletterwords.h>
#include <swmodule.h>
#include <ctype.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Words of Christ in Red";
	static const char oTip[]  = "Toggles Red Coloring for Words of Christ On and Off if they are marked";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


GBFRedLetterWords::GBFRedLetterWords() : SWOptionFilter(oName, oTip, oValues()) {
}


GBFRedLetterWords::~GBFRedLetterWords() {
}


char GBFRedLetterWords::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
/** This function removes the red letter words in Bible like the WEB
* The words are marked by <FR> as start and <Fr> as end tag.
*/
	if (!option) {	// if we don't want footnotes
		char token[4096]; // cheese.  Fix.
		int tokpos = 0;
		bool intoken = false;
		bool hide = false;

	const char *from;
	SWBuf orig = text;
	from = orig.c_str();
	for (text = ""; *from; from++) {
			if (*from == '<') {
				intoken = true;
				tokpos = 0;
//				memset(token, 0, 4096);
				token[0] = 0;
				token[1] = 0;
				token[2] = 0;
				continue;
			}
			if (*from == '>') {	// process tokens
				intoken = false;
				/*switch (*token) {
				case 'F':			// Font attribute
					switch(token[1]) {
					case 'R':               // Begin red letter words
						hide = true;
						break;
					case 'r':               // end red letter words
						hide = false;
						break;
					}
					continue;	// skip token
				}*/

				//hide the token if either FR or Fr was detected
				hide = (token[0] == 'F' && ( (token[1] == 'R') || (token[1] == 'r') ));

				// if not a red letter word token, keep token in text
				if (!hide) {
					text += '<';
					for (char *tok = token; *tok; tok++)
						text += *tok;
					text += '>';
				}
				continue;
			}
			if (intoken) {
				if (tokpos < 4090) {
					token[tokpos++] = *from;
					// TODO: why is this + 2 ?  The below comment still doesn't help me understand.  The switch statment 
					// is commented out in this filter
					token[tokpos+2] = 0;	// +2 cuz we init token with 2 extra '0' because of switch statement
				}
			}
			else {
				text += *from;
			}
		}
	}
	return 0;
}

SWORD_NAMESPACE_END
