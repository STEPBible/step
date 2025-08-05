/******************************************************************************
 *
 *  osisfootnotes.cpp -	SWFilter descendant to hide or show footnotes
 *			in an OSIS module
 *
 * $Id: osisfootnotes.cpp 2980 2013-09-14 21:51:47Z scribe $
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
#include <stdio.h>
#include <osisfootnotes.h>
#include <swmodule.h>
#include <swbuf.h>
#include <versekey.h>
#include <utilxml.h>
#include <utilstr.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Footnotes";
	static const char oTip[]  = "Toggles Footnotes On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


OSISFootnotes::OSISFootnotes() : SWOptionFilter(oName, oTip, oValues()) {
}


OSISFootnotes::~OSISFootnotes() {
}


char OSISFootnotes::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	SWBuf token;
	bool intoken    = false;
	bool hide       = false;
	SWBuf tagText;
	XMLTag startTag;
	SWBuf refs = "";
	int footnoteNum = 1;
	char buf[254];
	SWKey *p = (module) ? module->createKey() : (key) ? key->clone() : new VerseKey();
        VerseKey *parser = SWDYNAMIC_CAST(VerseKey, p);
        if (!parser) {
        	delete p;
                parser = new VerseKey();
        }
        *parser = key->getText();

	SWBuf orig = text;
	const char *from = orig.c_str();

	XMLTag tag;
	bool strongsMarkup = false;


	for (text = ""; *from; ++from) {

		// remove all newlines temporarily to fix kjv2003 module
		if ((*from == 10) || (*from == 13)) {
			if ((text.length()>1) && (text[text.length()-2] != ' ') && (*(from+1) != ' '))
				text.append(' ');
			continue;
		}


		if (*from == '<') {
			intoken = true;
			token = "";
			continue;
		}



		if (*from == '>') {	// process tokens
			intoken = false;
			if (!strncmp(token, "note", 4) || !strncmp(token.c_str(), "/note", 5)) {
				tag = token;

				if (!tag.isEndTag()) {
					if (tag.getAttribute("type") && (!strcmp("x-strongsMarkup", tag.getAttribute("type"))
											|| !strcmp("strongsMarkup", tag.getAttribute("type")))	// deprecated
							) {
						tag.setEmpty(false);  // handle bug in KJV2003 module where some note open tags were <note ... />
						strongsMarkup = true;
					}

					if (!tag.isEmpty()) {
//					if ((!tag.isEmpty()) || (SWBuf("strongsMarkup") == tag.getAttribute("type"))) {
						refs = "";
						startTag = tag;
						hide = true;
						tagText = "";
						continue;
					}
				}
				if (hide && tag.isEndTag()) {
					if (module->isProcessEntryAttributes() && !strongsMarkup) { //don`t parse strongsMarkup to EntryAttributes as Footnote
						sprintf(buf, "%i", footnoteNum++);
						StringList attributes = startTag.getAttributeNames();
						for (StringList::const_iterator it = attributes.begin(); it != attributes.end(); it++) {
							module->getEntryAttributes()["Footnote"][buf][it->c_str()] = startTag.getAttribute(it->c_str());
						}
						module->getEntryAttributes()["Footnote"][buf]["body"] = tagText;
						startTag.setAttribute("swordFootnote", buf);
						if ((startTag.getAttribute("type")) && (!strcmp(startTag.getAttribute("type"), "crossReference"))) {
							if (!refs.length())
								refs = parser->parseVerseList(tagText.c_str(), *parser, true).getRangeText();
							module->getEntryAttributes()["Footnote"][buf]["refList"] = refs.c_str();
						}
					}
					hide = false;
					if (option || (startTag.getAttribute("type") && !strcmp(startTag.getAttribute("type"), "crossReference"))) {	// we want the tag in the text; crossReferences are handled by another filter
						text.append(startTag);
//						text.append(tagText);	// we don't put the body back in because it is retrievable from EntryAttributes["Footnotes"][]["body"].
					}
					else	continue;
				}
				strongsMarkup = false;
			}

			// if not a heading token, keep token in text
			//if ((!strcmp(tag.getName(), "reference")) && (!tag.isEndTag())) {
			//	SWBuf osisRef = tag.getAttribute("osisRef");
			if (!strncmp(token, "reference", 9)) {
				if (refs.length()) {
					refs.append("; ");
				}

				const char* attr = strstr(token.c_str() + 9, "osisRef=\"");
				const char* end  = attr ? strchr(attr+9, '"') : 0;

				if (attr && end) {
					refs.append(attr+9, end-(attr+9));
				}
			}
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
        delete parser;
	return 0;
}

SWORD_NAMESPACE_END

