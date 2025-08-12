/******************************************************************************
 *
 *  gbflatex.cpp -	GBF to LaTeX
 *
 * $Id: gbflatex.cpp 3547 2017-12-10 05:06:48Z scribe $
 *
 * Copyright 2011-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <gbflatex.h>
#include <swmodule.h>
#include <utilxml.h>
#include <versekey.h>
#include <ctype.h>
#include <url.h>

SWORD_NAMESPACE_START

const char *GBFLaTeX::getHeader() const {
	return "\\usepackage{color}";
}

GBFLaTeX::MyUserData::MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {
	if (module) {
		version = module->getName(); 
	}	
}

GBFLaTeX::GBFLaTeX() {
	setTokenStart("<");
	setTokenEnd(">");
	
	setTokenCaseSensitive(true);

	//addTokenSubstitute("Rf", ")</small></font>");
	addTokenSubstitute("FA", "{\\color{maroon}"); // for ASV footnotes to mark text
	addTokenSubstitute("Rx", "}");
	addTokenSubstitute("FI", "\\emph{"); // italics begin
	addTokenSubstitute("Fi", "}");
	addTokenSubstitute("FB", "\\bold{"); // bold begin
	addTokenSubstitute("Fb", "}");
	addTokenSubstitute("FR", "{\\swordwoj{"); // words of Jesus begin
	addTokenSubstitute("Fr", "}");
	addTokenSubstitute("FU", "\\underline{"); // underline begin
	addTokenSubstitute("Fu", "}");
	addTokenSubstitute("FO", "\\begin{quote}"); //  Old Testament quote begin
	addTokenSubstitute("Fo", "\\end{quote}");
	addTokenSubstitute("FS", "\\textsuperscript{"); // Superscript begin// Subscript begin
	addTokenSubstitute("Fs", "}");
	addTokenSubstitute("FV", "\\textsubscript{"); // Subscript begin
	addTokenSubstitute("Fv", "}");
	addTokenSubstitute("TT", "\\section*{"); // Book title begin
	addTokenSubstitute("Tt", "}");
	addTokenSubstitute("PP", "\\begin{swordpoetry}"); //  poetry  begin
	addTokenSubstitute("Pp", "\\end{swordpoetry}");
	addTokenSubstitute("Fn", ""); //  font  end
	addTokenSubstitute("CL", "\\\\"); //  new line
	addTokenSubstitute("CM", "\\\\"); //  paragraph <!P> is a non showing comment that can be changed in the front end to <P> if desired
	addTokenSubstitute("CG", ""); //  ???
	addTokenSubstitute("CT", ""); // ???
	addTokenSubstitute("JR", "{\\raggedright{}"); // right align begin
	addTokenSubstitute("JC", "{\\raggedcenter{}"); // center align begin
	addTokenSubstitute("JL", "}"); // align end
	
	renderNoteNumbers = false;
}


bool GBFLaTeX::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	const char *tok;
	MyUserData *u = (MyUserData *)userData;

	if (!substituteToken(buf, token)) {
		XMLTag tag(token);
		
		if (!strncmp(token, "WG", 2)) { // strong's numbers
			//buf += " <small><em>&lt;<a href=\"type=Strongs value=";
			buf += " \\swordstrong[Greek]{";
			for (tok = token+2; *tok; tok++)
				//if(token[i] != '\"')
					buf += *tok;
			buf += ", ";
			for (tok = token + 2; *tok; tok++)
				//if(token[i] != '\"')
					buf += *tok;
			buf += "}";
		}
		else if (!strncmp(token, "WH", 2)) { // strong's numbers
			buf += " \\swordstrong[Hebrew]{";
			for (tok = token+2; *tok; tok++)
				//if(token[i] != '\"')
					buf += *tok;
			buf += ", ";
			for (tok = token + 2; *tok; tok++)
				//if(token[i] != '\"')
					buf += *tok;
			buf += "}";
		}
		else if (!strncmp(token, "WTG", 3)) { // strong's numbers tense
			buf += " \\swordstrong[Greektense]{";
			for (tok = token + 3; *tok; tok++)
				if(*tok != '\"')
					buf += *tok;
			buf += ", ";
			for (tok = token + 3; *tok; tok++)
				if(*tok != '\"')
					buf += *tok;
			buf += "}";
		}
		else if (!strncmp(token, "WTH", 3)) { // strong's numbers tense
			buf += " \\swordstrong[Hebrewtense]{";
			for (tok = token + 3; *tok; tok++)
				if(*tok != '\"')
					buf += *tok;
			buf += ",";
			for (tok = token + 3; *tok; tok++)
				if(*tok != '\"')
					buf += *tok;
			buf += "}";
		}

		else if (!strncmp(token, "WT", 2) && strncmp(token, "WTH", 3) && strncmp(token, "WTG", 3)) { // morph tags
			buf += " \\swordmorph{";
			
			for (tok = token + 2; *tok; tok++)
				if(*tok != '\"')
					buf += *tok;
			buf += ", >";
			for (tok = token + 2; *tok; tok++)				
				if(*tok != '\"') 			
					buf += *tok;		
			buf += "}";
		}

		else if (!strcmp(tag.getName(), "RX")) {
			buf += "\\swordxref{";
			for (tok = token + 3; *tok; tok++) {
			  if(*tok != '<' && *tok+1 != 'R' && *tok+2 != 'x') {
			    buf += *tok;
			  }
			  else {
			    break;
			  }
			}
			buf += "}";
		}
		else if (!strcmp(tag.getName(), "RF")) {
			SWBuf type = tag.getAttribute("type");
			SWBuf footnoteNumber = tag.getAttribute("swordFootnote");
			SWBuf noteName = tag.getAttribute("n");
			if (u->vkey) {
				
				buf.appendFormatted("\\swordfootnote{%s}{%s}{%s}{", 
					footnoteNumber.c_str(),
					u->version.c_str(), 
					u->vkey->getText()).c_str(); 
			}
			u->suspendTextPassThru = false;
		}
		else if (!strcmp(tag.getName(), "Rf")) {
			u->suspendTextPassThru = false;
			buf += "}";
		}
		else if (!strncmp(token, "FN", 2)) {
			buf += "\\swordfont{";
			for (tok = token + 2; *tok; tok++)				
				if(*tok != '\"') 			
					buf += *tok;
			buf += "}";
		}

		else if (!strncmp(token, "CA", 2)) {	// ASCII value
			buf += (char)atoi(&token[2]);
		}
		
		else {
			return false;
		}
	}
	return true;
}

SWORD_NAMESPACE_END
