/******************************************************************************
 *
 * stringmgr.h -	class StringMgr: base of string functions. Can be
 * 			subclassed and methods re-implemented your favorite
 * 			String library with Unicode support, e.g, ICU,
 * 			Qt, Java.
 *
 * $Id: stringmgr.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2004-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ	85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the GNU
 * General Public License for more details.
 *
 */


#ifndef STRINGMGR_H
#define STRINGMGR_H

#include <defs.h>
#include <swbuf.h>
#include <utilstr.h>

SWORD_NAMESPACE_START

/** StringMgr provide UTF8 handling
 * This class makes it possible to implement Unicode support on the client-side and not in SWORD itself.
 */
class SWDLLEXPORT StringMgr {
private:
	static StringMgr *systemStringMgr;
public:

	/** Sets the global StringMgr handle
	* @param newStringMgr The new global StringMgr. This pointer will be deleted by this StringMgr
	*/	
	static void setSystemStringMgr(StringMgr *newStringMgr);

	/** Returns the global StringMgr handle
	* @return The global string handle
	*/
	static StringMgr *getSystemStringMgr();

	/** Checks whether Utf8 support is available.
	* Override the function supportsUnicode() to tell whether your implementation has utf8 support.
	* @return True if this implementation provides support for Utf8 handling or false if just latin1 handling is available
	*/
	static inline bool hasUTF8Support() {
		return getSystemStringMgr()->supportsUnicode();
	};
	
	/** Converts the param to an upper case Utf8 string
	* @param text The text encoded in utf8 which should be turned into an upper case string
	* @param max Max buffer size
	* @return text buffer (only for convenience)
	*/	
	virtual char *upperUTF8(char *text, unsigned int max = 0) const;
	/** Converts the param to a lower case Utf8 string
	* @param text The text encoded in utf8 which should be turned into an upper case string
	* @param max Max buffer size
	* @return text buffer (only for convenience)
	*/	
	virtual char *lowerUTF8(char *text, unsigned int max = 0) const;

	virtual bool isUpper(SW_u32 character) const;
	virtual bool isLower(SW_u32 character) const;
	virtual bool isDigit(SW_u32 character) const;
	virtual bool isAlpha(SW_u32 character) const;

	/** Converts the param to an uppercase latin1 string
	* @param text The text encoded in latin1 which should be turned into an upper case string
	* @param max Max buffer size
	* @return text buffer (only for convenience)
	*/	
	virtual char *upperLatin1(char *text, unsigned int max = 0) const;
	

protected:
	friend class __staticsystemStringMgr;
	
	/** Default constructor. Protected to make instances on user side impossible, because this is a Singleton
	*/		
	StringMgr();

	/** Copy constructor
	*/	
	StringMgr(const StringMgr &);

	/** Destructor
	*/	
	virtual ~StringMgr();
	
	virtual bool supportsUnicode() const;
};


inline char *toupperstr(char *t, unsigned int max = 0) {
	return StringMgr::getSystemStringMgr()->upperUTF8(t, max);
}

inline char *tolowerstr(char *t, unsigned int max = 0) {
	return StringMgr::getSystemStringMgr()->lowerUTF8(t, max);
}
	
/*
 * @deprecated - SWBuf assumed to be UTF-8 now.
 */
inline char *toupperstr_utf8(char *t, unsigned int max = 0) {
	return StringMgr::getSystemStringMgr()->upperUTF8(t, max);
}


SWORD_NAMESPACE_END


#endif //STRINGMGR_H
