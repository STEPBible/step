/***************************************************************************
 *
 *  thmlgbf.cpp -	ThML to GBF filter
 *
 * $Id: thmlgbf.cpp 3427 2016-07-03 14:30:33Z scribe $
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
#include <thmlgbf.h>
#include <utilstr.h>
#include <swbuf.h>

SWORD_NAMESPACE_START

ThMLGBF::ThMLGBF()
{
}


char ThMLGBF::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	const char *from;
	char token[2048];
	int tokpos = 0;
	bool intoken 	= false;
	bool ampersand = false;
	bool sechead = false;
	bool title = false;  

	SWBuf orig = text;
	from = orig.c_str();

	for (text = ""; *from; from++) {
		if (*from == '<') {
			intoken = true;
			tokpos = 0;
			token[0] = 0;
			token[1] = 0;
			token[2] = 0;
			ampersand = false;
			continue;
		}
		else if (*from == '&') {
			intoken = true;
			tokpos = 0;
			memset(token, 0, 2048);
			ampersand = true;
			continue;
		}
		if (*from == ';' && ampersand) {
			intoken = false;
	
			if (!strncmp("nbsp", token, 4)) text += ' ';
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
		else if (*from == '>' && !ampersand) {
			intoken = false;
			// process desired tokens
			if (!strncmp(token, "sync type=\"Strongs\" value=\"", 27)) {
				text += "<W";
				for (unsigned int i = 27; token[i] != '\"'; i++)
					text += token[i];
				text += '>';
				continue;
			}
			if (!strncmp(token, "sync type=\"morph\" value=\"", 25)) {
				text += "<WT";
				for (unsigned int i = 25; token[i] != '\"'; i++)
					text += token[i];
				text += '>';
				continue;
			}
			else if (!strncmp(token, "scripRef", 8)) {
				text += "<RX>";
				continue;
			}
 			else if (!strncmp(token, "/scripRef", 9)) {
				text += "<Rx>";
				continue;
			}
			else if (!strncmp(token, "note", 4)) {
				text += "<RF>";
				continue;
			}
			else if (!strncmp(token, "/note", 5)) {
				text += "<Rf>";
				continue;
			}
			else if (!strncmp(token, "sup", 3)) {
				text += "<FS>";
			}
			else if (!strncmp(token, "/sup", 4)) {
				text += "<Fs>";
			}
			else if (!strnicmp(token, "font color=#ff0000", 18)) {
				text += "<FR>";
				continue;
			}
			else if (!strnicmp(token, "/font", 5)) {
				text += "<Fr>";
				continue;
			}
			else if (!strncmp(token, "div class=\"sechead\"", 19)) {
				text += "<TS>";
				sechead = true;
				continue;
			}
			else if (sechead && !strncmp(token, "/div", 19)) {
				text += "<Ts>";
				sechead = false;
				continue;
			}
			else if (!strncmp(token, "div class=\"title\"", 19)) {
				text += "<TT>";
				title = true;
				continue;
			}
			else if (title && !strncmp(token, "/div", 19)) {
				text += "<Tt>";
				title = false;
				continue;
			}
			else if (!strnicmp(token, "br", 2)) {
				text += "<CL>";
				continue;
			}
			else switch(*token) {
			case 'I':			// font tags
			case 'i':
				text += "<FI>";
				continue;
			case 'B':		// bold start
			case 'b':
				text += "<FB>";
				continue;
			case '/':
				switch(token[1]) {
				case 'P':
				case 'p':
					text += "<CM>";
					continue;
				case 'I':
				case 'i':		// italic end
					text += "<Fi>";
					continue;
				case 'B':		// bold start
				case 'b':
					text += "<Fb>";
					continue;
				}
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
		else	text += *from;
	}

	orig = text;
	from = orig.c_str();
	for (text = ""; *from; from++) {  //loop to remove extra spaces
                if ((strchr(" \t\n\r", *from))) {
                        while (*(from+1) && (strchr(" \t\n\r", *(from+1)))) {
                                from++;
                        }
                        text += " ";
                }
                else {
                        text += *from;
                }
        }
        text += (char)0;
        
	return 0;
}

SWORD_NAMESPACE_END
