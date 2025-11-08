/******************************************************************************
 *
 *  stringmgr.cpp -	implementation of class StringMgr
 *
 * $Id: stringmgr.cpp 3822 2020-11-03 18:54:47Z scribe $
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

#include <ctype.h>
#include <stringmgr.h>
#include <swlog.h>
#include <localemgr.h>
#include <utilstr.h>

#ifdef _ICU_

#include <unicode/utypes.h>
#include <unicode/ucnv.h>
#include <unicode/ustring.h>
#include <unicode/uchar.h>

#include <unicode/unistr.h>
#include <unicode/translit.h>

#include <unicode/locid.h>

#endif


SWORD_NAMESPACE_START


StringMgr *StringMgr::systemStringMgr = 0;

class __staticsystemStringMgr {
public:
	__staticsystemStringMgr() { }
	~__staticsystemStringMgr() { if (StringMgr::systemStringMgr) delete StringMgr::systemStringMgr; StringMgr::systemStringMgr = 0; }
} _staticsystemStringMgr;


namespace {

	/**
	 * Determine whether the string contains a valid unicode sequence. The following table give the pattern of a valid UTF-8 character.
	 * Unicode Range            1st       2nd       3rd       4th       5th       6th
	 * U-00000000 - U-0000007F  0nnnnnnn
	 * U-00000080 - U-000007FF  110nnnnn  10nnnnnn
	 * U-00000800 - U-0000FFFF  1110nnnn  10nnnnnn  10nnnnnn
	 * U-00010000 - U-001FFFFF  11110nnn  10nnnnnn  10nnnnnn  10nnnnnn
	 * U-00200000 - U-03FFFFFF  111110nn  10nnnnnn  10nnnnnn  10nnnnnn  10nnnnnn
	 * U-04000000 - U-7FFFFFFF  1111110n  10nnnnnn  10nnnnnn  10nnnnnn  10nnnnnn  10nnnnnn
	 * Note:
	 *   The latest UTF-8 RFC allows for a max of 4 bytes. Earlier allowed 6.
	 *   The number of bits of the leading byte before the first 0 is the total number of bytes
	 *   The "n" are the bits of the unicode codepoint.
	 *
	 * This routine does not check to see if the code point is in the range. It could.
	 *
	 * @param txt the text to check
	 * @return  1 if all high order characters form a valid unicode sequence
	 *         -1 if there are no high order characters
	 *          0 if there are high order characters that do not form a valid unicode sequence
	 * @author DM Smith [dmsmith555 at yahoo dot com]
	 */
	int isValidUTF8(unsigned char *txt) {
		unsigned int  countUTF8 = 0;
	#if 0
		unsigned char parts     = 0;


		unsigned char *p = txt;
		while (*p) {
			// Is the high order bit set?
			if (*p & 0x80) {
				// then count the number of high order bits that are set
				// this determines the number of following bytes need to have high order bits set
				unsigned char i = *p;
				for (parts = 0; i & 0x80; parts++) {
					i <<= 1;
				}


				// The pattern 10nnnnnn is not a unicode character
				if (parts == 1) {
					return 0;
				}
				else {
					while (--parts && ++*p) {
						// The pattern of each following character must be: 10nnnnnn
						if (0xc0 & *p != 0x80) {
							return  0;
						}
					}

					// Oops, we've run out of bytes too soon: Cannot be UTF-8
					if (parts) {
						return 0;
					}
				}
				countUTF8++;
			}
		}

		// At this point it is either UTF-8 or ascii
	#endif
		return countUTF8 ? 1 : -1;
	}

	char *lowerLatin1(char *buf, unsigned int maxlen = 0) {
		if (!buf)
			return 0;
			
		char *ret = buf;
		bool checkMax = maxlen;

		while (*buf && (!checkMax || maxlen--)) {
			*buf = SW_tolower(*buf);
			buf++;
		}

		return ret;
	}
}


