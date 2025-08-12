/******************************************************************************
 *
 *  utf8transliterator.cpp -	SWFilter descendant to transliterate between
 *				ICU-supported scripts
 *
 * $Id: utf8transliterator.cpp 3822 2020-11-03 18:54:47Z scribe $
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

#ifdef _ICU_

#include <stdlib.h>

#include <utilstr.h>

#include <unicode/ucnv.h>
#include <unicode/uchar.h>
#include <utf8transliterator.h>
#include <swmodule.h>

#ifndef _ICUSWORD_
#include "unicode/resbund.h"
#endif
#include <swlog.h>

SWORD_NAMESPACE_START

const char UTF8Transliterator::optionstring[NUMTARGETSCRIPTS][16] = {
        "Off",
        "Latin",
        /*
        "IPA",
        "Basic Latin",
        "SBL",
        "TC",
        "Beta",
        "BGreek",
        "SERA",
        "Hugoye",
        "UNGEGN",
        "ISO",
        "ALA-LC",
        "BGN",
        "Greek",
        "Hebrew",
        "Cyrillic",
        "Arabic",
        "Syriac",
        "Katakana",
        "Hiragana",
        "Hangul",
        "Devanagari",
        "Tamil",
        "Bengali",
        "Gurmukhi",
        "Gujarati",
        "Oriya",
        "Telugu",
        "Kannada",
        "Malayalam",
        "Thai",
        "Georgian",
        "Armenian",
        "Ethiopic",
        "Gothic",
        "Ugaritic",
        "Coptic",
        "Linear B",
        "Cypriot",
        "Runic",
        "Ogham",
        "Thaana",
        "Glagolitic",
        "Cherokee",
        */
};

const char UTF8Transliterator::optName[] = "Transliteration";
const char UTF8Transliterator::optTip[] = "Transliterates between scripts";

#ifdef ICU_CUSTOM_RESOURCE_BUILDING
SWTransMap UTF8Transliterator::transMap;

#ifndef _ICUSWORD_

const char UTF8Transliterator::SW_RB_RULE_BASED_IDS[] = "RuleBasedTransliteratorIDs";
const char UTF8Transliterator::SW_RB_RULE[] = "Rule";
#ifdef SWICU_DATA
const char UTF8Transliterator::SW_RESDATA[] = SWICU_DATA;
#else
const char UTF8Transliterator::SW_RESDATA[] = "/usr/local/lib/sword/";
#endif

class SWCharString {
 public:
    inline SWCharString(const UnicodeString& str);
    inline ~SWCharString();
    inline operator const char*() { return ptr; }
 private:
    char buf[128];
    char* ptr;
};
SWCharString::SWCharString(const UnicodeString& str) {
    // TODO This isn't quite right -- we should probably do
    // preflighting here to determine the real length.
    if (str.length() >= (int32_t)sizeof(buf)) {
        ptr = new char[str.length() + 8];
    } else {
        ptr = buf;
    }
    str.extract(0, 0x7FFFFFFF, ptr, "");
}

SWCharString::~SWCharString() {
    if (ptr != buf) {
        delete[] ptr;
    }
}

#endif // _ICUSWORD_
#endif // ICU_CUSTOM_RESOURCE_BUILDING

UTF8Transliterator::UTF8Transliterator() {
	option = 0;
        unsigned long i;
	for (i = 0; i < NUMTARGETSCRIPTS; i++) {
		options.push_back(optionstring[i]);
	}
#ifdef ICU_CUSTOM_RESOURCE_BUILDING
#ifndef _ICUSWORD_
	utf8status = U_ZERO_ERROR;
	Load(utf8status);
#endif
#endif
}


UTF8Transliterator::~UTF8Transliterator() {
}

