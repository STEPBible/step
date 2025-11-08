/******************************************************************************
 *
 *  tlitmgrtest.cpp -	
 *
 * $Id: tlitmgrtest.cpp 3618 2019-04-14 22:30:32Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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

/*
 * void Transliterator::initializeRegistry(void) {
    // Lock first, check registry pointer second
    Mutex lock(&registryMutex);
    if (registry != 0) {
        // We were blocked by another thread in initializeRegistry()
        return;
    }

    UErrorCode status = U_ZERO_ERROR;

    registry = new TransliteratorRegistry(status);
    if (registry == 0 || U_FAILURE(status)) {
        return; // out of memory, no recovery
    }

     * The following code parses the index table located in
     * icu/data/translit_index.txt.  The index is an n x 4 table
     * that follows this format:
     *
     *   <id>:file:<resource>:<direction>
     *   <id>:internal:<resource>:<direction>
     *   <id>:alias:<getInstanceArg>:
     *
     * <id> is the ID of the system transliterator being defined.  These
     * are public IDs enumerated by Transliterator.getAvailableIDs(),
     * unless the second field is "internal".
     *
     * <resource> is a ResourceReader resource name.  Currently these refer
     * to file names under com/ibm/text/resources.  This string is passed
     * directly to ResourceReader, together with <encoding>.
     *
     * <direction> is either "FORWARD" or "REVERSE".
     *
     * <getInstanceArg> is a string to be passed directly to
     * Transliterator.getInstance().  The returned Transliterator object
     * then has its ID changed to <id> and is returned.
     *
     * The extra blank field on "alias" lines is to make the array square.
     *
    static const char translit_index[] = "translit_index";

    UResourceBundle *bundle, *transIDs, *colBund;
    bundle = ures_openDirect(0, translit_index, &status);
    transIDs = ures_getByKey(bundle, RB_RULE_BASED_IDS, 0, &status);

    int32_t row, maxRows;
    if (U_SUCCESS(status)) {
        maxRows = ures_getSize(transIDs);
        for (row = 0; row < maxRows; row++) {
            colBund = ures_getByIndex(transIDs, row, 0, &status);

            if (U_SUCCESS(status) && ures_getSize(colBund) == 4) {
                UnicodeString id = ures_getUnicodeStringByIndex(colBund, 0, &status);
                UChar type = ures_getUnicodeStringByIndex(colBund, 1, &status).charAt(0);
                UnicodeString resString = ures_getUnicodeStringByIndex(colBund, 2, &status);

                if (U_SUCCESS(status)) {
                    switch (type) {
                    case 0x66: // 'f'
                    case 0x69: // 'i'
                        // 'file' or 'internal';
                        // row[2]=resource, row[3]=direction
                        {
                            UBool visible = (type == 0x0066 /f/);
                            UTransDirection dir =
                                (ures_getUnicodeStringByIndex(colBund, 3, &status).charAt(0) ==
                                 0x0046 /F/) ?
                                UTRANS_FORWARD : UTRANS_REVERSE;
                            registry->put(id, resString, dir, visible);
                        }
                        break;
                    case 0x61: // 'a'
                        // 'alias'; row[2]=createInstance argument
                        registry->put(id, resString, TRUE);
                        break;
                    }
                }
            }

            ures_close(colBund);
        }
    }

    ures_close(transIDs);
    ures_close(bundle);

    specialInverses = new Hashtable(TRUE);
    specialInverses->setValueDeleter(uhash_deleteUnicodeString);
    _registerSpecialInverse(NullTransliterator::SHORT_ID,
                            NullTransliterator::SHORT_ID, FALSE);

    // Manually add prototypes that the system knows about to the
    // cache.  This is how new non-rule-based transliterators are
    // added to the system.

    registry->put(new NullTransliterator(), TRUE);
    registry->put(new LowercaseTransliterator(), TRUE);
    registry->put(new UppercaseTransliterator(), TRUE);
    registry->put(new TitlecaseTransliterator(), TRUE);
    _registerSpecialInverse("Upper", "Lower", TRUE);
    _registerSpecialInverse("Title", "Lower", FALSE);
    registry->put(new UnicodeNameTransliterator(), TRUE);
    registry->put(new NameUnicodeTransliterator(), TRUE);
    RemoveTransliterator::registerIDs();
    EscapeTransliterator::registerIDs();
    UnescapeTransliterator::registerIDs();
    NormalizationTransliterator::registerIDs();
    ucln_i18n_registerCleanup();
}
*/


