/***************************************************************************
 *
 *  osiscgi.cpp -	OSISCGI: OSIS to Diatheke/CGI format filter
 *
 * $Id: osiscgi.cpp 3808 2020-10-02 13:23:34Z scribe $
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
#include "osiscgi.h"
#include <utilxml.h>
#include <versekey.h>
#include <swmodule.h>
#include <ctype.h>

SWORD_NAMESPACE_START


OSISCGI::MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
	osisQToTick = ((!module->getConfigEntry("OSISqToTick")) || (strcmp(module->getConfigEntry("OSISqToTick"), "false")));
}


OSISCGI::OSISCGI() {
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
	addTokenSubstitute("lg", "<br />");
	addTokenSubstitute("/lg", "<br />");

	setTokenCaseSensitive(true);
}


bool OSISCGI::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
  // manually process if it wasn't a simple substitution
	if (!substituteToken(buf, token)) {
		MyUserData *u = (MyUserData *)userData;
		XMLTag tag(token);

		// <w> tag
		if (!strcmp(tag.getName(), "w")) {

			// start <w> tag
			if ((!tag.isEmpty()) && (!tag.isEndTag())) {
				u->w = token;
			}

			// end or empty <w> tag
			else {
				bool endTag = tag.isEndTag();
				SWBuf lastText;
				bool show = true;	// to handle unplaced article in kjv2003-- temporary till combined

				if (endTag) {
					tag = u->w.c_str();
					lastText = u->lastTextNode.c_str();
				}
				else lastText = "stuff";

				const char *attrib;
				const char *val;
				if ((attrib = tag.getAttribute("xlit"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					buf.appendFormatted(" %s", val);
				}
				if ((attrib = tag.getAttribute("gloss"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					buf.appendFormatted(" %s", val);
				}
				if ((attrib = tag.getAttribute("lemma"))) {
					int count = tag.getAttributePartCount("lemma");
					int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
					do {
						attrib = tag.getAttribute("lemma", i);
						if (i < 0) i = 0;	// to handle our -1 condition
						val = strchr(attrib, ':');
						val = (val) ? (val + 1) : attrib;
						const char *val2 = val;
						if ((strchr("GH", *val)) && (isdigit(val[1])))
							val2++;
						if ((!strcmp(val2, "3588")) && (lastText.length() < 1))
							show = false;
						else {
						  if (!strchr("G", *val)) {
						        buf.appendFormatted(" <small><em>&lt;<a href=\"!DIATHEKE_URL!StrongsGreek=on&verse=%s\">%s</a>&gt;</em></small> ", val2, val);
						  }
						  else {
						        buf.appendFormatted(" <small><em>&lt;<a href=\"!DIATHEKE_URL!StrongsHebrew=on&verse=%s\">%s</a>&gt;</em></small> ", val2, val);
						  }
						}
					} while (++i < count);
				}
				if ((attrib = tag.getAttribute("morph")) && (show)) {
					SWBuf savelemma = tag.getAttribute("savlm");
					if ((strstr(savelemma.c_str(), "3588")) && (lastText.length() < 1))
						show = false;
					if (show) {
						int count = tag.getAttributePartCount("morph");
						int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
						do {
							attrib = tag.getAttribute("morph", i);
							if (i < 0) i = 0;	// to handle our -1 condition
							val = strchr(attrib, ':');
							val = (val) ? (val + 1) : attrib;
							const char *val2 = val;
							if ((*val == 'T') && (strchr("GH", val[1])) && (isdigit(val[2])))
								val2+=2;
							if (!strchr("G", *val)) {
							  buf.appendFormatted(" <small><em>(;<a href=\"!DIATHEKE_URL!StrongsGreek=on&verse=%s\">%s</a>)</em></small> ", val+1, tag.getAttribute("morph"));
							}
							else if (!strchr("H", *val)) {
							  buf.appendFormatted(" <small><em>(<a href=\"!DIATHEKE_URL!StrongsHebrew=on&verse=%s\">%s</a>)</em></small> ", val+1, tag.getAttribute("morph"));
							}
							else {
							  buf.appendFormatted(" <small><em>(<a href=\"!DIATHEKE_URL!Packard=on&verse=%s\">%s</a>)</em></small> ", val, tag.getAttribute("morph"));
							}
						} while (++i < count);
					}
				}
				if ((attrib = tag.getAttribute("POS"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					buf.appendFormatted(" %s", val);
				}

				/*if (endTag)
					buf += "}";*/
			}
		}

		// <note> tag
		else if (!strcmp(tag.getName(), "note")) {
			if (!tag.isEndTag()) {
				if (!tag.isEmpty()) {
					SWBuf type = tag.getAttribute("type");

					if (type != "x-strongsMarkup" &&	// leave strong's markup notes out, in the future we'll probably have different option filters to turn different note types on or off
					    type != "strongsMarkup") {	// deprecated
						SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
						const VerseKey *vkey = NULL;
						// see if we have a VerseKey * or descendant
						SWTRY {
							vkey = SWDYNAMIC_CAST(const VerseKey, u->key);
						}
						SWCATCH ( ... ) {	}
						if (vkey) {
							char ch = ((tag.getAttribute("type") && (!strcmp(tag.getAttribute("type"), "crossReference"))) ? 'x':'n');
							buf.appendFormatted("<a href=\"noteID=%s.%c.%s\"><small><sup>*%c</sup></small></a> ", vkey->getText(), ch, footnoteNumber.c_str(), ch);
						}
					}
					u->suspendTextPassThru = true;
				}
			}
			if (tag.isEndTag()) {
				u->suspendTextPassThru = false;
			}
		}

		// <p> paragraph tag
		else if (!strcmp(tag.getName(), "p")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {	// non-empty start tag
				buf += "<p><br />";
			}
			else if (tag.isEndTag()) {	// end tag
				buf += "</p><br />";
				userData->supressAdjacentWhitespace = true;
			}
			else {					// empty paragraph break marker
				buf += "<p><br />";
				userData->supressAdjacentWhitespace = true;
			}
		}

		// <reference> tag
		else if (!strcmp(tag.getName(), "reference")) {
		        const char *attrib;
		        const char *val;

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
			        buf += "<a href=\"!DIATHEKE_URL!verse=";
				if ((attrib = tag.getAttribute("osisRef"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					buf.appendFormatted("%s", val);
				}
				buf += "\">";
			}
			else if (tag.isEndTag()) {
				buf += "</a>";
			}
		}

		// <l> poetry, etc
		else if (!strcmp(tag.getName(), "l")) {
			if (tag.isEmpty()) {
				buf += "<br />";
			}
			else if (tag.isEndTag()) {
				buf += "<br />";
			}
			else if (tag.getAttribute("sID")) {	// empty line marker
				buf += "<br />";
			}
		}

		// <milestone type="line"/> or <lb.../>
		else if ((!strcmp(tag.getName(), "lb")) || ((!strcmp(tag.getName(), "milestone")) && (tag.getAttribute("type")) && (!strcmp(tag.getAttribute("type"), "line")))) {
			buf += "<br />";
			userData->supressAdjacentWhitespace = true;
		}

		// <title>
		else if (!strcmp(tag.getName(), "title")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<b>";
			}
			else if (tag.isEndTag()) {
				buf += "</b><br />";
			}
		}

		// <hi> hi?  hi contrast?
		else if (!strcmp(tag.getName(), "hi")) {
			SWBuf type = tag.getAttribute("type");
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				if (type == "bold" || type == "x-b") {
					buf += "<b> ";
					u->inBold = true;
				}
				else {	// all other types
					buf += "<i> ";
					u->inBold = false;
				}
			}
			else if (tag.isEndTag()) {
				if(u->inBold) {
					buf += "</b>";
					u->inBold = false;
				}
				else
				      buf += "</i>";
			}
			else {	// empty hi marker
				// what to do?  is this even valid?
			}
		}

		// <q> quote
		else if (!strcmp(tag.getName(), "q")) {
			SWBuf type = tag.getAttribute("type");
			SWBuf who = tag.getAttribute("who");
			const char *lev = tag.getAttribute("level");
			int level = (lev) ? atoi(lev) : 1;
			
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				/*buf += "{";*/

				//alternate " and '
				if (u->osisQToTick)
					buf += (level % 2) ? '\"' : '\'';
				
				if (who == "Jesus") {
					buf += "<font color=\"red\"> ";
				}
			}
			else if (tag.isEndTag()) {
				//alternate " and '
				if (u->osisQToTick)
					buf += (level % 2) ? '\"' : '\'';
				//buf += "</font>";
			}
			else {	// empty quote marker
				//alternate " and '
				if (u->osisQToTick)
					buf += (level % 2) ? '\"' : '\'';
			}
		}

		// <transChange>
		else if (!strcmp(tag.getName(), "transChange")) {
			SWBuf type = tag.getAttribute("type");
			
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {

// just do all transChange tags this way for now
//				if (type == "supplied")
					buf += "<i>";
			}
			else if (tag.isEndTag()) {
				buf += "</i>";
			}
			else {	// empty transChange marker?
			}
		}

		else {
		      return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