#ifdef ICU_CUSTOM_RESOURCE_BUILDING
void UTF8Transliterator::Load(UErrorCode &status)
{
#ifndef _ICUSWORD_
	static const char translit_swordindex[] = "translit_swordindex";
	
	UResourceBundle *bundle = 0, *transIDs = 0, *colBund = 0;
	bundle = ures_openDirect(SW_RESDATA, translit_swordindex, &status);
	if (U_FAILURE(status)) {
		SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: no resource index to load");
		SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: status %s", u_errorName(status));
		return;
	}

	transIDs = ures_getByKey(bundle, SW_RB_RULE_BASED_IDS, 0, &status);
	//UParseError parseError;

	int32_t row, maxRows;
	if (U_SUCCESS(status)) {
		maxRows = ures_getSize(transIDs);
        	for (row = 0; row < maxRows; row++) {
			colBund = ures_getByIndex(transIDs, row, 0, &status);

			if (U_SUCCESS(status) && ures_getSize(colBund) == 4) {
				UnicodeString id = ures_getUnicodeStringByIndex(colBund, 0, &status);
                        	UChar type = ures_getUnicodeStringByIndex(colBund, 1, &status).charAt(0);
				UnicodeString resString = ures_getUnicodeStringByIndex(colBund, 2, &status);
SWLOGD("ok so far");

				 if (U_SUCCESS(status)) {
					switch (type) {
					case 0x66: // 'f'
					case 0x69: // 'i'
						// 'file' or 'internal';
						// row[2]=resource, row[3]=direction
						{
							//UBool visible = (type == 0x0066 /*f*/);
							UTransDirection dir =
								(ures_getUnicodeStringByIndex(colBund, 3, &status).charAt(0) ==
								0x0046 /*F*/) ?
								UTRANS_FORWARD : UTRANS_REVERSE;
		                                        //registry->put(id, resString, dir, visible);
SWLOGD("instantiating %s ...", resString.getBuffer());
					    		registerTrans(id, resString, dir, status);
SWLOGD("done.");
	                                	}
						break;
					case 0x61: // 'a'
                	                	// 'alias'; row[2]=createInstance argument
                        	        	//registry->put(id, resString, TRUE);
                                		break;
					}
        	                 }
                	         else SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Failed to get resString");
	                }
			else SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Failed to get row");
			ures_close(colBund);
		}
	}
	else {
		SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: no resource index to load");
		SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: status %s", u_errorName(status));
	}

	ures_close(transIDs);
	ures_close(bundle);

#endif // _ICUSWORD_
}

void  UTF8Transliterator::registerTrans(const UnicodeString& ID, const UnicodeString& resource,
		UTransDirection dir, UErrorCode &status )
{
#ifndef _ICUSWORD_
SWLOGD("registering ID locally %s", ID.getBuffer());
		SWTransData swstuff;
		swstuff.resource = resource;
		swstuff.dir = dir;
		SWTransPair swpair;
		swpair.first = ID;
		swpair.second = swstuff;
		transMap.insert(swpair);
#endif
}

