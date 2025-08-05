/******************************************************************************
 *
 *  thmlstrongs.cpp -	SWFilter descendant to hide or show Strong's number
 *			in a ThML module
 *
 * $Id: thmlstrongs.cpp 3790 2020-09-11 15:26:02Z scribe $
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
#include <thmlstrongs.h>
#include <swmodule.h>
#include <utilstr.h>
#include <ctype.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Strong's Numbers";
	static const char oTip[]  = "Toggles Strong's Numbers On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


ThMLStrongs::ThMLStrongs() : SWOptionFilter(oName, oTip, oValues()) {
}


ThMLStrongs::~ThMLStrongs() {
}


char ThMLStrongs::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	char token[2048]; // cheese.  Fix.
	const char *from;
	int tokpos = 0;
	bool intoken = false;
	bool lastspace = false;
	int word = 1;
	char val[128];
	char wordstr[11];
	char *valto;
	char *ch;
	unsigned int textStart = 0, textEnd = 0;
	SWBuf tmp;
	bool newText = false;

	SWBuf orig = text;
	from = orig.c_str();

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
			if (!strnicmp(token, "sync type=\"Strongs\" ", 20)) {	// Strongs
				if (module->isProcessEntryAttributes()) {
					valto = val;
					for (unsigned int i = 27; token[i] != '\"' && i < 150; i++)
						*valto++ = token[i];
					*valto = 0;
					if (atoi((!isdigit(*val))?val+1:val) < 5627) {
						// normal strongs number
						sprintf(wordstr, "%03d", word);
						module->getEntryAttributes()["Word"][wordstr]["PartCount"] = "1";
						module->getEntryAttributes()["Word"][wordstr]["Lemma"] = val;
						module->getEntryAttributes()["Word"][wordstr]["LemmaClass"] = "strong";
						module->getEntryAttributes()["Word"][wordstr]["Lemma.1"] = val;
						module->getEntryAttributes()["Word"][wordstr]["LemmaClass.1"] = "strong";
						tmp = "";
						tmp.append(text.c_str()+textStart, (int)(textEnd - textStart));
						module->getEntryAttributes()["Word"][wordstr]["Text"] = tmp;
						newText = true;
					}
					else {
/*
						// verb morph
						sprintf(wordstr, "%03d", word);
						module->getEntryAttributes()["Word"][wordstr]["Morph"] = val;
						module->getEntryAttributes()["Word"][wordstr]["MorphClass"] = "OLBMorph";
						module->getEntryAttributes()["Word"][wordstr]["Morph.1"] = val;
						module->getEntryAttributes()["Word"][wordstr]["MorphClass.1"] = "OLBMorph";
*/
						word--;	// for now, completely ignore this word attribute.
					}
					word++;
				}

				if (!option) {	// if we don't want strongs
					if ((from[1] == ' ') || (from[1] == ',') || (from[1] == ';') || (from[1] == '.') || (from[1] == '?') || (from[1] == '!') || (from[1] == ')') || (from[1] == '\'') || (from[1] == '\"')) {
						if (lastspace)
							text--;
					}
					if (newText) {textStart = (unsigned int)text.length(); newText = false; }
					continue;
				}
			}
			if (module->isProcessEntryAttributes()) {
				if (!strncmp(token, "sync type=\"morph\"", 17)) {
					for (ch = token+17; *ch; ch++) {
						if (!strncmp(ch, "class=\"", 7)) {
							valto = val;
							for (unsigned int i = 7; ch[i] != '\"' && i < 127; i++)
								*valto++ = ch[i];
							*valto = 0;
							sprintf(wordstr, "%03d", word-1);
							if ((!stricmp(val, "Robinsons")) || (!stricmp(val, "Robinson"))) {
								strcpy(val, "robinson");
							}
							module->getEntryAttributes()["Word"][wordstr]["MorphClass"] = val;
							module->getEntryAttributes()["Word"][wordstr]["MorphClass.1"] = val;
						}
						if (!strncmp(ch, "value=\"", 7)) {
							valto = val;
							for (unsigned int i = 7; ch[i] != '\"' && i < 127; i++)
								*valto++ = ch[i];
							*valto = 0;
							sprintf(wordstr, "%03d", word-1);
							module->getEntryAttributes()["Word"][wordstr]["Morph"] = val;
							module->getEntryAttributes()["Word"][wordstr]["Morph.1"] = val;
						}
					}
					newText = true;
				}
			}
			// if not a strongs token, keep token in text
			text += '<';
			text += token;
			text += '>';
			if (newText) {textStart = (unsigned int)text.length(); newText = false; }
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
			lastspace = (*from == ' ');
		}
	}
	return 0;
}

SWORD_NAMESPACE_END
