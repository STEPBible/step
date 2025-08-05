/******************************************************************************
 *
 *  osisredletterwords.cpp -	SWFilter descendant to toggle red coloring for
 *				words of Christ in an OSIS module
 *
 * $Id: osisredletterwords.cpp 2980 2013-09-14 21:51:47Z scribe $
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
#include <osisredletterwords.h>
#include <swmodule.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Words of Christ in Red";
	static const char oTip[]  = "Toggles Red Coloring for Words of Christ On and Off if they are marked";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"On", "Off", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


OSISRedLetterWords::OSISRedLetterWords() : SWOptionFilter(oName, oTip, oValues()) {
}


OSISRedLetterWords::~OSISRedLetterWords() {
}


char OSISRedLetterWords::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if (option) //leave in the red lettered words
		return 0;
	
	SWBuf token;
	bool intoken    = false;

	SWBuf orig = text;
	const char *from = orig.c_str();

	//taken out of the loop
	const char* start = 0;
	const char* end = 0;
		
	for (text = ""; *from; from++) {
		if (*from == '<') {
			intoken = true;
			token = "";
			continue;
		}
		else if (*from == '>') {	// process tokens
			intoken = false;

			if ((token[0] == 'q') && (token[1] == ' ')) { //q tag
				start = strstr(token.c_str(), " who=\"Jesus\"");
				if (start && (strlen(start) >= 12)) { //we found a quote of Jesus Christ
					end = start+12; //marks the end of the who attribute value
					
					text.append('<');
					text.append(token, start - (token.c_str())); //the text before the who attr
					text.append(end, token.c_str() + token.length() - end);  //text after the who attr
					text.append('>');
					
					continue;
				}
			}
			
			//token not processed, append it. We don't want to alter the text
			text.append('<');
			text.append(token);
			text.append('>');
			continue;
		}
		
		if (intoken) { //copy token
			token.append(*from);
		}
		else { //copy text which is not inside a token
			text.append(*from);
		}
	}
	return 0;
}

SWORD_NAMESPACE_END

