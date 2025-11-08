/******************************************************************************
 *
 *  greeklexattribs.cpp -	SWFilter descendant to set entry attributes
 *				for greek lexicons
 *
 * $Id: greeklexattribs.cpp 3511 2017-11-01 11:18:50Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <string>
#include <greeklexattribs.h>
#include <swmodule.h>

using std::string;

SWORD_NAMESPACE_START

GreekLexAttribs::GreekLexAttribs() {
}


char GreekLexAttribs::processText(SWBuf &text, const SWKey *key, const SWModule *module) {

	if (module->isProcessEntryAttributes()) {
		const char *from;
		bool inAV = false;
		string phrase;
		string freq;
		char val[128], *valto;
		char wordstr[11];
		const char *currentPhrase = 0;
		const char *currentPhraseEnd = 0;
		int number = 0;


		for (from = text.c_str(); *from; from++) {
			if (inAV) {
				if (currentPhrase == 0) {
					if (isalpha(*from))
						currentPhrase = from;
				}
				else {
					if ((!isalpha(*from)) && (*from != ' ') && (*from != '+') && (*from !='(') && (*from != ')') && (*from != '\'')) {
						if (*from == '<') {
							if (!currentPhraseEnd)
								currentPhraseEnd = from - 1;
							for (; *from && *from != '>'; from++) {
								if (!strncmp(from, "value=\"", 7)) {
									valto = val;
									from += 7;
									for (unsigned int i = 0; from[i] != '\"' && i < 127; i++)
										*valto++ = from[i];
									*valto = 0;
									sprintf(wordstr, "%03d", number+1);
									module->getEntryAttributes()["AVPhrase"][wordstr]["CompoundedWith"] = val;
									from += strlen(val);
								}
							}
							continue;
						}

						phrase = "";
						phrase.append(currentPhrase, (int)(((currentPhraseEnd>currentPhrase)?currentPhraseEnd:from) - currentPhrase)-1);
						currentPhrase = from;
						while (*from && isdigit(*from)) from++;
						freq = "";
						freq.append(currentPhrase, (int)(from - currentPhrase));
						if ((freq.length() > 0) && (phrase.length() > 0)) {
							sprintf(wordstr, "%03d", ++number);
							if ((strchr(phrase.c_str(), '(') > phrase.c_str()) && (strchr(phrase.c_str(), ')') > phrase.c_str() + 1)) {
								string tmp = phrase.substr(0, phrase.find_first_of("("));
								phrase.erase(phrase.find_first_of("("), 1);
								phrase.erase(phrase.find_first_of(")"), 1);
								phrase.erase(0,phrase.find_first_not_of("\r\n\v\t ")); phrase.erase(phrase.find_last_not_of("\r\n\v\t ")+1);
								module->getEntryAttributes()["AVPhrase"][wordstr]["Alt"] = phrase.c_str();
								phrase = tmp;
							}
							phrase.erase(0,phrase.find_first_not_of("\r\n\v\t ")); phrase.erase(phrase.find_last_not_of("\r\n\v\t ")+1);
							freq.erase(0,freq.find_first_not_of("\r\n\v\t ")); freq.erase(freq.find_last_not_of("\r\n\v\t ")+1);
							module->getEntryAttributes()["AVPhrase"][wordstr]["Phrase"] = phrase.c_str();
							module->getEntryAttributes()["AVPhrase"][wordstr]["Frequency"] = freq.c_str();
							currentPhrase = 0;
							currentPhraseEnd = 0;
						}
					}
				}
				if (*from == ';') inAV = false;

			}
			else if (!strncmp(from, "AV-", 3)) {
				inAV = true;
				from+=2;
			}
		}
	}
	return 0;
}


SWORD_NAMESPACE_END
