/******************************************************************************
 *
 *  gbfosis.cpp -	GBF to OSIS filter
 *
 * $Id: gbfosis.cpp 3808 2020-10-02 13:23:34Z scribe $
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
#include <stdarg.h>
#include <gbfosis.h>
#include <swmodule.h>
#include <versekey.h>
#include <swlog.h>
#include <stdarg.h>


SWORD_NAMESPACE_START


GBFOSIS::GBFOSIS() {
}


GBFOSIS::~GBFOSIS() {
}


char GBFOSIS::processText(SWBuf &text, const SWKey *key, const SWModule *module) { 
	char token[2048]; //cheesy, we seem to like cheese :)
	int tokpos = 0;
	bool intoken = false;
	bool keepToken = false;
	
//	static QuoteStack quoteStack;

	SWBuf orig = text;
	SWBuf tmp;
	SWBuf value;
	
	bool suspendTextPassThru = false;
	bool handled = false;
	bool newWord = false;
	bool newText = false;
	bool lastspace = false;
	
	const char *wordStart = text.c_str();
	const char *wordEnd = NULL;
	
	const char *textStart = NULL;
	const char *textEnd = NULL;
	
	SWBuf textNode = "";

	SWBuf buf;
		
	text = "";
	for (const char* from = orig.c_str(); *from; ++from) {
		if (*from == '<') { //start of new token detected
			intoken = true;
			tokpos = 0;
			token[0] = 0;
			token[1] = 0;
			token[2] = 0;
			textEnd = from-1; //end of last text node found
			wordEnd = text.c_str() + text.length();//not good, instead of wordEnd = to!
			
			continue;
		}
		
		if (*from == '>') {	// process tokens
			intoken = false;
			keepToken = false;
			suspendTextPassThru = false;
			newWord = true;
			handled = false;

			while (wordStart < (text.c_str() + text.length())) { //hack
				if (strchr(";,. :?!()'\"", *wordStart) && wordStart[0] && wordStart[1])
					wordStart++;
				else break;
			}			
			while (wordEnd > wordStart) {
				if (strchr(" ,;:.?!()'\"", *wordEnd))
					wordEnd--;
				else break;
			}

			// Scripture Reference
			if (!strncmp(token, "scripRef", 8)) {
				suspendTextPassThru = true;
				newText = true;
				handled = true;
			}
			else if (!strncmp(token, "/scripRef", 9)) {
				tmp = "";
				tmp.append(textStart, (int)(textEnd - textStart)+1);
				text += VerseKey::convertToOSIS(tmp.c_str(), key);
				
				lastspace = false;
				suspendTextPassThru = false;
				handled = true;
			}

			// Footnote
			if (!strcmp(token, "RF") || !strncmp(token, "RF ", 3)) { //the GBFFootnotes filter adds the attribute "swordFootnote", we want to catch that, too
	//			pushString(buf, "<reference work=\"Bible.KJV\" reference=\"");
				text += "<note type=\"x-StudyNote\">";
				newText = true;
				lastspace = false;
				handled = true;
			}
			else	if (!strcmp(token, "Rf")) {
				text += "</note>";
				lastspace = false;
				handled = true;
			}
			// hebrew titles
			if (!strcmp(token, "TH")) {
				text += "<title type=\"psalm\">";
				newText = true;
				lastspace = false;
				handled = true;
			}
			else	if (!strcmp(token, "Th")) {
				text += "</title>";
				lastspace = false;
				handled = true;
			}
			// Italics assume transchange
			if (!strcmp(token, "FI")) {
				text += "<transChange type=\"added\">";
				newText = true;
				lastspace = false;
				handled = true;
			}
			else	if (!strcmp(token, "Fi")) {
				text += "</transChange>";
				lastspace = false;
				handled = true;
			}
			// less than
			if (!strcmp(token, "CT")) {
				text += "&lt;";
				newText = true;
				lastspace = false;
				handled = true;
			}
			// greater than
			if (!strcmp(token, "CG")) {
				text += "&gt;";
				newText = true;
				lastspace = false;
				handled = true;
			}
			// Paragraph break.  For now use empty paragraph element
			if (!strcmp(token, "CM")) {
				text += "<milestone type=\"x-p\" />";
				newText = true;
				lastspace = false;
				handled = true;
			}

			// Figure
			else	if (!strncmp(token, "img ", 4)) {
				const char *src = strstr(token, "src");
				if (!src)		// assert we have a src attribute
					continue;
//					return false;

				text += "<figure src=\"";
				const char *c;
				for (c = src;((*c) && (*c != '"')); c++);

// uncomment for SWORD absolute path logic
//				if (*(c+1) == '/') {
//					pushString(buf, "file:");
//					pushString(buf, module->getConfigEntry("AbsoluteDataPath"));
//					if (*((*buf)-1) == '/')
//						c++;		// skip '/'
//				}
// end of uncomment for asolute path logic 

				for (c++;((*c) && (*c != '"')); c++) {
					text += *c;
				}
				text += "\" />";
				
				lastspace = false;
				handled = true;
			}

			// Strongs numbers
			else if (*token == 'W' && (token[1] == 'G' || token[1] == 'H')) {	// Strongs
				bool divineName = false;
				value = token+1;
			
				// normal strongs number
				//strstrip(val);
				if (!strncmp(wordStart, "<w ", 3)) {
					const char *attStart = strstr(wordStart, "lemma");
					if (attStart) {
						attStart += 7;
						
						buf = "";
						buf.appendFormatted("strong:%s ", value.c_str());
					}
					else { // no lemma attribute
						attStart = wordStart + 3;
						
						buf = "";
						buf.appendFormatted(buf, "lemma=\"strong:%s\" ", value.c_str());
					}

					text.insert(attStart - text.c_str(), buf);
				}
				else { //wordStart doesn't point to an existing <w> attribute!
					if (!strcmp(value.c_str(), "H03068")) {	//divineName
						buf = "";
						buf.appendFormatted("<divineName><w lemma=\"strong:%s\">", value.c_str());
						
						divineName = true;
					}
					else {
						buf = "";
						buf.appendFormatted("<w lemma=\"strong:%s\">", value.c_str());
					}

					text.insert(wordStart - text.c_str(), buf);

					if (divineName) {
						wordStart += 12;
						text += "</w></divineName>";
					}
					else	text += "</w>";

					lastspace = false;
				}
				handled = true;
			}

			// Morphology
			else if (*token == 'W' && token[1] == 'T') {
				if (token[2] == 'G' || token[2] == 'H') {	// Strongs
					value = token+2;
				}
				else value = token+1;
				
				if (!strncmp(wordStart, "<w ", 3)) {
					const char *attStart = strstr(wordStart, "morph");
					if (attStart) { //existing morph attribute, append this one to it
						attStart += 7;
						buf = "";
						buf.appendFormatted("%s:%s ", "robinson", value.c_str());
					}
					else { // no lemma attribute
						attStart = wordStart + 3;
						buf = "";
						buf.appendFormatted("morph=\"%s:%s\" ", "robinson", value.c_str());
					}
					
					text.insert(attStart - text.c_str(), buf); //hack, we have to
				}
				else { //no existing <w> attribute fond
					buf = "";
					buf.appendFormatted("<w morph=\"%s:%s\">", "robinson", value.c_str());
					text.insert(wordStart - text.c_str(), buf);
					text += "</w>";
					lastspace = false;

				}
				handled = true;
			}

			if (!keepToken) {	
				if (!handled) {
					SWLog::getSystemLog()->logError("Unprocessed Token: <%s> in key %s", token, key ? (const char*)*key : "<unknown>");
//					exit(-1);
				}
				if (from[1] && strchr(" ,;.:?!()'\"", from[1])) {
					if (lastspace) {
						text--;
					}
				}
				if (newText) {
					textStart = from+1;
					newText = false; 
				}
				continue;
			}

			// if not a strongs token, keep token in text
			text.appendFormatted("<%s>", token);
			
			if (newText) {
				textStart = text.c_str() + text.length();
				newWord = false; 
			}
			continue;
		}
		if (intoken) {
			if ((tokpos < 2045) && ((*from != 10)&&(*from != 13))) {
				token[tokpos++] = *from;
				token[tokpos+2] = 0;
			}
		}
		else	{
			switch (*from) {
			case '\'':
			case '\"':
			case '`':
//				quoteStack.handleQuote(fromStart, from, &to);
				text += *from;
				//from++; //this line removes chars after an apostrophe! Needs fixing.
				break;
			default:
				if (newWord && (*from != ' ')) {
					wordStart = text.c_str() + text.length();
					newWord = false;
					
					//fix this if required?
					//memset(to, 0, 10);

				}

				if (!suspendTextPassThru) {
					text += (*from);
					lastspace = (*from == ' ');
				}
			}
		}
	}

	const VerseKey *vkey = SWDYNAMIC_CAST(const VerseKey, key);
	if (vkey) {
		SWBuf ref = "";
		if (vkey->getVerse()) {
			ref.appendFormatted("\t\t<verse osisID=\"%s\">", vkey->getOSISRef());
		}

		if (ref.length() > 0) {

			text = ref + text;

			if (vkey->getVerse()) {
				VerseKey *tmp = (VerseKey *)vkey->clone();
				*tmp = *vkey;
				tmp->setAutoNormalize(false);
				tmp->setIntros(true);

				text += "</verse>";

				*tmp = MAXVERSE;
				if (*vkey == *tmp) {
					tmp->setVerse(0);
//					sprintf(ref, "\t</div>");
//					pushString(&to, ref);
					*tmp = MAXCHAPTER;
					*tmp = MAXVERSE;
					if (*vkey == *tmp) {
						tmp->setChapter(0);
						tmp->setVerse(0);
//						sprintf(ref, "\t</div>");
//						pushString(&to, ref);
/*
						if (!quoteStack.empty()) {
							SWLog::getSystemLog()->logError("popping unclosed quote at end of book");
							quoteStack.clear();
						}
*/
					}
				}
                                delete tmp;
			}
