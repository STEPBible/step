/******************************************************************************
 *
 *  thmlscripref.cpp -	SWFilter descendant to hide or show scripture
 *			referebces in a ThML module
 *
 * $Id: thmlscripref.cpp 3045 2014-03-02 07:53:52Z chrislit $
 *
 * Copyright 2001-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <thmlscripref.h>
#include <utilxml.h>
#include <versekey.h>
#include <swmodule.h>


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


ThMLScripref::ThMLScripref() : SWOptionFilter(oName, oTip, oValues()) {
}


ThMLScripref::~ThMLScripref() {
}


char ThMLScripref::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
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

	for (text = ""; *from; from++) {
		if (*from == '<') {
			intoken = true;
			token = "";
			continue;
		}
		if (*from == '>') {	// process tokens
			intoken = false;

			XMLTag tag(token);
			if (!strcmp(tag.getName(), "scripRef")) {
				if (!tag.isEndTag()) {
					if (!tag.isEmpty()) {
						refs = "";
						startTag = tag;
						hide = true;
						tagText = "";
						continue;
					}
				}
				if (hide && tag.isEndTag()) {
					if (module->isProcessEntryAttributes()) {
						SWBuf fc = module->getEntryAttributes()["Footnote"]["count"]["value"];
						footnoteNum = (fc.length()) ? atoi(fc.c_str()) : 0;
						sprintf(buf, "%i", ++footnoteNum);
						module->getEntryAttributes()["Footnote"]["count"]["value"] = buf;
						StringList attributes = startTag.getAttributeNames();
						for (StringList::iterator it = attributes.begin(); it != attributes.end(); it++) {
							module->getEntryAttributes()["Footnote"][buf][it->c_str()] = startTag.getAttribute(it->c_str());
						}
						module->getEntryAttributes()["Footnote"][buf]["body"] = tagText;
						startTag.setAttribute("swordFootnote", buf);
						SWBuf passage = startTag.getAttribute("passage");
						if (passage.length())
							refs = parser->parseVerseList(passage.c_str(), *parser, true).getRangeText();
						else	refs = parser->parseVerseList(tagText.c_str(), *parser, true).getRangeText();
						module->getEntryAttributes()["Footnote"][buf]["refList"] = refs.c_str();
					}
					hide = false;
					if (option) {	// we want the tag in the text
						text += startTag;
						text.append(tagText);
					}
					else	continue;
				}
			}

			// if not a scripRef token, keep token in text
			if ((!strcmp(tag.getName(), "scripRef")) && (!tag.isEndTag())) {
				SWBuf osisRef = tag.getAttribute("passage");
				if (refs.length())
					refs += "; ";
				refs += osisRef;
			}
			if (!hide) {
				text += '<';
				text.append(token);
				text += '>';
			}
			else {
				tagText += '<';
				tagText.append(token);
				tagText += '>';
			}
			continue;
		}
		if (intoken) { //copy token
			token += *from;
		}
		else if (!hide) { //copy text which is not inside a token
			text += *from;
		}
		else tagText += *from;
	}
        delete parser;
	return 0;
}

SWORD_NAMESPACE_END
