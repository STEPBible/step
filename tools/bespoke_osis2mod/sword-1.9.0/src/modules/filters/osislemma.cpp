/******************************************************************************
 *
 *  osislemma.cpp -	SWFilter descendant to hide or show lemmata
 *	       		in a OSIS module
 *
 * $Id: osislemma.cpp 3482 2017-06-25 14:36:23Z scribe $
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
#include <osislemma.h>
#include <utilxml.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Lemmas";
	static const char oTip[]  = "Toggles Lemmas On and Off if they exist";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"Off", "On", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}
}


OSISLemma::OSISLemma() : SWOptionFilter(oName, oTip, oValues()) {
}


OSISLemma::~OSISLemma() {
}


char OSISLemma::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	SWBuf token;
	bool intoken = false;

	const SWBuf orig = text;
	const char * from = orig.c_str();

	if (!option) {
		for (text = ""; *from; ++from) {
			if (*from == '<') {
				intoken = true;
				token = "";
				continue;
			}
			if (*from == '>') {	// process tokens
				intoken = false;
				if (token.startsWith("w ")) {	// Word
					XMLTag wtag(token);

					// always save off lemma if we haven't yet
					if (!wtag.getAttribute("savlm")) {
						const char *l = wtag.getAttribute("lemma");
						if (l) {
							wtag.setAttribute("savlm", l);
						}
					}

					int count = wtag.getAttributePartCount("lemma", ' ');
					for (int i = 0; i < count; i++) {
						SWBuf a = wtag.getAttribute("lemma", i, ' ');
						const char *prefix = a.stripPrefix(':');
						if ((!prefix) || ((SWBuf)prefix).startsWith("lemma.")) {
							// remove attribute part
							wtag.setAttribute("lemma", 0, i, ' ');
							i--;
							count--;
						}
					}

					token = wtag;
					token.trim();
					// drop <>
					token << 1;
					token--;
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
	}
	return 0;
}

SWORD_NAMESPACE_END