//			else if (vkey->Chapter()) {
//				sprintf(ref, "\t<div type=\"chapter\" osisID=\"%s\">", vkey->getOSISRef());
//			}
//			else sprintf(ref, "\t<div type=\"book\" osisID=\"%s\">", vkey->getOSISRef());
		}
	}
	return 0;
}


QuoteStack::QuoteStack() {
	clear();
}


void QuoteStack::clear() {
	while (!quotes.empty()) quotes.pop();
}


QuoteStack::~QuoteStack() {
	clear();
}


void QuoteStack::handleQuote(char *buf, char *quotePos, SWBuf &text) {
//QuoteInstance(char startChar = '\"', char level = 1, string uniqueID = "", char continueCount = 0) {
	if (!quotes.empty()) {
		QuoteInstance last = quotes.top();
		if (last.startChar == *quotePos) {
			text += "</quote>";
			quotes.pop();
		}
		else {
			quotes.push(QuoteInstance(*quotePos, last.level+1));
			quotes.top().pushStartStream(text);
		}
	}
	else {
		quotes.push(QuoteInstance(*quotePos));
		quotes.top().pushStartStream(text);
	}
}

void QuoteStack::QuoteInstance::pushStartStream(SWBuf &text) {
	text.appendFormatted("<quote level=\"%d\">", level);
}

SWORD_NAMESPACE_END
