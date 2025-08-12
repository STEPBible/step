/***************************************************************************
 *
 *  osiswebif.cpp -	OSIS to HTML filter with hrefs for strongs and
 *			morph tags
 * 
 * $Id: osiswebif.cpp 3648 2019-06-11 01:39:52Z scribe $
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
#include <osiswebif.h>
#include <utilxml.h>
#include <url.h>
#include <versekey.h>
#include <swmodule.h>
#include <ctype.h>


SWORD_NAMESPACE_START


OSISWEBIF::OSISWEBIF() : baseURL(""), passageStudyURL(baseURL + "passagestudy.jsp"), javascript(false) {
}


BasicFilterUserData *OSISWEBIF::createUserData(const SWModule *module, const SWKey *key) {
	MyUserData *u = (MyUserData *)OSISXHTML::createUserData(module, key);
	u->interModuleLinkStart = "<a href=\"#\" onclick=\"return im('%s', '%s');\">";
	u->interModuleLinkEnd = "</a>";
	if (module) u->fn = module->getConfigEntry("EmbeddedFootnoteMarkers");
	return u;
}

bool OSISWEBIF::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	MyUserData *u = (MyUserData *)userData;
	SWBuf scratch;
	bool sub = (u->suspendTextPassThru) ? substituteToken(scratch, token) : substituteToken(buf, token);
	if (!sub) {

		// manually process if it wasn't a simple substitution
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
//					buf.appendFormatted(" %s", val);
				}
				if ((attrib = tag.getAttribute("gloss"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
//					buf.appendFormatted(" %s", val);
				}
				if ((attrib = tag.getAttribute("lemma"))) {
					int count = tag.getAttributePartCount("lemma", ' ');
					int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
					do {
						attrib = tag.getAttribute("lemma", i, ' ');
						if (i < 0) i = 0;	// to handle our -1 condition
						val = strchr(attrib, ':');
						val = (val) ? (val + 1) : attrib;
						const char *val2 = val;
						if ((strchr("GH", *val)) && (isdigit(val[1])))
							val2++;
						if ((!strcmp(val2, "3588")) && (lastText.length() < 1))
							show = false;
						else	buf.appendFormatted(" <small><em>&lt;<a href=\"%s?showStrong=%s#cv\">%s</a>&gt;</em></small> ", passageStudyURL.c_str(), URL::encode(val2).c_str(), val2);
					} while (++i < count);
				}
				if ((attrib = tag.getAttribute("morph")) && (show)) {
					SWBuf savelemma = tag.getAttribute("savlm");
					if ((strstr(savelemma.c_str(), "3588")) && (lastText.length() < 1))
						show = false;
					if (show) {
						int count = tag.getAttributePartCount("morph", ' ');
						int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
						do {
							attrib = tag.getAttribute("morph", i, ' ');
							if (i < 0) i = 0;	// to handle our -1 condition
							val = strchr(attrib, ':');
							val = (val) ? (val + 1) : attrib;
							const char *val2 = val;
							if ((*val == 'T') && (strchr("GH", val[1])) && (isdigit(val[2])))
								val2+=2;
							buf.appendFormatted(" <small><em>(<a href=\"%s?showMorph=%s#cv\">%s</a>)</em></small> ", passageStudyURL.c_str(), URL::encode(val2).c_str(), val2);
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
                                SWBuf type = tag.getAttribute("type");
                                bool strongsMarkup = (type == "x-strongsMarkup" || type == "strongsMarkup");    // the latter is deprecated
                                if (strongsMarkup) {
                                        tag.setEmpty(false);    // handle bug in KJV2003 module where some note open tags were <note ... />
                                }                       
                                                        
				if (!tag.isEmpty()) {
					if (!strongsMarkup) {	// leave strong's markup notes out, in the future we'll probably have different option filters to turn different note types on or off
						SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
						SWBuf n = tag.getAttribute("n");
						SWBuf modName = (u->module) ? u->module->getName() : "";
						if (u->vkey) {
							char ch = ((tag.getAttribute("type") && ((!strcmp(tag.getAttribute("type"), "crossReference")) || (!strcmp(tag.getAttribute("type"), "x-cross-ref")))) ? 'x':'n');
							buf.append("<span");
							if (n.length()) buf.appendFormatted(" data-n=\"%s\"", n.c_str());
							else if (u->fn != "true") buf.appendFormatted(" data-n=\"%c\"", ch);
							buf.appendFormatted(" class=\"fn\" onclick=\"f(\'%s\',\'%s\',\'%s\');\" >%c</span>", modName.c_str(), u->key->getText(), footnoteNumber.c_str(), ch);
						}
					}
					u->suspendTextPassThru = (++u->suspendLevel);
				}
			}
			if (tag.isEndTag()) {
				u->suspendTextPassThru = (--u->suspendLevel);

			}
		}


		// handled appropriately in base class
		else {
			return OSISXHTML::handleToken(buf, token, userData);
		}
	}
	return true;
}


SWORD_NAMESPACE_END

