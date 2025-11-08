/******************************************************************************
 *
 *  gbfwordjs.cpp -	SWFilter descendant for ???
 *
 * $Id: gbfwordjs.cpp 3808 2020-10-02 13:23:34Z scribe $
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
#include <gbfwordjs.h>
#include <swmodule.h>
#include <ctype.h>
#include <utilstr.h>
#include <versekey.h>


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


GBFWordJS::GBFWordJS() : SWOptionFilter(oName, oTip, oValues()) {

     defaultGreekLex   = 0;
     defaultHebLex     = 0;
     defaultGreekParse = 0;
     defaultHebParse   = 0;
     mgr               = 0;
}


GBFWordJS::~GBFWordJS() {
}


char GBFWordJS::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if (option) {
		char token[2112]; // cheese.  Fix.
		int tokpos = 0;
		bool intoken = false;
		int word = 1;
		char val[128];
		char wordstr[5];
		unsigned int textStart = 0, lastAppendLen = 0, textEnd = 0;
		SWBuf tmp;
		bool newText = false;
		bool needWordOut = false;
		AttributeValue *wordAttrs = 0;
		SWBuf modName = (module)?module->getName():"";
		SWBuf wordSrcPrefix = modName;
		
		const SWBuf orig = text;
		const char * from = orig.c_str();
		const VerseKey *vkey = 0;
		if (key) {
			vkey = SWDYNAMIC_CAST(const VerseKey, key);
		}

		for (text = ""; *from; from++) {
			if (*from == '<') {
				intoken = true;
				tokpos = 0;
				token[0] = 0;
				token[1] = 0;
				token[2] = 0;
				textEnd = (unsigned int)text.length();
				continue;
			}
			if (*from == '>') {	// process tokens
				intoken = false;
				if (*token == 'W' && (token[1] == 'G' || token[1] == 'H')) {	// Strongs
					strcpy(val,token+1);
					if (atoi((!isdigit(*val))?val+1:val) < 5627) {
						// normal strongs number
						sprintf(wordstr, "%03d", word++);
						needWordOut = (word > 2);
						wordAttrs = &(module->getEntryAttributes()["Word"][wordstr]);
						(*wordAttrs)["Lemma"] = val;
	//printf("Adding: [\"Word\"][%s][\"Strongs\"] = %s\n", wordstr, val);
						tmp = "";
						tmp.append(text.c_str()+textStart, (int)(textEnd - textStart));
						(*wordAttrs)["Text"] = tmp;
						text.append("</span>");
						SWBuf ts;
						ts.appendFormatted("%d", textStart);
						(*wordAttrs)["TextStart"] = ts;
	//printf("Adding: [\"Word\"][%s][\"Text\"] = %s\n", wordstr, tmp.c_str());
						newText = true;
					}
					else {
						// verb morph
						if (wordAttrs) {
							(*wordAttrs)["Morph"] = val;
						}
	//printf("Adding: [\"Word\"][%s][\"Morph\"] = %s\n", wordstr, val);
					}

				}
				if (*token == 'W' && token[1] == 'T') {	// Morph
					if (token[2] == 'G' || token[2] == 'H') {
						strcpy(val, token+2);
					}
					else strcpy(val, token+1);
					if (wordAttrs) {
						(*wordAttrs)["Morph"] = val;
						(*wordAttrs)["MorphClass"] = "StrongsMorph";
					}
					newText = true;
				}
				// if not a strongs token, keep token in text
				text += '<';
				text += token;
				text += '>';
				if (needWordOut) {
					char wstr[11];
					sprintf(wstr, "%03d", word-2);
					AttributeValue *wAttrs = &(module->getEntryAttributes()["Word"][wstr]);
					needWordOut = false;
					SWBuf strong = (*wAttrs)["Lemma"];
					SWBuf morph = (*wAttrs)["Morph"];
					SWBuf morphClass = (*wAttrs)["MorphClass"];
					SWBuf wordText = (*wAttrs)["Text"];
					SWBuf textSt = (*wAttrs)["TextStart"];
					if (strong.size()) {
						char gh = 0;
						gh = isdigit(strong[0]) ? 0:strong[0];
						if (!gh) {
							if (vkey) {
								gh = vkey->getTestament() ? 'H' : 'G';
							}
						}
						else strong << 1;

						SWModule *sLex = 0;
						SWModule *sMorph = 0;
						if (gh == 'G') {
							sLex = defaultGreekLex;
							sMorph = defaultGreekParse;
						}
						if (gh == 'H') {
							sLex = defaultHebLex;
							sMorph = defaultHebParse;
						}
						SWBuf lexName = "";
						if (sLex) {
							// we can pass the real lex name in, but we have some
							// aliases in the javascript to optimize bandwidth
							lexName = sLex->getName();
							if (lexName == "StrongsGreek")
								lexName = "G";
							if (lexName == "StrongsHebrew")
								lexName = "H";
						}
						SWBuf wordID;
						if (vkey) {
							// optimize for bandwidth and use only the verse as the unique entry id
							wordID.appendFormatted("%d", vkey->getVerse());
						}
						else {
							wordID = key->getText();
						}
						for (unsigned int i = 0; i < wordID.size(); i++) {
							if ((!isdigit(wordID[i])) && (!isalpha(wordID[i]))) {
								wordID[i] = '_';
							}
						}
						wordID.appendFormatted("_%s%d", wordSrcPrefix.c_str(), atoi(wstr));
						if (textSt.size()) {
							int textStr = atoi(textSt.c_str());
							textStr += lastAppendLen;
							SWBuf spanStart = "";



							if (!sMorph) sMorph = 0;	// to pass unused warning for now
/*
							if (sMorph) {
								SWBuf popMorph = "<a onclick=\"";
								popMorph.appendFormatted("p(\'%s\',\'%s\','%s','');\" >%s</a>", sMorph->getName(), morph.c_str(), wordID.c_str(), morph.c_str());
								morph = popMorph;
							}
*/

							// 'p' = 'fillpop' to save bandwidth
							const char *m = strchr(morph.c_str(), ':');
							if (m) m++;
							else m = morph.c_str();
							spanStart.appendFormatted("<span class=\"clk\" onclick=\"p('%s','%s','%s','%s','','%s');\" >", lexName.c_str(), strong.c_str(), wordID.c_str(), m, modName.c_str());
							text.insert(textStr, spanStart);
							lastAppendLen = (unsigned int)spanStart.length();
						}
					}

				}
				if (newText) {
					textStart = (unsigned int)text.length(); newText = false;
				}
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
			}
		}

		char wstr[11];
		sprintf(wstr, "%03d", word-1);
		AttributeValue *wAttrs = &(module->getEntryAttributes()["Word"][wstr]);
		needWordOut = false;
		SWBuf strong = (*wAttrs)["Lemma"];
		SWBuf morph = (*wAttrs)["Morph"];
		SWBuf morphClass = (*wAttrs)["MorphClass"];
		SWBuf wordText = (*wAttrs)["Text"];
		SWBuf textSt = (*wAttrs)["TextStart"];
		if (strong.size()) {
			char gh = 0;
			gh = isdigit(strong[0]) ? 0:strong[0];
			if (!gh) {
				if (vkey) {
					gh = vkey->getTestament() ? 'H' : 'G';
				}
			}
			else strong << 1;

			SWModule *sLex = 0;
			if (gh == 'G') {
				sLex = defaultGreekLex;
			}
			if (gh == 'H') {
				sLex = defaultHebLex;
			}
			SWBuf lexName = "";
			if (sLex) {
				// we can pass the real lex name in, but we have some
				// aliases in the javascript to optimize bandwidth
				lexName = sLex->getName();
				if (lexName == "StrongsGreek")
					lexName = "G";
				if (lexName == "StrongsHebrew")
					lexName = "H";
			}
			SWBuf wordID;
			if (vkey) {
				// optimize for bandwidth and use only the verse as the unique entry id
				wordID.appendFormatted("%d", vkey->getVerse());
			}
			else {
				wordID = key->getText();
			}
			for (unsigned int i = 0; i < wordID.size(); i++) {
				if ((!isdigit(wordID[i])) && (!isalpha(wordID[i]))) {
					wordID[i] = '_';
				}
			}
			wordID.appendFormatted("_%s%d", wordSrcPrefix.c_str(), atoi(wstr));
			if (textSt.size()) {
				int textStr = atoi(textSt.c_str());
				textStr += lastAppendLen;
				SWBuf spanStart = "";
				// 'p' = 'fillpop' to save bandwidth
				const char *m = strchr(morph.c_str(), ':');
				if (m) m++;
				else m = morph.c_str();
				spanStart.appendFormatted("<span class=\"clk\" onclick=\"p('%s','%s','%s','%s','','%s');\" >", lexName.c_str(), strong.c_str(), wordID.c_str(), m, modName.c_str());
				text.insert(textStr, spanStart);
			}
		}
	}

	return 0;
}

SWORD_NAMESPACE_END
