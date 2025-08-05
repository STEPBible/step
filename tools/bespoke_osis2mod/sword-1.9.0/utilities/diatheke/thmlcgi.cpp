/******************************************************************************
 *
 *  thmlcgi.cpp -	ThMLCGI: ThML to Diatheke/CGI format filter
 *
 * $Id: thmlcgi.cpp 3427 2016-07-03 14:30:33Z scribe $
 *
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <string.h>
#include <map>
#include <utilstr.h>
#include "thmlcgi.h"

SWORD_NAMESPACE_START

typedef std::map<SWBuf, SWBuf> DualStringMap;

namespace {
	class MyUserData : public BasicFilterUserData {
	public:
		MyUserData(const SWModule *module, const SWKey *key) : BasicFilterUserData(module, key) {}
		DualStringMap properties;
	};
}

BasicFilterUserData *ThMLCGI::createUserData(const SWModule *module, const SWKey *key) {
	return new MyUserData(module, key);
}

ThMLCGI::ThMLCGI() {
	setTokenStart("<");
	setTokenEnd(">");

	setTokenCaseSensitive(true);

	addTokenSubstitute("note", " <font color=\"#008000\"><small>(");
	addTokenSubstitute("/note", ")</small></font> ");
}


bool ThMLCGI::handleToken(SWBuf &buf, const char *token, BasicFilterUserData *baseUserData) {
	MyUserData *userData = (MyUserData *) baseUserData;
	unsigned long i;
	if (!substituteToken(buf, token)) {
	// manually process if it wasn't a simple substitution
		if (!strncmp(token, "sync ", 5)) {
			buf += "<a href=\"!DIATHEKE_URL!";
			char* pbuf;
			char typ[32]; typ[0] = 0;
			char val[32]; val[0] = 0;
			char cls[32]; cls[0] = 0;
			for (unsigned int j = 5; j < strlen(token); j++) {
                                if (!strncmp(token+j, "type=\"", 6)) {
				        pbuf = typ;
                                        j += 6;
                                        for (;token[j] != '\"'; j++)
                				*(pbuf)++ = token[j];
					*(pbuf) = 0;
                                }
                                else if (!strncmp(token+j, "value=\"", 7)) {
				        pbuf = val;
                                        j += 7;
                                        for (;token[j] != '\"'; j++)
                				*(pbuf)++ = token[j];
					*(pbuf) = 0;
                                }
                                else if (!strncmp(token+j, "class=\"", 7)) {
				        pbuf = cls;
                                        j += 7;
                                        for (;token[j] != '\"'; j++)
                				*(pbuf)++ = token[j];
					*(pbuf) = 0;					
                                }
                        }
			if (*cls && *val) {
			        buf.appendFormatted("%s=on&verse=%s", cls, val);
			}
			else if (*typ && *val) {
			  if (!strnicmp(typ, "Strongs", 7)) {
			    if (*val == 'G') {
			      buf.appendFormatted("StrongsGreek=on&verse=%s", val + 1);
			    }
			    else if (*val == 'H') {
			      buf.appendFormatted("StrongsHebrew=on&verse=%s", val + 1);
			    }
			  }

			  else if (!strnicmp(typ, "Morph", 5)) {
			    if (*val == 'G') {
			      buf.appendFormatted("StrongsGreek=on&verse=%s", val + 1);
			    }
			    else if (*val == 'H') {
			      buf.appendFormatted("StrongsHebrew=on&verse=%s", val + 1);
			    }
			    else {
			      buf.appendFormatted("Packard=on&verse=%s", val);
			    }
			  }
			  else {
			    buf.appendFormatted("%s=on&verse=%s", typ, val);
			  }
			}
			buf += "\">";
			
			if (*val) {
			        buf += val;
			}
			buf += "</a>";
		}

		else if (!strncmp(token, "scripRef p", 10) || !strncmp(token, "scripRef v", 10)) {
        		userData->properties["inscriptRef"] = "true";
			buf += "<a href=\"!DIATHEKE_URL!";
			for (i = 9; i < strlen(token); i++) {
			  if (!strncmp(token+i, "version=\"", 9)) {
			    i += 9;
			    for (;token[i] != '\"'; i++)
			      buf += token[i];
			    buf += "=on&";
			  }
			  if (!strncmp(token+i, "passage=\"", 9)) {
			    i += 9;
			    buf += "verse=";
			    for (;token[i] != '\"'; i++) {
			      if (token[i] == ' ') buf += '+';
			      else buf += token[i];
			    }
			    buf += '&';
			  }
			}
			buf += "\">";
		} 

		// we're starting a scripRef like "<scripRef>John 3:16</scripRef>"
		else if (!strcmp(token, "scripRef")) {
			userData->properties["inscriptRef"] = "false";
			// let's stop text from going to output
			userData->properties["suspendTextPassThru"] = "true";
		}

		// we've ended a scripRef 
		else if (!strcmp(token, "/scripRef")) {
			if (userData->properties["inscriptRef"] == "true") { // like  "<scripRef passage="John 3:16">John 3:16</scripRef>"
				userData->properties["inscriptRef"] = "false";
				buf += "</a>";
			}
			
			else { // like "<scripRef>John 3:16</scripRef>"
				buf += "<a href=\"!DIATHEKE_URL!verse=";

				char* vref = (char*)userData->properties["lastTextNode"].c_str();
				while (*vref) {
				  if (*vref == ' ') buf += '+';
				  else buf += *vref;
				  vref++;
				}
				buf += "\">";
				buf += userData->properties["lastTextNode"].c_str();
				// let's let text resume to output again
				userData->properties["suspendTextPassThru"] = "false";	
				buf += "</a>";
			}
		}

		else if (!strncmp(token, "div class=\"sechead\"", 19)) {
		        userData->properties["SecHead"] = "true";
			buf += "<br /><b><i>";
		}
		else if (!strncmp(token, "div class=\"title\"", 19)) {
		        userData->properties["SecHead"] = "true";
			buf += "<br /><b><i>";
		}
		else if (!strncmp(token, "/div", 4)) {
		        if (userData->properties["SecHead"] == "true") {
			        buf += "</i></b><br />";
				userData->properties["SecHead"] = "false";
			}
		}

                else if(!strncmp(token, "note", 4)) {
                        buf += " <small><font color=\"#008000\">{";
                }                

		else {
			buf += '<';
			for (i = 0; i < strlen(token); i++) {
				buf += token[i];
			}
			buf += '>';
			//return false;  // we still didn't handle token
		}
	}
	return true;
}






SWORD_NAMESPACE_END