/*Transliterator* TransliteratorRegistry::instantiateEntry(const UnicodeString& ID,
                                                         Entry *entry,
                                                         TransliteratorAlias* &aliasReturn,
                                                         UParseError& parseError,
                                                         UErrorCode& status) {

    for (;;) {
        if (entry->entryType == Entry::RBT_DATA) {
            return new RuleBasedTransliterator(ID, entry->u.data);
        } else if (entry->entryType == Entry::PROTOTYPE) {
            return entry->u.prototype->clone();
        } else if (entry->entryType == Entry::ALIAS) {
            aliasReturn = new TransliteratorAlias(entry->stringArg);
            return 0;
        } else if (entry->entryType == Entry::FACTORY) {
            return entry->u.factory.function(ID, entry->u.factory.context);
        } else if (entry->entryType == Entry::COMPOUND_RBT) {
            UnicodeString id("_", "");
            Transliterator *t = new RuleBasedTransliterator(id, entry->u.data);
            aliasReturn = new TransliteratorAlias(ID, entry->stringArg, t, entry->intArg, entry->compoundFilter);
            return 0;
        }

        TransliteratorParser parser;

        if (entry->entryType == Entry::LOCALE_RULES) {
            parser.parse(entry->stringArg, (UTransDirection) entry->intArg,
                         parseError, status);
        } else {
		{
			// At this point entry type must be either RULES_FORWARD or
            // RULES_REVERSE.  We process the rule data into a
            // TransliteratorRuleData object, and possibly also into an
            // ::id header and/or footer.  Then we modify the registry with
            // the parsed data and retry.
            UBool isReverse = (entry->entryType == Entry::RULES_REVERSE);

            // We use the file name, taken from another resource bundle
            // 2-d array at static init time, as a locale language.  We're
            // just using the locale mechanism to map through to a file
            // name; this in no way represents an actual locale.
            CharString ch(entry->stringArg);
            UResourceBundle *bundle = ures_openDirect(0, ch, &status);
            UnicodeString rules = ures_getUnicodeStringByKey(bundle, RB_RULE, &status);
            ures_close(bundle);

            // If the status indicates a failure, then we don't have any
            // rules -- there is probably an installation error.  The list
            // in the root locale should correspond to all the installed
            // transliterators; if it lists something that's not
            // installed, we'll get an error from ResourceBundle.

            parser.parse(rules, isReverse ? UTRANS_REVERSE : UTRANS_FORWARD,
                         parseError, status);
        }

        if (U_FAILURE(status)) {
            // We have a failure of some kind.  Remove the ID from the
            // registry so we don't keep trying.  NOTE: This will throw off
            // anyone who is, at the moment, trying to iterate over the
            // available IDs.  That's acceptable since we should never
            // really get here except under installation, configuration,
            // or unrecoverable run time memory failures.
			remove(ID);
            break;
        }

        entry->u.data = parser.orphanData();
        entry->stringArg = parser.idBlock;
        entry->intArg = parser.idSplitPoint;
        entry->compoundFilter = parser.orphanCompoundFilter();

        // Reset entry->entryType to something that we process at the
        // top of the loop, then loop back to the top.  As long as we
        // do this, we only loop through twice at most.
        // NOTE: The logic here matches that in
        // Transliterator::createFromRules().
        if (entry->stringArg.length() == 0) {
            if (entry->u.data == 0) {
                // No idBlock, no data -- this is just an
                // alias for Null
                entry->entryType = Entry::ALIAS;
                entry->stringArg = NullTransliterator::ID;
            } else {
                // No idBlock, data != 0 -- this is an
                // ordinary RBT_DATA
                entry->entryType = Entry::RBT_DATA;
				return new RuleBasedTransliterator(ID, entry->u.data);
            }
        } else {
            if (entry->u.data == 0) {
                // idBlock, no data -- this is an alias.  The ID has
                // been munged from reverse into forward mode, if
                // necessary, so instantiate the ID in the forward
                // direction.
                entry->entryType = Entry::ALIAS;
            } else {
                // idBlock and data -- this is a compound
                // RBT
                entry->entryType = Entry::COMPOUND_RBT;
            }
        }
    }

    return 0; // failed
}
*/

//#include "unicode/rbt.h"
#include "unicode/resbund.h"
#include "unicode/translit.h"
#include "unicode/ustream.h"
#include <iostream>

using icu::UnicodeString;

