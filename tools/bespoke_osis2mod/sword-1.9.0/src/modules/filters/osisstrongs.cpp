/******************************************************************************
 *
 *  osisstrongs.cpp -	SWFilter descendant to hide or show Strong's number
 *			in a OSIS module
 *
 * $Id: osisstrongs.cpp 3808 2020-10-02 13:23:34Z scribe $
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
#include <ctype.h>
#include <osisstrongs.h>
#include <swmodule.h>
#include <versekey.h>
#include <utilxml.h>


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


OSISStrongs::OSISStrongs() : SWOptionFilter(oName, oTip, oValues()) {
}


OSISStrongs::~OSISStrongs() {
}


char OSISStrongs::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	SWBuf token;
	bool intoken = false;
	int wordNum = 1;
	char wordstr[11];
	const char *wordStart = 0;
	SWBuf page = "";		// some modules include <seg> page info, so we add these to the words

	const SWBuf orig = text;
	const char * from = orig.c_str();

	for (text = ""; *from; ++from) {
		if (*from == '<') {
			intoken = true;
			token = "";
			continue;
		}
		if (*from == '>') {	// process tokens
			intoken = false;

			// possible page seg --------------------------------
			if (token.startsWith("seg ")) {
				XMLTag stag(token);
				SWBuf type = stag.getAttribute("type");
				if (type == "page") {
					SWBuf number = stag.getAttribute("subtype");
					if (number.length()) {
						page = number;
					}
				}
			}
			// ---------------------------------------------------

			if (token.startsWith("w ")) {	// Word
				XMLTag wtag(token);

				// always save off lemma if we haven't yet
				if (!wtag.getAttribute("savlm")) {
					const char *l = wtag.getAttribute("lemma");
					if (l) {
						wtag.setAttribute("savlm", l);
					}
				}

				if (module->isProcessEntryAttributes()) {
					wordStart = from+1;
					char gh = 0;
					const VerseKey *vkey = 0;
					if (key) {
						vkey = SWDYNAMIC_CAST(const VerseKey, key);
					}
					SWBuf lemma      = "";
					SWBuf morph      = "";
					SWBuf src        = "";
					SWBuf morphClass = "";
					SWBuf lemmaClass = "";

					const char *attrib;
					sprintf(wordstr, "%03d", wordNum);

					// why is morph entry attribute processing done in here?  Well, it's faster.  It makes more local sense to place this code in osismorph.
					// easier to keep lemma and morph in same wordstr number too maybe.
					if ((attrib = wtag.getAttribute("morph"))) {
						int count = wtag.getAttributePartCount("morph", ' ');
						int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
						do {
							SWBuf mClass = "";
							SWBuf mp = "";
							attrib = wtag.getAttribute("morph", i, ' ');
							if (i < 0) i = 0;	// to handle our -1 condition

							const char *m = strchr(attrib, ':');
							if (m) {
								int len = (int)(m-attrib);
								mClass.append(attrib, len);
								attrib += (len+1);
							}
							if ((mClass == "x-Robinsons") || (mClass == "x-Robinson") || (mClass == "Robinson")) {
								mClass = "robinson";
							}
							if (i) { morphClass += " "; morph += " "; }
							mp += attrib;
							morphClass += mClass;
							morph += mp;
							mp.replaceBytes("+", ' ');
							SWBuf tmp;
							tmp.setFormatted("Morph.%d", i+1);
							module->getEntryAttributes()["Word"][wordstr][tmp] = mp;
							tmp.setFormatted("MorphClass.%d", i+1);
							module->getEntryAttributes()["Word"][wordstr][tmp] = mClass;
						} while (++i < count);
					}

					if ((attrib = wtag.getAttribute("savlm"))) {
						int count = wtag.getAttributePartCount("savlm", ' ');
						int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
						do {
							gh = 0;
							SWBuf lClass = "";
							SWBuf l = "";
							attrib = wtag.getAttribute("savlm", i, ' ');
							if (i < 0) i = 0;	// to handle our -1 condition

							const char *m = strchr(attrib, ':');
							if (m) {
								int len = (int)(m-attrib);
								lClass.append(attrib, len);
								attrib += (len+1);
							}
							if ((lClass == "x-Strongs") || (lClass == "strong") || (lClass == "Strong")) {
								if (isdigit(attrib[0])) {
									if (vkey) {
										gh = vkey->getTestament() ? 'H' : 'G';
									}
								}
								else {
									gh = *attrib;
									attrib++;
								}
								lClass = "strong";
							}
							if (gh) l += gh;
							l += attrib;
							if (i) { lemmaClass += " "; lemma += " "; }
							lemma += l;
							l.replaceBytes("+", ' ');
							lemmaClass += lClass;
							SWBuf tmp;
							tmp.setFormatted("Lemma.%d", i+1);
							module->getEntryAttributes()["Word"][wordstr][tmp] = l;
							tmp.setFormatted("LemmaClass.%d", i+1);
							module->getEntryAttributes()["Word"][wordstr][tmp] = lClass;
						} while (++i < count);
						module->getEntryAttributes()["Word"][wordstr]["PartCount"].setFormatted("%d", count);
					}

					if ((attrib = wtag.getAttribute("src"))) {
						int count = wtag.getAttributePartCount("src", ' ');
						int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
						do {
							SWBuf mp = "";
							attrib = wtag.getAttribute("src", i, ' ');
							if (i < 0) i = 0;	// to handle our -1 condition

							if (i) src += " ";
							mp += attrib;
							src += mp;
							mp.replaceBytes("+", ' ');
							SWBuf tmp;
							tmp.setFormatted("Src.%d", i+1);
							module->getEntryAttributes()["Word"][wordstr][tmp] = mp;
						} while (++i < count);
					}


					if (lemma.length())
						module->getEntryAttributes()["Word"][wordstr]["Lemma"] = lemma;
					if (lemmaClass.length())
						module->getEntryAttributes()["Word"][wordstr]["LemmaClass"] = lemmaClass;
					if (morph.length())
						module->getEntryAttributes()["Word"][wordstr]["Morph"] = morph;
					if (morphClass.length())
						module->getEntryAttributes()["Word"][wordstr]["MorphClass"] = morphClass;
					if (src.length())
						module->getEntryAttributes()["Word"][wordstr]["Src"] = src;
					if (page.length())
						module->getEntryAttributes()["Word"][wordstr]["Page"] = page;

					if (wtag.isEmpty()) {
						int j;
						for (j = (int)token.length()-1; ((j>0) && (strchr(" /", token[j]))); j--);
						token.size(j+1);
					}
					
					token += " wn=\"";
					token += wordstr;
					token += "\"";

					if (wtag.isEmpty()) {
						token += "/";
					}

					wordNum++;
				}

				// if we won't want strongs, then lets get them out of lemma
				if (!option) {
					int count = wtag.getAttributePartCount("lemma", ' ');
					for (int i = 0; i < count; ++i) {
						SWBuf a = wtag.getAttribute("lemma", i, ' ');
						const char *prefix = a.stripPrefix(':');
						if ((prefix) && (!strcmp(prefix, "x-Strongs") || !strcmp(prefix, "strong") || !strcmp(prefix, "Strong"))) {
							// remove attribute part
							wtag.setAttribute("lemma", 0, i, ' ');
							--i;
							--count;
						}
					}


				}
				token = wtag;
				token.trim();
				// drop <>
				token << 1;
				token--;
			}
			if (token.startsWith("/w")) {	// Word End
				if (module->isProcessEntryAttributes()) {
					if (wordStart) {
						SWBuf tmp;
						tmp.append(wordStart, (from-wordStart)-3);
						sprintf(wordstr, "%03d", wordNum-1);
						module->getEntryAttributes()["Word"][wordstr]["Text"] = tmp;
					}
				}
				wordStart = 0;
			}
			
			// keep token in text
			text.append('<');
			text.append(token);
			text.append('>');
			
			continue;
		}
		if (intoken) {
			token += *from;
		}
		else	{
			text.append(*from);
		}
	}
	return 0;
}

SWORD_NAMESPACE_END