#ifdef _ICU_

//here comes our ICUStringMgr reimplementation
class ICUStringMgr : public StringMgr {
public:
	virtual char *upperUTF8(char *, unsigned int maxlen = 0) const;
	virtual char *lowerUTF8(char *, unsigned int maxlen = 0) const;
	virtual bool isUpper(SW_u32 character) const;
	virtual bool isLower(SW_u32 character) const;
	virtual bool isDigit(SW_u32 character) const;
	virtual bool isAlpha(SW_u32 character) const;
	
protected:
	virtual bool supportsUnicode() const { return true; };
};

#endif


/** Default constructor
*/		
StringMgr::StringMgr() {
}

/** Copy constructor
*/	
StringMgr::StringMgr(const StringMgr &m) {
}

/** Destructor
*/	
StringMgr::~StringMgr() {
}

/** Sets the global StringMgr handle
* @param newStringMgr The new global StringMgr. This pointer will be deleted by this StringMgr
*/	
void StringMgr::setSystemStringMgr(StringMgr *newStringMgr) {
	if (systemStringMgr) 
		delete systemStringMgr;
	
	systemStringMgr = newStringMgr;

   // TODO: this is magic. apparently we have to reset the system localemgr upon changing stringmgr.
   // setting system stringmgr should be set before localemgr and not possible to change.
   // rework this design.
	LocaleMgr::getSystemLocaleMgr()->setSystemLocaleMgr(new LocaleMgr());
}

/** Returns the global StringMgr handle
* @return The global string handle
*/
StringMgr* StringMgr::getSystemStringMgr() {
	if (!systemStringMgr) {
#ifdef _ICU_
		systemStringMgr = new ICUStringMgr();
// 		SWLOGI("created default ICUStringMgr");
#else
		systemStringMgr = new StringMgr();
//  		SWLOGI("created default StringMgr");
#endif
	}
	
	return systemStringMgr;
}


/**
 * This is a fallback method.  It should never be called.
 * If UTF8 support is desired, then a UTF8 StringMgr needs
 * to be used.
 *
 * Here we just do our best.
 *
 * Converts the param to an upper case UTF8 string
 * @param t - The text encoded in utf8 which should be turned into an upper case string
 *
 */	
char *StringMgr::upperUTF8(char *t, unsigned int maxlen) const {
	// try to decide if it's worth trying to toupper.  Do we have more
	// characters which are probably lower latin than not?
	// we still don't use isValidUTF8 optimally. what if we have 1 unicode
	// character in the string?  should we not try to upper any of the string?
	// dunno.  Best solution is to upper all other characters. Don't have
	// time to write that before release.
	long performOp = 0;
	if (!isValidUTF8((unsigned char *)t)) {
		performOp = 1;
	}
	else {
		for (const char *ch = t; *ch; ch++) {
			performOp += (*ch > 0) ? 1 : -1;
		}
	}

	if (performOp > 0) {
		return upperLatin1(t);
	}

	return t;
}


/**
 * This is a fallback method.  It should never be called.
 * If UTF8 support is desired, then a UTF8 StringMgr needs
 * to be used.
 *
 * Here we just do our best.
 *
 * Converts the param to a lower case UTF8 string
 * @param t - The text encoded in utf8 which should be turned into an lower case string
 *
 */	
char *StringMgr::lowerUTF8(char *t, unsigned int maxlen) const {
	// try to decide if it's worth trying to tolower.  Do we have more
	// characters which are probably lower latin than not?
	// we still don't use isValidUTF8 optimally. what if we have 1 unicode
	// character in the string?  should we not try to lower any of the string?
	// dunno.  Best solution is to lower all other characters. Don't have
	// time to write that before release.
	long performOp = 0;
	if (!isValidUTF8((unsigned char *)t)) {
		performOp = 1;
	}
	else {
		for (const char *ch = t; *ch; ch++) {
			performOp += (*ch > 0) ? 1 : -1;
		}
	}

	if (performOp > 0) {
		return lowerLatin1(t);
	}

	return t;
}