class SWCharString {
 public:
    inline SWCharString(const UnicodeString& str);
    inline ~SWCharString();
    inline operator const char*() { return ptr; }
 private:
    char buf[128];
    char* ptr;
};

inline SWCharString::SWCharString(const UnicodeString& str) {
    // TODO This isn't quite right -- we should probably do
    // preflighting here to determine the real length.
    if (str.length() >= (int32_t)sizeof(buf)) {
        ptr = new char[str.length() + 8];
    } else {
        ptr = buf;
    }
    str.extract(0, 0x7FFFFFFF, ptr, "");
}

inline SWCharString::~SWCharString() {
    if (ptr != buf) {
        delete[] ptr;
    }
}



static const char RB_RULE_BASED_IDS[] = "RuleBasedTransliteratorIDs";

static const char RB_RULE[] = "Rule";

static const char SW_RESDATA[] = "/usr/local/lib/sword/";

#include <map>

using namespace std;
using icu::UnicodeString;
using icu::Transliterator;

struct SWTransData {
	UnicodeString resource;
	UTransDirection dir;
};

typedef map <const UnicodeString, SWTransData> SWTransMap;

typedef pair<UnicodeString, SWTransData> SWTransPair;

SWTransMap *sw_tmap;

Transliterator * instantiateTrans(const UnicodeString& ID, const UnicodeString& resource,
		UTransDirection dir, UParseError &parseError, UErrorCode &status );

Transliterator *SWTransFactory(const UnicodeString &ID, Transliterator::Token context)
{
	std::cout << "running factory for " << ID << std::endl;
	SWTransMap::iterator swelement;
	if ((swelement = sw_tmap->find(ID)) != sw_tmap->end())
	{
		std::cout << "found element in map" << std::endl;
		SWTransData swstuff = (*swelement).second;
		UParseError parseError;
		UErrorCode status;
		std::cout << "unregistering " << ID << std::endl;
		Transliterator::unregister(ID);
		std::cout << "resource is " << swstuff.resource << std::endl;
		Transliterator *trans = instantiateTrans(ID, swstuff.resource, swstuff.dir, parseError, status);
		return trans;
	}
	return NULL;
}

void  instantiateTransFactory(const UnicodeString& ID, const UnicodeString& resource, UTransDirection dir, UParseError &parseError, UErrorCode &status) {
		std::cout << "making factory for ID " << ID << std::endl;
		Transliterator::Token context;
		SWTransData swstuff; 
		swstuff.resource = resource;
		swstuff.dir = dir;
		SWTransPair swpair;
		swpair.first = ID;
		swpair.second = swstuff;
		sw_tmap->insert(swpair);
		Transliterator::registerFactory(ID, &SWTransFactory, context);
}

void  registerTrans(const UnicodeString& ID, const UnicodeString& resource, UTransDirection dir, UErrorCode &status) {
		std::cout << "registering ID locally " << ID << std::endl;
		SWTransData swstuff; 
		swstuff.resource = resource;
		swstuff.dir = dir;
		SWTransPair swpair;
		swpair.first = ID;
		swpair.second = swstuff;
		sw_tmap->insert(swpair);
}

bool checkTrans(const UnicodeString& ID, UErrorCode &status)
{
		Transliterator *trans = Transliterator::createInstance(ID, UTRANS_FORWARD, status);
		if (!U_FAILURE(status))
		{
			// already have it, clean up and return true
			std::cout << "already have it " << ID << std::endl;
			delete trans;
			return true;
		}
		status = U_ZERO_ERROR;
	
	SWTransMap::iterator swelement;
	if ((swelement = sw_tmap->find(ID)) != sw_tmap->end())
	{
		std::cout << "found element in map" << std::endl;
		SWTransData swstuff = (*swelement).second;
		UParseError parseError;
		//UErrorCode status;
		//std::cout << "unregistering " << ID << std::endl;
		//Transliterator::unregister(ID);
		std::cout << "resource is " << swstuff.resource << std::endl;
		
		// Get the rules
		//std::cout << "importing: " << ID << ", " << resource << std::endl;
		SWCharString ch(swstuff.resource);
		UResourceBundle *bundle = ures_openDirect(SW_RESDATA, ch, &status);
		const UnicodeString rules = icu::ures_getUnicodeStringByKey(bundle, RB_RULE, &status);
		ures_close(bundle);
		//parser.parse(rules, isReverse ? UTRANS_REVERSE : UTRANS_FORWARD,
		//        parseError, status);
		if (U_FAILURE(status)) {
			std::cout << "Failed to get rules" << std::endl;
			std::cout << "status " << u_errorName(status) << std::endl;
			return false;
		}

		
		Transliterator *trans = Transliterator::createFromRules(ID, rules, swstuff.dir,
			parseError,status);
		if (U_FAILURE(status)) {
			std::cout << "Failed to create transliterator" << std::endl;
			std::cout << "status " << u_errorName(status) << std::endl;
			std::cout << "Parse error: line " << parseError.line << std::endl;
			std::cout << "Parse error: offset " << parseError.offset << std::endl;
			std::cout << "Parse error: preContext " << *parseError.preContext << std::endl;
			std::cout << "Parse error: postContext " << *parseError.postContext << std::endl;
			std::cout << "rules were" << std::endl;
			std::cout << rules << std::endl;
			return false;
		}

		Transliterator::registerInstance(trans);
		return true;
		
		//Transliterator *trans = instantiateTrans(ID, swstuff.resource, swstuff.dir, parseError, status);
		//return trans;
	}
	else
	{
		return false;
	}
}

