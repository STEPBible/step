/***************************************************************************
 *
 *  thmlrtf.cpp -	ThML to RTF filter
 *
 * $Id: thmlrtf.cpp 3547 2017-12-10 05:06:48Z scribe $
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
#include <thmlrtf.h>
#include <swmodule.h>
#include <utilxml.h>
#include <utilstr.h>
#include <versekey.h>

SWORD_NAMESPACE_START

ThMLRTF::ThMLRTF() {
	setTokenStart("<");
	setTokenEnd(">");

	setEscapeStart("&");
	setEscapeEnd(";");

	setEscapeStringCaseSensitive(true);

     addEscapeStringSubstitute("nbsp", "\302\240");
	addEscapeStringSubstitute("apos", "'");
	addEscapeStringSubstitute("quot", "\"");
	addEscapeStringSubstitute("amp", "&");
	addEscapeStringSubstitute("lt", "<");
	addEscapeStringSubstitute("gt", ">");
	addEscapeStringSubstitute("brvbar", "�");
	addEscapeStringSubstitute("sect", "�");
	addEscapeStringSubstitute("copy", "�");
	addEscapeStringSubstitute("laquo", "�");
	addEscapeStringSubstitute("reg", "�");
	addEscapeStringSubstitute("acute", "�");
	addEscapeStringSubstitute("para", "�");
	addEscapeStringSubstitute("raquo", "�");

	addEscapeStringSubstitute("Aacute", "�");
	addEscapeStringSubstitute("Agrave", "�");
	addEscapeStringSubstitute("Acirc", "�");
	addEscapeStringSubstitute("Auml", "�");
	addEscapeStringSubstitute("Atilde", "�");
	addEscapeStringSubstitute("Aring", "�");
	addEscapeStringSubstitute("aacute", "�");
	addEscapeStringSubstitute("agrave", "�");
	addEscapeStringSubstitute("acirc", "�");
	addEscapeStringSubstitute("auml", "�");
	addEscapeStringSubstitute("atilde", "�");
	addEscapeStringSubstitute("aring", "�");
	addEscapeStringSubstitute("Eacute", "�");
	addEscapeStringSubstitute("Egrave", "�");
	addEscapeStringSubstitute("Ecirc", "�");
	addEscapeStringSubstitute("Euml", "�");
	addEscapeStringSubstitute("eacute", "�");
	addEscapeStringSubstitute("egrave", "�");
	addEscapeStringSubstitute("ecirc", "�");
	addEscapeStringSubstitute("euml", "�");
	addEscapeStringSubstitute("Iacute", "�");
	addEscapeStringSubstitute("Igrave", "�");
	addEscapeStringSubstitute("Icirc", "�");
	addEscapeStringSubstitute("Iuml", "�");
	addEscapeStringSubstitute("iacute", "�");
	addEscapeStringSubstitute("igrave", "�");
	addEscapeStringSubstitute("icirc", "�");
	addEscapeStringSubstitute("iuml", "�");
	addEscapeStringSubstitute("Oacute", "�");
	addEscapeStringSubstitute("Ograve", "�");
	addEscapeStringSubstitute("Ocirc", "�");
	addEscapeStringSubstitute("Ouml", "�");
	addEscapeStringSubstitute("Otilde", "�");
	addEscapeStringSubstitute("oacute", "�");
	addEscapeStringSubstitute("ograve", "�");
	addEscapeStringSubstitute("ocirc", "�");
	addEscapeStringSubstitute("ouml", "�");
	addEscapeStringSubstitute("otilde", "�");
	addEscapeStringSubstitute("Uacute", "�");
	addEscapeStringSubstitute("Ugrave", "�");
	addEscapeStringSubstitute("Ucirc", "�");
	addEscapeStringSubstitute("Uuml", "�");
	addEscapeStringSubstitute("uacute", "�");
	addEscapeStringSubstitute("ugrave", "�");
	addEscapeStringSubstitute("ucirc", "�");
	addEscapeStringSubstitute("uuml", "�");
	addEscapeStringSubstitute("Yacute", "�");
	addEscapeStringSubstitute("yacute", "�");
	addEscapeStringSubstitute("yuml", "�");

	addEscapeStringSubstitute("deg", "�");
	addEscapeStringSubstitute("plusmn", "�");
	addEscapeStringSubstitute("sup2", "�");
	addEscapeStringSubstitute("sup3", "�");
	addEscapeStringSubstitute("sup1", "�");
	addEscapeStringSubstitute("nbsp", "�");
	addEscapeStringSubstitute("pound", "�");
	addEscapeStringSubstitute("cent", "�");
	addEscapeStringSubstitute("frac14", "�");
	addEscapeStringSubstitute("frac12", "�");
	addEscapeStringSubstitute("frac34", "�");
	addEscapeStringSubstitute("iquest", "�");
	addEscapeStringSubstitute("iexcl", "�");
	addEscapeStringSubstitute("ETH", "�");
	addEscapeStringSubstitute("eth", "�");
	addEscapeStringSubstitute("THORN", "�");
	addEscapeStringSubstitute("thorn", "�");
	addEscapeStringSubstitute("AElig", "�");
	addEscapeStringSubstitute("aelig", "�");
	addEscapeStringSubstitute("Oslash", "�");
	addEscapeStringSubstitute("curren", "�");
	addEscapeStringSubstitute("Ccedil", "�");
	addEscapeStringSubstitute("ccedil", "�");
	addEscapeStringSubstitute("szlig", "�");
	addEscapeStringSubstitute("Ntilde", "�");
	addEscapeStringSubstitute("ntilde", "�");
	addEscapeStringSubstitute("yen", "�");
	addEscapeStringSubstitute("not", "�");
	addEscapeStringSubstitute("ordf", "�");
	addEscapeStringSubstitute("uml", "�");
	addEscapeStringSubstitute("shy", "�");
	addEscapeStringSubstitute("macr", "�");

	addEscapeStringSubstitute("micro",  "�");
	addEscapeStringSubstitute("middot", "�");
	addEscapeStringSubstitute("cedil",  "�");
	addEscapeStringSubstitute("ordm",   "�");
	addEscapeStringSubstitute("times",  "�");
	addEscapeStringSubstitute("divide", "�");
	addEscapeStringSubstitute("oslash", "�");

	setTokenCaseSensitive(true);


	addTokenSubstitute("br", "\\line ");
	addTokenSubstitute("br /", "\\line ");
	addTokenSubstitute("i", "{\\i1 ");
	addTokenSubstitute("/i", "}");
	addTokenSubstitute("b", "{\\b1 ");
	addTokenSubstitute("/b", "}");
	addTokenSubstitute("p", "{\\fi200\\par}");
	addTokenSubstitute("p /", "\\pard\\par\\par ");

	//we need uppercase forms for the moment to support a few early ThML modules that aren't XHTML compliant
	addTokenSubstitute("BR", "\\line ");
	addTokenSubstitute("I", "{\\i1 ");
	addTokenSubstitute("/I", "}");
	addTokenSubstitute("B", "{\\b1 ");
	addTokenSubstitute("/B", "}");
	addTokenSubstitute("P", "\\par ");
	addTokenSubstitute("scripture", "{\\i1 ");
	addTokenSubstitute("/scripture", "}");
     addTokenSubstitute("center", "\\qc ");
     addTokenSubstitute("/center", "\\pard ");
}


char ThMLRTF::processText(SWBuf &text, const SWKey *key, const SWModule *module) {

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


ThMLRTF::MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
	isBiblicalText = false;
	inSecHead = false;
	XMLTag startTag = "";
	if (module) {
		version = module->getName();
		isBiblicalText = (!strcmp(module->getType(), "Biblical Texts"));
	}	
}


bool ThMLRTF::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	if (!substituteToken(buf, token)) { // manually process if it wasn't a simple substitution
		MyUserData *u = (MyUserData *)userData;		
		XMLTag tag(token);
		if ((!tag.isEndTag()) && (!tag.isEmpty()))
			u->startTag = tag;
		if (tag.getName() && !strcmp(tag.getName(), "sync")) {
			SWBuf value = tag.getAttribute("value");
			if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "morph")) { //&gt;
				buf.appendFormatted(" {\\cf4 \\sub (%s)}", value.c_str());
			}
			else if( tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "Strongs")) {
				if (value[0] == 'H' || value[0] == 'G' || value[0] == 'A') {
					value<<1;
					buf.appendFormatted(" {\\cf3 \\sub <%s>}", value.c_str());
				}
				else if (value[0] == 'T') {
					value<<1;
					buf.appendFormatted(" {\\cf4 \\sub (%s)}", value.c_str());
				}
			}
			else if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "Dict")) {
				if (!tag.isEndTag())
					buf += "{\\b ";
				else	buf += "}";
			}
		}
		// <note> tag
		else if (!strcmp(tag.getName(), "note")) {
			if (!tag.isEndTag()) {
				if (!tag.isEmpty()) {
					SWBuf type = tag.getAttribute("type");
					SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
					if (u->vkey) {
						// leave this special osis type in for crossReference notes types?  Might thml use this some day? Doesn't hurt.
						char ch = ((tag.getAttribute("type") && ((!strcmp(tag.getAttribute("type"), "crossReference")) || (!strcmp(tag.getAttribute("type"), "x-cross-ref")))) ? 'x':'n');
						buf.appendFormatted("{\\super <a href=\"\">*%c%i.%s</a>} ", ch, u->vkey->getVerse(), footnoteNumber.c_str());
					}
					u->suspendTextPassThru = true;
				}
			}
			if (tag.isEndTag()) {
				u->suspendTextPassThru = false;
			}
		}


		else if (!strcmp(tag.getName(), "scripRef")) {
			if (!tag.isEndTag()) {
				if (!tag.isEmpty()) {
					u->suspendTextPassThru = true;
				}
			}
			if (tag.isEndTag()) {	//	</scripRef>
				if (!u->isBiblicalText) {
					SWBuf refList = u->startTag.getAttribute("passage");
					if (!refList.length())
						refList = u->lastTextNode;
					SWBuf version = tag.getAttribute("version");
					buf += "<a href=\"\">";
					buf += refList.c_str();
//					buf += u->lastTextNode.c_str();
					buf += "</a>";
				}
				else {
					SWBuf footnoteNumber = u->startTag.getAttribute("swordFootnote");
					if (u->vkey) {
						// leave this special osis type in for crossReference notes types?  Might thml use this some day? Doesn't hurt.
						buf.appendFormatted("{\\super <a href=\"\">*x%i.%s</a>} ", u->vkey->getVerse(), footnoteNumber.c_str());
					}
				}

				// let's let text resume to output again
				u->suspendTextPassThru = false;
			}
		}

		else if (tag.getName() && !strcmp(tag.getName(), "div")) {
			if (tag.isEndTag() && u->inSecHead) {
				buf += "\\par}";
				u->inSecHead = false;
			}
			else if (tag.getAttribute("class")) {
				if (!stricmp(tag.getAttribute("class"), "sechead")) {
					u->inSecHead = true;
					buf += "{\\par\\i1\\b1 ";
				}
				else if (!stricmp(tag.getAttribute("class"), "title")) {
					u->inSecHead = true;
					buf += "{\\par\\i1\\b1 ";
				}
			}
		}
		else if (tag.getName() && (!strcmp(tag.getName(), "img") || !strcmp(tag.getName(), "image"))) {
			const char *src = tag.getAttribute("src");
			if (!src)		// assert we have a src attribute
				return false;

			char* filepath = new char[strlen(u->module->getConfigEntry("AbsoluteDataPath")) + strlen(token)];
			*filepath = 0;
			strcpy(filepath, userData->module->getConfigEntry("AbsoluteDataPath"));
			strcat(filepath, src);

// we do this because BibleCS looks for this EXACT format for an image tag
			buf+="<img src=\"";
			buf+=filepath;
			buf+="\" />";
			delete [] filepath;
		}
		else {
			return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
