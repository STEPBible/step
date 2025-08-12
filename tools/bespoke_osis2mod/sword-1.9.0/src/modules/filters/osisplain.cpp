/******************************************************************************
 *
 *  osisplain.cpp -	An SWFilter that provides stripping of OSIS tags
 *
 * $Id: osisplain.cpp 3623 2019-05-19 02:47:41Z scribe $
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
#include <osisplain.h>
#include <ctype.h>
#include <versekey.h>
#include <stringmgr.h>
#include <utilxml.h>
#include <swmodule.h>

SWORD_NAMESPACE_START


namespace {

	class MyUserData : public BasicFilterUserData {
	public:
		SWBuf w;
		XMLTag tag;
		char testament;
		SWBuf hiType;
		MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {}
	};
}


OSISPlain::OSISPlain() {
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
	addTokenSubstitute("title", "\n");
	addTokenSubstitute("/title", "\n");
	addTokenSubstitute("/l", "\n");
	addTokenSubstitute("lg", "\n");
	addTokenSubstitute("/lg", "\n");

	setStageProcessing(PRECHAR);
}


BasicFilterUserData *OSISPlain::createUserData(const SWModule *module, const SWKey *key) {
	MyUserData *u = new MyUserData(module, key);
	u->testament = (u->vkey) ? u->vkey->getTestament() : 2;	// default to NT
	return u;
}


bool OSISPlain::processStage(char stage, SWBuf &text, char *&from, BasicFilterUserData *userData) {
	// this is a strip filter so we want to do this as optimized as possible.  Avoid calling
	// getUniCharFromUTF8 for slight speed improvement
		
	if (stage == PRECHAR) {
		if ((unsigned)from[0] == 0xC2 && (unsigned)from[1] == 0xAD) return true;	// skip soft hyphens
	}
	return false;
}


bool OSISPlain::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	   // manually process if it wasn't a simple substitution
	if (!substituteToken(buf, token)) {
		MyUserData *u = (MyUserData *)userData;
		if (((*token == 'w') && (token[1] == ' ')) ||
		    ((*token == '/') && (token[1] == 'w') && (!token[2]))) {
				 u->tag = token;
			
			bool start = false;
			if (*token == 'w') {
				if (token[strlen(token)-1] != '/') {
					u->w = token;
					return true;
				}
				start = true;
			}
			u->tag = (start) ? token : u->w.c_str();
			bool show = true;	// to handle unplaced article in kjv2003-- temporary till combined

			SWBuf lastText = (start) ? "stuff" : u->lastTextNode.c_str();

			const char *attrib;
			const char *val;
			if ((attrib = u->tag.getAttribute("xlit"))) {
				val = strchr(attrib, ':');
				val = (val) ? (val + 1) : attrib;
				buf.append(" <");
				buf.append(val);
				buf.append('>');
			}
			if ((attrib = u->tag.getAttribute("gloss"))) {
				buf.append(" <");
				buf.append(attrib);
				buf.append('>');
			}
			if ((attrib = u->tag.getAttribute("lemma"))) {
				int count = u->tag.getAttributePartCount("lemma", ' ');
				int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
				do {
					char gh;
					attrib = u->tag.getAttribute("lemma", i, ' ');
					if (i < 0) i = 0;	// to handle our -1 condition
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					if ((strchr("GH", *val)) && (isdigit(val[1]))) {
						gh = *val;
						val++;
					}
					else {
						gh = (u->testament>1) ? 'G' : 'H';
					}
					if ((!strcmp(val, "3588")) && (lastText.length() < 1))
						show = false;
					else	{
						buf.append(" <");
						buf.append(gh);
						buf.append(val);
						buf.append(">");
					}
				} while (++i < count);
			}
			if ((attrib = u->tag.getAttribute("morph")) && (show)) {
				int count = u->tag.getAttributePartCount("morph", ' ');
				int i = (count > 1) ? 0 : -1;		// -1 for whole value cuz it's faster, but does the same thing as 0
				do {
					attrib = u->tag.getAttribute("morph", i, ' ');
					if (i < 0) i = 0;	// to handle our -1 condition
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					if ((*val == 'T') && (strchr("GH", val[1])) && (isdigit(val[2])))
						val+=2;
					buf.append(" (");
					buf.append(val);
					buf.append(')');
				} while (++i < count);
			}
			if ((attrib = u->tag.getAttribute("POS"))) {
				val = strchr(attrib, ':');
				val = (val) ? (val + 1) : attrib;
				
				buf.append(" <");
				buf.append(val);
				buf.append('>');
			}
		}

		// <note> tag
		else if (!strncmp(token, "note", 4)) {
				if (!strstr(token, "strongsMarkup")) {	// leave strong's markup notes out, in the future we'll probably have different option filters to turn different note types on or off
					buf.append(" [");
				}
				else	u->suspendTextPassThru = true;
				if (u->module) {
					XMLTag tag = token;
					SWBuf swordFootnote = tag.getAttribute("swordFootnote");
					SWBuf footnoteBody = u->module->getEntryAttributes()["Footnote"][swordFootnote]["body"];
					buf.append(u->module->renderText(footnoteBody));
				}
			}
		else if (!strncmp(token, "/note", 5)) {
			if (!u->suspendTextPassThru)
				buf.append("] ");
			else	u->suspendTextPassThru = false;
		}

		// <p> paragraph tag
		else if (((*token == 'p') && ((token[1] == ' ') || (!token[1]))) ||
			((*token == '/') && (token[1] == 'p') && (!token[2]))) {
				userData->supressAdjacentWhitespace = true;
				buf.append('\n');
		}

		// Milestoned paragraph, created by osis2mod
		// <div type="paragraph"  sID... />
		// <div type="paragraph"  eID... />
		else if (!strcmp(u->tag.getName(), "div") && u->tag.getAttribute("type") && (!strcmp(u->tag.getAttribute("type"), "x-p") || !strcmp(u->tag.getAttribute("type"), "paragraph")) &&
			(u->tag.isEmpty() && (u->tag.getAttribute("sID") || u->tag.getAttribute("eID")))) {
				userData->supressAdjacentWhitespace = true;
				buf.append('\n');
		}

                // <lb .../>
                else if (!strncmp(token, "lb", 2)) {
			userData->supressAdjacentWhitespace = true;
			buf.append('\n');
		}
		else if (!strncmp(token, "l", 1) && strstr(token, "eID")) {
			userData->supressAdjacentWhitespace = true;
			buf.append('\n');
		}
		else if (!strncmp(token, "/divineName", 11)) {
			// Get the end portion of the string, and upper case it
			char* end = buf.getRawData();
			end += buf.size() - u->lastTextNode.size();
			toupperstr(end);
		}
		else if (!strncmp(token, "hi", 2)) {

				// handle both OSIS 'type' and TEI 'rend' attributes
				// there is no officially supported OSIS overline attribute,
				// thus either TEI overline or OSIS x-overline would be best,
				// but we have used "ol" in the past, as well.  Once a valid
				// OSIS overline attribute is made available, these should all
				// eventually be deprecated and never documented that they are supported.
				if (strstr(token, "rend=\"ol\"") || strstr(token, "rend=\"x-overline\"") || strstr(token, "rend=\"overline\"")
				   || strstr(token, "type=\"ol\"") || strstr(token, "type=\"x-overline\"") || strstr(token, "type=\"overline\"")) {
					u->hiType = "overline";
				}
				else u->hiType = "";
				u->suspendTextPassThru = true;
			}
		else if (!strncmp(token, "/hi", 3)) {
			if (u->hiType == "overline") {
				const unsigned char *b = (const unsigned char *)u->lastTextNode.c_str();
				while (*b) {
					const unsigned char *o = b;
					if (getUniCharFromUTF8(&b)) {
						while (o != b) buf.append(*(o++));
						buf.append((unsigned char)0xCC);
						buf.append((unsigned char)0x85);
					}
				}
			}
			else {
				buf.append("* ");
				buf.append(u->lastSuspendSegment);
				buf.append(" *");
			}
			u->suspendTextPassThru = false;
		}
		
		else if ((!strncmp(token, "q", 1) && (u->tag.getAttribute("marker")))) {
			buf.append(u->tag.getAttribute("marker"));
			}
		

                // <milestone type="line"/>
                else if (!strncmp(token, "milestone", 9)) {
			const char* type = strstr(token+10, "type=\"");
			if (type && strncmp(type+6, "line", 4)) { //we check for type != line
				userData->supressAdjacentWhitespace = true;
        			buf.append('\n');
			}
			if (u->tag.getAttribute("marker")) {
				buf.append(u->tag.getAttribute("marker"));
			}
                }

		else {
			return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