Transliterator * createTrans(const UnicodeString& preID, const UnicodeString& ID, const UnicodeString& postID, UTransDirection dir, UErrorCode &status) {
	// extract id to check from ID xxx;id;xxx
	if (checkTrans(ID, status)) {
		UnicodeString fullID = preID;
		fullID += ID;
		fullID += postID;
		Transliterator *trans = Transliterator::createInstance(fullID,UTRANS_FORWARD,status);
		if (U_FAILURE(status)) {
			delete trans;
			return NULL;
		}
		else {
			return trans;
		}
	}
	else {
		return NULL;
	}
}

Transliterator * instantiateTrans(const UnicodeString& ID, const UnicodeString& resource, UTransDirection dir, UParseError &parseError, UErrorCode &status )
{
	//TransliterationRuleData *ruleData;
	//TransliteratorParser parser;

	//entry->entryType is 'direction' from translit_index
	//UBool isReverse = (entry->entryType == Entry::RULES_REVERSE);
	//entry->stringArg is the 'resource'
	//CharString ch(entry->stringArg);
	std::cout << "importing: " << ID << ", " << resource << std::endl;
	SWCharString ch(resource);
	UResourceBundle *bundle = ures_openDirect(SW_RESDATA, ch, &status);
	const UnicodeString rules = icu::ures_getUnicodeStringByKey(bundle, RB_RULE, &status);
	ures_close(bundle);
	//parser.parse(rules, isReverse ? UTRANS_REVERSE : UTRANS_FORWARD,
    //        parseError, status);
	if (U_FAILURE(status)) {
		std::cout << "Failed to get rules" << std::endl;
		return NULL;
	}
    //ruleData = parser.orphanData();
    //entry->stringArg = parser.idBlock;
    //entry->intArg = parser.idSplitPoint;
    //entry->compoundFilter = parser.orphanCompoundFilter();

    //entry->entryType = Entry::RBT_DATA;
	//return new RuleBasedTransliterator(ID, ruleData);
	Transliterator *trans = Transliterator::createFromRules(ID, rules, dir, parseError, status);
	if (U_FAILURE(status)) {
		std::cout << "Failed to create transliterator" << std::endl;
		std::cout << "status " << u_errorName(status) << std::endl;
		std::cout << "Parse error: line " << parseError.line << std::endl;
		std::cout << "Parse error: offset " << parseError.offset << std::endl;
		std::cout << "Parse error: preContext " << *parseError.preContext << std::endl;
		std::cout << "Parse error: postContext " << *parseError.postContext << std::endl;
		std::cout << "rules were" << std::endl;
		std::cout << rules << std::endl;
		return NULL;
	}

	Transliterator::registerInstance(trans);
	return trans;
}

