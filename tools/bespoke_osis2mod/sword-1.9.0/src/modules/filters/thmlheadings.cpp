/******************************************************************************
 *
 *  thmlheadings.cpp -	SWFilter descendant to hide or show headings
 *			in a ThML module
 *
 * $Id: thmlheadings.cpp 3191 2014-04-19 17:06:38Z scribe $
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
#include <thmlheadings.h>
#include <utilxml.h>
#include <utilstr.h>
#include <swmodule.h>
#include <stdio.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Headings";
	static const char oTip[]  = "Toggles Headings On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


ThMLHeadings::ThMLHeadings() : SWOptionFilter(oName, oTip, oValues()) {
}


ThMLHeadings::~ThMLHeadings() {
}


char ThMLHeadings::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	SWBuf token;
	bool intoken    = false;
	bool isheader   = false;
	bool hide       = false;
	bool preverse   = false;
	bool withinDiv  = false;
	SWBuf header;
	int headerNum   = 0;
	int pvHeaderNum = 0;
	char buf[254];
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

			if (!strnicmp(token.c_str(), "div", 3) || !strnicmp(token.c_str(), "/div", 4)) {
				withinDiv =  (!strnicmp(token.c_str(), "div", 3));
				tag = token;
				if (hide && tag.isEndTag()) {
					if (module->isProcessEntryAttributes() && (option || (!preverse))) {
						SWBuf heading;
						SWBuf cls = startTag.getAttribute("class");
						if (!cls.startsWith("fromEntryAttributes")) {
							cls = SWBuf("fromEntryAttributes ") + cls;
							startTag.setAttribute("class", cls);
						}
						heading += startTag;
						heading += header;
						heading += tag;
						if (preverse) {
							sprintf(buf, "%i", pvHeaderNum++);
							module->getEntryAttributes()["Heading"]["Preverse"][buf] = heading;
						}
						else {
							sprintf(buf, "%i", headerNum++);
							module->getEntryAttributes()["Heading"]["Interverse"][buf] = heading;
							if (option) {	// we want the tag in the text
								text.append(header);
							}
						}
						
						StringList attributes = startTag.getAttributeNames();
						for (StringList::const_iterator it = attributes.begin(); it != attributes.end(); it++) {
							module->getEntryAttributes()["Heading"][buf][it->c_str()] = startTag.getAttribute(it->c_str());
						}
					}
					
					hide = false;
					if (!option || preverse) {	// we don't want the tag in the text anymore
						preverse = false;
						continue;
					}
					preverse = false;
				}
				if (tag.getAttribute("class") && ((!stricmp(tag.getAttribute("class"), "sechead"))
										 ||  (!stricmp(tag.getAttribute("class"), "title")))) {

					isheader = true;
					
					if (!tag.isEndTag()) { //start tag
						if (!tag.isEmpty()) {
							startTag = tag;
					
/* how do we tell a ThML preverse title from one that should be in the text?  probably if any text is before the title...  just assuming all are preverse for now
					}
					if (tag.getAttribute("subtype") && !stricmp(tag.getAttribute("subtype"), "x-preverse")) {
*/
						hide = true;
						preverse = true;
						header = "";
						continue;
						}	// move back up under startTag = tag
					}
/* this is where non-preverse will go eventually
					if (!tag.isEndTag()) { //start tag
						hide = true;
						header = "";
						if (option) {	// we want the tag in the text
							text.append('<');
							text.append(token);
							text.append('>');
						}
						continue;
					}
*/
				}
				else {
					isheader = false;
					SWBuf cls = tag.getAttribute("class");
					if (cls.startsWith("fromEntryAttributes ")) {
						cls <<  SWBuf("fromEntryAttributes ").size();
						tag.setAttribute("class", cls);
						token = tag;
						token << 1;
						token.setSize(token.size() - 1);
					}
				}
			}

			if (withinDiv && isheader) {
				header.append('<');
				header.append(token);
				header.append('>');
			} else {
				// if not a heading token, keep token in text
				if (!hide) {
					text.append('<');
					text.append(token);
					text.append('>');
				}
			}
			continue;
		}
		if (intoken) { //copy token
			token.append(*from);
		}
		else if (!hide) { //copy text which is not inside a token
			text.append(*from);
		}
		else header.append(*from);
	}
	return 0;
}


SWORD_NAMESPACE_END
