/***************************************************************************
 *
 *  teilatex.cpp -	TEI to LATEX filter
 *
 * $Id: teilatex.cpp 3698 2020-02-05 20:15:59Z refdoc $
 *
 * Copyright 2012-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <teilatex.h>
#include <utilxml.h>
#include <swmodule.h>
#include <url.h>
#include <iostream>


SWORD_NAMESPACE_START


TEILaTeX::MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
	isBiblicalText = false;
	if (module) {
		version = module->getName();
		isBiblicalText = (!strcmp(module->getType(), "Biblical Texts"));
	}
}


TEILaTeX::TEILaTeX() {
	setTokenStart("<");
	setTokenEnd(">");

	setEscapeStart("&");
	setEscapeEnd(";");

	setEscapeStringCaseSensitive(true);

	addAllowedEscapeString("quot");
	addAllowedEscapeString("apos");
	addAllowedEscapeString("amp");
	addAllowedEscapeString("lt");
	addAllowedEscapeString("gt");

	setTokenCaseSensitive(true);

	renderNoteNumbers = false;
}

bool TEILaTeX::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
  // manually process if it wasn't a simple substitution
	if (!substituteToken(buf, token)) {
		MyUserData *u = (MyUserData *)userData;
		XMLTag tag(token);

		if (!strcmp(tag.getName(), "p")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {	// non-empty start tag
				buf += "";
			}
			else if (tag.isEndTag()) {	// end tag
				buf += "//\n";
				//userData->supressAdjacentWhitespace = true;
			}
			else {					// empty paragraph break marker
				buf += "//\n";
				//userData->supressAdjacentWhitespace = true;
			}
		}
		
		// <hi>
		else if (!strcmp(tag.getName(), "hi")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				SWBuf rend = tag.getAttribute("rend");
				
				u->lastHi = rend;
				if (rend == "italic" || rend == "ital")
					buf += "\\it{";
				else if (rend == "bold")
					buf += "\\bd{";
				else if (rend == "super" || rend == "sup")
					buf += "^{";
				else if (rend == "sub")
					buf += "_{";
				else if (rend == "overline")
					buf += "\\overline{";

			}
			else if (tag.isEndTag()) {
				buf += "}";
			}
		}

		// <entryFree>
		else if (!strcmp(tag.getName(), "entryFree")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				SWBuf n = tag.getAttribute("n");				
				if (n != "") {
					buf += "\\teiEntryFree{";
					buf += n;
					buf += "}";
				}
			}
		}

		// <sense>
		else if (!strcmp(tag.getName(), "sense")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				SWBuf n = tag.getAttribute("n");
				if (n != "") {
					buf += "\n\\teiSense{";
					buf += n;
					buf += "}";
				}
			}
		}

		// <div>
		else if (!strcmp(tag.getName(), "div")) {

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "";
			}
			else if (tag.isEndTag()) {
			}
		}

		// <lb.../>
		else if (!strcmp(tag.getName(), "lb")) {
			buf += "//\n";
		}

		// <pos>, <gen>, <case>, <gram>, <number>, <mood>, <pron>, <def>
		else if (!strcmp(tag.getName(), "pos") || 
				 !strcmp(tag.getName(), "gen") || 
				 !strcmp(tag.getName(), "case") || 
				 !strcmp(tag.getName(), "gram") || 
				 !strcmp(tag.getName(), "number") || 
				 !strcmp(tag.getName(), "pron") ||
				 !strcmp(tag.getName(), "tr") || 
				 !strcmp(tag.getName(), "orth") ||
				 !strcmp(tag.getName(), "etym") || 
				 !strcmp(tag.getName(), "usg") ||
				 
				 
				 !strcmp(tag.getName(), "def")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "\\tei";
				buf += tag.getName();
				buf += "{";
			}
			else if (tag.isEndTag()) {
				buf += "}";
			}
		}

		else if (!strcmp(tag.getName(), "ref")) {
			if (!tag.isEndTag()) {
				u->suspendTextPassThru = true;
				SWBuf target;
				SWBuf work;
				SWBuf ref;

				int was_osisref = false;
				if(tag.getAttribute("osisRef"))
				{
					target += tag.getAttribute("osisRef");
					was_osisref=true;
				}
				else if(tag.getAttribute("target"))
					target += tag.getAttribute("target");

				if(target.size())
				{
					const char* the_ref = strchr(target, ':');
					
					if(!the_ref) {
						// No work
						ref = target;
					}
					else {
						// Compensate for starting :
						ref = the_ref + 1;

						int size = target.size() - ref.size() - 1;
						work.setSize(size);
						strncpy(work.getRawData(), target, size);
					}

					if(was_osisref)
					{
						buf.appendFormatted("\\swordref{%s}{%s}{",
							(ref) ? ref.c_str() : "", 
							(work.size()) ? work.c_str() : "" );
					}
					else
					{
						// Dictionary link, or something
						buf.appendFormatted("\\sworddictref{%s}{%s}{",
							(work.size()) ? work.c_str() : u->version.c_str(),
							(ref) ? ref.c_str() : ""							
							);
					}
				}
				else
				{
					//std::cout << "TARGET WASN'T\n";
				}
				
			}
			else {
				buf += u->lastTextNode.c_str();
				buf += "}";
				
				u->suspendTextPassThru = false;
			}
		}

	   	// <note> tag
		else if (!strcmp(tag.getName(), "note")) {
			if (!tag.isEndTag()) {
				if (!tag.isEmpty()) {
					u->suspendTextPassThru = true;
				}
			}
			if (tag.isEndTag()) {
				SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
				SWBuf noteName = tag.getAttribute("n");
				SWBuf footnoteBody = "";
				if (u->module){
					footnoteBody += u->module->getEntryAttributes()["Footnote"][footnoteNumber]["body"];
				}
										
				buf.appendFormatted("\\swordfootnote{%s}{%s}{%s}{%s}{",
					footnoteNumber.c_str(), 
					u->version.c_str(),
					u->key->getText(), 
					renderNoteNumbers ? noteName.c_str() : "");
					if (u->module) {
						buf += u->module->renderText(footnoteBody).c_str();
					}			
				u->suspendTextPassThru = false;
			}
		}

		// <graphic> image tag
		else if (!strcmp(tag.getName(), "graphic")) {
			const char *url = tag.getAttribute("url");
			if (url) {		// assert we have a url attribute
				SWBuf filepath;
				if (userData->module) {
					filepath = userData->module->getConfigEntry("AbsoluteDataPath");
					if ((filepath.size()) && (filepath[filepath.size()-1] != '/') && (url[0] != '/'))
						filepath += '/';
				}
				filepath += url;

				buf.appendFormatted("\\figure{\\includegraphics{%s}}",
						    filepath.c_str());
				u->suspendTextPassThru = false;
				
			}
		}

		// <table> <row> <cell>
		else if (!strcmp(tag.getName(), "table")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "\n\\begin{tabular}";
			}
			else if (tag.isEndTag()) {
				buf += "\n\\end{tabular}";
				++u->consecutiveNewlines;
				u->supressAdjacentWhitespace = true;
			}
			
		}
		else if (!strcmp(tag.getName(), "row")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "\n";
				u->firstCell = true;
			}
			else if (tag.isEndTag()) {
				buf += "//";
				u->firstCell = false;
			}
			
		}
		else if (!strcmp(tag.getName(), "cell")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				if (u->firstCell == false) {
					buf += " & ";
				}
				else {
					u->firstCell = false;
				}
			}
			else if (tag.isEndTag()) {
				buf += "";
			}
		}
		// <list> <item>
		else if (!strcmp(tag.getName(), "list")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {

				SWBuf rend = tag.getAttribute("rend");
				
				u->lastHi = rend;
				if (rend == "numbered") {
					buf += "\\begin{enumerate}\n";
					}
				else if (rend == "bulleted") {
					buf += "\\begin{itemize}\n";
				}
				else {
					buf += "\\begin{list-"; 
					buf += rend.c_str(); 
					buf += "}\n";
				}
			}
			else if (tag.isEndTag()) {
				SWBuf rend = u->lastHi;
				if (rend == "numbered") {
					buf += "\\end{enumerate}\n>";
				}
				else if (rend == "bulleted") {
					buf += "\\end{itemize}\n";
				
				}
				else {
					buf += "\\end{list-";
					buf += rend;
					buf += "}\n";
				}
				u->supressAdjacentWhitespace = true;
			}
		}
		else if (!strcmp(tag.getName(), "item")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "\\item";
			}
		}
		else {
			return false;  // we still didn't handle token
		}


	}
	return true;
}


SWORD_NAMESPACE_END