bool UTF8Transliterator::checkTrans(const UnicodeString& ID, UErrorCode &status )
{
#ifndef _ICUSWORD_
		Transliterator *trans = Transliterator::createInstance(ID, UTRANS_FORWARD, status);
		if (!U_FAILURE(status)) {
			// already have it, clean up and return true
SWLOGD("already have it %s", ID.getBuffer());
			delete trans;
			return true;
		}
		status = U_ZERO_ERROR;
	
	SWTransMap::iterator swelement;
	if ((swelement = transMap.find(ID)) != transMap.end()) {
SWLOGD("found element in map");
		SWTransData swstuff = (*swelement).second;
		UParseError parseError;
		//UErrorCode status;
		//std::cout << "unregistering " << ID << std::endl;
		//Transliterator::unregister(ID);
SWLOGD("resource is %s", swstuff.resource.getBuffer());

		// Get the rules
		//std::cout << "importing: " << ID << ", " << resource << std::endl;
		SWCharString ch(swstuff.resource);
		UResourceBundle *bundle = ures_openDirect(SW_RESDATA, ch, &status);
		const UnicodeString rules = ures_getUnicodeStringByKey(bundle, SW_RB_RULE, &status);
		ures_close(bundle);
		//parser.parse(rules, isReverse ? UTRANS_REVERSE : UTRANS_FORWARD,
		//        parseError, status);
		if (U_FAILURE(status)) {
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Failed to get rules");
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: status %s", u_errorName(status));
			return false;
		}

		
		Transliterator *trans = Transliterator::createFromRules(ID, rules, swstuff.dir,
			parseError,status);
		if (U_FAILURE(status)) {
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Failed to create transliterator");
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: status %s", u_errorName(status));
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Parse error: line %s", parseError.line);
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Parse error: offset %d", parseError.offset);
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Parse error: preContext %s", *parseError.preContext);
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: Parse error: postContext %s", *parseError.postContext);
			SWLog::getSystemLog()->logError("UTF8Transliterator: ICU: rules were");
//			SWLog::getSystemLog()->logError((const char *)rules);
			return false;
		}

		Transliterator::registerInstance(trans);
		return true;
		
		//Transliterator *trans = instantiateTrans(ID, swstuff.resource, swstuff.dir, parseError, status);
		//return trans;
	}
	else {
		return false;
	}
#else
return true;
#endif // _ICUSWORD_
}
#endif // ICU_CUSTOM_RESOURCE_BUILDING

bool UTF8Transliterator::addTrans(const char* newTrans, SWBuf* transList) {
#ifdef ICU_CUSTOM_RESOURCE_BUILDING
#ifdef _ICUSWORD_
	UErrorCode status;
	if (checkTrans(UnicodeString(newTrans), status)) {
#endif
#endif // ICU_CUSTOM_RESOURCE_BUILDING
		*transList += newTrans;
		*transList += ";";
		return true;
#ifdef ICU_CUSTOM_RESOURCE_BUILDING
#ifdef _ICUSWORD_
	}
	else {
    	return false;
	}
#endif
#endif // ICU_CUSTOM_RESOURCE_BUILDING
}


icu::Transliterator * UTF8Transliterator::createTrans(const icu::UnicodeString& ID, UTransDirection dir, UErrorCode &status )
{
	icu::Transliterator *trans = icu::Transliterator::createInstance(ID,UTRANS_FORWARD,status);
	if (U_FAILURE(status)) {
		delete trans;
		return NULL;
	}
	else {
		return trans;
	}
}

void UTF8Transliterator::setOptionValue(const char *ival)
{
	unsigned char i = option = NUMTARGETSCRIPTS;
	while (i && stricmp(ival, optionstring[i])) {
		i--;
		option = i;
	}
}

const char *UTF8Transliterator::getOptionValue()
{
	return (NUMTARGETSCRIPTS > option) ? optionstring[option] : 0;
}

