/***************************************************************************
 *
 *  osisrtf.cpp -	OSIS to RTF filter
 *
 * $Id: osisrtf.cpp 3547 2017-12-10 05:06:48Z scribe $ *
 *
 * Copyright 2003-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <ctype.h>
#include <osisrtf.h>
#include <utilxml.h>
#include <utilstr.h>
#include <versekey.h>
#include <swmodule.h>
#include <stringmgr.h>
#include <stack>

SWORD_NAMESPACE_START

namespace {
	class MyUserData : public BasicFilterUserData {
	public:
		bool osisQToTick;
		bool isBiblicalText;
		bool inXRefNote;
		int suspendLevel;
		std::stack<char *> quoteStack;
		SWBuf w;
		SWBuf version;
		MyUserData(const SWModule *module, const SWKey *key);
		~MyUserData();
	};


	MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
		inXRefNote    = false;
		isBiblicalText  = false;
		suspendLevel  = 0;
		osisQToTick = true;  // default
		if (module) {
			version = module->getName();
			isBiblicalText = (!strcmp(module->getType(), "Biblical Texts"));
			osisQToTick = ((!module->getConfigEntry("OSISqToTick")) || (strcmp(module->getConfigEntry("OSISqToTick"), "false")));
		}	
	}


	MyUserData::~MyUserData() {
		// Just in case the quotes are not well formed
		while (!quoteStack.empty()) {
			char *tagData = quoteStack.top();
			quoteStack.pop();
			delete [] tagData;
		}
	}

	static inline void outText(const char *t, SWBuf &o, BasicFilterUserData *u) { if (!u->suspendTextPassThru) o += t; else u->lastSuspendSegment += t; }
	static inline void outText(char t, SWBuf &o, BasicFilterUserData *u) { if (!u->suspendTextPassThru) o += t; else u->lastSuspendSegment += t; }

}


OSISRTF::OSISRTF() {
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
	//	addTokenSubstitute("lg", "{\\par}");
	//	addTokenSubstitute("/lg", "{\\par}");

	setTokenCaseSensitive(true);
}


BasicFilterUserData *OSISRTF::createUserData(const SWModule *module, const SWKey *key) {
	return new MyUserData(module, key);
}


char OSISRTF::processText(SWBuf &text, const SWKey *key, const SWModule *module) {

	// preprocess text buffer to escape RTF control codes
	const char *from;
	SWBuf orig = text;
	from = orig.c_str();
	for (text = ""; *from; from++) {  //loop to remove extra spaces
		switch (*from) {
		case '{':
		case '}':
		case '\\':
			text += "\\";
			text += *from;
			break;
		default:
			text += *from;
		}
	}
	text += (char)0;

	SWBasicFilter::processText(text, key, module);  //handle tokens as usual

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
	text += (char)0;	// probably not needed, but don't want to remove without investigating (same as above)
	return 0;
}


bool OSISRTF::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
  // manually process if it wasn't a simple substitution
	MyUserData *u = (MyUserData *)userData;
	SWBuf scratch;
	bool sub = (u->suspendTextPassThru) ? substituteToken(scratch, token) : substituteToken(buf, token);
	if (!sub) {
		XMLTag tag(token);

		// <w> tag
		if (!strcmp(tag.getName(), "w")) {

			// start <w> tag
			if ((!tag.isEmpty()) && (!tag.isEndTag())) {
				outText('{', buf, u);
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
					scratch.setFormatted(" {\\fs15 <%s>}", val);
					outText(scratch.c_str(), buf, u);
				}
				if ((attrib = tag.getAttribute("gloss"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					scratch.setFormatted(" {\\fs15 <%s>}", val);
					outText(scratch.c_str(), buf, u);
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
						else	{
							scratch.setFormatted(" {\\cf3 \\sub <%s>}", val2);
							outText(scratch.c_str(), buf, u);
						}
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
							scratch.setFormatted(" {\\cf4 \\sub (%s)}", val2);
							outText(scratch.c_str(), buf, u);
						} while (++i < count);
					}
				}
				if ((attrib = tag.getAttribute("POS"))) {
					val = strchr(attrib, ':');
					val = (val) ? (val + 1) : attrib;
					scratch.setFormatted(" {\\fs15 <%s>}", val);
					outText(scratch.c_str(), buf, u);
				}               

				if (endTag)
					outText('}', buf, u);
			}
		}

		// <note> tag
		else if (!strcmp(tag.getName(), "note")) {
			if (!tag.isEndTag()) {
				if (!tag.isEmpty()) {
					SWBuf type = tag.getAttribute("type");

					if ((type != "x-strongsMarkup")			// leave strong's markup notes out, in the future we'll probably have different option filters to turn different note types on or off
							&& (type != "strongsMarkup")	// deprecated
							) {
						SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
						if (u->vkey) {
							char ch = ((!strcmp(type.c_str(), "crossReference")) || (!strcmp(type.c_str(), "x-cross-ref"))) ? 'x':'n';
							scratch.setFormatted("{\\super <a href=\"\">*%c%i.%s</a>} ", ch, u->vkey->getVerse(), footnoteNumber.c_str());
							outText(scratch.c_str(), buf, u);
							u->inXRefNote = (ch == 'x');
						}
					}
					u->suspendTextPassThru = (++u->suspendLevel);
				}
			}
			if (tag.isEndTag()) {
				u->suspendTextPassThru = (--u->suspendLevel);
				u->inXRefNote = false;
			}
		}

		// <p> paragraph and <lg> linegroup tags
		else if (!strcmp(tag.getName(), "p") || !strcmp(tag.getName(), "lg")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {	// non-empty start tag
				outText("{\\fi200\\par}", buf, u);
			}
			else if (tag.isEndTag()) {	// end tag
				outText("{\\par}", buf, u);
				userData->supressAdjacentWhitespace = true;
			}
			else {					// empty paragraph break marker
				outText("{\\pard\\par}", buf, u);
				userData->supressAdjacentWhitespace = true;
			}
		}

		// Milestoned paragraphs, created by osis2mod
		// <div type="paragraph" sID.../>
		// <div type="paragraph" eID.../>
		else if (tag.isEmpty() && !strcmp(tag.getName(), "div") && tag.getAttribute("type") && (!strcmp(tag.getAttribute("type"), "x-p") || !strcmp(tag.getAttribute("type"), "paragraph"))) {
			// <div type="paragraph"  sID... />
			if (tag.getAttribute("sID")) {	// non-empty start tag
				outText("{\\fi200\\par}", buf, u);
			}
			// <div type="paragraph"  eID... />
			else if (tag.getAttribute("eID")) {
				outText("{\\par}", buf, u);
				userData->supressAdjacentWhitespace = true;
			}
		}

		// <reference> tag
		else if (!strcmp(tag.getName(), "reference")) {
			if (!u->inXRefNote) {	// only show these if we're not in an xref note
				if ((!tag.isEndTag()) && (!tag.isEmpty())) {
					outText("{<a href=\"\">", buf, u);
				}
				else if (tag.isEndTag()) {
					outText("</a>}", buf, u);
				}
			}
		}

		// <l> poetry
		else if (!strcmp(tag.getName(), "l")) {
			// end line marker
			if (tag.getAttribute("eID")) {
				outText("{\\par}", buf, u);
			}
			// <l/> without eID or sID
			// Note: this is improper osis. This should be <lb/>
			else if (tag.isEmpty() && !tag.getAttribute("sID")) {
				outText("{\\par}", buf, u);
			}
			// end of the line
			else if (tag.isEndTag()) {
				outText("{\\par}", buf, u);
			}
		}

		// <milestone type="line"/> or <lb.../>
		else if ((!strcmp(tag.getName(), "lb") && (!tag.getAttribute("type") || strcmp(tag.getAttribute("type"), "x-optional"))) || ((!strcmp(tag.getName(), "milestone")) && (tag.getAttribute("type")) && (!strcmp(tag.getAttribute("type"), "line")))) {
			outText("{\\par}", buf, u);
			userData->supressAdjacentWhitespace = true;
		}

		// <title>
		else if (!strcmp(tag.getName(), "title")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				outText("{\\par\\i1\\b1 ", buf, u);
			}
			else if (tag.isEndTag()) {
				outText("\\par}", buf, u);
			}
		}
		// <list>	 - how do we support these better in RTF?
		else if (!strcmp(tag.getName(), "list")) {
			if((!tag.isEndTag()) && (!tag.isEmpty())) {
				outText("\\par\\pard", buf, u);
			}
			else if (tag.isEndTag()) {
				outText("\\par\\pard", buf, u);
			}
		}

		// <item> - support better
		else if (!strcmp(tag.getName(), "item")) {
			if((!tag.isEndTag()) && (!tag.isEmpty())) {
				outText("* ", buf, u);
			}
			else if (tag.isEndTag()) {
				outText("\\par", buf, u);
			}
		}

		// <catchWord> & <rdg> tags (italicize)
		else if (!strcmp(tag.getName(), "rdg") || !strcmp(tag.getName(), "catchWord")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				outText("{\\i1 ", buf, u);
			}
			else if (tag.isEndTag()) {
				outText('}', buf, u);
			}
		}

		// <hi>
		else if (!strcmp(tag.getName(), "hi")) {
			SWBuf type = tag.getAttribute("type");
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				if (type == "bold" || type == "b" || type == "x-b")
					outText("{\\b1 ", buf, u);
				else	// all other types
					outText("{\\i1 ", buf, u);
			}
			else if (tag.isEndTag()) {
				outText('}', buf, u);
			}
		}

		// <q> quote
		// Rules for a quote element:
		// If the tag is empty with an sID or an eID then use whatever it specifies for quoting.
		//    Note: empty elements without sID or eID are ignored.
		// If the tag is <q> then use it's specifications and push it onto a stack for </q>
		// If the tag is </q> then use the pushed <q> for specification
		// If there is a marker attribute, possibly empty, this overrides osisQToTick.
		// If osisQToTick, then output the marker, using level to determine the type of mark.
		else if (!strcmp(tag.getName(), "q")) {
			SWBuf type      = tag.getAttribute("type");
			SWBuf who       = tag.getAttribute("who");
			const char *tmp = tag.getAttribute("level");
			int level       = (tmp) ? atoi(tmp) : 1;
			tmp             = tag.getAttribute("marker");
			bool hasMark    = tmp;
			SWBuf mark      = tmp;

			// open <q> or <q sID... />
			if ((!tag.isEmpty() && !tag.isEndTag()) || (tag.isEmpty() && tag.getAttribute("sID"))) {
				// if <q> then remember it for the </q>
				if (!tag.isEmpty()) {
					char *tagData = 0;
					stdstr(&tagData, tag.toString());
					u->quoteStack.push(tagData);
				}

				// Do this first so quote marks are included as WoC
				if (who == "Jesus")
					outText("\\cf6 ", buf, u);

				// first check to see if we've been given an explicit mark
				if (hasMark)
					outText(mark, buf, u);
				//alternate " and '
				else if (u->osisQToTick)
					outText((level % 2) ? '\"' : '\'', buf, u);
			}
			// close </q> or <q eID... />
			else if ((tag.isEndTag()) || (tag.getAttribute("eID"))) {
				// if it is </q> then pop the stack for the attributes
				if (tag.isEndTag() && !u->quoteStack.empty()) {
					char *tagData  = u->quoteStack.top();
					u->quoteStack.pop();
					XMLTag qTag(tagData);
					delete [] tagData;

					type    = qTag.getAttribute("type");
					who     = qTag.getAttribute("who");
					tmp     = qTag.getAttribute("level");
					level   = (tmp) ? atoi(tmp) : 1;
					tmp     = qTag.getAttribute("marker");
					hasMark = tmp;
					mark    = tmp;
				}

				// first check to see if we've been given an explicit mark
				if (hasMark)
					outText(mark, buf, u);
				// finally, alternate " and ', if config says we should supply a mark
				else if (u->osisQToTick)
					outText((level % 2) ? '\"' : '\'', buf, u);

				// Do this last so quote marks are included as WoC
				if (who == "Jesus")
					outText("\\cf0 ", buf, u);
			}
		}


		// <milestone type="cQuote" marker="x"/>
		else if (!strcmp(tag.getName(), "milestone") && tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "cQuote")) {
			const char *tmp = tag.getAttribute("marker");
			bool hasMark    = tmp;
			SWBuf mark      = tmp;
			tmp             = tag.getAttribute("level");
			int level       = (tmp) ? atoi(tmp) : 1;

			// first check to see if we've been given an explicit mark
			if (hasMark)
				outText(mark, buf, u);
			// finally, alternate " and ', if config says we should supply a mark
			else if (u->osisQToTick)
				outText((level % 2) ? '\"' : '\'', buf, u);
		}

		// <transChange>
		else if (!strcmp(tag.getName(), "transChange")) {
			SWBuf type = tag.getAttribute("type");

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {

// just do all transChange tags this way for now
//				if (type == "supplied")
					outText("{\\i1 ", buf, u);
			}
			else if (tag.isEndTag()) {
				outText('}', buf, u);
			}
		}

		// <divineName>
		else if (!strcmp(tag.getName(), "divineName")) {

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
 				outText("{\\scaps ", buf, u);
			}
			else if (tag.isEndTag()) {
				outText("}", buf, u);
			}
		}

		// <div>
		else if (!strcmp(tag.getName(), "div")) {

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				outText("\\pard ", buf, u);
			}
			else if (tag.isEndTag()) {
	                        outText("\\par ", buf, u);
                        }
		}

		// image
		else if (!strcmp(tag.getName(), "figure")) {
			const char *src = tag.getAttribute("src");
			if (!src)		// assert we have a src attribute
				return false;

			char* filepath = new char[strlen(u->module->getConfigEntry("AbsoluteDataPath")) + strlen(token)];
			*filepath = 0;
			strcpy(filepath, userData->module->getConfigEntry("AbsoluteDataPath"));
			strcat(filepath, src);

// we do this because BibleCS looks for this EXACT format for an image tag
			outText("<img src=\"", buf, u);
			outText(filepath, buf, u);
			outText("\" />", buf, u);
/*
			char imgc;
			for (c = filepath + strlen(filepath); c > filepath && *c != '.'; c--);
			c++;
			FILE* imgfile;
				    if (stricmp(c, "jpg") || stricmp(c, "jpeg")) {
						  imgfile = fopen(filepath, "r");
						  if (imgfile != NULL) {
								outText("{\\nonshppict {\\pict\\jpegblip ", buf, u);
								while (feof(imgfile) != EOF) {
									   scratch.setFormatted("%2x", fgetc(imgfile));
							   		   outText(scratch.c_str(), buf, u);
									   
								}
								fclose(imgfile);
								outText("}}", buf, u);
						  }
				    }
				    else if (stricmp(c, "png")) {
						  outText("{\\*\\shppict {\\pict\\pngblip ", buf, u);

						  outText("}}", buf, u);
				    }
*/
			delete [] filepath;
		}
		else {
			return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
