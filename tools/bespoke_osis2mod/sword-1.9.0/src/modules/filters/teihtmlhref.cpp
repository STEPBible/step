/***************************************************************************
 *
 *  teihtmlhref.cpp -	TEI to HTML with hrefs filter
 *
 * $Id: teihtmlhref.cpp 3807 2020-09-27 12:59:54Z scribe $
 *
 * Copyright 2008-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <teihtmlhref.h>
#include <utilxml.h>
#include <swmodule.h>
#include <url.h>
#include <iostream>


SWORD_NAMESPACE_START


TEIHTMLHREF::MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
	isBiblicalText = false;
	if (module) {
		version = module->getName();
		isBiblicalText = (!strcmp(module->getType(), "Biblical Texts"));
	}
}


TEIHTMLHREF::TEIHTMLHREF() {
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

bool TEIHTMLHREF::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
  // manually process if it wasn't a simple substitution
	if (!substituteToken(buf, token)) {
		MyUserData *u = (MyUserData *)userData;
		XMLTag tag(token);

		if (!strcmp(tag.getName(), "p")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {	// non-empty start tag
				buf += "<!P><br />";
			}
			else if (tag.isEndTag()) {	// end tag
				buf += "<!/P><br />";
				//userData->supressAdjacentWhitespace = true;
			}
			else {					// empty paragraph break marker
				buf += "<!P><br />";
				//userData->supressAdjacentWhitespace = true;
			}
		}
		
		// <hi>
		else if (!strcmp(tag.getName(), "hi")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				SWBuf rend = tag.getAttribute("rend");
				
				u->lastHi = rend;
				if (rend == "italic" || rend == "ital")
					buf += "<i>";
				else if (rend == "bold")
					buf += "<b>";
				else if (rend == "super" || rend == "sup")
					buf += "<sup>";
				else if (rend == "sub")
					buf += "<sub>";
				else if (rend == "overline")
					buf += "<span style=\"text-decoration:overline\">";
			}
			else if (tag.isEndTag()) {
				SWBuf rend = u->lastHi;
				if (rend == "italic" || rend == "ital")
					buf += "</i>";
				else if (rend == "bold")
					buf += "</b>";
				else if (rend == "super" || rend == "sup")
					buf += "</sup>";
				else if (rend == "sub")
					buf += "</sub>";
				else if (rend == "overline")
					buf += "</span>";
			}
		}

		// <entryFree>
		else if (!strcmp(tag.getName(), "entryFree")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				SWBuf n = tag.getAttribute("n");				
				if (n != "") {
					buf += "<b>";
					buf += n;
					buf += "</b>";
				}
			}
		}

		// <sense>
		else if (!strcmp(tag.getName(), "sense")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				SWBuf n = tag.getAttribute("n");
				if (n != "") {
					buf += "<br /><b>";
					buf += n;
					buf += "</b> ";
				}
			}
		}

		// <div>
		else if (!strcmp(tag.getName(), "div")) {

			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<!P>";
			}
			else if (tag.isEndTag()) {
			}
		}

		// <lb.../>
		else if (!strcmp(tag.getName(), "lb")) {
			buf += "<br />";
		}

		// <pos>, <gen>, <case>, <gram>, <number>, <mood>, <pron>, <def>
		else if (!strcmp(tag.getName(), "pos") || 
				 !strcmp(tag.getName(), "gen") || 
				 !strcmp(tag.getName(), "case") || 
				 !strcmp(tag.getName(), "gram") || 
				 !strcmp(tag.getName(), "number") || 
				 !strcmp(tag.getName(), "pron") /*||
				 !strcmp(tag.getName(), "def")*/) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<i>";
			}
			else if (tag.isEndTag()) {
				buf += "</i>";
			}
		}

		// <tr>
		else if (!strcmp(tag.getName(), "tr")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<i>";
			}
			else if (tag.isEndTag()) {
				buf += "</i>";
			}
		}
		
		// orth
		else if (!strcmp(tag.getName(), "orth")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<b>";
			}
			else if (tag.isEndTag()) {
				buf += "</b>";
			}
		}

		// <etym>, <usg>
		else if (!strcmp(tag.getName(), "etym") || 
				 !strcmp(tag.getName(), "usg")) {
			// do nothing here
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

						int size = (int)(target.size() - ref.size() - 1);
						work.setSize(size);
						strncpy(work.getRawData(), target, size);
					}

					if(was_osisref)
					{
						buf.appendFormatted("<a href=\"passagestudy.jsp?action=showRef&type=scripRef&value=%s&module=%s\">",
							(ref) ? URL::encode(ref.c_str()).c_str() : "", 
							(work.size()) ? URL::encode(work.c_str()).c_str() : "");
					}
					else
					{
						// Dictionary link, or something
						buf.appendFormatted("<a href=\"sword://%s/%s\">",
							(work.size()) ? URL::encode(work.c_str()).c_str() : u->version.c_str(),
							(ref) ? URL::encode(ref.c_str()).c_str() : ""							
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
				buf += "</a>";
				
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
				
				buf.appendFormatted("<a href=\"passagestudy.jsp?action=showNote&type=n&value=%s&module=%s&passage=%s\"><small><sup class=\"n\">*n%s</sup></small></a>",
					URL::encode(footnoteNumber.c_str()).c_str(), 
					URL::encode(u->version.c_str()).c_str(),
					URL::encode(u->key->getText()).c_str(), 
					(renderNoteNumbers ? URL::encode(noteName.c_str()).c_str() : ""));
				
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
				// images become clickable, if the UI supports showImage.
				buf.appendFormatted("<a href=\"passagestudy.jsp?action=showImage&value=%s&module=%s\"><img src=\"file:%s\" border=\"0\" /></a>",
						    URL::encode(filepath.c_str()).c_str(),
						    URL::encode(u->version.c_str()).c_str(),
						    filepath.c_str());
				u->suspendTextPassThru = true;
			}
		}
		// <table> <row> <cell>
		else if (!strcmp(tag.getName(), "table")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<table><tbody>\n";
			}
			else if (tag.isEndTag()) {
				buf += "</tbody></table>\n";
				u->supressAdjacentWhitespace = true;
			}

		}
		else if (!strcmp(tag.getName(), "row")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "\t<tr>";
			}
			else if (tag.isEndTag()) {
				buf += "</tr>\n";
			}
		}
		else if (!strcmp(tag.getName(), "cell")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<td>";
			}
			else if (tag.isEndTag()) {
				buf += "</td>";
			}
		}

		// <list> <item>
		else if (!strcmp(tag.getName(), "list")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {

				SWBuf rend = tag.getAttribute("rend");
				
				u->lastHi = rend;
				if (rend == "numbered") {
					buf += "<ol>\n";
				}
				else if (rend == "lettered") {
					buf += "<ol type=\"A\">\n";
				}
				else if (rend == "bulleted") {
					buf += "<ul>\n";
				}
				else {
					buf += "<ul class=\"list "; 
					buf += rend.c_str(); 
					buf += "\">";
				}
			}
			else if (tag.isEndTag()) {
				SWBuf rend = u->lastHi;
				if (rend == "numbered") {
					buf += "</ol>\n>";
				}
				else if (rend == "lettered") {
					buf += "</ol>\n";
				}
				else if (rend == "bulleted") {
					buf += "</ul>\n";
				}
				else {
					buf += "</ul>\n";
				}
				u->supressAdjacentWhitespace = true;
			}
		}
		else if (!strcmp(tag.getName(), "item")) {
			if ((!tag.isEndTag()) && (!tag.isEmpty())) {
				buf += "<li>";
			}
			else if (tag.isEndTag()) {
				buf += "</li>\n";
			}
		}
		else {
			return false;  // we still didn't handle token
		}

	}
	return true;
}


SWORD_NAMESPACE_END