void initiateSwordTransliterators(UErrorCode &status)
{
    static const char translit_swordindex[] = "translit_swordindex";

    UResourceBundle *bundle, *transIDs, *colBund;
    bundle = ures_openDirect(SW_RESDATA, translit_swordindex, &status);
    if (U_FAILURE(status)) {
		std::cout << "no resource index to load" << std::endl;
		return;
	}

    transIDs = ures_getByKey(bundle, RB_RULE_BASED_IDS, 0, &status);
	UParseError parseError;

    int32_t row, maxRows;
    if (U_SUCCESS(status)) {
        maxRows = ures_getSize(transIDs);
        for (row = 0; row < maxRows; row++) {
            colBund = ures_getByIndex(transIDs, row, 0, &status);

            if (U_SUCCESS(status) && ures_getSize(colBund) == 4) {
                UnicodeString id = icu::ures_getUnicodeStringByIndex(colBund, 0, &status);
                UChar type = icu::ures_getUnicodeStringByIndex(colBund, 1, &status).charAt(0);
                UnicodeString resString = icu::ures_getUnicodeStringByIndex(colBund, 2, &status);

                if (U_SUCCESS(status)) {
                    switch (type) {
                    case 0x66: // 'f'
                    case 0x69: // 'i'
                        // 'file' or 'internal';
                        // row[2]=resource, row[3]=direction
                        {
                            //UBool visible = (type == 0x0066 /*f*/);
                            UTransDirection dir =
                                (icu::ures_getUnicodeStringByIndex(colBund, 3, &status).charAt(0) ==
                                 0x0046 /*F*/) ?
                                UTRANS_FORWARD : UTRANS_REVERSE;
                            //registry->put(id, resString, dir, visible);
			    std::cout << "instantiating " << resString << std::endl;
			    instantiateTrans(id, resString, dir, parseError, status);
                        }
                        break;
                    case 0x61: // 'a'
                        // 'alias'; row[2]=createInstance argument
                        //registry->put(id, resString, TRUE);
                        break;
                    }
                }
		else std::cout << "Failed to get resString" << std:: endl;
            }
	    else std::cout << "Failed to get row" << std:: endl;

            ures_close(colBund);
        }
    }
	else
	{
		std::cout << "no resource index to load" << std::endl;
	}

    ures_close(transIDs);
    ures_close(bundle);
}



void initiateSwordTransliteratorsByFactory(UErrorCode &status)
{
    static const char translit_swordindexf[] = "translit_swordindex";

    UResourceBundle *bundle, *transIDs, *colBund;
    bundle = ures_openDirect(SW_RESDATA, translit_swordindexf, &status);
    if (U_FAILURE(status)) {
		std::cout << "no resource index to load" << std::endl;
		std::cout << "status " << u_errorName(status) << std::endl;
		return;
	}

    transIDs = ures_getByKey(bundle, RB_RULE_BASED_IDS, 0, &status);
	UParseError parseError;

    int32_t row, maxRows;
    if (U_SUCCESS(status)) {
        maxRows = ures_getSize(transIDs);
        for (row = 0; row < maxRows; row++) {
            colBund = ures_getByIndex(transIDs, row, 0, &status);

            if (U_SUCCESS(status) && ures_getSize(colBund) == 4) {
                UnicodeString id = icu::ures_getUnicodeStringByIndex(colBund, 0, &status);
                UChar type = icu::ures_getUnicodeStringByIndex(colBund, 1, &status).charAt(0);
                UnicodeString resString = icu::ures_getUnicodeStringByIndex(colBund, 2, &status);
				std::cout << "ok so far" << std::endl;

                if (U_SUCCESS(status)) {
                    switch (type) {
                    case 0x66: // 'f'
                    case 0x69: // 'i'
                        // 'file' or 'internal';
                        // row[2]=resource, row[3]=direction
                        {
                            //UBool visible = (type == 0x0066 /*f*/);
                            UTransDirection dir =
                                (icu::ures_getUnicodeStringByIndex(colBund, 3, &status).charAt(0) ==
                                 0x0046 /*F*/) ?
                                UTRANS_FORWARD : UTRANS_REVERSE;
                            //registry->put(id, resString, dir, visible);
			    std::cout << "instantiating " << resString << " ..." << std::endl;
			    instantiateTransFactory(id, resString, dir, parseError, status);
				std::cout << "done." << std::endl;
                        }
                        break;
                    case 0x61: // 'a'
                        // 'alias'; row[2]=createInstance argument
                        //registry->put(id, resString, TRUE);
                        break;
                    }
                }
		else std::cout << "Failed to get resString" << std:: endl;
            }
	    else std::cout << "Failed to get row" << std:: endl;

            ures_close(colBund);
        }
    }
	else
	{
		std::cout << "no resource index to load" << std::endl;
		std::cout << "status " << u_errorName(status) << std::endl;
	}

    ures_close(transIDs);
    ures_close(bundle);
}


