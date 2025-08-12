/***************************************************************************
 *
 *  thmlwebif.cpp -	ThML to HTML filter with hrefs
 *
 * $Id: thmlwebif.cpp 2980 2013-09-14 21:51:47Z scribe $
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
#include <thmlwebif.h>
#include <swmodule.h>
#include <url.h>
#include <utilxml.h>
#include <ctype.h>

SWORD_NAMESPACE_START


ThMLWEBIF::ThMLWEBIF() : baseURL(""), passageStudyURL(baseURL + "passagestudy.jsp") {
}


bool ThMLWEBIF::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {

	if (!substituteToken(buf, token)) { // manually process if it wasn't a simple substitution
		MyUserData *u = (MyUserData *)userData;
		XMLTag tag(token);
		SWBuf url;
		if (!strcmp(tag.getName(), "sync")) {
			const char* value = tag.getAttribute("value");
			url = value;
			if ((url.length() > 1) && strchr("GH", url[0])) {
				if (isdigit(url[1]))
					url = url.c_str()+1;
			}

			if(tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "morph")){
				buf += "<small><em> (";
				buf.appendFormatted("<a href=\"%s?showMorph=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str() );
			}
			else {
				if (value) {
					value++; //skip leading G, H or T
					//url = value;
				}

				buf += "<small><em> &lt;";
				buf.appendFormatted("<a href=\"%s?showStrong=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str() );
			}

			buf += value;
			buf += "</a>";

			if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "morph")) {
				buf += ") </em></small>";
			}
			else {
				buf += "&gt; </em></small>";
			}
		}
		else if (!strcmp(tag.getName(), "scripRef")) {
			if (tag.isEndTag()) {
				if (u->inscriptRef) { // like  "<scripRef passage="John 3:16">John 3:16</scripRef>"
					u->inscriptRef = false;
					buf += "</a>";
				}
				else { // end of scripRef like "<scripRef>John 3:16</scripRef>"
					url = u->lastTextNode;
					buf.appendFormatted("<a href=\"%s?key=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());
					buf += u->lastTextNode.c_str();
					buf += "</a>";

					// let's let text resume to output again
					u->suspendTextPassThru = false;
				}
			}
			else if (tag.getAttribute("passage")) { //passage given
				u->inscriptRef = true;

				buf.appendFormatted("<a href=\"%s?key=%s#cv\">", passageStudyURL.c_str(), URL::encode(tag.getAttribute("passage")).c_str());
			}
			else { //no passage given
				u->inscriptRef = false;
				// let's stop text from going to output
				u->suspendTextPassThru = true;
			}
		}
		else {
			return ThMLXHTML::handleToken(buf, token, userData);
		}
	}
	return true;
}


SWORD_NAMESPACE_END
