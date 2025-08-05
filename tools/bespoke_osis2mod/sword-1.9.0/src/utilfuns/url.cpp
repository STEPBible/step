/******************************************************************************
 *
 *  url.cpp -	code for an URL parser utility class
 *
 * $Id: url.cpp 3439 2016-10-23 08:32:02Z scribe $
 *
 * Copyright 2004-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <url.h>
#include <swlog.h>

//system includes
#include <ctype.h>
#include <map>
#include <stdio.h>
#include <iostream>


SWORD_NAMESPACE_START


namespace {
	typedef std::map<unsigned char, SWBuf> DataMap;
    	DataMap m;
	static class __init {
		public:
			__init() {
				for (unsigned short int c = 32; c <= 255; ++c) { //first set all encoding chars
					if ( (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || strchr("-_.!~*'()", c)) {
						continue; //we don't need an encoding for this char
					}

					SWBuf buf;
					buf.setFormatted("%%%-.2X", c);
					m[c] = buf;
				}
				//the special encodings for certain chars
				m[' '] = '+';
			}
	} ___init;
}


/**
 * Constructors/Destructors
 */
URL::URL(const char *url)  
	: 	url(""),
		protocol(""),
		hostname(""),
		path("")
{
	if (url && strlen(url)) {
		this->url = url;
		parse();
	}
}


const char *URL::getProtocol() const {
	return protocol.c_str();
}


const char *URL::getHostName () const {
	return hostname.c_str();
}


const char *URL::getPath() const {
	return path.c_str();
}


const URL::ParameterMap &URL::getParameters() const {
	return parameterMap;
}


/**
 * Returns the value of an URL parameter. For the URL "http://www.crosswire.org/index.jsp?page=test&amp;user=nobody" the value of the parameter "page" would be "test".
 * If the parameter is not set an empty string is returned.
 */
const char *URL::getParameterValue(const char *name) const {
	static SWBuf emptyStr("");

	ParameterMap::const_iterator it = parameterMap.find(name);
	static SWBuf retVal;

	if (it != parameterMap.end())
		retVal = it->second.c_str();
    	else
		retVal = emptyStr.c_str();

	return retVal.c_str();
}


/** Parse the URL.
 * Parse the URL into the protocol, the hostname, the path and the paramters with their values
 * 
 */
void URL::parse() {
	/* format example		protocol://hostname/path/path/path.pl?param1=value1&amp;param2=value2
	* we include the script name in the path, so the path would be /path/path/path.pl in this example
	*  &amp; could also be &
	*/

	//1. Init
	const char *urlPtr = url.c_str();
	 
	protocol = "";
	hostname = "";
	path     = "";
	parameterMap.clear();
	 
	 // 2. Get the protocol, which is from the begining to the first ://
	const char *end = strchr( urlPtr, ':' );
	if (end) { //protocol was found
	 	protocol.append(urlPtr, end-urlPtr);
	 	urlPtr = end + 1;
	
		//find the end of the protocol separator (e.g. "://")
		for (; (*urlPtr == ':') || (*urlPtr == '/'); urlPtr++);
	}

 //3.Get the hostname part. This is the part from pos up to the first slash
	bool checkPath   = true;
	bool checkParams = true;
	bool checkAnchor = true;

	end = strchr(urlPtr, '/');
	if (!end) {
		checkPath = false;
		end = strchr(urlPtr, '?');
	}
	if (!end) {
		checkParams = false;
		end = strchr(urlPtr, '#');
	}
	if (!end) {
		checkAnchor = false;
		end = urlPtr+strlen(urlPtr);
	}
	 
	hostname.append(urlPtr, end-urlPtr);
	 	
	urlPtr = end + ((*end)? 1 : 0);

	if (checkPath) { 
		end = strchr(urlPtr, '?');
		if (!end) {
			checkParams = false;
			end = strchr(urlPtr, '#');
		}
		if (!end) {
			checkAnchor = false;
			end = urlPtr+strlen(urlPtr);
		}

	 	path.append(urlPtr, end-urlPtr);
		
		urlPtr = end + ((*end)? 1 : 0);
	 }

	if (checkParams) {
		//5. Fill the map with the parameters and their values
		SWBuf paramName;
		SWBuf paramValue;
				
		if (checkAnchor) checkAnchor = false;
/*
		end = strchr(urlPtr, '#');
		if (!end) {
			checkAnchor = false;
			end = urlPtr+strlen(urlPtr);
		}
*/
		//end = (start && strchr(start, '?')) ? strchr(start, '?')+1 :0;
		end = urlPtr;
		while (end) {
			paramName = "";
			paramValue = "";
			
			//search for the equal sign to find the value part
			const char *valueStart = strchr(end, '=');		
			if (valueStart) {
				const char* valueEnd = strstr(valueStart, "&amp;") ? strstr(valueStart, "&amp;") : strstr(valueStart, "&"); //try to find a new paramter part
				
				if (valueEnd) {
					paramName.append(end, valueStart-end);
					paramValue.append(valueStart+1, valueEnd-(valueStart+1));
				}
				else { //this is the last paramter of the URL
					paramName.append(end, valueStart-end);
					paramValue.append(valueStart+1);
				}
				
				if (paramName.length() && paramValue.length()) {//insert the param into the map if it's valid
					paramName = decode(paramName.c_str());
					paramValue = decode(paramValue.c_str());
					
					parameterMap[ paramName ] = paramValue;
				}
			}
			else {
				break; //no valid parameter in the url
			}
			
			const char *start = end+1;
			end = strstr(start, "&amp;") ? strstr(start, "&amp;")+5 : (strstr(start, "&") ? strstr(start, "&")+1 : 0); //try to find a new paramter part
		}
	}
}


const SWBuf URL::encode(const char *urlText) {
	/*static*/ SWBuf url;
	url = urlText;
	
	SWBuf buf;
	const long length = url.length();
	for (long i = 0; i < length; i++) { //fill "buf"
		const char& c = url[i];
		buf.append( ((m[c].length()) ? m[c] : SWBuf(c)) );
	}

	url = buf;
	return url;
}


const SWBuf URL::decode(const char *encoded) {
	/*static*/ SWBuf text;
	text = encoded;	

	SWBuf decoded;	
	const long length = text.length();
	int i = 0;
	
	while (i < length) {
		char a = text[i];
		
		if ( a == '+' ) { //handle special cases
			decoded.append(' ');
		}		
		else if ( (a == '%') && (i+2 < length)) { //decode the %ab  hex encoded char
			const char b = toupper( text[i+1] );
			const char c = toupper( text[i+2] );
			
			if (isxdigit(b) && isxdigit(c)) { //valid %ab part
				unsigned int dec = 16 * ((b >= 'A' && b <= 'F') ? (b - 'A' + 10) : (b - '0')); //dec value of the most left digit (b)
				dec += (c >= 'A' && c <= 'F') ? (c - 'A' + 10) : (c - '0'); //dec value of the right digit (c)
				
				decoded.append((char)dec); //append the decoded char
				
				i += 2; //we jump over the %ab part; we have to leave out three, but the while  loop adds one, too
			}
		}
		else { //just append the char
			decoded.append(a);
		}
		
		i++;
	}
	
	if (decoded.length()) {
		text = decoded;
	}
	return text;
}


SWORD_NAMESPACE_END