void initiateSwordTransliteratorsToMap(UErrorCode &status)
{
    static const char translit_swordindexf[] = "translit_swordindex";

    UResourceBundle *bundle, *transIDs, *colBund;
    bundle = ures_openDirect(SW_RESDATA, translit_swordindexf, &status);
    if (U_FAILURE(status)) {
		std::cout << "no resource index to load" << std::endl;
		std::cout << "status " << u_errorName(status) << std::endl;
		return;
	}

    transIDs = ures_getByKey(bundle, RB_RULE_BASED_IDS, 0, &status);
	//UParseError parseError;

    int32_t row, maxRows;
    if (U_SUCCESS(status)) {
        maxRows = ures_getSize(transIDs);
        for (row = 0; row < maxRows; row++) {
            colBund = ures_getByIndex(transIDs, row, 0, &status);

            if (U_SUCCESS(status) && ures_getSize(colBund) == 4) {
                UnicodeString id = icu::ures_getUnicodeStringByIndex(colBund, 0, &status);
                UChar type = icu::ures_getUnicodeStringByIndex(colBund, 1, &status).charAt(0);
                UnicodeString resString = icu::ures_getUnicodeStringByIndex(colBund, 2, &status);
				std::cout << "ok so far" << std::endl;

                if (U_SUCCESS(status)) {
                    switch (type) {
                    case 0x66: // 'f'
                    case 0x69: // 'i'
                        // 'file' or 'internal';
                        // row[2]=resource, row[3]=direction
                        {
                            //UBool visible = (type == 0x0066 /*f*/);
                            UTransDirection dir =
                                (icu::ures_getUnicodeStringByIndex(colBund, 3, &status).charAt(0) ==
                                 0x0046 /*F*/) ?
                                UTRANS_FORWARD : UTRANS_REVERSE;
                            //registry->put(id, resString, dir, visible);
			    std::cout << "instantiating " << resString << " ..." << std::endl;
			    registerTrans(id, resString, dir, status);
				std::cout << "done." << std::endl;
                        }
                        break;
                    case 0x61: // 'a'
                        // 'alias'; row[2]=createInstance argument
                        //registry->put(id, resString, TRUE);
                        break;
                    }
                }
		else std::cout << "Failed to get resString" << std:: endl;
            }
	    else std::cout << "Failed to get row" << std:: endl;

            ures_close(colBund);
        }
    }
	else
	{
		std::cout << "no resource index to load" << std::endl;
		std::cout << "status " << u_errorName(status) << std::endl;
	}

    ures_close(transIDs);
    ures_close(bundle);
}





int main()
{
	sw_tmap = new SWTransMap();
	UErrorCode status = U_ZERO_ERROR;
	std::cout << "Available before: " << Transliterator::countAvailableIDs() << std::endl;
	//initiateSwordTransliterators(status);
	//initiateSwordTransliteratorsByFactory(status);
	initiateSwordTransliteratorsToMap(status);
	int32_t cids = Transliterator::countAvailableIDs();
	std::cout << "Available after: " << cids << std::endl;

	//for ( int32_t i=0;i<cids;i++) {
	//	std::cout << i << ": " << Transliterator::getAvailableID(i) << std::endl;
	//}

	//Transliterator *trans = Transliterator::createInstance("NFD;Latin-Gothic;NFC", UTRANS_FORWARD,status);
	Transliterator *trans = createTrans("NFD;", "Latin-Gothic", ";NFC", UTRANS_FORWARD,status);
    if (U_FAILURE(status)) {
	std::cout << "Failed to get Latin-Gothic" << std::endl;
	status = U_ZERO_ERROR;
	}
	else
	{
	std::cout << "Got Latin-Gothic :)" << std::endl;
	delete trans;
	}
	
	std::cout << "Available after gothic: " << Transliterator::countAvailableIDs() << std::endl;

	//trans = Transliterator::createInstance("NFD;BGreek-Greek;NFC", UTRANS_FORWARD, status);
	trans = createTrans("NFD;", "BGreek-Greek", ";NFC", UTRANS_FORWARD, status);
    if (U_FAILURE(status)) {
	std::cout << "Failed to get BGreek-Greek" << std::endl;
	status = U_ZERO_ERROR;
	}
	else
	{
	std::cout << "Got BGreek-Greek :)" << std::endl;
	delete trans;
	}
	std::cout << "Available after greek: " << Transliterator::countAvailableIDs() << std::endl;

	delete sw_tmap;

	return 1;
}

//gcc -I../source/i18n -I../source/common  swtest.cpp -L../source/i18n -licui18n -L../source/common -licuuc

