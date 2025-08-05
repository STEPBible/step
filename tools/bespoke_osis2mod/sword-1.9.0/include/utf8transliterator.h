/******************************************************************************
 *
 * utf8transliterator.h -	class UTF8Transliterator: a Filter to
 * 				transliterate a UTF8 text stream into
 * 				an alternate script. e.g., Hebrew to Latin
 *
 * $Id: utf8transliterator.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef UTF8TRANSLITERATOR_H
#define UTF8TRANSLITERATOR_H

enum scriptEnum {SE_OFF, SE_LATIN, 
/*one-way (to) transliterators*/ 
SE_IPA, SE_BASICLATIN, SE_SBL, SE_TC, SE_BETA, SE_BGREEK, SE_SERA, SE_HUGOYE, SE_UNGEGN, SE_ISO, SE_ALALC, SE_BGN, 
/*two-way transliterators*/ 
SE_GREEK, SE_HEBREW, SE_CYRILLIC, SE_ARABIC, SE_SYRIAC, SE_KATAKANA, SE_HIRAGANA, SE_HANGUL, SE_DEVANAGARI, SE_TAMIL, SE_BENGALI, SE_GURMUKHI, SE_GUJARATI, SE_ORIYA, SE_TELUGU, SE_KANNADA, SE_MALAYALAM, SE_THAI, SE_GEORGIAN, SE_ARMENIAN, SE_ETHIOPIC, SE_GOTHIC, SE_UGARITIC, SE_COPTIC, SE_MEROITIC, SE_LINEARB, SE_CYPRIOT, SE_RUNIC, SE_OGHAM, SE_THAANA, SE_GLAGOLITIC, SE_CHEROKEE,
/*SE_TENGWAR, SE_CIRTH,*/
/*one-way (from) transliterators*/
SE_JAMO, SE_HAN, SE_KANJI
};

#define NUMSCRIPTS 49
#define NUMTARGETSCRIPTS 2 //NUMSCRIPTS-3//6

#include <swoptfilter.h>

#include <unicode/unistr.h>

#include <unicode/translit.h>

#include <defs.h>
#include <map>

SWORD_NAMESPACE_START

class SWModule;

struct SWTransData {
	icu::UnicodeString resource;
	UTransDirection dir;
};
typedef std::map<const icu::UnicodeString, SWTransData> SWTransMap;
typedef std::pair<icu::UnicodeString, SWTransData> SWTransPair;

/** This Filter uses ICU for transliteration
*/
class SWDLLEXPORT UTF8Transliterator : public SWOptionFilter {

private:
	unsigned char option;

	static const char optionstring[NUMTARGETSCRIPTS][16];

	static const char optName[];
	static const char optTip[];
	StringList options;

#ifdef ICU_CUSTOM_RESOURCE_BUILDING
	static const char SW_RB_RULE_BASED_IDS[];
	static const char SW_RB_RULE[];
	static const char SW_RESDATA[];
	static SWTransMap transMap;
	UErrorCode utf8status;

	void load(UErrorCode &status);
	void registerTrans(const UnicodeString& ID, const UnicodeString& resource, UTransDirection dir, UErrorCode &status);	
	bool checkTrans(const UnicodeString& ID, UErrorCode &status);
#endif
	bool addTrans(const char* newTrans, SWBuf* transList);
	icu::Transliterator *createTrans(const icu::UnicodeString& ID, UTransDirection dir, UErrorCode &status);

public:
	UTF8Transliterator();
	~UTF8Transliterator();
	virtual char processText(SWBuf &text, const SWKey *key = 0, const SWModule *module = 0);
	virtual const char *getOptionName() { return optName; }
	virtual const char *getOptionTip() { return optTip; }
	virtual void setOptionValue(const char *ival);
	virtual const char *getOptionValue();
	virtual StringList getOptionValues() { return options; }
};

SWORD_NAMESPACE_END
#endif
