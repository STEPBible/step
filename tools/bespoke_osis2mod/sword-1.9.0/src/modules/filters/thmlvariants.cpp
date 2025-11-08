/******************************************************************************
 *
 *  thmlvariants.cpp -	SWFilter descendant to hide or show textual variants
 *			in a ThML module
 *
 * $Id: thmlvariants.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <thmlvariants.h>
#include <utilstr.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Textual Variants";
	static const char oTip[]  = "Switch between Textual Variants modes";
	static const char *choices[4] = { "Primary Reading", "Secondary Reading", "All Readings", "" };

	static const StringList *oValues() {
		static const StringList oVals(&choices[0], &choices[3]);
		return &oVals;
	}
}


ThMLVariants::ThMLVariants() : SWOptionFilter(oName, oTip, oValues()) {
}


ThMLVariants::~ThMLVariants() {
}


char ThMLVariants::processText(SWBuf &text, const SWKey *key, const SWModule *module)
{

	int option = 0;
	if      (optionValue == choices[0]) option = 0;
	else if (optionValue == choices[1]) option = 1;
	else                                option = 2;

	if (option == 0 || option == 1) { //we want primary or variant only
		bool intoken = false;
		bool hide = false;
		bool invar = false;
		
		SWBuf token;
		SWBuf orig = text;
		const char *from = orig.c_str();

		//we use a fixed comparision string to make sure the loop is as fast as the original two blocks with almost the same code
		const char* variantCompareString = (option == 0) ? "div type=\"variant\" class=\"1\"" : "div type=\"variant\" class=\"2\"";
		
		for (text = ""; *from; from++) {
			if (*from == '<') {
				intoken = true;
				token = "";
				continue;
			}
			else if (*from == '>') {	// process tokens
				intoken = false;
				
				if ( !strncmp(token.c_str(), variantCompareString, 28)) { //only one of the variants, length of the two strings is 28 in both cases 
					invar = true;
					hide = true;
					continue;
				}
				if (!strncmp(token.c_str(), "div type=\"variant\"", 18)) {
					invar = true;
					continue;
				}
				if (!strncmp(token.c_str(), "/div", 4)) {
					hide = false;
					if (invar) {
						invar = false;
						continue;
					}
				}
				if (!hide) {
					text += '<';
					text.append(token);
					text += '>';
				}

				continue;
			}
			if (intoken) {
				token += *from;
			}
			else if (!hide) {
				text += *from;
			}
		}

	}

	return 0;
}



SWORD_NAMESPACE_END
