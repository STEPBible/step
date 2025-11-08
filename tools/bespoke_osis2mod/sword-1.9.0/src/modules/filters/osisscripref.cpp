/******************************************************************************
 *
 *  osisscripref.cpp -	SWFilter descendant to hide or show scripture
 *			references in an OSIS module
 *
 * $Id: osisscripref.cpp 3045 2014-03-02 07:53:52Z chrislit $
 *
 * Copyright 2003-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <osisscripref.h>
#include <swmodule.h>
#include <utilxml.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Cross-references";
	static const char oTip[]  = "Toggles Scripture Cross-references On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


OSISScripref::OSISScripref() : SWOptionFilter(oName, oTip, oValues()) {
}


OSISScripref::~OSISScripref() {
}


char OSISScripref::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	SWBuf token;
	bool intoken    = false;
	bool hide       = false;
	SWBuf tagText;
	XMLTag startTag;

	SWBuf orig = text;
	const char *from = orig.c_str();
	
	XMLTag tag;

	for (text = ""; *from; ++from) {
		if (*from == '<') {
			intoken = true;
			token = "";
			continue;
		}
		if (*from == '>') {	// process tokens
			intoken = false;
			
			tag = token;
			
			if (!strncmp(token.c_str(), "note", 4) || !strncmp(token.c_str(), "/note", 5)) {
				if (!tag.isEndTag() && !tag.isEmpty()) {
					startTag = tag;
					if ((tag.getAttribute("type")) && (!strcmp(tag.getAttribute("type"), "crossReference"))) {
						hide = true;
						tagText = "";
						if (option) {	// we want the tag in the text
							text.append('<');
							text.append(token);
							text.append('>');
						}
						continue;
					}
				}
				if (hide && tag.isEndTag()) {
					hide = false;
					if (option) {	// we want the tag in the text
						text.append(tagText);  // end tag gets added further down
					}
					else	continue;	// don't let the end tag get added to the text
				}
			}

			// if not a heading token, keep token in text
			if (!hide) {
				text.append('<');
				text.append(token);
				text.append('>');
			}
			else {
				tagText.append('<');
				tagText.append(token);
				tagText.append('>');
			}
			continue;
		}
		if (intoken) { //copy token
			token.append(*from);
		}
		else if (!hide) { //copy text which is not inside a token
			text.append(*from);
		}
		else tagText.append(*from);
	}
	return 0;
}

SWORD_NAMESPACE_END
