/***************************************************************************
 *
 *  gbfcgi.cpp -	GBF to Diatheke/CGI format
 *
 * $Id: gbfcgi.cpp 2833 2013-06-29 06:40:28Z chrislit $
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
#include <string.h>
#include <map>
#include "gbfcgi.h"

SWORD_NAMESPACE_START

typedef std::map<SWBuf, SWBuf> DualStringMap;

namespace {
	class MyUserData : public BasicFilterUserData {
	public:
		MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {}
		DualStringMap properties;
	};
}


BasicFilterUserData *GBFCGI::createUserData(const SWModule *module, const SWKey *key) {
	return new MyUserData(module, key);
}

GBFCGI::GBFCGI() {
	setTokenStart("<");
	setTokenEnd(">");
	
	setTokenCaseSensitive(true);

	addTokenSubstitute("Rf", ")</small></font>");
	addTokenSubstitute("FI", "<i>"); // italics begin
	addTokenSubstitute("Fi", "</i>");
	addTokenSubstitute("FB", "<n>"); // bold begin
	addTokenSubstitute("Fb", "</n>");
	addTokenSubstitute("FR", "<font color=\"#FF0000\">"); // words of Jesus begin
	addTokenSubstitute("Fr", "</font>");
	addTokenSubstitute("FU", "<u>"); // underline begin
	addTokenSubstitute("Fu", "</u>");
	addTokenSubstitute("FO", "<cite>"); //  Old Testament quote begin
	addTokenSubstitute("Fo", "</cite>");
	addTokenSubstitute("FS", "<sup>"); // Superscript begin// Subscript begin
	addTokenSubstitute("Fs", "</sup>");
	addTokenSubstitute("FV", "<sub>"); // Subscript begin
	addTokenSubstitute("Fv", "</sub>");
	addTokenSubstitute("TT", "<big>"); // Book title begin
	addTokenSubstitute("Tt", "</big>");
	addTokenSubstitute("PP", "<cite>"); //  poetry  begin
	addTokenSubstitute("Pp", "</cite>");
	addTokenSubstitute("Fn", "</font>"); //  font  end
	addTokenSubstitute("CL", "<br />"); //  new line
	addTokenSubstitute("CM", "<br />"); //  paragraph
	addTokenSubstitute("CG", "&gt;"); //  ???
	addTokenSubstitute("CT", "&lt;"); // ???
	addTokenSubstitute("JR", "<div align=\"right\">"); // right align begin
	addTokenSubstitute("JC", "<div align=\"center\">"); // center align begin
	addTokenSubstitute("JL", "</div>"); // align end
	
}


bool GBFCGI::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *baseUserData) {
	MyUserData *userData = (MyUserData *) baseUserData;
	unsigned long i;
	if (!substituteToken(buf, token)) {
		if (!strncmp(token, "WG", 2) || !strncmp(token, "WH", 2)) { // strong's numbers
			buf += " <small><em>&lt;<a href=\"!DIATHEKE_URL!";
			if (token[1] == 'H') {
			  buf += "StrongsHebrew";
			}
			else if (token[1] == 'G') {
			  buf += "StrongsGreek";
			}
			buf += "=on&verse=";
			for (i = 2; i < strlen(token); i++)
			  buf += token[i];
			buf += "\">";
			for (i = 2; i < strlen(token); i++)
			  buf += token[i];
			buf += "</a>&gt;</em></small>";
		}

		else if (!strncmp(token, "WTG", 3) || !strncmp(token, "WTH", 3)) { // strong's numbers tense
			buf += " <small><em>&lt;<a href=\"!DIATHEKE_URL!";
			if (token[2] == 'H') {
			  buf += "StrongsHebrew";
			}
			else if (token[2] == 'G') {
			  buf += "StrongsGreek";
			}
			buf += "=on&verse=";
			for (i = 3; i < strlen(token); i++)
			  buf += token[i];
			buf += "\">";
			for (i = 3; i < strlen(token); i++)
			  buf += token[i];
			buf += "</a>&gt;</em></small>";
		}

		else if (!strncmp(token, "WT", 2)) { // morph tags
			buf += " <small><em>(<a href=\"!DIATHEKE_URL!Packard=on&verse=";
			for (i = 1; i < strlen(token); i++)
			  buf += token[i];
			buf += "\">";
			for (i = 1; i < strlen(token); i++)
			  buf += token[i];		
			buf += "</a>)</em></small>";
		}

		else if (!strncmp(token, "RB", 2)) {
			buf += "<i>";
			userData->properties["hasFootnotePreTag"] = "true";
		}

		else if (!strncmp(token, "RF", 2)) {
			if(userData->properties["hasFootnotePreTag"] == "true") {
				userData->properties["hasFootnotePreTag"] = "false";
				buf += "</i> ";
			}
			buf += "<font color=\"#800000\"><small> (";
		}

		else if (!strncmp(token, "FN", 2)) {
			buf += "<font face=\"";
			for (i = 2; i < strlen(token); i++)		       
			  buf += token[i];
			buf += "\">";
		}

		else if (!strncmp(token, "CA", 2)) {	// ASCII value
			buf += (char)atoi(&token[2]);
		}
		
		else {
			return false;
		}
	}
	return true;
}

SWORD_NAMESPACE_END