bool StringMgr::isUpper(SW_u32 character) const {
	return isupper(character);
}
bool StringMgr::isLower(SW_u32 character) const {
	return islower(character);
}
bool StringMgr::isDigit(SW_u32 character) const {
	return isdigit(character);
}
bool StringMgr::isAlpha(SW_u32 character) const {
	return isalpha(character);
}



/**
 * Converts the param to an uppercase latin1 string
 * @param The text encoded in latin1 which should be turned into an upper case string
 */	
char *StringMgr::upperLatin1(char *buf, unsigned int maxlen) const {
	if (!buf)
		return 0;
		
	char *ret = buf;
	bool checkMax = maxlen;

	while (*buf && (!checkMax || maxlen--)) {
		*buf = SW_toupper(*buf);
		buf++;
	}

	return ret;
}

bool StringMgr::supportsUnicode() const {
	return false; //default impl has no UTF8 support
}


#ifdef _ICU_

char *ICUStringMgr::upperUTF8(char *buf, unsigned int maxlen) const {
	char *ret = buf;
	int max = (int)((maxlen) ? maxlen : strlen(buf));
		
	UErrorCode err = U_ZERO_ERROR;
		
	if (!buf || !max) {
		return ret;
	}
		
	UChar *lowerStr = new UChar[max+10];
	UChar *upperStr = new UChar[max+10];
		
	u_strFromUTF8(lowerStr, max+9, 0, buf, -1, &err);
	if (err != U_ZERO_ERROR) {
//		SWLog::getSystemLog()->logError("from: %s", u_errorName(err));
		delete [] lowerStr;
		delete [] upperStr;
		return ret;
	}

	u_strToUpper(upperStr, max+9, lowerStr, -1, 0, &err);
	if (err != U_ZERO_ERROR) {
//		SWLog::getSystemLog()->logError("upperCase: %s", u_errorName(err));
		delete [] lowerStr;
		delete [] upperStr;
		return ret;
	}

	ret = u_strToUTF8(ret, max, 0, upperStr, -1, &err);
		
	delete [] lowerStr;
	delete [] upperStr;
	return ret;
}

char *ICUStringMgr::lowerUTF8(char *buf, unsigned int maxlen) const {
	char *ret = buf;
	int max = (int)((maxlen) ? maxlen : strlen(buf));
		
	UErrorCode err = U_ZERO_ERROR;
		
	if (!buf || !max) {
		return ret;
	}
		
	UChar *sourceStr = new UChar[max+10];
	UChar *resultStr = new UChar[max+10];
		
	u_strFromUTF8(sourceStr, max+9, 0, buf, -1, &err);
	if (err != U_ZERO_ERROR) {
//		SWLog::getSystemLog()->logError("from: %s", u_errorName(err));
		delete [] sourceStr;
		delete [] resultStr;
		return ret;
	}

	u_strToLower(resultStr, max+9, sourceStr, -1, 0, &err);
	if (err != U_ZERO_ERROR) {
//		SWLog::getSystemLog()->logError("upperCase: %s", u_errorName(err));
		delete [] sourceStr;
		delete [] resultStr;
		return ret;
	}

	ret = u_strToUTF8(ret, max, 0, resultStr, -1, &err);
		
	delete [] sourceStr;
	delete [] resultStr;
	return ret;
}

bool ICUStringMgr::isUpper(SW_u32 character) const {
	return u_isupper(character);
}
bool ICUStringMgr::isLower(SW_u32 character) const {
	return u_islower(character);
}
bool ICUStringMgr::isDigit(SW_u32 character) const {
	return u_isdigit(character);
}
bool ICUStringMgr::isAlpha(SW_u32 character) const {
	return u_isalpha(character);
}
	
#endif

SWORD_NAMESPACE_END
