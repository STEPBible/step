/******************************************************************************
 *
 *  gbffootnotes.cpp -	SWFilter descendant to hide or show footnotes
 *			in a GBF module
 *
 * $Id: gbffootnotes.cpp 2980 2013-09-14 21:51:47Z scribe $
 *
 * Copyright 1999-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <gbffootnotes.h>
#include <swmodule.h>
#include <swbuf.h>
#include <versekey.h>
#include <utilxml.h>


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


GBFFootnotes::GBFFootnotes() : SWOptionFilter(oName, oTip, oValues()) {
}


GBFFootnotes::~GBFFootnotes() {
}


char GBFFootnotes::processText (SWBuf &text, const SWKey *key, const SWModule *module)
{

	SWBuf token;
	bool intoken    = false;
	bool hide       = false;
	SWBuf tagText;
	XMLTag startTag;
	SWBuf refs = "";
	int footnoteNum = 1;
	char buf[254];

	SWBuf orig = text;
	const char *from = orig.c_str();

	//XMLTag tag;

	for (text = ""; *from; from++) {
		if (*from == '<') {
			intoken = true;
			token = "";
			continue;
		}
		if (*from == '>') {	// process tokens
			intoken = false;

			//XMLTag tag(token);
			if (!strncmp(token, "RF",2)) {
// 				tag = token;

				refs = "";
				startTag = token;
				hide = true;
				tagText = "";
				continue;
			}
			else if (!strncmp(token, "Rf",2)) {
				if (module->isProcessEntryAttributes()) {
					//tag = token;

					if((tagText.length() == 1) || !strcmp(module->getName(), "IGNT")) {
						if (option) { // for ASV marks text in verse then put explanation at end of verse
							text.append(" <FS>[");
							text.append(tagText);
							text.append("]<Fs>");
							hide = false;
							continue;
						}
					}
					SWBuf fc = module->getEntryAttributes()["Footnote"]["count"]["value"];
					footnoteNum = (fc.length()) ? atoi(fc.c_str()) : 0;
					sprintf(buf, "%i", ++footnoteNum);
					module->getEntryAttributes()["Footnote"]["count"]["value"] = buf;
					StringList attributes = startTag.getAttributeNames();
					for (StringList::const_iterator it = attributes.begin(); it != attributes.end(); it++) {
						module->getEntryAttributes()["Footnote"][buf][it->c_str()] = startTag.getAttribute(it->c_str());
					}
					module->getEntryAttributes()["Footnote"][buf]["body"] = tagText;
					startTag.setAttribute("swordFootnote", buf);
				}
				hide = false;
				if (option) {
					text.append(startTag);
					text.append(tagText);
				}
				else	continue;
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
	return 0;

	/*
	if (!option) {	// if we don't want footnotes
		char token[4096]; // cheese.  Fix.
		int tokpos = 0;
		bool intoken = false;
		int len;
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
				switch (*token) {
				case 'R':				// Reference
					switch(token[1]) {
					case 'F':               // Begin footnote
						hide = true;
						break;
					case 'f':               // end footnote
						hide = false;
						break;
					}
					continue;	// skip token
				case 'W':
					if (token[1] == 'T') {
						switch (token[2]) {
						case 'P':
						case 'S':
						case 'A':
							continue; // remove this token
						default:
							break;
						}
					}
				}
				// if not a footnote token, keep token in text
				if (!hide) {
					text += '<';
					text += token;
					text += '>';
				}
				continue;
			}
			if (intoken) {
				if (tokpos < 4090)
					token[tokpos++] = *from;
					token[tokpos+2] = 0;	// +2 cuz we init token with 2 extra '0' because of switch statement
			}
			else	{
				if (!hide) {
					text += *from;
				}
			}
		}
	}
	return 0;*/
}

SWORD_NAMESPACE_END
