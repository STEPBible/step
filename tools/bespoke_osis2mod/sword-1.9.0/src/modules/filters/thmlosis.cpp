/******************************************************************************
 *
 *  thmlosis.cpp -	filter to convert ThML to OSIS
 *
 * $Id: thmlosis.cpp 3808 2020-10-02 13:23:34Z scribe $
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
#include <ctype.h>
#include <thmlosis.h>
#include <swmodule.h>
#include <swlog.h>
#include <versekey.h>
#include <utilstr.h>
#include <utilxml.h>


SWORD_NAMESPACE_START

ThMLOSIS::ThMLOSIS() {
}


ThMLOSIS::~ThMLOSIS() {
}


char ThMLOSIS::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	char token[2048]; // cheese.  Fix.
	int tokpos = 0;
	bool intoken = false;
	bool keepToken = false;
	bool ampersand = false;

//	static QuoteStack quoteStack;
	
	bool lastspace = false;
	char val[128];
	SWBuf buf;
	char *valto;
	char *ch;
	
	const char *wordStart = text.c_str();
	const char *wordEnd = NULL;
	
	const char *textStart = NULL;
	const char *textEnd = NULL;
		
	bool suspendTextPassThru = false;
	bool handled = false;
	bool newText = false;
	bool newWord = false;
	
// 	SWBuf tmp;
	SWBuf divEnd = "";

	SWBuf orig = text;
	const char* from = orig.c_str();

	text = "";
	for (from = orig.c_str(); *from; ++from) {

		// handle silly <variant word> items in greek whnu, remove when module is fixed
		if ((*from == '<') && (*(from+1) < 0)) {
			text += "&lt;";
			continue;
		}

		if (*from == '<') { //start of new token detected
			intoken = true;
			tokpos = 0;
			token[0] = 0;
			token[1] = 0;
			token[2] = 0;
			ampersand = false;
			textEnd = from-1;
			wordEnd = text.c_str() + text.length();//not good, instead of wordEnd = to!

// 			wordEnd = to;
			continue;
		}

		if (*from == '&') {
			intoken = true;
			tokpos = 0;
			token[0] = 0;
			token[1] = 0;
			token[2] = 0;
			ampersand = true;
			continue;
		}

		if (*from == ';' && ampersand) {
			intoken = false;
			ampersand = false;

			if (*token == '#') {
				text += '&';
				text += token;
				text += ';';
			}
			else if (!strncmp("nbsp", token, 4)) text += ' ';
			else if (!strncmp("quot", token, 4)) text += '"';
			else if (!strncmp("amp", token, 3)) text += '&';
			else if (!strncmp("lt", token, 2)) text += '<';
			else if (!strncmp("gt", token, 2)) text += '>';
			else if (!strncmp("brvbar", token, 6)) text += '¦';
			else if (!strncmp("sect", token, 4)) text += '§';
			else if (!strncmp("copy", token, 4)) text += '©';
			else if (!strncmp("laquo", token, 5)) text += '«';
			else if (!strncmp("reg", token, 3)) text += '®';
			else if (!strncmp("acute", token, 5)) text += '´';
			else if (!strncmp("para", token, 4)) text += '¶';
			else if (!strncmp("raquo", token, 5)) text += '»';
			else if (!strncmp("Aacute", token, 6)) text += 'Á';
			else if (!strncmp("Agrave", token, 6)) text += 'À';
			else if (!strncmp("Acirc", token, 5)) text += 'Â';
			else if (!strncmp("Auml", token, 4)) text += 'Ä';
			else if (!strncmp("Atilde", token, 6)) text += 'Ã';
			else if (!strncmp("Aring", token, 5)) text += 'Å';
			else if (!strncmp("aacute", token, 6)) text += 'á';
			else if (!strncmp("agrave", token, 6)) text += 'à';
			else if (!strncmp("acirc", token, 5)) text += 'â';
			else if (!strncmp("auml", token, 4)) text += 'ä';
			else if (!strncmp("atilde", token, 6)) text += 'ã';
			else if (!strncmp("aring", token, 5)) text += 'å';
			else if (!strncmp("Eacute", token, 6)) text += 'É';
			else if (!strncmp("Egrave", token, 6)) text += 'È';
			else if (!strncmp("Ecirc", token, 5)) text += 'Ê';
			else if (!strncmp("Euml", token, 4)) text += 'Ë';
			else if (!strncmp("eacute", token, 6)) text += 'é';
			else if (!strncmp("egrave", token, 6)) text += 'è';
			else if (!strncmp("ecirc", token, 5)) text += 'ê';
			else if (!strncmp("euml", token, 4)) text += 'ë';
			else if (!strncmp("Iacute", token, 6)) text += 'Í';
			else if (!strncmp("Igrave", token, 6)) text += 'Ì';
			else if (!strncmp("Icirc", token, 5)) text += 'Î';
			else if (!strncmp("Iuml", token, 4)) text += 'Ï';
			else if (!strncmp("iacute", token, 6)) text += 'í';
			else if (!strncmp("igrave", token, 6)) text += 'ì';
			else if (!strncmp("icirc", token, 5)) text += 'î';
			else if (!strncmp("iuml", token, 4)) text += 'ï';
			else if (!strncmp("Oacute", token, 6)) text += 'Ó';
			else if (!strncmp("Ograve", token, 6)) text += 'Ò';
			else if (!strncmp("Ocirc", token, 5)) text += 'Ô';
			else if (!strncmp("Ouml", token, 4)) text += 'Ö';
			else if (!strncmp("Otilde", token, 6)) text += 'Õ';
			else if (!strncmp("oacute", token, 6)) text += 'ó';
			else if (!strncmp("ograve", token, 6)) text += 'ò';
			else if (!strncmp("ocirc", token, 5)) text += 'ô';
			else if (!strncmp("ouml", token, 4)) text += 'ö';
			else if (!strncmp("otilde", token, 6)) text += 'õ';
			else if (!strncmp("Uacute", token, 6)) text += 'Ú';
			else if (!strncmp("Ugrave", token, 6)) text += 'Ù';
			else if (!strncmp("Ucirc", token, 5)) text += 'Û';
			else if (!strncmp("Uuml", token, 4)) text += 'Ü';
			else if (!strncmp("uacute", token, 6)) text += 'ú';
			else if (!strncmp("ugrave", token, 6)) text += 'ù';
			else if (!strncmp("ucirc", token, 5)) text += 'û';
			else if (!strncmp("uuml", token, 4)) text += 'ü';
			else if (!strncmp("Yacute", token, 6)) text += 'Ý';
			else if (!strncmp("yacute", token, 6)) text += 'ý';
			else if (!strncmp("yuml", token, 4)) text += 'ÿ';

			else if (!strncmp("deg", token, 3)) text += '°';
			else if (!strncmp("plusmn", token, 6)) text += '±';
			else if (!strncmp("sup2", token, 4)) text += '²';
			else if (!strncmp("sup3", token, 4)) text += '³';
			else if (!strncmp("sup1", token, 4)) text += '¹';
			else if (!strncmp("nbsp", token, 4)) text += 'º';
			else if (!strncmp("pound", token, 5)) text += '£';
			else if (!strncmp("cent", token, 4)) text += '¢';
			else if (!strncmp("frac14", token, 6)) text += '¼';
			else if (!strncmp("frac12", token, 6)) text += '½';
			else if (!strncmp("frac34", token, 6)) text += '¾';
			else if (!strncmp("iquest", token, 6)) text += '¿';
			else if (!strncmp("iexcl", token, 5)) text += '¡';
			else if (!strncmp("ETH", token, 3)) text += 'Ð';
			else if (!strncmp("eth", token, 3)) text += 'ð';
			else if (!strncmp("THORN", token, 5)) text += 'Þ';
			else if (!strncmp("thorn", token, 5)) text += 'þ';
			else if (!strncmp("AElig", token, 5)) text += 'Æ';
			else if (!strncmp("aelig", token, 5)) text += 'æ';
			else if (!strncmp("Oslash", token, 6)) text += 'Ø';
			else if (!strncmp("curren", token, 6)) text += '¤';
			else if (!strncmp("Ccedil", token, 6)) text += 'Ç';
			else if (!strncmp("ccedil", token, 6)) text += 'ç';
			else if (!strncmp("szlig", token, 5)) text += 'ß';
			else if (!strncmp("Ntilde", token, 6)) text += 'Ñ';
			else if (!strncmp("ntilde", token, 6)) text += 'ñ';
			else if (!strncmp("yen", token, 3)) text += '¥';
			else if (!strncmp("not", token, 3)) text += '¬';
			else if (!strncmp("ordf", token, 4)) text += 'ª';
			else if (!strncmp("uml", token, 3)) text += '¨';
			else if (!strncmp("shy", token, 3)) text += '­';
			else if (!strncmp("macr", token, 4)) text += '¯';
			else if (!strncmp("micro", token, 5)) text += "µ";
			else if (!strncmp("middot", token, 6)) text +="·";
			else if (!strncmp("cedil", token, 5)) text += "¸";
			else if (!strncmp("ordm", token, 4)) text +=  "º";
			else if (!strncmp("times", token, 5)) text += "×";
			else if (!strncmp("divide", token, 6)) text +="÷";
			else if (!strncmp("oslash", token, 6)) text +="ø";
			continue;
		}

		// handle silly <variant word> items in greek whnu, remove when module is fixed
		if ((*from == '>') && (*(from-1) < 0)) {
			text += "&gt;";
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

			// variants
			if (!strncmp(token, "div type=\"variant\"", 18)) {
				XMLTag tag = token;
				text.append("<seg type=\"x-variant\"");
				SWBuf cls = "x-class:";
				cls += tag.getAttribute("class");
				if (cls.length()>8)
					text.appendFormatted(" subType=\"%s\"", cls.c_str());

				text += ">";
				divEnd = "</seg>";
				newText = true;
				lastspace = false;
				handled = true;
			}
			// section titles
			if (!strcmp(token, "div class=\"sechead\"")) {
// 				pushString(&to, "<title>");
				text.append("<title>");
				divEnd = "</title>";
				newText = true;
				lastspace = false;
				handled = true;
			}
			else	if (!strcmp(token, "/div")) {
				//pushString(&to, divEnd.c_str());
				text.append(divEnd);
				lastspace = false;
				handled = true;
			}
			// Scripture Reference
			if (!strncmp(token, "scripRef", 8)) {
	//			pushString(buf, "<reference osisRef=\"");
				suspendTextPassThru = true;
				newText = true;
				handled = true;
			}
			else	if (!strncmp(token, "/scripRef", 9)) {
				SWBuf tmp;
				tmp = "";
				tmp.append(textStart, (int)(textEnd - textStart)+1);
				//pushString(&to, convertToOSIS(tmp.c_str(), key));
				text.append(VerseKey::convertToOSIS(tmp.c_str(), key));
				suspendTextPassThru = false;
				handled = true;
			}
//      Usage of italics to represent transChange isn't domaninant;
//        solution: mark in OSIS instead, assume no semantics other than emphasis
//                of italicized text
//                        if (!strcmp(module->Type(), "Biblical Texts")) {
//        			// Italics assume transchange for Biblical texts
//	        		if (!stricmp(token, "i")) {
//		        		pushString(&to, "<transChange type=\"added\">");
//			        	newText = true;
//				        lastspace = false;
//        				handled = true;
//	        		}
//		        	else	if (!stricmp(token, "/i")) {
//			        	pushString(&to, "</transChange>");
//        				lastspace = false;
//	        			handled = true;
//		        	}
//                        }
//                        else {
//                        	// otherwise, italics are just italics
//-- end italics for transchange
	        		if (!stricmp(token, "i")) {
// 		        		pushString(&to, "<hi type=\"i\">");
					text.append("<hi type=\"i\">");
			        	newText = true;
				     lastspace = false;
        				handled = true;
	        		}
		        	else	if (!stricmp(token, "/i")) {
// 			        	pushString(&to, "</hi>");
					text.append("</hi>");
        				lastspace = false;
	        			handled = true;
		        	}
//                        }

	        	if (!strcmp(token, "b")) {
// 		        	pushString(&to, "<hi type=\"b\">");
				text.append("<hi type=\"b\">");
				newText = true;
				lastspace = false;
        			handled = true;
	        	}
			else if (!strcmp(token, "/b")) {
// 			     pushString(&to, "</hi>");
				text.append("</hi>");
        			lastspace = false;
	        		handled = true;
			}

			// Footnote
			if (!strncmp(token, "note", 4)) {
		        	//pushString(&to, "<note>");
				text.append("<note>");
				newText = true;
				lastspace = false;
				handled = true;
			}
			else	if (!strcmp(token, "/note")) {
				// pushString(&to, "</note>");
				text.append("</note>");
				lastspace = false;
				handled = true;
			}

			// Figure
			else	if (!strncmp(token, "img ", 4)) {
				const char *src = strstr(token, "src");
				if (!src)		// assert we have a src attribute
					continue;
//					return false;

				//pushString(&to, "<figure src=\"");
				text.append("<figure src=\"");

				const char* end = strchr(src+2, '"'); //start search behind src="
				
				if (end) { //append the path
					text.append(src+2, end - (src+2));
				}
								
// 				const char *c;
// 				for (c = src;((*c) && (*c != '"')); c++);

// uncomment for SWORD absolute path logic
//				if (*(c+1) == '/') {
//					pushString(buf, "file:");
//					pushString(buf, module->getConfigEntry("AbsoluteDataPath"));
//					if (*((*buf)-1) == '/')
//						c++;		// skip '/'
//				}
//				end of uncomment for asolute path logic 

// 				for (c++;((*c) && (*c != '"')); c++)
// 					*to++ = *c;

				//pushString(&to, "\" />");
				text.append("\" />");
				handled = true;
			}

			// Strongs numbers
			else	if (!strnicmp(token, "sync type=\"Strongs\" ", 20)) {	// Strongs
				valto = val;
				for (unsigned int i = 27; token[i] != '\"' && i < 150; i++)
					*valto++ = token[i];
				*valto = 0;
				if (atoi((!isdigit(*val))?val+1:val) < 5627) {
					// normal strongs number
					strstrip(val);

					if (!strncmp(wordStart, "<w ", 3)) {
						const char *attStart = strstr(wordStart, "lemma");
						if (attStart) { //existing morph attribute, append this one to it
							attStart += 7;
							buf = "";
							buf.appendFormatted("strong:%s ", val);
						}
						else { // no lemma attribute
							attStart = wordStart + 3;
							buf = "";
							buf.appendFormatted(buf, "lemma=\"strong:%s\" ", val);
						}

						text.insert(attStart - text.c_str(), buf);
					}
					else { //wordStart doesn't point to an existing <w> attribute!
						buf = "";
						buf.appendFormatted("<w lemma=\"strong:%s\">", val);
						text.insert(wordStart - text.c_str(), buf);
						text += "</w>";
						lastspace = false;
					}
				}
				// OLB verb morph, leave it out of OSIS tag
				else {
				}
				handled = true;
			}

			// Morphology
			else	if (!strncmp(token, "sync type=\"morph\"", 17)) {
				SWBuf cls = "";
				SWBuf morph = "";
				for (ch = token+17; *ch; ch++) {
					if (!strncmp(ch, "class=\"", 7)) {
						valto = val;
						for (unsigned int i = 7; ch[i] != '\"' && i < 127; i++)
							*valto++ = ch[i];
						*valto = 0;
						strstrip(val);
						cls = val;
					}
					if (!strncmp(ch, "value=\"", 7)) {
						valto = val;
						for (unsigned int i = 7; ch[i] != '\"' && i < 127; i++)
							*valto++ = ch[i];
						*valto = 0;
						strstrip(val);
						morph = val;
					}
				}
				if (!strncmp(wordStart, "<w ", 3)) {
					const char *attStart = strstr(wordStart, "morph");
					if (attStart) { //existing morph attribute, append this one to it
						attStart += 7;
						buf = "";
						buf.appendFormatted("%s:%s ", ((cls.length())?cls.c_str():"robinson"), morph.c_str());
					}
					else { // no lemma attribute
						attStart = wordStart + 3;
						buf = "";
						buf.appendFormatted("morph=\"%s:%s\" ", ((cls.length())?cls.c_str():"robinson"), morph.c_str());
					}
					
					text.insert(attStart - text.c_str(), buf); //hack, we have to
				}
				else { //no existing <w> attribute fond
					buf = "";
					buf.appendFormatted("<w morph=\"%s:%s\">", ((cls.length())?cls.c_str():"robinson"), morph.c_str());
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
//			else if (vkey->getChapter()) {
//				sprintf(ref, "\t<div type=\"chapter\" osisID=\"%s\">", vkey->getOSISRef());
//			}
//			else sprintf(ref, "\t<div type=\"book\" osisID=\"%s\">", vkey->getOSISRef());
		}
	}
	return 0;
}


SWORD_NAMESPACE_END
