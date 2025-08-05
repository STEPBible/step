/******************************************************************************
 *
 *  osiswordjs.cpp -	SWFilter descendant for ???
 *
 * $Id: osiswordjs.cpp 3808 2020-10-02 13:23:34Z scribe $
 *
 * Copyright 2005-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <osiswordjs.h>
#include <swmodule.h>
#include <ctype.h>
#include <utilxml.h>
#include <utilstr.h>
#include <versekey.h>
#include <stdio.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Word Javascript";
	static const char oTip[]  = "Toggles Word Javascript data";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


OSISWordJS::OSISWordJS() : SWOptionFilter(oName, oTip, oValues()) {

     defaultGreekLex   = 0;
     defaultHebLex     = 0;
     defaultGreekParse = 0;
     defaultHebParse   = 0;
     mgr               = 0;
}


OSISWordJS::~OSISWordJS() {
}


char OSISWordJS::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if (option) {
		char token[2112]; // cheese.  Fix.
		int tokpos = 0;
		bool intoken = false;
		int wordNum = 1;
		char wordstr[11];
		SWBuf modName = (module)?module->getName():"";
		// add TR to w src in KJV then remove this next line
		SWBuf wordSrcPrefix = (modName == "KJV")?SWBuf("TR"):modName;

		const VerseKey *vkey = 0;
		if (key) {
			vkey = SWDYNAMIC_CAST(const VerseKey, key);
		}
		
		const SWBuf orig = text;
		const char * from = orig.c_str();

		for (text = ""; *from; ++from) {
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
				if ((*token == 'w') && (token[1] == ' ')) {	// Word
					XMLTag wtag(token);
					sprintf(wordstr, "%03d", wordNum);
					SWBuf lemmaClass;
					SWBuf lemma;
					SWBuf morph;
					SWBuf page;
					SWBuf src;
					char gh = 0;
					page = module->getEntryAttributes()["Word"][wordstr]["Page"].c_str();
					if (page.length()) page = (SWBuf)"p:" + page;
					int count = atoi(module->getEntryAttributes()["Word"][wordstr]["PartCount"].c_str());
					for (int i = 0; i < count; i++) {

						// for now, lemma class can just be equal to last lemma class in multi part word
						SWBuf tmp = "LemmaClass";
						if (count > 1) tmp.appendFormatted(".%d", i+1);
						lemmaClass = module->getEntryAttributes()["Word"][wordstr][tmp];

						tmp = "Lemma";
						if (count > 1) tmp.appendFormatted(".%d", i+1);
						tmp = (module->getEntryAttributes()["Word"][wordstr][tmp].c_str());

						// if we're strongs, 
						if (lemmaClass == "strong") {
							gh = tmp[0];
							tmp << 1;
						}
						if (lemma.size()) lemma += "|";
						lemma += tmp;

						tmp = "Morph";
						if (count > 1) tmp.appendFormatted(".%d", i+1);
						tmp = (module->getEntryAttributes()["Word"][wordstr][tmp].c_str());
						if (morph.size()) morph += "|";
						morph += tmp;

						tmp = "Src";
						if (count > 1) tmp.appendFormatted(".%d", i+1);
						tmp = (module->getEntryAttributes()["Word"][wordstr][tmp].c_str());
						if (!tmp.length()) tmp.appendFormatted("%d", wordNum);
						tmp.insert(0, wordSrcPrefix);
						if (src.size()) src += "|";
						src += tmp;
					}

					SWBuf lexName = "";
					// we can pass the real lex name in, but we have some
					// aliases in the javascript to optimize bandwidth
					if ((gh == 'G') && (defaultGreekLex)) {
						lexName = (!strcmp(defaultGreekLex->getName(), "StrongsGreek"))?"G":defaultGreekLex->getName();
					}
					else if ((gh == 'H') && (defaultHebLex)) {
						lexName = (!strcmp(defaultHebLex->getName(), "StrongsHebrew"))?"H":defaultHebLex->getName();
					}

					SWBuf xlit = wtag.getAttribute("xlit");

					if ((lemmaClass != "strong") && (xlit.startsWith("betacode:"))) {
						lexName = "betacode";
//						const char *m = strchr(xlit.c_str(), ':');
//						strong = ++m;
					}
					SWBuf wordID;
					if (vkey) {
						// optimize for bandwidth and use only the verse as the unique entry id
						wordID.appendFormatted("%d", vkey->getVerse());
					}
					else {
						wordID = key->getText();
					}
					wordID.appendFormatted("_%s", src.c_str());
					// clean up our word ID for XHTML
					for (unsigned int i = 0; i < wordID.size(); i++) {
						if ((!isdigit(wordID[i])) && (!isalpha(wordID[i]))) {
							wordID[i] = '_';
						}
					}
					// 'p' = 'fillpop' to save bandwidth
					text.appendFormatted("<span class=\"clk\" onclick=\"p('%s','%s','%s','%s','%s','%s');\" >", lexName.c_str(), lemma.c_str(), wordID.c_str(), morph.c_str(), page.c_str(), modName.c_str());
					wordNum++;

					if (wtag.isEmpty()) {
						text += "</w></span>";
					}
				}
				if ((*token == '/') && (token[1] == 'w') && option) {	// Word
					text += "</w></span>";
					continue;
				}
				
				// if not a strongs token, keep token in text
				text.append('<');
				text.append(token);
				text.append('>');
				
				continue;
			}
			if (intoken) {
				if (tokpos < 2045) {
					token[tokpos++] = *from;
					token[tokpos+2] = 0;
				}
			}
			else	{
				text.append(*from);
			}
		}
	}
	return 0;
}

SWORD_NAMESPACE_END
