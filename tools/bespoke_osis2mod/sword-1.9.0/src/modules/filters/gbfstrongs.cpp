/******************************************************************************
 *
 *  gbfstrongs.cpp -	SWFilter descendant to hide or show Strong's number
 *			in a GBF module
 *
 * $Id: gbfstrongs.cpp 3511 2017-11-01 11:18:50Z scribe $
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
#include <gbfstrongs.h>
#include <swmodule.h>
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


GBFStrongs::GBFStrongs() : SWOptionFilter(oName, oTip, oValues()) {
}


GBFStrongs::~GBFStrongs() {
}


char GBFStrongs::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	char token[2048]; // cheese.  Fix.
	int tokpos = 0;
	bool intoken = false;
	bool lastspace = false;
	int word = 1;
	char val[128];
	char wordstr[11];
	char *valto;
	unsigned int textStart = 0, textEnd = 0;
	bool newText = false;
	SWBuf tmp;
	const char *from;

	SWBuf orig = text;
	from = orig.c_str();

	for (text = ""; *from; from++) {
		if (*from == '<') {
			intoken = true;
			tokpos = 0;
			token[0] = 0;
			token[1] = 0;
			token[2] = 0;
			textEnd = (unsigned int)text.size();
			continue;
		}
		if (*from == '>') {	// process tokens
			intoken = false;
			if (*token == 'W' && (token[1] == 'G' || token[1] == 'H')) {	// Strongs
				if (module->isProcessEntryAttributes()) {
					valto = val;
					for (unsigned int i = 1; ((token[i]) && (i < 150)); i++)
						*valto++ = token[i];
					*valto = 0;
					if (atoi((!isdigit(*val))?val+1:val) < 5627) {
						// normal strongs number
						sprintf(wordstr, "%03d", word++);
						module->getEntryAttributes()["Word"][wordstr]["PartsCount"] = "1";
						module->getEntryAttributes()["Word"][wordstr]["Lemma"] = val;
						module->getEntryAttributes()["Word"][wordstr]["LemmaClass"] = "strong";
						tmp = "";
						tmp.append(text.c_str()+textStart, (int)(textEnd - textStart));
						module->getEntryAttributes()["Word"][wordstr]["Text"] = tmp;
						newText = true;
					}
					else {
						// verb morph
						sprintf(wordstr, "%03d", word-1);
						module->getEntryAttributes()["Word"][wordstr]["Morph"] = val;
						module->getEntryAttributes()["Word"][wordstr]["MorphClass"] = "OLBMorph";
					}
				}

				if (!option) {
					if ((from[1] == ' ') || (from[1] == ',') || (from[1] == ';') || (from[1] == '.') || (from[1] == '?') || (from[1] == '!') || (from[1] == ')') || (from[1] == '\'') || (from[1] == '\"')) {
						if (lastspace)
							text--;
					}
					if (newText) {textStart = (unsigned int)text.size(); newText = false; }
					continue;
				}
			}
			if (module->isProcessEntryAttributes()) {
				if ((*token == 'W') && (token[1] == 'T')) {	// Morph
					valto = val;
					for (unsigned int i = 2; ((token[i]) && (i < 150)); i++)
						*valto++ = token[i];
					*valto = 0;
					sprintf(wordstr, "%03d", word-1);
					module->getEntryAttributes()["Word"][wordstr]["MorphClass"] = "GBFMorph";
					module->getEntryAttributes()["Word"][wordstr]["Morph"] = val;
					newText = true;
				}
			}
			// if not a strongs token, keep token in text
			text += '<';
			text += token;
			text += '>';
			if (newText) {textStart = (unsigned int)text.size(); newText = false; }
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