char UTF8Transliterator::processText(SWBuf &text, const SWKey *key, const SWModule *module)
{
	if (option) {	// if we want transliteration
		unsigned long i, j;
                UErrorCode err = U_ZERO_ERROR;
                UConverter * conv = NULL;
                conv = ucnv_open("UTF-8", &err);
                SWBuf ID;

                bool compat = false;

		// Convert UTF-8 string to UTF-16 (UChars)
                j = strlen(text);
                int32_t len = (j * 2) + 1;
                UChar *source = new UChar[len];
                err = U_ZERO_ERROR;
                len = ucnv_toUChars(conv, source, len, text, j, &err);
                source[len] = 0;

		// Figure out which scripts are used in the string
		unsigned char scripts[NUMSCRIPTS];

                for (i = 0; i < NUMSCRIPTS; i++) {
                        scripts[i] = false;
                }

                for (i = 0; i < (unsigned long)len; i++) {
                        j = ublock_getCode(source[i]);
			scripts[SE_LATIN] = true;
			switch (j) {
			//case UBLOCK_BASIC_LATIN: scripts[SE_LATIN] = true; break;
			case UBLOCK_GREEK: scripts[SE_GREEK] = true; break;
			case UBLOCK_HEBREW: scripts[SE_HEBREW] = true; break;
			case UBLOCK_CYRILLIC: scripts[SE_CYRILLIC] = true; break;
			case UBLOCK_ARABIC: scripts[SE_ARABIC] = true; break;
			case UBLOCK_SYRIAC: scripts[SE_SYRIAC] = true; break;
			case UBLOCK_KATAKANA: scripts[SE_KATAKANA] = true; break;
			case UBLOCK_HIRAGANA: scripts[SE_HIRAGANA] = true; break;
			case UBLOCK_HANGUL_SYLLABLES: scripts[SE_HANGUL] = true; break;
			case UBLOCK_HANGUL_JAMO: scripts[SE_JAMO] = true; break;
			case UBLOCK_DEVANAGARI: scripts[SE_DEVANAGARI] = true; break;
			case UBLOCK_TAMIL: scripts[SE_TAMIL] = true; break;
			case UBLOCK_BENGALI: scripts[SE_BENGALI] = true; break;
			case UBLOCK_GURMUKHI: scripts[SE_GURMUKHI] = true; break;
			case UBLOCK_GUJARATI: scripts[SE_GUJARATI] = true; break;
			case UBLOCK_ORIYA: scripts[SE_ORIYA] = true; break;
			case UBLOCK_TELUGU: scripts[SE_TELUGU] = true; break;
			case UBLOCK_KANNADA: scripts[SE_KANNADA] = true; break;
			case UBLOCK_MALAYALAM: scripts[SE_MALAYALAM] = true; break;
			case UBLOCK_THAI: scripts[SE_THAI] = true; break;
			case UBLOCK_GEORGIAN: scripts[SE_GEORGIAN] = true; break;
			case UBLOCK_ARMENIAN: scripts[SE_ARMENIAN] = true; break;
			case UBLOCK_ETHIOPIC: scripts[SE_ETHIOPIC] = true; break;
			case UBLOCK_GOTHIC: scripts[SE_GOTHIC] = true; break;
			case UBLOCK_UGARITIC: scripts[SE_UGARITIC] = true; break;
//			case UBLOCK_MEROITIC: scripts[SE_MEROITIC] = true; break;
			case UBLOCK_LINEAR_B_SYLLABARY: scripts[SE_LINEARB] = true; break;
			case UBLOCK_CYPRIOT_SYLLABARY: scripts[SE_CYPRIOT] = true; break;
			case UBLOCK_RUNIC: scripts[SE_RUNIC] = true; break;
			case UBLOCK_OGHAM: scripts[SE_OGHAM] = true; break;
			case UBLOCK_THAANA: scripts[SE_THAANA] = true; break;
			case UBLOCK_GLAGOLITIC: scripts[SE_GLAGOLITIC] = true; break;
                        case UBLOCK_CHEROKEE: scripts[SE_CHEROKEE] = true; break;
//			case UBLOCK_TENGWAR: scripts[SE_TENGWAR] = true; break;
//			case UBLOCK_CIRTH: scripts[SE_CIRTH] = true; break;
			case UBLOCK_CJK_RADICALS_SUPPLEMENT:
			case UBLOCK_KANGXI_RADICALS:
			case UBLOCK_IDEOGRAPHIC_DESCRIPTION_CHARACTERS:
			case UBLOCK_CJK_SYMBOLS_AND_PUNCTUATION:
			case UBLOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A:
			case UBLOCK_CJK_UNIFIED_IDEOGRAPHS:
                                scripts[SE_HAN] = true;
                                break;
			case UBLOCK_CJK_COMPATIBILITY:
			case UBLOCK_CJK_COMPATIBILITY_IDEOGRAPHS:
			case UBLOCK_CJK_COMPATIBILITY_FORMS:
                                scripts[SE_HAN] = true;
                                compat = true;
        			break;
			case UBLOCK_HANGUL_COMPATIBILITY_JAMO:
                                scripts[SE_HANGUL] = true;
                                compat = true;
                                break;

                        //default: scripts[SE_LATIN] = true;
			}
		}
		scripts[option] = false; //turn off the reflexive transliteration

		//return if we have no transliteration to do for this text
                j = 0;
               	for (i = 0; !j && i < NUMSCRIPTS; i++) {
	        	if (scripts[i]) j++;
        	}
	       	if (!j) {
                        ucnv_close(conv);
                        return 0;
                }

                if (compat) {
                        addTrans("NFKD", &ID);
                }
                else {
                        addTrans("NFD", &ID);
                }

		//Simple X to Latin transliterators
		if (scripts[SE_GREEK]) {
			if (strnicmp (((SWModule*)module)->getLanguage(), "cop", 3)) {
				if (option == SE_SBL)
					addTrans("Greek-Latin/SBL", &ID);
				else if (option == SE_TC)
					addTrans("Greek-Latin/TC", &ID);
				else if (option == SE_BETA)
					addTrans("Greek-Latin/Beta", &ID);
				else if (option == SE_BGREEK)
					addTrans("Greek-Latin/BGreek", &ID);
	                        else if (option == SE_UNGEGN)
        	                	addTrans("Greek-Latin/UNGEGN", &ID);
				else if (option == SE_ISO)
        	                	addTrans("Greek-Latin/ISO", &ID);
                                else if (option == SE_ALALC)
        	                	addTrans("Greek-Latin/ALALC", &ID);
                                else if (option == SE_BGN)
        	                	addTrans("Greek-Latin/BGN", &ID);
                                else if (option == SE_IPA)
        	                	addTrans("Greek-IPA/Ancient", &ID);
                                else {
        	                	addTrans("Greek-Latin", &ID);
					scripts[SE_LATIN] = true;
                                }
			}
			else {
				if (option == SE_SBL)
					addTrans("Coptic-Latin/SBL", &ID);
				else if (option == SE_TC)
					addTrans("Coptic-Latin/TC", &ID);
				else if (option == SE_BETA)
					addTrans("Coptic-Latin/Beta", &ID);
                                else if (option == SE_IPA)
        	                	addTrans("Coptic-IPA", &ID);
                                else {
        	                	addTrans("Coptic-Latin", &ID);
					scripts[SE_LATIN] = true;
                                }
			}
		}
		if (scripts[SE_HEBREW]) {
                        if (option == SE_SBL)
                                addTrans("Hebrew-Latin/SBL", &ID);
                        else if (option == SE_TC)
                                addTrans("Hebrew-Latin/TC", &ID);
			else if (option == SE_BETA)
				addTrans("Hebrew-Latin/Beta", &ID);
                        else if (option == SE_UNGEGN)
                                addTrans("Hebrew-Latin/UNGEGN", &ID);
                        else if (option == SE_ALALC)
                                addTrans("Hebrew-Latin/ALALC", &ID);
                        else if (option == SE_SYRIAC)
                                addTrans("Hebrew-Syriac", &ID);
			else {
				addTrans("Hebrew-Latin", &ID);
                                scripts[SE_LATIN] = true;
			}
		}
		if (scripts[SE_CYRILLIC]) {
                	if (option == SE_GLAGOLITIC)
                        	addTrans("Cyrillic-Glagolitic", &ID);
                	else {
				addTrans("Cyrillic-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_ARABIC]) {
			addTrans("Arabic-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_SYRIAC]) {
                        if (option == SE_TC)
                                addTrans("Syriac-Latin/TC", &ID);
                        else if (option == SE_BETA)
        			addTrans("Syriac-Latin/Beta", &ID);
                        else if (option == SE_HUGOYE)
        			addTrans("Syriac-Latin/Hugoye", &ID);
                        else if (option == SE_HEBREW)
                                addTrans("Syriac-Hebrew", &ID);
                        else {
        			addTrans("Syriac-Latin", &ID);
        			scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_THAI]) {
			addTrans("Thai-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_GEORGIAN]) {
                        if (option == SE_ISO)
        			addTrans("Georgian-Latin/ISO", &ID);
                        else if (option == SE_ALALC)
        			addTrans("Georgian-Latin/ALALC", &ID);
                        else if (option == SE_BGN)
        			addTrans("Georgian-Latin/BGN", &ID);
                        else if (option == SE_IPA)
        			addTrans("Georgian-IPA", &ID);
                        else {
				addTrans("Georgian-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_ARMENIAN]) {
                        if (option == SE_ISO)
        			addTrans("Armenian-Latin/ISO", &ID);
                        else if (option == SE_ALALC)
        			addTrans("Armenian-Latin/ALALC", &ID);
                        else if (option == SE_BGN)
        			addTrans("Armenian-Latin/BGN", &ID);
                        else if (option == SE_IPA)
        			addTrans("Armenian-IPA", &ID);
                        else {
				addTrans("Armenian-Latin", &ID);
				scripts[SE_LATIN] = true;
                	}
		}
		if (scripts[SE_ETHIOPIC]) {
                        if (option == SE_UNGEGN)
        			addTrans("Ethiopic-Latin/UNGEGN", &ID);
                        else if (option == SE_ISO)
        			addTrans("Ethiopic-Latin/ISO", &ID);
                        else if (option == SE_ALALC)
        			addTrans("Ethiopic-Latin/ALALC", &ID);
                        else if (option == SE_SERA)
        			addTrans("Ethiopic-Latin/SERA", &ID);
                	else {
				addTrans("Ethiopic-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_GOTHIC]) {
                        if (option == SE_BASICLATIN)
        			addTrans("Gothic-Latin/Basic", &ID);
                        else if (option == SE_IPA)
        			addTrans("Gothic-IPA", &ID);
                	else {
				addTrans("Gothic-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_UGARITIC]) {
                	if (option == SE_SBL)
                        	addTrans("Ugaritic-Latin/SBL", &ID);
                        else {
				addTrans("Ugaritic-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_MEROITIC]) {
			addTrans("Meroitic-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_LINEARB]) {
			addTrans("LinearB-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_CYPRIOT]) {
			addTrans("Cypriot-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_RUNIC]) {
			addTrans("Runic-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_OGHAM]) {
			addTrans("Ogham-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_THAANA]) {
			if (option == SE_ALALC)
                        	addTrans("Thaana-Latin/ALALC", &ID);
			else if (option == SE_BGN)
                        	addTrans("Thaana-Latin/BGN", &ID);
			else {
				addTrans("Thaana-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_GLAGOLITIC]) {
			if (option == SE_ISO)
                        	addTrans("Glagolitic-Latin/ISO", &ID);
			else if (option == SE_ALALC)
                        	addTrans("Glagolitic-Latin/ALALC", &ID);
			else if (option == SE_ALALC)
                        	addTrans("Glagolitic-Cyrillic", &ID);
			else {
				addTrans("Glagolitic-Latin", &ID);
				scripts[SE_LATIN] = true;
                        }
		}
		if (scripts[SE_CHEROKEE]) {
			addTrans("Cherokee-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_THAI]) {
			addTrans("Thai-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_THAI]) {
			addTrans("Thai-Latin", &ID);
			scripts[SE_LATIN] = true;
		}

		if (scripts[SE_HAN]) {
	        	if (!strnicmp (((SWModule*)module)->getLanguage(), "ja", 2)) {
     				addTrans("Kanji-Romaji", &ID);
			}
			else {
       				addTrans("Han-Latin", &ID);
			}
			scripts[SE_LATIN] = true;
		}

       		// Inter-Kana and Kana to Latin transliterators
		if (option == SE_HIRAGANA && scripts[SE_KATAKANA]) {
			addTrans("Katakana-Hiragana", &ID);
			scripts[SE_HIRAGANA] = true;
		}
		else if (option == SE_KATAKANA && scripts[SE_HIRAGANA]) {
			addTrans("Hiragana-Katakana", &ID);
			scripts[SE_KATAKANA] = true;
		}
		else {
        		if (scripts[SE_KATAKANA]) {
	        		addTrans("Katakana-Latin", &ID);
		        	scripts[SE_LATIN] = true;
        		}
	        	if (scripts[SE_HIRAGANA]) {
		        	addTrans("Hiragana-Latin", &ID);
			        scripts[SE_LATIN] = true;
        		}
                }

		// Korean to Latin transliterators
		if (scripts[SE_HANGUL]) {
			addTrans("Hangul-Latin", &ID);
			scripts[SE_LATIN] = true;
		}
		if (scripts[SE_JAMO]) {
			addTrans("Jamo-Latin", &ID);
			scripts[SE_LATIN] = true;
		}

		// Indic-Latin
		if (option < SE_DEVANAGARI || option > SE_MALAYALAM) {
			// Indic to Latin
			if (scripts[SE_TAMIL]) {
				addTrans("Tamil-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_BENGALI]) {
				addTrans("Bengali-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_GURMUKHI]) {
				addTrans("Gurmukhi-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_GUJARATI]) {
				addTrans("Gujarati-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_ORIYA]) {
				addTrans("Oriya-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_TELUGU]) {
				addTrans("Telugu-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_KANNADA]) {
				addTrans("Kannada-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
			if (scripts[SE_MALAYALAM]) {
				addTrans("Malayalam-Latin", &ID);
				scripts[SE_LATIN] = true;
			}
		}
		else {
			if (scripts[SE_LATIN]) {
				addTrans("Latin-InterIndic", &ID);
			}
			if (scripts[SE_DEVANAGARI]) {
				addTrans("Devanagari-InterIndic", &ID);
			}
			if (scripts[SE_TAMIL]) {
				addTrans("Tamil-InterIndic", &ID);
			}
			if (scripts[SE_BENGALI]) {
				addTrans("Bengali-InterIndic", &ID);
			}
			if (scripts[SE_GURMUKHI]) {
				addTrans("Gurmurkhi-InterIndic", &ID);
			}
			if (scripts[SE_GUJARATI]) {
				addTrans("Gujarati-InterIndic", &ID);
			}
			if (scripts[SE_ORIYA]) {
				addTrans("Oriya-InterIndic", &ID);
			}
			if (scripts[SE_TELUGU]) {
				addTrans("Telugu-InterIndic", &ID);
			}
			if (scripts[SE_KANNADA]) {
				addTrans("Kannada-InterIndic", &ID);
			}
			if (scripts[SE_MALAYALAM]) {
				addTrans("Malayalam-InterIndic", &ID);
			}

			switch(option) {
			case SE_DEVANAGARI:
				addTrans("InterIndic-Devanagari", &ID);
				break;
			case SE_TAMIL:
				addTrans("InterIndic-Tamil", &ID);
				break;
			case SE_BENGALI:
				addTrans("InterIndic-Bengali", &ID);
				break;
			case SE_GURMUKHI:
				addTrans("InterIndic-Gurmukhi", &ID);
				break;
			case SE_GUJARATI:
				addTrans("InterIndic-Gujarati", &ID);
				break;
			case SE_ORIYA:
				addTrans("InterIndic-Oriya", &ID);
				break;
			case SE_TELUGU:
				addTrans("InterIndic-Telugu", &ID);
				break;
			case SE_KANNADA:
				addTrans("InterIndic-Kannada", &ID);
				break;
			case SE_MALAYALAM:
				addTrans("InterIndic-Malayalam", &ID);
				break;
			default:
				addTrans("InterIndic-Latin", &ID);
				scripts[SE_LATIN] = true;
				break;
			}
		}

//		if (scripts[SE_TENGWAR]) {
//			addTrans("Tengwar-Latin", &ID);
//			scripts[SE_LATIN] = true;
//		}
//		if (scripts[SE_CIRTH]) {
//			addTrans("Cirth-Latin", &ID);
//			scripts[SE_LATIN] = true;
//		}

		if (scripts[SE_LATIN]) {
                switch (option) {
                        case SE_GREEK:
				addTrans("Latin-Greek", &ID);
                                break;
                        case SE_HEBREW:
				addTrans("Latin-Hebrew", &ID);
                                break;
                        case SE_CYRILLIC:
				addTrans("Latin-Cyrillic", &ID);
                                break;
                        case SE_ARABIC:
				addTrans("Latin-Arabic", &ID);
                                break;
                        case SE_SYRIAC:
				addTrans("Latin-Syriac", &ID);
                                break;
                        case SE_THAI:
				addTrans("Latin-Thai", &ID);
                                break;
                        case SE_GEORGIAN:
				addTrans("Latin-Georgian", &ID);
                                break;
                        case SE_ARMENIAN:
				addTrans("Latin-Armenian", &ID);
                                break;
                        case SE_ETHIOPIC:
				addTrans("Latin-Ethiopic", &ID);
                                break;
                        case SE_GOTHIC:
				addTrans("Latin-Gothic", &ID);
                                break;
                        case SE_UGARITIC:
				addTrans("Latin-Ugaritic", &ID);
                                break;
                        case SE_COPTIC:
				addTrans("Latin-Coptic", &ID);
                                break;
                        case SE_KATAKANA:
				addTrans("Latin-Katakana", &ID);
                                break;
                        case SE_HIRAGANA:
				addTrans("Latin-Hiragana", &ID);
                                break;
                        case SE_JAMO:
				addTrans("Latin-Jamo", &ID);
                                break;
                        case SE_HANGUL:
				addTrans("Latin-Hangul", &ID);
                                break;
                        case SE_MEROITIC:
				addTrans("Latin-Meroitic", &ID);
                                break;
                        case SE_LINEARB:
				addTrans("Latin-LinearB", &ID);
                                break;
                        case SE_CYPRIOT:
				addTrans("Latin-Cypriot", &ID);
                                break;
                        case SE_RUNIC:
				addTrans("Latin-Runic", &ID);
                                break;
                        case SE_OGHAM:
				addTrans("Latin-Ogham", &ID);
                                break;
                        case SE_THAANA:
				addTrans("Latin-Thaana", &ID);
                                break;
                        case SE_GLAGOLITIC:
				addTrans("Latin-Glagolitic", &ID);
                                break;
                        case SE_CHEROKEE:
				addTrans("Latin-Cherokee", &ID);
                                break;
//                        case SE_TENGWAR:
//				addTrans("Latin-Tengwar", &ID);
//                                break;
//                        case SE_CIRTH:
//				addTrans("Latin-Cirth", &ID);
//                                break;
                        }
                }

                if (option == SE_BASICLATIN) {
                        addTrans("Any-Latin1", &ID);
                }

                addTrans("NFC", &ID);

                err = U_ZERO_ERROR;
                icu::Transliterator * trans = createTrans(icu::UnicodeString(ID), UTRANS_FORWARD, err);
                if (trans && !U_FAILURE(err)) {
                        icu::UnicodeString target = icu::UnicodeString(source);
			trans->transliterate(target);
			text.setSize(text.size()*2);
			len = ucnv_fromUChars(conv, text.getRawData(), text.size(), target.getBuffer(), target.length(), &err);
			text.setSize(len);
			delete trans;
                }
                ucnv_close(conv);
        }
	return 0;
}

SWORD_NAMESPACE_END
#endif



