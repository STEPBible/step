/***************************************************************************
 *
 *  gbfwebif.cpp -	GBF to HTML filter with hrefs for strongs and morph
 *			tags
 *
 * $Id: gbfwebif.cpp 2833 2013-06-29 06:40:28Z chrislit $
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


#include <gbfwebif.h>
#include <ctype.h>
#include <url.h>

SWORD_NAMESPACE_START

GBFWEBIF::GBFWEBIF() : baseURL(""), passageStudyURL(baseURL + "passagestudy.jsp") {
}

bool GBFWEBIF::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData) {
	const char *tok;
	char val[128];
	char *valto;
	const char *num;
	SWBuf url;

	if (!substituteToken(buf, token)) {
		if (!strncmp(token, "w", 1)) {
			// OSIS Word (temporary until OSISRTF is done)
			valto = val;
			num = strstr(token, "lemma=\"x-Strongs:");
			if (num) {
				for (num+=17; ((*num) && (*num != '\"')); num++)
					*valto++ = *num;
				*valto = 0;

				if (atoi((!isdigit(*val))?val+1:val) < 5627) {
					buf += " <small><em>&lt;";
					url = "";
					for (tok = val; *tok; tok++) {
						url += *tok;
					}
					if ((url.length() > 1) && strchr("GH", url[0])) {
						if (isdigit(url[1]))
							url = url.c_str()+1;
					}
					buf.appendFormatted("<a href=\"%s?showStrong=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());

					for (tok = (!isdigit(*val))?val+1:val; *tok; tok++) {
						buf += *tok;
					}
					buf += "</a>&gt;</em></small> ";
				}
			}
			else {
				num = strstr(token, "lemma=\"strong:");
				if (num) {
					for (num+=14; ((*num) && (*num != '\"')); num++)
						*valto++ = *num;
					*valto = 0;

					if (atoi((!isdigit(*val))?val+1:val) < 5627) {
						buf += " <small><em>&lt;";
						url = "";
						for (tok = val; *tok; tok++) {
							url += *tok;
						}
						if ((url.length() > 1) && strchr("GH", url[0])) {
							if (isdigit(url[1]))
								url = url.c_str()+1;
						}
						buf.appendFormatted("<a href=\"%s?showStrong=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());

						for (tok = (!isdigit(*val))?val+1:val; *tok; tok++) {
							buf += *tok;
						}
						buf += "</a>&gt;</em></small> ";
					}
				}
			}
			valto = val;
			num = strstr(token, "morph=\"x-Robinson:");
			if (num) {
				for (num+=18; ((*num) && (*num != '\"')); num++)
					*valto++ = *num;
				*valto = 0;
				buf += " <small><em>(";
				url = "";
				for (tok = val; *tok; tok++) {
				// normal robinsons tense
					buf += *tok;
				}
				buf.appendFormatted("<a href=\"%s?showMorph=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());

				for (tok = val; *tok; tok++) {
					buf += *tok;
				}
				buf += "</a>)</em></small> ";
			}
		}

		else if (!strncmp(token, "WG", 2) || !strncmp(token, "WH", 2)) { // strong's numbers
			buf += " <small><em>&lt;";
			url = "";

			for (tok = token+1; *tok; tok++) {
				url += *tok;
			}
			if ((url.length() > 1) && strchr("GH", url[0])) {
				if (isdigit(url[1]))
					url = url.c_str()+1;
			}
			buf.appendFormatted("<a href=\"%s?showStrong=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());

			for (tok = token + 2; *tok; tok++) {
				buf += *tok;
			}
			buf += "</a>&gt;</em></small>";
		}

		else if (!strncmp(token, "WTG", 3) || !strncmp(token, "WTH", 3)) { // strong's numbers tense
			buf += " <small><em>(";
			url = "";
			for (tok = token + 2; *tok; tok++) {
				if(*tok != '\"')
					url += *tok;
			}
			if ((url.length() > 1) && strchr("GH", url[0])) {
				if (isdigit(url[1]))
					url = url.c_str()+1;
			}
			buf.appendFormatted("<a href=\"%s?showStrong=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());

			for (tok = token + 3; *tok; tok++)
				if(*tok != '\"')
					buf += *tok;
			buf += "</a>)</em></small>";
		}

		else if (!strncmp(token, "WT", 2) && strncmp(token, "WTH", 3) && strncmp(token, "WTG", 3)) { // morph tags
			buf += " <small><em>(";
			for (tok = token + 2; *tok; tok++) {
				if(*tok != '\"')
					buf += *tok;
			}
			buf.appendFormatted("<a href=\"%s?showMorph=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());

			for (tok = token + 2; *tok; tok++) {
				if(*tok != '\"')
					buf += *tok;
			}
			buf += "</a>)</em></small>";
		}

		else if (!strncmp(token, "RX", 2)) {
			buf += "<a href=\"";
			for (tok = token + 3; *tok; tok++) {
			  if(*tok != '<' && *tok+1 != 'R' && *tok+2 != 'x') {
			    buf += *tok;
			  }
			  else {
			    break;
			  }
			}

			buf.appendFormatted("a href=\"%s?key=%s#cv\">", passageStudyURL.c_str(), URL::encode(url).c_str());
		}
		// ok to leave these in
		else if ((!strncmp(token, "span", 4))
				|| (!strncmp(token, "/span", 5))) {
			buf.appendFormatted("<%s>", token);
		}

		else {
			return GBFXHTML::handleToken(buf, token, userData);
		}
	}
	return true;
}

SWORD_NAMESPACE_END
