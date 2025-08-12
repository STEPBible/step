/******************************************************************************
 *
 *  thmlxhtml.cpp -	ThML to classed XHTML
 *
 * $Id: thmlxhtml.cpp 3726 2020-04-26 17:53:51Z scribe $
 *
 * Copyright 2011-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <thmlxhtml.h>
#include <swmodule.h>
#include <utilxml.h>
#include <utilstr.h>
#include <versekey.h>
#include <url.h>

SWORD_NAMESPACE_START
 

const char *ThMLXHTML::getHeader() const {
	return "\
	";
}


ThMLXHTML::MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
	isBiblicalText = false;
	secHeadLevel = 0;
	if (module) {
		version = module->getName();
		isBiblicalText = (!strcmp(module->getType(), "Biblical Texts"));
	}	
}


ThMLXHTML::ThMLXHTML() {
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
	addAllowedEscapeString("brvbar"); // "Š"
	addAllowedEscapeString("sect");   // "§"
	addAllowedEscapeString("copy");   // "©"
	addAllowedEscapeString("laquo");  // "«"
	addAllowedEscapeString("reg");    // "®"
	addAllowedEscapeString("acute");  // "Ž"
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
	addAllowedEscapeString("frac14"); // "Œ"
	addAllowedEscapeString("frac12"); // "œ"
	addAllowedEscapeString("frac34"); // "Ÿ"
	addAllowedEscapeString("iquest"); // "¿"
	addAllowedEscapeString("iexcl");  // "¡"
	addAllowedEscapeString("ETH");    // "Ð"
	addAllowedEscapeString("eth");    // "ð"
	addAllowedEscapeString("THORN");  // "Þ"
	addAllowedEscapeString("thorn");  // "þ"
	addAllowedEscapeString("AElig");  // "Æ"
	addAllowedEscapeString("aelig");  // "æ"
	addAllowedEscapeString("Oslash"); // "Ø"
	addAllowedEscapeString("curren"); // "€"
	addAllowedEscapeString("Ccedil"); // "Ç"
	addAllowedEscapeString("ccedil"); // "ç"
	addAllowedEscapeString("szlig");  // "ß"
	addAllowedEscapeString("Ntilde"); // "Ñ"
	addAllowedEscapeString("ntilde"); // "ñ"
	addAllowedEscapeString("yen");    // "¥"
	addAllowedEscapeString("not");    // "¬"
	addAllowedEscapeString("ordf");   // "ª"
	addAllowedEscapeString("uml");    // "š"
	addAllowedEscapeString("shy");    // "­"
	addAllowedEscapeString("macr");   // "¯"

	addAllowedEscapeString("micro");  // "µ"
	addAllowedEscapeString("middot"); // "·"
	addAllowedEscapeString("cedil");  // "ž"
	addAllowedEscapeString("ordm");   // "º"
	addAllowedEscapeString("times");  // "×"
	addAllowedEscapeString("divide"); // "÷"
	addAllowedEscapeString("oslash"); // "ø"

	setTokenCaseSensitive(true);
//	addTokenSubstitute("scripture", "<i> ");
	addTokenSubstitute("/scripture", "</i> ");

	renderNoteNumbers = false;
}


bool ThMLXHTML::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	if (!substituteToken(buf, token)) { // manually process if it wasn't a simple substitution
		MyUserData *u = (MyUserData *)userData;		

		XMLTag tag(token);
		if ((!tag.isEndTag()) && (!tag.isEmpty()))
			u->startTag = tag;

		if (tag.getName() && !strcmp(tag.getName(), "sync")) {
			SWBuf value = tag.getAttribute("value");
			if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "morph")) { //&gt;
				if(value.length())
					buf.appendFormatted("<small><em class=\"morph\">(<a href=\"passagestudy.jsp?action=showMorph&type=Greek&value=%s\" class=\"morph\">%s</a>)</em></small>", 
						URL::encode(value.c_str()).c_str(),
						value.c_str());
			}
			else if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "lemma")) { //&gt;
				if(value.length())
					// empty "type=" is deliberate.
					buf.appendFormatted("<small><em class=\"strongs\">&lt;<a href=\"passagestudy.jsp?action=showStrongs&type=&value=%s\" class=\"strongs\">%s</a>&gt;</em></small>", 
						URL::encode(value.c_str()).c_str(),
						value.c_str());
			}
			else if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "Strongs")) {
				char ch = *value;
				value<<1;
				buf.appendFormatted("<small><em class=\"strongs\">&lt;<a href=\"passagestudy.jsp?action=showStrongs&type=%s&value=%s\" class=\"strongs\">",
						    ((ch == 'H') ? "Hebrew" : "Greek"),
						    URL::encode(value.c_str()).c_str());
				buf += (value.length()) ? value.c_str() : "";
				buf += "</a>&gt;</em></small>";
			}
			else if (tag.getAttribute("type") && !strcmp(tag.getAttribute("type"), "Dict")) {
				buf += (tag.isEndTag() ? "</b>" : "<b>");
			}
				
		}
		// <note> tag
		else if (!strcmp(tag.getName(), "note")) {
			if (!tag.isEndTag()) {
				SWBuf type = tag.getAttribute("type");

				// for backward compatibility
				if (type == "x-cross-ref") type = "crossReference";

				SWBuf subType = tag.getAttribute("subType");
				SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
				SWBuf noteName = tag.getAttribute("n");
				SWBuf classExtras = "";

				if (type.size()) {
					classExtras.append(" ").append(type);
				}
				if (subType.size()) {
                                        classExtras.append(" ").append(subType);
                                }
				if (!tag.isEmpty()) {
					if (u->vkey) {
						// leave this special osis type in for crossReference notes types?  Might thml use this some day? Doesn't hurt.
						char ch = (type == "crossReference" ? 'x':'n');
						buf.appendFormatted("<a class=\"noteMarker%s\" href=\"passagestudy.jsp?action=showNote&type=%c&value=%s&module=%s&passage=%s\"><small><sup class=\"%c\">*%c%s</sup></small></a>", 
							classExtras.c_str(),
							ch, 
							URL::encode(footnoteNumber.c_str()).c_str(), 
							URL::encode(u->version.c_str()).c_str(), 
							URL::encode(u->vkey->getText()).c_str(), 
							ch,
							ch, 
							(renderNoteNumbers ? noteName.c_str() : ""));
					}
					else {
						char ch = ((tag.getAttribute("type") && ((!strcmp(tag.getAttribute("type"), "crossReference")) || (!strcmp(tag.getAttribute("type"), "x-cross-ref")))) ? 'x':'n');
						buf.appendFormatted("<a class=\"noteMarker%s\" href=\"passagestudy.jsp?action=showNote&type=%c&value=%s&module=%s&passage=%s\"><small><sup class=\"%c\">*%c%s</sup></small></a>", 
							classExtras.c_str(),
							ch, 
							URL::encode(footnoteNumber.c_str()).c_str(), 
							URL::encode(u->version.c_str()).c_str(), 
							URL::encode(u->key->getText()).c_str(),  
							ch,
							ch, 
							(renderNoteNumbers ? noteName.c_str() : ""));
					}
					u->suspendTextPassThru = true;
				}
			}
			if (tag.isEndTag()) {
				u->suspendTextPassThru = false;
			}
		}
		else if (!strcmp(tag.getName(), "scripture")) {
			buf += (tag.isEndTag() ? "</i>" : "<i>");
		}
		// <scripRef> tag
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
					
					buf.appendFormatted("<a href=\"passagestudy.jsp?action=showRef&type=scripRef&value=%s&module=%s\">",
						(refList.length()) ? URL::encode(refList.c_str()).c_str() : "", 
						(version.length()) ? URL::encode(version.c_str()).c_str() : "");
					buf += u->lastTextNode.c_str();
					buf += "</a>";
				}
				else {
					SWBuf footnoteNumber = u->startTag.getAttribute("swordFootnote");
					SWBuf noteName = tag.getAttribute("n");
					if (u->vkey) {
						// leave this special osis type in for crossReference notes types?  Might thml use this some day? Doesn't hurt.
						//buf.appendFormatted("<a href=\"noteID=%s.x.%s\"><small><sup>*x</sup></small></a> ", u->vkey->getText(), footnoteNumber.c_str());
						buf.appendFormatted("<a href=\"passagestudy.jsp?action=showNote&type=x&value=%s&module=%s&passage=%s\"><small><sup class=\"x\">*x%s</sup></small></a>",
							URL::encode(footnoteNumber.c_str()).c_str(), 
							URL::encode(u->version.c_str()).c_str(),
							URL::encode(u->vkey->getText()).c_str(), 
							(renderNoteNumbers ? noteName.c_str() : ""));
					}
				}

				// let's let text resume to output again
				u->suspendTextPassThru = false;
			}
		}
		else if (tag.getName() && !strcmp(tag.getName(), "div")) {
			if (tag.isEndTag() && u->secHeadLevel) {
				buf += "</h";
				buf += u->secHeadLevel;
				buf += ">";
				u->secHeadLevel = 0;
			}
			else if (tag.getAttribute("class")) {
				if (!stricmp(tag.getAttribute("class"), "sechead")) {
					u->secHeadLevel = '3';
					buf += "<h3>";
				}
				else if (!stricmp(tag.getAttribute("class"), "title")) {
					u->secHeadLevel = '2';
					buf += "<h2>";
				}
				else {
					buf += tag;
				}
			}
			else {
				buf += tag;
			}
		}
		else if (tag.getName() && (!strcmp(tag.getName(), "img") || !strcmp(tag.getName(), "image"))) {
			const char *src = strstr(token, "src");
			if (!src)		// assert we have a src attribute
				return false;

			const char *c, *d;
			if (((c = strchr(src+3, '"')) == NULL) ||
			    ((d = strchr( ++c , '"')) == NULL))	// identify endpoints.
				return false;			// abandon hope.

			SWBuf imagename = "file:";
			if (*c == '/')				// as below, inside for loop.
				imagename += userData->module->getConfigEntry("AbsoluteDataPath");
			while (c != d)				// move bits into the name.
			    imagename += *(c++);

			// images become clickable, if the UI supports showImage.
			buf.appendFormatted("<a href=\"passagestudy.jsp?action=showImage&value=%s&module=%s\"><",
					    URL::encode(imagename.c_str()).c_str(),
					    URL::encode(u->version.c_str()).c_str());

			for (c = token; *c; c++) {
				if ((*c == '/') && (*(c+1) == '\0'))
					continue;
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
               buf += " border=0 /></a>";
		}
		else {
			buf += '<';
			/*for (const char *tok = token; *tok; tok++)
				buf += *tok;*/
			buf += token;
			buf += '>';
			//return false;  // we still didn't handle token
		}
	}
	return true;
}


SWORD_NAMESPACE_END
