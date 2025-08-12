/***************************************************************************
 *
 *  thmlhtml.cpp -	ThML to HTML filter
 *
 * $Id: thmlhtml.cpp 3547 2017-12-10 05:06:48Z scribe $
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
#include <thmlhtml.h>
#include <swmodule.h>
#include <utilxml.h>


SWORD_NAMESPACE_START


ThMLHTML::ThMLHTML() {
	setTokenStart("<");
	setTokenEnd(">");

	setEscapeStart("&");
	setEscapeEnd(";");

	setEscapeStringCaseSensitive(true);
	setPassThruNumericEscapeString(true);

	addAllowedEscapeString("quot");
	addAllowedEscapeString("amp");
	addAllowedEscapeString("lt");
	addAllowedEscapeString("gt");

	addAllowedEscapeString("nbsp");
	addAllowedEscapeString("brvbar"); // "¦"
	addAllowedEscapeString("sect");   // "§"
	addAllowedEscapeString("copy");   // "©"
	addAllowedEscapeString("laquo");  // "«"
	addAllowedEscapeString("reg");    // "®"
	addAllowedEscapeString("acute");  // "´"
	addAllowedEscapeString("para");   // "¶"
	addAllowedEscapeString("raquo");  // "»"

	addAllowedEscapeString("Aacute"); // "Á"
	addAllowedEscapeString("Agrave"); // "À"
	addAllowedEscapeString("Acirc");  // "Â"
	addAllowedEscapeString("Auml");   // "Ä"
	addAllowedEscapeString("Atilde"); // "Ã"
	addAllowedEscapeString("Aring");  // "Å"
	addAllowedEscapeString("aacute"); // "á"
	addAllowedEscapeString("agrave"); // "à"
	addAllowedEscapeString("acirc");  // "â"
	addAllowedEscapeString("auml");   // "ä"
	addAllowedEscapeString("atilde"); // "ã"
	addAllowedEscapeString("aring");  // "å"
	addAllowedEscapeString("Eacute"); // "É"
	addAllowedEscapeString("Egrave"); // "È"
	addAllowedEscapeString("Ecirc");  // "Ê"
	addAllowedEscapeString("Euml");   // "Ë"
	addAllowedEscapeString("eacute"); // "é"
	addAllowedEscapeString("egrave"); // "è"
	addAllowedEscapeString("ecirc");  // "ê"
	addAllowedEscapeString("euml");   // "ë"
	addAllowedEscapeString("Iacute"); // "Í"
	addAllowedEscapeString("Igrave"); // "Ì"
	addAllowedEscapeString("Icirc");  // "Î"
	addAllowedEscapeString("Iuml");   // "Ï"
	addAllowedEscapeString("iacute"); // "í"
	addAllowedEscapeString("igrave"); // "ì"
	addAllowedEscapeString("icirc");  // "î"
	addAllowedEscapeString("iuml");   // "ï"
	addAllowedEscapeString("Oacute"); // "Ó"
	addAllowedEscapeString("Ograve"); // "Ò"
	addAllowedEscapeString("Ocirc");  // "Ô"
	addAllowedEscapeString("Ouml");   // "Ö"
	addAllowedEscapeString("Otilde"); // "Õ"
	addAllowedEscapeString("oacute"); // "ó"
	addAllowedEscapeString("ograve"); // "ò"
	addAllowedEscapeString("ocirc");  // "ô"
	addAllowedEscapeString("ouml");   // "ö"
	addAllowedEscapeString("otilde"); // "õ"
	addAllowedEscapeString("Uacute"); // "Ú"
	addAllowedEscapeString("Ugrave"); // "Ù"
	addAllowedEscapeString("Ucirc");  // "Û"
	addAllowedEscapeString("Uuml");   // "Ü"
	addAllowedEscapeString("uacute"); // "ú"
	addAllowedEscapeString("ugrave"); // "ù"
	addAllowedEscapeString("ucirc");  // "û"
	addAllowedEscapeString("uuml");   // "ü"
	addAllowedEscapeString("Yacute"); // "Ý"
	addAllowedEscapeString("yacute"); // "ý"
	addAllowedEscapeString("yuml");   // "ÿ"

	addAllowedEscapeString("deg");    // "°"
	addAllowedEscapeString("plusmn"); // "±"
	addAllowedEscapeString("sup2");   // "²"
	addAllowedEscapeString("sup3");   // "³"
	addAllowedEscapeString("sup1");   // "¹"
	addAllowedEscapeString("nbsp");   // "º"
	addAllowedEscapeString("pound");  // "£"
	addAllowedEscapeString("cent");   // "¢"
	addAllowedEscapeString("frac14"); // "¼"
	addAllowedEscapeString("frac12"); // "½"
	addAllowedEscapeString("frac34"); // "¾"
	addAllowedEscapeString("iquest"); // "¿"
	addAllowedEscapeString("iexcl");  // "¡"
	addAllowedEscapeString("ETH");    // "Ð"
	addAllowedEscapeString("eth");    // "ð"
	addAllowedEscapeString("THORN");  // "Þ"
	addAllowedEscapeString("thorn");  // "þ"
	addAllowedEscapeString("AElig");  // "Æ"
	addAllowedEscapeString("aelig");  // "æ"
	addAllowedEscapeString("Oslash"); // "Ø"
	addAllowedEscapeString("curren"); // "¤"
	addAllowedEscapeString("Ccedil"); // "Ç"
	addAllowedEscapeString("ccedil"); // "ç"
	addAllowedEscapeString("szlig");  // "ß"
	addAllowedEscapeString("Ntilde"); // "Ñ"
	addAllowedEscapeString("ntilde"); // "ñ"
	addAllowedEscapeString("yen");    // "¥"
	addAllowedEscapeString("not");    // "¬"
	addAllowedEscapeString("ordf");   // "ª"
	addAllowedEscapeString("uml");    // "¨"
	addAllowedEscapeString("shy");    // "­"
	addAllowedEscapeString("macr");   // "¯"

	addAllowedEscapeString("micro");  // "µ"
	addAllowedEscapeString("middot"); // "·"
	addAllowedEscapeString("cedil");  // "¸"
	addAllowedEscapeString("ordm");   // "º"
	addAllowedEscapeString("times");  // "×"
	addAllowedEscapeString("divide"); // "÷"
	addAllowedEscapeString("oslash"); // "ø"

	setTokenCaseSensitive(true);

	addTokenSubstitute("note", " <font color=\"#800000\"><small>(");
	addTokenSubstitute("/note", ")</small></font> ");
}


bool ThMLHTML::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	if (!substituteToken(buf, token)) { // manually process if it wasn't a simple substitution
		MyUserData *u = (MyUserData *)userData;
		XMLTag tag(token);
		if (!strcmp(tag.getName(), "sync")) {
			if (tag.getAttribute("type") && tag.getAttribute("value") && !strcmp(tag.getAttribute("type"), "Strongs")) {
				const char* value = tag.getAttribute("value");
				if (*value == 'H' || *value == 'G' || *value == 'A') {
					value++;
					buf += "<small><em>";
					buf += value;
					buf += "</em></small>";
				}
				else if (*value == 'T') {
					value += 2;

					buf += "<small><i>";
					buf += value;
					buf += "</i></small>";
				}
			}
			else if (tag.getAttribute("type") && tag.getAttribute("value") && !strcmp(tag.getAttribute("type"), "morph")) {
				buf += "<small><em>";
				buf += tag.getAttribute("value");
				buf += "</em></small>";
			}
			else if (tag.getAttribute("type") && tag.getAttribute("value") && !strcmp(tag.getAttribute("type"), "lemma")) {
				buf += "<small><em>(";
				buf += tag.getAttribute("value");
				buf += ")</em></small>";
			}
		}
		else if (!strcmp(tag.getName(), "div")) {
			if (tag.isEndTag() && (u->inSecHead)) {
				buf += "</i></b><br />";
				u->inSecHead = false;
			}
			else if (tag.getAttribute("class")) {
				if (!strcmp(tag.getAttribute("class"), "sechead")) {
					u->inSecHead = true;
					buf += "<br /><b><i>";
				}
				else if (!strcmp(tag.getAttribute("class"), "title")) {
					u->inSecHead = true;
					buf += "<br /><b><i>";
				}
			}
		}
		else if (!strcmp(tag.getName(), "img")) {
			const char *src = strstr(token, "src");
			if (!src)		// assert we have a src attribute
				return false;

			buf += '<';
			for (const char *c = token; *c; c++) {
				if (c == src) {
					for (;((*c) && (*c != '"')); c++)
						buf += *c;

					if (!*c) { c--; continue; }

					buf += '"';
					if (*(c+1) == '/') {
						buf += "file:";
						buf += userData->module->getConfigEntry("AbsoluteDataPath");
						if (buf[buf.length()-2] == '/')
							c++;		// skip '/'
					}
					continue;
				}
				buf += *c;
			}
			buf += '>';
		}
		else if (!strcmp(tag.getName(), "scripRef")) { //do nothing with scrip refs, we leave them out

		}
		else {
			buf += '<';
			buf += token;
			buf += '>';

//			return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
