/***************************************************************************
 *
 *  gbfthml.cpp -	GBF to ThML filter
 *
 * $Id: gbfthml.cpp 3427 2016-07-03 14:30:33Z scribe $
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
#include <gbfthml.h>
#include <swbuf.h>


SWORD_NAMESPACE_START


GBFThML::GBFThML()
{
}


char GBFThML::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	const char *from;
	char token[2048];
	int tokpos = 0;
	bool intoken 	= false;
	const char *tok;

	SWBuf orig = text;
	from = orig.c_str();

	for (text = ""; *from; from++) {
		if (*from == '<') {
			intoken = true;
			tokpos = 0;
			token[0] = 0;
			token[1] = 0;
			token[2] = 0;
			continue;
		}
		if (*from == '>') {
			intoken = false;
			// process desired tokens
			switch (*token) {
			case 'W':	// Strongs
			  switch(token[1]) {
			  case 'G':
			  case 'H':			    
			    text += "<sync type=\"Strongs\" value=\"";
			    for (tok = token + 1; *tok; tok++)
				 text += *tok;
			    text += "\" />";
			    continue;
			    
			  case 'T':               // Tense
			    text += "<sync type=\"Morph\" value=\"";
			    for (tok = token + 2; *tok; tok++)
				 text += *tok;
			    text += "\" />";
			    continue;
				}
			  break;
			case 'R':
			  switch(token[1])
			    {
			    case 'X':
				 text += "<a href=\"";
				 for (tok = token + 3; *tok; tok++) {
				if(*tok != '<' && *tok+1 != 'R' && *tok+2 != 'x') {
				  text += *tok;
				}
				else {
				  break;
				}
				 }
				 text += "\">";
				 continue;
			    case 'x':
				 text += "</a>";
				 continue;
			    case 'F':               // footnote begin
				 text += "<note>";
				 continue;
			    case 'f':               // footnote end
				 text += "</note>";
				 continue;
			    }
			  break;
			case 'F':			// font tags
			  switch(token[1])
			    {
			    case 'N':
				 text += "<font face=\"";
				 for (tok = token + 2; *tok; tok++)
					text += *tok;
				text += "\">";
				 continue;
			    case 'n':
				 text += "</font>";
				 continue;
			    case 'I':		// italic start
				 text += "<i>";
				 continue;
			    case 'i':		// italic end
				 text += "</i>";
				 continue;
			    case 'B':		// bold start
				 text += "<b>";
				 continue;
			    case 'b':		// bold end
				 text += "</b>";
				 continue;

			    case 'R':		// words of Jesus begin
				 text += "<font color=\"#ff0000\">";
				 continue;
			    case 'r':		// words of Jesus end
				 text += "</font>";
				 continue;
			    case 'U':		// Underline start
				 text += "<u>";
				 continue;
			    case 'u':		// Underline end
				 text += "</u>";
				 continue;
			    case 'O':		// Old Testament quote begin
				 text += "<cite>";
				 continue;
			    case 'o':		// Old Testament quote end
				 text += "</cite>";
				 continue;
			    case 'S':		// Superscript begin
				 text += "<sup>";
				 continue;
			    case 's':		// Superscript end
				 text += "</sup>";
				 continue;
			    case 'V':		// Subscript begin
				 text += "<sub>";
				 continue;
			    case 'v':		// Subscript end
				 text += "</sub>";
				 continue;
			    }
			  break;
			case 'C':			// special character tags
			  switch(token[1])
				{
				case 'A':               // ASCII value
				  text += (char)atoi(&token[2]);
				  continue;
				case 'G':
				  //*to++ = ' ';
				  continue;
				case 'L':               // line break
				 text += "<br /> ";
				  continue;
				case 'M':               // new paragraph
				 text += "<p />";
				  continue;
				case 'T':
				  //*to++ = ' ';
				  continue;
				}
			  break;
			case 'T':			// title formatting
			  switch(token[1])
			    {
			    case 'T':               // Book title begin
				 text += "<big>";
				 continue;
			    case 't':
				 text += "</big>";
				 continue;
			    case 'S':
				 text += "<div class=\"sechead\">";
				 continue;
			    case 's':
				 text += "</div>";
				 continue;
			    }
			  break;

			case 'P':			// special formatting
			  switch(token[1]) {
			    case 'P':               // Poetry begin
				 text += "<verse>";
				 continue;
			    case 'p':
				 text += "</verse>";
				 continue;
			    }
			  break;
			}
			continue;
		}
		if (intoken) {
			if (tokpos < 2045) {
				token[tokpos++] = *from;
				//TODO: why is this + 2?  Are we trying to keep 2 or 3 nulls after the last valid char?
				// tokpos has been incremented past the last valid token. it should be pointing to null
				// +1 should give us 2 nulls, but we're +2 here, which actually keeps 3 nulls after the
				// last valid char.  Why are we doing any of this?  These were written before SWBuf and should
				// probably be switched to SWBuf, but perf tests before and after the switch should be run
				token[tokpos+2] = 0;
			}
		}
		else	text += *from;
	}
	return 0;
}


SWORD_NAMESPACE_END
