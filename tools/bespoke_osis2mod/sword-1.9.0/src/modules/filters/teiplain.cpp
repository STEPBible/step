/***************************************************************************
 *
 *  teiplain.cpp -	TEI to Plaintext filter
 *
 * $Id: teiplain.cpp 3696 2020-02-03 19:38:46Z refdoc $
 *
 * Copyright 2006-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <teiplain.h>
#include <ctype.h>

SWORD_NAMESPACE_START

TEIPlain::TEIPlain() {
	setTokenStart("<");
	setTokenEnd(">");

	setEscapeStart("&");
	setEscapeEnd(";");

	setEscapeStringCaseSensitive(true);

	addEscapeStringSubstitute("amp", "&");
	addEscapeStringSubstitute("apos", "'");
	addEscapeStringSubstitute("lt", "<");
	addEscapeStringSubstitute("gt", ">");
	addEscapeStringSubstitute("quot", "\"");

	setTokenCaseSensitive(true);
}


bool TEIPlain::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
  // manually process if it wasn't a simple substitution
	if (!substituteToken(buf, token)) {
		//MyUserData *u = (MyUserData *)userData;
		XMLTag tag(token);

		// <p> paragraph tag
		if (!strcmp(tag.getName(), "p")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {	// non-empty start tag
				buf += "\n";
			}
			else if (tag.isEndTag()) {	// end tag
				buf += "\n";
				userData->supressAdjacentWhitespace = true;
			}
			else {					// empty paragraph break marker
				buf += "\n\n";
				userData->supressAdjacentWhitespace = true;
			}
		}

		// <entryFree>
		else if (!strcmp(tag.getName(), "entryFree")) {
			SWBuf n = tag.getAttribute("n");
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
			        if (n != "") {
					buf += n;
					buf += ". ";
				}
			}
		}

		// <sense>
		else if (!strcmp(tag.getName(), "sense")) {
			SWBuf n = tag.getAttribute("n");
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
			        if (n != "") {
					buf += n;
					buf += ". ";
				}
			}
			else if (tag.isEndTag()) {
			                buf += "\n";
			}
		}

		// <div>
		else if (!strcmp(tag.getName(), "div")) {

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf.append("\n\n\n");
			}
			else if (tag.isEndTag()) {
			}
		}

		// <etym>
		else if (!strcmp(tag.getName(), "etym")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "[";
			}
			else if (tag.isEndTag()) {
			        buf += "]";
			}
 		}

		// <list> <item>  This implementation does not distinguish between forms of lists
		// it would be nice if a numbered list could be added
		
		else if (!strcmp(tag.getName(), "list")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {

				buf += "\n";
			}
			else if (tag.isEndTag()) {
				buf += "\n";
			}
		}
		else if (!strcmp(tag.getName(), "item")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "\t* ";
			}
			else if (tag.isEndTag()) {
				buf += "\n";
			}
		}
		else {
			return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
