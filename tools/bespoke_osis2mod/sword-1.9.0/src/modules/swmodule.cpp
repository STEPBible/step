/******************************************************************************
 *
 *  swmodule.cpp -	code for base class 'SWModule'. SWModule is the basis
 *			for all types of modules (e.g. texts, commentaries,
 *			maps, lexicons, etc.)
 *
 * $Id: swmodule.cpp 3755 2020-07-19 18:43:07Z scribe $
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


#include <vector>

#include <swlog.h>
#include <sysdata.h>
#include <swmodule.h>
#include <utilstr.h>
#include <swfilter.h>
#include <versekey.h>	// KLUDGE for Search
#include <treekeyidx.h>	// KLUDGE for Search
#include <swoptfilter.h>
#include <filemgr.h>
#include <stringmgr.h>
#ifndef _MSC_VER
#include <iostream>
#endif

#if defined(USECXX11REGEX)
#include <regex>
#ifndef REG_ICASE
#define REG_ICASE std::regex::icase
#endif
#elif defined(USEICUREGEX)
#include <unicode/regex.h>
#ifndef REG_ICASE
#define REG_ICASE UREGEX_CASE_INSENSITIVE
#endif
#else
#include <regex.h>	// GNU
#endif

#if defined USEXAPIAN
#include <xapian.h>
#elif defined USELUCENE
#include <CLucene.h>

//Lucence includes
//#include "CLucene.h"
//#include "CLucene/util/Reader.h"
//#include "CLucene/util/Misc.h"
//#include "CLucene/util/dirent.h"

using namespace lucene::index;
using namespace lucene::analysis;
using namespace lucene::util;
using namespace lucene::store;
using namespace lucene::document;
using namespace lucene::queryParser;
using namespace lucene::search;
#endif

using std::vector;

SWORD_NAMESPACE_START

SWModule::StdOutDisplay SWModule::rawdisp;

typedef std::list<SWBuf> StringList;

/******************************************************************************
 * SWModule Constructor - Initializes data for instance of SWModule
 *
 * ENT:	imodname - Internal name for module
 *	imoddesc - Name to display to user for module
 *	idisp	 - Display object to use for displaying
 *	imodtype - Type of Module (All modules will be displayed with
 *			others of same type under their modtype heading
 *	unicode  - if this module is unicode
 */

SWModule::SWModule(const char *imodname, const char *imoddesc, SWDisplay *idisp, const char *imodtype, SWTextEncoding encoding, SWTextDirection direction, SWTextMarkup markup, const char *imodlang) {
	key       = createKey();
	entryBuf  = "";
	config    = &ownConfig;
	modname   = 0;
	error     = 0;
	moddesc   = 0;
	modtype   = 0;
	modlang   = 0;
	this->encoding = encoding;
	this->direction = direction;
	this->markup  = markup;
	entrySize= -1;
	disp     = (idisp) ? idisp : &rawdisp;
	stdstr(&modname, imodname);
	stdstr(&moddesc, imoddesc);
	stdstr(&modtype, imodtype);
	stdstr(&modlang, imodlang);
	stripFilters = new FilterList();
	rawFilters = new FilterList();
	renderFilters = new FilterList();
	optionFilters = new OptionFilterList();
	encodingFilters = new FilterList();
	skipConsecutiveLinks = true;
	procEntAttr = true;
}


/******************************************************************************
 * SWModule Destructor - Cleans up instance of SWModule
 */

SWModule::~SWModule()
{
	if (modname)
		delete [] modname;
	if (moddesc)
		delete [] moddesc;
	if (modtype)
		delete [] modtype;
	if (modlang)
		delete [] modlang;

	if (key) {
		if (!key->isPersist())
			delete key;
	}

	stripFilters->clear();
	rawFilters->clear();
	renderFilters->clear();
	optionFilters->clear();
	encodingFilters->clear();
	entryAttributes.clear();

	delete stripFilters;
	delete rawFilters;
	delete renderFilters;
	delete optionFilters;
	delete encodingFilters;
}


/******************************************************************************
 * SWModule::createKey - Allocates a key of specific type for module
 *
 * RET:	pointer to allocated key
 */

SWKey *SWModule::createKey() const
{
	return new SWKey();
}


/******************************************************************************
 * SWModule::popError - Gets and clears error status
 *
 * RET:	error status
 */

char SWModule::popError()
{
	char retval = error;

	error = 0;
	if (!retval) retval = key->popError();
	return retval;
}


/******************************************************************************
 * SWModule::Name - Sets/gets module name
 *
 * ENT:	imodname - value which to set modname
 *		[0] - only get
 *
 * RET:	pointer to modname
 */

const char *SWModule::getName() const {
	return modname;
}


/******************************************************************************
 * SWModule::Description - Sets/gets module description
 *
 * ENT:	imoddesc - value which to set moddesc
 *		[0] - only get
 *
 * RET:	pointer to moddesc
 */

const char *SWModule::getDescription() const {
	return moddesc;
}


/******************************************************************************
 * SWModule::Type - Sets/gets module type
 *
 * ENT:	imodtype - value which to set modtype
 *		[0] - only get
 *
 * RET:	pointer to modtype
 */

const char *SWModule::getType() const {
	return modtype;
}

/******************************************************************************
 * SWModule::getDirection - Sets/gets module direction
 *
 * ENT:	newdir - value which to set direction
 *		[-1] - only get
 *
 * RET:	char direction
 */
char SWModule::getDirection() const {
	return direction;
}


/******************************************************************************
 * SWModule::Disp - Sets/gets display driver
 *
 * ENT:	idisp - value which to set disp
 *		[0] - only get
 *
 * RET:	pointer to disp
 */

SWDisplay *SWModule::getDisplay() const {
	return disp;
}

void SWModule::setDisplay(SWDisplay *idisp) {
	disp = idisp;
}

/******************************************************************************
 *  * SWModule::Display - Calls this modules display object and passes itself
 *   *
 *    * RET:   error status
 *     */

char SWModule::display() {
	disp->display(*this);
	return 0;
}

/******************************************************************************
 * SWModule::getKey - Gets the key from this module that points to the position
 *			record
 *
 * RET:	key object
 */

SWKey *SWModule::getKey() const {
	return key;
}


/******************************************************************************
 * SWModule::setKey - Sets a key to this module for position to a particular
 *			record
 *
 * ENT:	ikey - key with which to set this module
 *
 * RET:	error status
 */

char SWModule::setKey(const SWKey *ikey) {
	SWKey *oldKey = 0;

	if (key) {
		if (!key->isPersist())	// if we have our own copy
			oldKey = key;
	}

	if (!ikey->isPersist()) {		// if we are to keep our own copy
		 key = createKey();
		*key = *ikey;
	}
	else	 key = (SWKey *)ikey;		// if we are to just point to an external key

	if (oldKey)
		delete oldKey;

	return error = key->getError();
}


/******************************************************************************
 * SWModule::setPosition(SW_POSITION)	- Positions this modules to an entry
 *
 * ENT:	p	- position (e.g. TOP, BOTTOM)
 *
 * RET: *this
 */

void SWModule::setPosition(SW_POSITION p) {
	*key = p;
	char saveError = key->popError();

	switch (p) {
	case POS_TOP:
		this->increment();
		this->decrement();
		break;

	case POS_BOTTOM:
		this->decrement();
		this->increment();
		break;
	}

	error = saveError;
}


/******************************************************************************
 * SWModule::increment	- Increments module key a number of entries
 *
 * ENT:	increment	- Number of entries to jump forward
 *
 * RET: *this
 */

void SWModule::increment(int steps) {
	(*key) += steps;
	error = key->popError();
}


/******************************************************************************
 * SWModule::decrement	- Decrements module key a number of entries
 *
 * ENT:	decrement	- Number of entries to jump backward
 *
 * RET: *this
 */

void SWModule::decrement(int steps) {
	(*key) -= steps;
	error = key->popError();
}


/******************************************************************************
 * SWModule::Search 	- Searches a module for a string
 *
 * ENT:	istr		- string for which to search
 * 	searchType	- type of search to perform
 *				>=0 - regex; (for backward compat, if > 0 then used as additional REGEX FLAGS)
 *				-1  - phrase
 *				-2  - multiword
 *				-3  - entryAttrib (eg. Word//Lemma./G1234/)	 (Lemma with dot means check components (Lemma.[1-9]) also)
 *				-4  - clucene
 *				-5  - multilemma window; flags = window size
 * 	flags		- options flags for search
 *	justCheckIfSupported	- if set, don't search, only tell if this
 *							function supports requested search.
 *
 * RET: ListKey set to verses that contain istr
 */

ListKey &SWModule::search(const char *istr, int searchType, int flags, SWKey *scope, bool *justCheckIfSupported, void (*percent)(char, void *), void *percentUserData) {

	listKey.clear();
	SWBuf term = istr;
	bool includeComponents = false;	// for entryAttrib e.g., /Lemma.1/ 

	// this only works for 1 or 2 verses right now, and for some search types (regex and multi word).
	// future plans are to extend functionality
	// By default SWORD defaults to allowing searches to cross the artificial boundaries of verse markers
	// Searching are done in a sliding window of 2 verses right now.
	// To turn this off, include SEARCHFLAG_STRICTBOUNDARIES in search flags
	int windowSize = 2;
	if ((flags & SEARCHFLAG_STRICTBOUNDARIES) && (searchType == -2 || searchType > 0)) {
		// remove custom SWORD flag to prevent possible overlap with unknown regex option
		flags ^= SEARCHFLAG_STRICTBOUNDARIES;
		windowSize = 1;
	}

	SWBuf target = getConfigEntry("AbsoluteDataPath");
	if (!target.endsWith("/") && !target.endsWith("\\")) {
		target.append('/');
	}
#if defined USEXAPIAN
	target.append("xapian");
#elif defined USELUCENE
	target.append("lucene");
#endif
	if (justCheckIfSupported) {
		*justCheckIfSupported = (searchType >= -3);
#if defined USEXAPIAN
		if ((searchType == -4) && (FileMgr::existsDir(target))) {
			*justCheckIfSupported = true;
		}
#elif defined USELUCENE
		if ((searchType == -4) && (IndexReader::indexExists(target.c_str()))) {
			*justCheckIfSupported = true;
		}
#endif
		return listKey;
	}
	
	SWKey *saveKey   = 0;
	SWKey *searchKey = 0;
	SWKey *resultKey = createKey();
	SWKey *lastKey   = createKey();
	VerseKey *vkCheck = SWDYNAMIC_CAST(VerseKey, resultKey);
	SWBuf lastBuf = "";

#ifdef USECXX11REGEX
	std::locale oldLocale;
	std::locale::global(std::locale("en_US.UTF-8"));

	std::regex preg;
#elif defined(USEICUREGEX)
	icu::RegexMatcher *matcher = 0;
#else
	regex_t preg;
#endif

	vector<SWBuf> words;
	vector<SWBuf> window;
	const char *sres;
	terminateSearch = false;
	char perc = 1;
	bool savePEA = isProcessEntryAttributes();

	// determine if we might be doing special strip searches.  useful for knowing if we can use shortcuts
	bool specialStrips = (getConfigEntry("LocalStripFilter")
			|| (getConfig().has("GlobalOptionFilter", "UTF8GreekAccents"))
			|| (getConfig().has("GlobalOptionFilter", "UTF8HebrewPoints"))
			|| (getConfig().has("GlobalOptionFilter", "UTF8ArabicPoints"))
			|| (strchr(istr, '<')));

	setProcessEntryAttributes(searchType == -3);
	

	if (!key->isPersist()) {
		saveKey = createKey();
		*saveKey = *key;
	}
	else	saveKey = key;

	searchKey = (scope)?scope->clone():(key->isPersist())?key->clone():0;
	if (searchKey) {
		searchKey->setPersist(true);
		setKey(*searchKey);
	}

	(*percent)(perc, percentUserData);

	*this = BOTTOM;
	long highIndex = key->getIndex();
	if (!highIndex)
		highIndex = 1;		// avoid division by zero errors.
	*this = TOP;
	if (searchType >= 0) {
#ifdef USECXX11REGEX
		preg = std::regex((SWBuf(".*")+istr+".*").c_str(), std::regex_constants::extended | searchType | flags);
#elif defined(USEICUREGEX)
		UErrorCode        status    = U_ZERO_ERROR;
		matcher = new icu::RegexMatcher(istr, searchType | flags, status);
		if (U_FAILURE(status)) {
			SWLog::getSystemLog()->logError("Error compiling Regex: %d", status);
			return listKey;
		}

#else
		flags |=searchType|REG_NOSUB|REG_EXTENDED;
		int err = regcomp(&preg, istr, flags);
		if (err) {
			SWLog::getSystemLog()->logError("Error compiling Regex: %d", err);
			return listKey;
		}
#endif
	}

	(*percent)(++perc, percentUserData);


#if defined USEXAPIAN || defined USELUCENE
	(*percent)(10, percentUserData);
	if (searchType == -4) {	// indexed search
#if defined USEXAPIAN
		SWTRY {
			Xapian::Database database(target.c_str());
			Xapian::QueryParser queryParser;
			queryParser.set_default_op(Xapian::Query::OP_AND);
			SWTRY {
				queryParser.set_stemmer(Xapian::Stem(getLanguage()));
			} SWCATCH(...) {}
			queryParser.set_stemming_strategy(queryParser.STEM_SOME);
			queryParser.add_prefix("content", "C");
			queryParser.add_prefix("lemma", "L");
			queryParser.add_prefix("morph", "M");
			queryParser.add_prefix("prox", "P");
			queryParser.add_prefix("proxlem", "PL");
			queryParser.add_prefix("proxmorph", "PM");

#elif defined USELUCENE
		
		lucene::index::IndexReader    *ir = 0;
		lucene::search::IndexSearcher *is = 0;
		Query                         *q  = 0;
		Hits                          *h  = 0;
		SWTRY {
			ir = IndexReader::open(target);
			is = new IndexSearcher(ir);
			const TCHAR *stopWords[] = { 0 };
			standard::StandardAnalyzer analyzer(stopWords);
#endif

			// parse the query
#if defined USEXAPIAN
			Xapian::Query q = queryParser.parse_query(istr);
			Xapian::Enquire enquire = Xapian::Enquire(database);
#elif defined USELUCENE
			q = QueryParser::parse((wchar_t *)utf8ToWChar(istr).getRawData(), _T("content"), &analyzer);
#endif
			(*percent)(20, percentUserData);

			// perform the search
#if defined USEXAPIAN
			enquire.set_query(q);
			Xapian::MSet h = enquire.get_mset(0, 99999);
#elif defined USELUCENE
			h = is->search(q);
#endif
			(*percent)(80, percentUserData);

			// iterate thru each good module position that meets the search
			bool checkBounds = getKey()->isBoundSet();
#if defined USEXAPIAN
			Xapian::MSetIterator i;
			for (i = h.begin(); i != h.end(); ++i) {
//				cout << "Document ID " << *i << "\t";
				SW_u64 score = i.get_percent();
				Xapian::Document doc = i.get_document();
				*resultKey = doc.get_data().c_str();
#elif defined USELUCENE
			for (unsigned long i = 0; i < (unsigned long)h->length(); i++) {
				Document &doc = h->doc(i);
				// set a temporary verse key to this module position
				*resultKey = wcharToUTF8(doc.get(_T("key"))); //TODO Does a key always accept utf8?
				SW_u64 score = (SW_u64)((SW_u32)(h->score(i) * 100));
#endif

				// check to see if it sets ok (within our bounds) and if not, skip
				if (checkBounds) {
					*getKey() = *resultKey;
					if (*getKey() != *resultKey) {
						continue;
					}
				}
				listKey << *resultKey;
				listKey.getElement()->userData = score;
			}
			(*percent)(98, percentUserData);
		}
		SWCATCH (...) {
#if defined USEXAPIAN
#elif defined USELUCENE
			q = 0;
#endif
			// invalid clucene query
		}
#if defined USEXAPIAN
#elif defined USELUCENE
		delete h;
		delete q;

		delete is;
		if (ir) {
			ir->close();
		}
#endif
	}
#endif

	// some pre-loop processing
	switch (searchType) {

	// phrase
	case -1:
		// let's see if we're told to ignore case.  If so, then we'll touppstr our term
		if ((flags & REG_ICASE) == REG_ICASE) term.toUpper();
		break;

	// multi-word
	case -2:
	case -5:
		// let's break the term down into our words vector
		while (1) {
			const char *word = term.stripPrefix(' ');
			if (!word) {
				words.push_back(term);
				break;
			}
			words.push_back(word);
		}
		if ((flags & REG_ICASE) == REG_ICASE) {
			for (unsigned int i = 0; i < words.size(); i++) {
				words[i].toUpper();
			}
		}
		break;

	// entry attributes
	case -3:
		// let's break the attribute segs down.  We'll reuse our words vector for each segment
		while (1) {
			const char *word = term.stripPrefix('/');
			if (!word) {
				words.push_back(term);
				break;
			}
			words.push_back(word);
		}
		if ((words.size()>2) && words[2].endsWith(".")) {
			includeComponents = true;
			words[2]--;
		}
		break;
	}


	// our main loop to iterate the module and find the stuff
	perc = 5;
	(*percent)(perc, percentUserData);

	
	while ((searchType != -4) && !popError() && !terminateSearch) {
		long mindex = key->getIndex();
		float per = (float)mindex / highIndex;
		per *= 93;
		per += 5;
		char newperc = (char)per;
		if (newperc > perc) {
			perc = newperc;
			(*percent)(perc, percentUserData);
		}
		else if (newperc < perc) {
			SWLog::getSystemLog()->logError(
				"Serious error: new percentage complete is less than previous value\nindex: %d\nhighIndex: %d\nnewperc == %d%% is smaller than\nperc == %d%%",
				key->getIndex(), highIndex, (int)newperc, (int )perc);
		}

		// regex
		if (searchType >= 0) {
			SWBuf textBuf = stripText();
#ifdef USECXX11REGEX
			if (std::regex_match(std::string(textBuf.c_str()), preg)) {
#elif defined(USEICUREGEX)
			icu::UnicodeString stringToTest = textBuf.c_str();
			matcher->reset(stringToTest);

			if (matcher->find()) {
#else
			if (!regexec(&preg, textBuf, 0, 0, 0)) {
#endif
				*resultKey = *getKey();
				resultKey->clearBounds();
				listKey << *resultKey;
				lastBuf = "";
			}
#ifdef USECXX11REGEX
			else if (std::regex_match(std::string((lastBuf + ' ' + textBuf).c_str()), preg)) {
#elif defined(USEICUREGEX)
			else {
				stringToTest = (lastBuf + ' ' + textBuf).c_str();
				matcher->reset(stringToTest);

				if (matcher->find()) {
#else
			else if (!regexec(&preg, lastBuf + ' ' + textBuf, 0, 0, 0)) {
#endif
				lastKey->clearBounds();
				if (vkCheck) {
					resultKey->clearBounds();
					*resultKey = *getKey();
					vkCheck->setUpperBound(resultKey);
					vkCheck->setLowerBound(lastKey);
				}
				else {
					*resultKey = *lastKey;
					resultKey->clearBounds();
				}
				listKey << *resultKey;
				lastBuf = (windowSize > 1) ? textBuf.c_str() : "";
			}
			else {
				lastBuf = (windowSize > 1) ? textBuf.c_str() : "";
			}
#if defined(USEICUREGEX)
			}
#endif
		}

		else {
			SWBuf textBuf;
			switch (searchType) {

			// phrase
			case -1: {
				textBuf = stripText();
				if ((flags & REG_ICASE) == REG_ICASE) textBuf.toUpper();
				sres = strstr(textBuf.c_str(), term.c_str());
				if (sres) { //it's also in the stripText(), so we have a valid search result item now
					*resultKey = *getKey();
					resultKey->clearBounds();
					listKey << *resultKey;
				}
				break;
			}

			// multiword
			case -2: { // enclose our allocations
				int stripped = 0;
				int multiVerse = 0;
				unsigned int foundWords = 0;
				textBuf = getRawEntry();
				SWBuf testBuf;

				// Here we loop twice, once for the current verse, to see if we have a simple match within our verse.
				// This always takes precedence over a windowed search.  If we match a window, but also one verse within
				// our window matches by itself, prefer the single verse as the hit address-- the larger window is not needed.
				//
				// The second loop includes our current verse within the context of the sliding window
				// Currrently that window size is set to 2 verses, but future plans include allowing this to be configurable
				// 
				do {
					// Herein lies optimization.
					//
					// First we check getRawEntry because it's the fastest;
					// it might return false positives because all the markup is include, but is the quickest
					// way to eliminate a verse. If it passes, then we do the real work to strip the markup and 
					// really test the verse for our keywords.
					//
					stripped = 0;
					do {
						if (stripped||specialStrips||multiVerse) {
							testBuf = multiVerse ? lastBuf + ' ' + textBuf : textBuf;
							if (stripped) testBuf = stripText(testBuf);
						}
						else testBuf.setSize(0);
						foundWords = 0;

						if ((flags & REG_ICASE) == REG_ICASE) testBuf.size() ? testBuf.toUpper() : textBuf.toUpper();
						for (unsigned int i = 0; i < words.size(); i++) {
							sres = strstr(testBuf.size() ? testBuf.c_str() : textBuf.c_str(), words[i].c_str());
							if (!sres) {
								break; //for loop
							}
							foundWords++;
						}

						++stripped;
					} while ( (stripped < 2) && (foundWords == words.size()));
					++multiVerse;
				} while ((windowSize > 1) && (multiVerse < 2) && (stripped != 2 || foundWords != words.size()));

				if ((stripped == 2) && (foundWords == words.size())) { //we found the right words in both raw and stripped text, which means it's a valid result item
					lastKey->clearBounds();
					resultKey->clearBounds();
					*resultKey = (multiVerse > 1 && !vkCheck) ? *lastKey : *getKey();
					if (multiVerse > 1 && vkCheck) {
						vkCheck->setUpperBound(resultKey);
						vkCheck->setLowerBound(lastKey);
					}
					else {
						resultKey->clearBounds();
					}
					listKey << *resultKey;
					lastBuf = "";
					// if we're searching windowSize > 1 and we had a hit which required the current verse
					// let's start the next window with our current verse in case we have another hit adjacent
					if (multiVerse == 2) {
						lastBuf = textBuf;
					}
				}
				else {
					lastBuf = (windowSize > 1) ? textBuf.c_str() : "";
				}
			}
			break;

			// entry attributes
			case -3: {
				renderText();	// force parse
				AttributeTypeList &entryAttribs = getEntryAttributes();
				AttributeTypeList::iterator i1Start, i1End;
				AttributeList::iterator i2Start, i2End;
				AttributeValue::iterator i3Start, i3End;

				if ((words.size()) && (words[0].length())) {
// cout << "Word: " << words[0] << endl;
				for (i1Start = entryAttribs.begin(); i1Start != entryAttribs.end(); ++i1Start) {
// cout << "stuff: " << i1Start->first.c_str() << endl;
				}
					i1Start = entryAttribs.find(words[0]);
					i1End = i1Start;
					if (i1End != entryAttribs.end()) {
						i1End++;
					}
				}
				else {
					i1Start = entryAttribs.begin();
					i1End   = entryAttribs.end();
				}
				for (;i1Start != i1End; i1Start++) {
					if ((words.size()>1) && (words[1].length())) {
						i2Start = i1Start->second.find(words[1]);
						i2End = i2Start;
						if (i2End != i1Start->second.end())
							i2End++;
					}
					else {
						i2Start = i1Start->second.begin();
						i2End   = i1Start->second.end();
					}
					for (;i2Start != i2End; i2Start++) {
						if ((words.size()>2) && (words[2].length()) && (!includeComponents)) {
							i3Start = i2Start->second.find(words[2]);
							i3End = i3Start;
							if (i3End != i2Start->second.end())
								i3End++;
						}
						else {
							i3Start = i2Start->second.begin();
							i3End   = i2Start->second.end();
						}
						for (;i3Start != i3End; i3Start++) {
							if ((words.size()>3) && (words[3].length())) {
								if (includeComponents) {
									SWBuf key = i3Start->first.c_str();
									key = key.stripPrefix('.', true);
									// we're iterating all 3 level keys, so be sure we match our
									// prefix (e.g., Lemma, Lemma.1, Lemma.2, etc.)
									if (key != words[2]) continue;
								}
								if (flags & SEARCHFLAG_MATCHWHOLEENTRY) {
									bool found = !(((flags & REG_ICASE) == REG_ICASE) ? sword::stricmp(i3Start->second.c_str(), words[3]) : strcmp(i3Start->second.c_str(), words[3]));
									sres = (found) ? i3Start->second.c_str() : 0;
								}
								else {
									sres = ((flags & REG_ICASE) == REG_ICASE) ? stristr(i3Start->second.c_str(), words[3]) : strstr(i3Start->second.c_str(), words[3]);
								}
								if (sres) {
									*resultKey = *getKey();
									resultKey->clearBounds();
									listKey << *resultKey;
									break;
								}
							}
						}
						if (i3Start != i3End)
							break;
					}
					if (i2Start != i2End)
						break;
				}
				break;
			}
			// NOT DONE
			case -5:
				AttributeList &words = getEntryAttributes()["Word"];
				SWBuf kjvWord = "";
				SWBuf bibWord = "";
				for (AttributeList::iterator it = words.begin(); it != words.end(); it++) {
					int parts = atoi(it->second["PartCount"]);
					SWBuf lemma = "";
					SWBuf morph = "";
					for (int i = 1; i <= parts; i++) {
						SWBuf key = "";
						key = (parts == 1) ? "Lemma" : SWBuf().setFormatted("Lemma.%d", i).c_str();
						AttributeValue::iterator li = it->second.find(key);
						if (li != it->second.end()) {
							if (i > 1) lemma += " ";
							key = (parts == 1) ? "LemmaClass" : SWBuf().setFormatted("LemmaClass.%d", i).c_str();
							AttributeValue::iterator lci = it->second.find(key);
							if (lci != it->second.end()) {
								lemma += lci->second + ":";
							}
							lemma += li->second;
						}
						key = (parts == 1) ? "Morph" : SWBuf().setFormatted("Morph.%d", i).c_str();
						li = it->second.find(key);
						// silly.  sometimes morph counts don't equal lemma counts
						if (i == 1 && parts != 1 && li == it->second.end()) {
							li = it->second.find("Morph");
						}
						if (li != it->second.end()) {
							if (i > 1) morph += " ";
							key = (parts == 1) ? "MorphClass" : SWBuf().setFormatted("MorphClass.%d", i).c_str();
							AttributeValue::iterator lci = it->second.find(key);
							// silly.  sometimes morph counts don't equal lemma counts
							if (i == 1 && parts != 1 && lci == it->second.end()) {
								lci = it->second.find("MorphClass");
							}
							if (lci != it->second.end()) {
								morph += lci->second + ":";
							}
							morph += li->second;
						}
						// TODO: add src tags and maybe other attributes
					}
					while (window.size() < (unsigned)flags) {
						
					}
				}
				break;
			} // end switch
		}
		*lastKey = *getKey();
		(*this)++;
	}
	

	// cleaup work
	if (searchType >= 0) {
#ifdef USECXX11REGEX
		std::locale::global(oldLocale);
#elif defined(USEICUREGEX)
		delete matcher;
#else
		regfree(&preg);
#endif
	}

	setKey(*saveKey);

	if (!saveKey->isPersist())
		delete saveKey;

	if (searchKey)
		delete searchKey;
	delete resultKey;
	delete lastKey;

	listKey = TOP;
	setProcessEntryAttributes(savePEA);


	(*percent)(100, percentUserData);


	return listKey;
}


/******************************************************************************
 * SWModule::stripText() 	- calls all stripfilters on current text
 *
 * ENT:	buf	- buf to massage instead of this modules current text
 * 	len	- max len of buf
 *
 * RET: this module's text at current key location massaged by Strip filters
 */

const char *SWModule::stripText(const char *buf, int len) {
	static SWBuf local;
	local = renderText(buf, len, false);
	return local.c_str();
}


/** SWModule::getRenderHeader()	- Produces any header data which might be
 *	useful which associated with the processing done with this filter.
 *	A typical example is a suggested CSS style block for classed
 *	containers.
 */
const char *SWModule::getRenderHeader() const {
	FilterList::const_iterator first = getRenderFilters().begin();
	if (first != getRenderFilters().end()) {
		return (*first)->getHeader();
	}
	return "";
}


/******************************************************************************
 * SWModule::renderText 	- calls all renderfilters on current module
 *				position
 *
 * RET: this module's text at current key location massaged by renderText filters
 */
SWBuf SWModule::renderText() {
	return renderText((const char *)0);
}

/******************************************************************************
 * SWModule::renderText 	- calls all renderfilters on provided text
 *				or current module position provided text null
 *
 * ENT:	buf	- buffer to render
 *
 * RET: this module's text at current key location massaged by renderText filters
 *
 * NOTES: This method is only truly const if called with a provided text; using
 * module's current position may produce a new entry attributes map which
 * logically violates the const semantic, which is why the above method
 * which takes no params is not const, i.e., don't call this method with
 * null as text param, but instead use non-const method above.  The public
 * interface for this method expects a value for the text param.  We use it
 * internally sometimes calling with null to save duplication of code.
 */

SWBuf SWModule::renderText(const char *buf, int len, bool render) const {
	bool savePEA = isProcessEntryAttributes();
	if (!buf) {
		entryAttributes.clear();
	}
	else {
		setProcessEntryAttributes(false);
	}

	SWBuf local;
	if (buf)
		local = buf;

	SWBuf &tmpbuf = (buf) ? local : getRawEntryBuf();
	SWKey *key = 0;
	static const char *null = "";

	if (tmpbuf) {
		unsigned long size = (len < 0) ? ((getEntrySize()<0) ? strlen(tmpbuf) : getEntrySize()) : len;
		if (size > 0) {
			key = this->getKey();

			optionFilter(tmpbuf, key);
	
			if (render) {
				renderFilter(tmpbuf, key);
				encodingFilter(tmpbuf, key);
			}
			else	stripFilter(tmpbuf, key);
		}
	}
	else {
		tmpbuf = null;
	}

	setProcessEntryAttributes(savePEA);

	return tmpbuf;
}


/******************************************************************************
 * SWModule::renderText 	- calls all renderfilters on current text
 *
 * ENT:	tmpKey	- key to use to grab text
 *
 * RET: this module's text at current key location massaged by RenderFilers
 */

SWBuf SWModule::renderText(const SWKey *tmpKey) {
	SWKey *saveKey;
	const char *retVal;

	if (!key->isPersist()) {
		saveKey = createKey();
		*saveKey = *key;
	}
	else	saveKey = key;

	setKey(*tmpKey);

	retVal = renderText();

	setKey(*saveKey);

	if (!saveKey->isPersist())
		delete saveKey;

	return retVal;
}


/******************************************************************************
 * SWModule::stripText 	- calls all StripTextFilters on current text
 *
 * ENT:	tmpKey	- key to use to grab text
 *
 * RET: this module's text at specified key location massaged by Strip filters
 */

const char *SWModule::stripText(const SWKey *tmpKey) {
	SWKey *saveKey;
	const char *retVal;

	if (!key->isPersist()) {
		saveKey = createKey();
		*saveKey = *key;
	}
	else	saveKey = key;

	setKey(*tmpKey);

	retVal = stripText();

	setKey(*saveKey);

	if (!saveKey->isPersist())
		delete saveKey;

	return retVal;
}

/******************************************************************************
 * SWModule::getBibliography	-Returns bibliographic data for a module in the
 *								requested format
 *
 * ENT: bibFormat format of the bibliographic data
 *
 * RET: bibliographic data in the requested format as a string (BibTeX by default)
 */

SWBuf SWModule::getBibliography(unsigned char bibFormat) const {
	SWBuf s;
	switch (bibFormat) {
	case BIB_BIBTEX:
		s.append("@Book {").append(modname).append(", Title = \"").append(moddesc).append("\", Publisher = \"CrossWire Bible Society\"}");
		break;
	}
	return s;
}

const char *SWModule::getConfigEntry(const char *key) const {
	ConfigEntMap::iterator it = config->find(key);
	return (it != config->end()) ? it->second.c_str() : 0;
}


void SWModule::setConfig(ConfigEntMap *config) {
	this->config = config;
}


bool SWModule::hasSearchFramework() {
#ifdef USELUCENE
	return true;
#else
	return SWSearchable::hasSearchFramework();
#endif
}

void SWModule::deleteSearchFramework() {
#ifdef USELUCENE
	SWBuf target = getConfigEntry("AbsoluteDataPath");
	if (!target.endsWith("/") && !target.endsWith("\\")) {
		target.append('/');
	}
	target.append("lucene");

	FileMgr::removeDir(target.c_str());
#else
	SWSearchable::deleteSearchFramework();
#endif
}


signed char SWModule::createSearchFramework(void (*percent)(char, void *), void *percentUserData) {

#if defined USELUCENE || defined USEXAPIAN
	SWBuf target = getConfigEntry("AbsoluteDataPath");
	if (!target.endsWith("/") && !target.endsWith("\\")) {
		target.append('/');
	}
#if defined USEXAPIAN
	target.append("xapian");
#elif defined USELUCENE
	const int MAX_CONV_SIZE = 1024 * 1024;
	target.append("lucene");
#endif
	int status = FileMgr::createParent(target+"/dummy");
	if (status) return -1;

	SWKey *saveKey = 0;
	SWKey *searchKey = 0;
	SWKey textkey;
	SWBuf c;


	// turn all filters to default values
	StringList filterSettings;
	for (OptionFilterList::iterator filter = optionFilters->begin(); filter != optionFilters->end(); filter++) {
		filterSettings.push_back((*filter)->getOptionValue());
		(*filter)->setOptionValue(*((*filter)->getOptionValues().begin()));

		if ( (!strcmp("Greek Accents", (*filter)->getOptionName())) ||
			(!strcmp("Hebrew Vowel Points", (*filter)->getOptionName())) ||
			(!strcmp("Arabic Vowel Points", (*filter)->getOptionName()))
		   ) {
			(*filter)->setOptionValue("Off");
		}
	}


	// be sure we give CLucene enough file handles
	FileMgr::getSystemFileMgr()->flush();

	// save key information so as not to disrupt original
	// module position
	if (!key->isPersist()) {
		saveKey = createKey();
		*saveKey = *key;
	}
	else	saveKey = key;

	searchKey = (key->isPersist())?key->clone():0;
	if (searchKey) {
		searchKey->setPersist(1);
		setKey(*searchKey);
	}

	bool includeKeyInSearch = getConfig().has("SearchOption", "IncludeKeyInSearch");

	// lets create or open our search index
#if defined USEXAPIAN
	Xapian::WritableDatabase database(target.c_str(), Xapian::DB_CREATE_OR_OPEN);
	Xapian::TermGenerator termGenerator;
	SWTRY {
		termGenerator.set_stemmer(Xapian::Stem(getLanguage()));
	} SWCATCH(...) {}

#elif defined USELUCENE
	RAMDirectory *ramDir = 0;
	IndexWriter *coreWriter = 0;
	IndexWriter *fsWriter = 0;
	Directory *d = 0;

	const TCHAR *stopWords[] = { 0 };
	standard::StandardAnalyzer *an = new standard::StandardAnalyzer(stopWords);

	ramDir = new RAMDirectory();
	coreWriter = new IndexWriter(ramDir, an, true);
	coreWriter->setMaxFieldLength(MAX_CONV_SIZE);
#endif




	char perc = 1;
	VerseKey *vkcheck = 0;
	vkcheck = SWDYNAMIC_CAST(VerseKey, key);
	VerseKey *chapMax = 0;
	if (vkcheck) chapMax = (VerseKey *)vkcheck->clone();

	TreeKeyIdx *tkcheck = 0;
	tkcheck = SWDYNAMIC_CAST(TreeKeyIdx, key);


	*this = BOTTOM;
	long highIndex = key->getIndex();
	if (!highIndex)
		highIndex = 1;		// avoid division by zero errors.

	bool savePEA = isProcessEntryAttributes();
	setProcessEntryAttributes(true);

	// prox chapter blocks
	// position module at the beginning
	*this = TOP;

	SWBuf proxBuf;
	SWBuf proxLem;
	SWBuf proxMorph;
	SWBuf strong;
	SWBuf morph;

	char err = popError();
	while (!err) {
		long mindex = key->getIndex();

		proxBuf = "";
		proxLem = "";
		proxMorph = "";

		// computer percent complete so we can report to our progress callback
		float per = (float)mindex / highIndex;
		// between 5%-98%
		per *= 93; per += 5;
		char newperc = (char)per;
		if (newperc > perc) {
			perc = newperc;
			(*percent)(perc, percentUserData);
		}

		// get "content" field
		const char *content = stripText();

		bool good = false;

		// start out entry
#if defined USEXAPIAN
		Xapian::Document doc;
		termGenerator.set_document(doc);
#elif defined USELUCENE
		Document *doc = new Document();
#endif
		// get "key" field
		SWBuf keyText = (vkcheck) ? vkcheck->getOSISRef() : getKeyText();
		if (content && *content) {
			good = true;


			// build "strong" field
			AttributeTypeList::iterator words;
			AttributeList::iterator word;
			AttributeValue::iterator strongVal;
			AttributeValue::iterator morphVal;

			strong="";
			morph="";
			words = getEntryAttributes().find("Word");
			if (words != getEntryAttributes().end()) {
				for (word = words->second.begin();word != words->second.end(); word++) {
					int partCount = atoi(word->second["PartCount"]);
					if (!partCount) partCount = 1;
					for (int i = 0; i < partCount; i++) {
						SWBuf tmp = "Lemma";
						if (partCount > 1) tmp.appendFormatted(".%d", i+1);
						strongVal = word->second.find(tmp);
						if (strongVal != word->second.end()) {
							// cheeze.  skip empty article tags that weren't assigned to any text
							if (strongVal->second == "G3588") {
								if (word->second.find("Text") == word->second.end())
									continue;	// no text? let's skip
							}
							strong.append(strongVal->second);
							morph.append(strongVal->second);
							morph.append('@');
							SWBuf tmp = "Morph";
							if (partCount > 1) tmp.appendFormatted(".%d", i+1);
							morphVal = word->second.find(tmp);
							if (morphVal != word->second.end()) {
								morph.append(morphVal->second);
							}
							strong.append(' ');
							morph.append(' ');
						}
					}
				}
			}

#if defined USEXAPIAN
			doc.set_data(keyText.c_str());
#elif defined USELUCENE
			doc->add(*_CLNEW Field(_T("key"), (wchar_t *)utf8ToWChar(keyText).getRawData(), Field::STORE_YES | Field::INDEX_UNTOKENIZED));
#endif

			if (includeKeyInSearch) {
				c = keyText;
				c += " ";
				c += content;
				content = c.c_str();
			}

#if defined USEXAPIAN
			termGenerator.index_text(content);
			termGenerator.index_text(content, 1, "C");
#elif defined USELUCENE
			doc->add(*_CLNEW Field(_T("content"), (wchar_t *)utf8ToWChar(content).getRawData(), Field::STORE_NO | Field::INDEX_TOKENIZED));
#endif

			if (strong.length() > 0) {
#if defined USEXAPIAN
				termGenerator.index_text(strong.c_str(), 1, "L");
				termGenerator.index_text(morph.c_str(), 1, "M");
#elif defined USELUCENE
				doc->add(*_CLNEW Field(_T("lemma"), (wchar_t *)utf8ToWChar(strong).getRawData(), Field::STORE_NO | Field::INDEX_TOKENIZED));
				doc->add(*_CLNEW Field(_T("morph"), (wchar_t *)utf8ToWChar(morph).getRawData(), Field::STORE_NO | Field::INDEX_TOKENIZED));
#endif
//printf("setting fields (%s).\ncontent: %s\nlemma: %s\n", (const char *)*key, content, strong.c_str());
			}

//printf("setting fields (%s).\n", (const char *)*key);
//fflush(stdout);
		}
		// don't write yet, cuz we have to see if we're the first of a prox block (5:1 or chapter5/verse1

		// for VerseKeys use chapter
		if (vkcheck) {
			*chapMax = *vkcheck;
			// we're the first verse in a chapter
			if (vkcheck->getVerse() == 1) {
				*chapMax = MAXVERSE;
				VerseKey saveKey = *vkcheck;
				while ((!err) && (*vkcheck <= *chapMax)) {
//printf("building proxBuf from (%s).\nproxBuf.c_str(): %s\n", (const char *)*key, proxBuf.c_str());
//printf("building proxBuf from (%s).\n", (const char *)*key);

					content = stripText();
					if (content && *content) {
						// build "strong" field
						strong = "";
						morph = "";
						AttributeTypeList::iterator words;
						AttributeList::iterator word;
						AttributeValue::iterator strongVal;
						AttributeValue::iterator morphVal;

						words = getEntryAttributes().find("Word");
						if (words != getEntryAttributes().end()) {
							for (word = words->second.begin();word != words->second.end(); word++) {
								int partCount = atoi(word->second["PartCount"]);
								if (!partCount) partCount = 1;
								for (int i = 0; i < partCount; i++) {
									SWBuf tmp = "Lemma";
									if (partCount > 1) tmp.appendFormatted(".%d", i+1);
									strongVal = word->second.find(tmp);
									if (strongVal != word->second.end()) {
										// cheeze.  skip empty article tags that weren't assigned to any text
										if (strongVal->second == "G3588") {
											if (word->second.find("Text") == word->second.end())
												continue;	// no text? let's skip
										}
										strong.append(strongVal->second);
										morph.append(strongVal->second);
										morph.append('@');
										SWBuf tmp = "Morph";
										if (partCount > 1) tmp.appendFormatted(".%d", i+1);
										morphVal = word->second.find(tmp);
										if (morphVal != word->second.end()) {
											morph.append(morphVal->second);
										}
										strong.append(' ');
										morph.append(' ');
									}
								}
							}
						}
						proxBuf += content;
						proxBuf.append(' ');
						proxLem += strong;
						proxMorph += morph;
						if (proxLem.length()) {
							proxLem.append("\n");
							proxMorph.append("\n");
						}
					}
					(*this)++;
					err = popError();
				}
				err = 0;
				*vkcheck = saveKey;
			}
		}

		// for TreeKeys use siblings if we have no children
		else if (tkcheck) {
			if (!tkcheck->hasChildren()) {
				if (!tkcheck->previousSibling()) {
					do {
//printf("building proxBuf from (%s).\n", (const char *)*key);
//fflush(stdout);

						content = stripText();
						if (content && *content) {
							// build "strong" field
							strong = "";
							morph = "";
							AttributeTypeList::iterator words;
							AttributeList::iterator word;
							AttributeValue::iterator strongVal;
							AttributeValue::iterator morphVal;

							words = getEntryAttributes().find("Word");
							if (words != getEntryAttributes().end()) {
								for (word = words->second.begin();word != words->second.end(); word++) {
									int partCount = atoi(word->second["PartCount"]);
									if (!partCount) partCount = 1;
									for (int i = 0; i < partCount; i++) {
										SWBuf tmp = "Lemma";
										if (partCount > 1) tmp.appendFormatted(".%d", i+1);
										strongVal = word->second.find(tmp);
										if (strongVal != word->second.end()) {
											// cheeze.  skip empty article tags that weren't assigned to any text
											if (strongVal->second == "G3588") {
												if (word->second.find("Text") == word->second.end())
													continue;	// no text? let's skip
											}
											strong.append(strongVal->second);
											morph.append(strongVal->second);
											morph.append('@');
											SWBuf tmp = "Morph";
											if (partCount > 1) tmp.appendFormatted(".%d", i+1);
											morphVal = word->second.find(tmp);
											if (morphVal != word->second.end()) {
												morph.append(morphVal->second);
											}
											strong.append(' ');
											morph.append(' ');
										}
									}
								}
							}

							proxBuf += content;
							proxBuf.append(' ');
							proxLem += strong;
							proxMorph += morph;
							if (proxLem.length()) {
								proxLem.append("\n");
								proxMorph.append("\n");
							}
						}
					} while (tkcheck->nextSibling());
					tkcheck->parent();
					tkcheck->firstChild();
				}
				else tkcheck->nextSibling();	// reposition from our previousSibling test
			}
		}

		if (proxBuf.length() > 0) {

#if defined USEXAPIAN
			termGenerator.index_text(proxBuf.c_str(), 1, "P");
#elif defined USELUCENE
			doc->add(*_CLNEW Field(_T("prox"), (wchar_t *)utf8ToWChar(proxBuf).getRawData(), Field::STORE_NO | Field::INDEX_TOKENIZED));
#endif
			good = true;
		}
		if (proxLem.length() > 0) {
#if defined USEXAPIAN
			termGenerator.index_text(proxLem.c_str(), 1, "PL");
			termGenerator.index_text(proxMorph.c_str(), 1, "PM");
#elif defined USELUCENE
			doc->add(*_CLNEW Field(_T("proxlem"), (wchar_t *)utf8ToWChar(proxLem).getRawData(), Field::STORE_NO | Field::INDEX_TOKENIZED) );
			doc->add(*_CLNEW Field(_T("proxmorph"), (wchar_t *)utf8ToWChar(proxMorph).getRawData(), Field::STORE_NO | Field::INDEX_TOKENIZED) );
#endif
			good = true;
		}
		if (good) {
//printf("writing (%s).\n", (const char *)*key);
//fflush(stdout);
#if defined USEXAPIAN
			SWBuf idTerm;
			idTerm.setFormatted("Q%ld", key->getIndex());
			doc.add_boolean_term(idTerm.c_str());
			database.replace_document(idTerm.c_str(), doc);
#elif defined USELUCENE
			coreWriter->addDocument(doc);
#endif
		}
#if defined USEXAPIAN
#elif defined USELUCENE
		delete doc;
#endif

		(*this)++;
		err = popError();
	}

	// Optimizing automatically happens with the call to addIndexes
	//coreWriter->optimize();
#if defined USEXAPIAN
#elif defined USELUCENE
	coreWriter->close();

#ifdef CLUCENE2
	d = FSDirectory::getDirectory(target.c_str());
#endif
	if (IndexReader::indexExists(target.c_str())) {
#ifndef CLUCENE2
		d = FSDirectory::getDirectory(target.c_str(), false);
#endif
		if (IndexReader::isLocked(d)) {
			IndexReader::unlock(d);
		}
		fsWriter = new IndexWriter( d, an, false);
	}
	else {
#ifndef CLUCENE2
		d = FSDirectory::getDirectory(target.c_str(), true);
#endif
		fsWriter = new IndexWriter(d, an, true);
	}

	Directory *dirs[] = { ramDir, 0 };
#ifdef CLUCENE2
	lucene::util::ConstValueArray< lucene::store::Directory *>dirsa(dirs, 1);
	fsWriter->addIndexes(dirsa);
#else
	fsWriter->addIndexes(dirs);
#endif
	fsWriter->close();

	delete ramDir;
	delete coreWriter;
	delete fsWriter;
	delete an;
#endif

	// reposition module back to where it was before we were called
	setKey(*saveKey);

	if (!saveKey->isPersist())
		delete saveKey;

	if (searchKey)
		delete searchKey;

	delete chapMax;

	setProcessEntryAttributes(savePEA);

	// reset option filters back to original values
	StringList::iterator origVal = filterSettings.begin();
	for (OptionFilterList::iterator filter = optionFilters->begin(); filter != optionFilters->end(); filter++) {
		(*filter)->setOptionValue(*origVal++);
	}

	return 0;
#else
	return SWSearchable::createSearchFramework(percent, percentUserData);
#endif
}

/** OptionFilterBuffer a text buffer
 * @param filters the FilterList of filters to iterate
 * @param buf the buffer to filter
 * @param key key location from where this buffer was extracted
 */
void SWModule::filterBuffer(OptionFilterList *filters, SWBuf &buf, const SWKey *key) const {
	OptionFilterList::iterator it;
	for (it = filters->begin(); it != filters->end(); it++) {
		(*it)->processText(buf, key, this);
	}
}

/** FilterBuffer a text buffer
 * @param filters the FilterList of filters to iterate
 * @param buf the buffer to filter
 * @param key key location from where this buffer was extracted
 */
void SWModule::filterBuffer(FilterList *filters, SWBuf &buf, const SWKey *key) const {
	FilterList::iterator it;
	for (it = filters->begin(); it != filters->end(); it++) {
		(*it)->processText(buf, key, this);
	}
}

signed char SWModule::createModule(const char*) {
	return -1;
}

void SWModule::setEntry(const char*, long) {
}

void SWModule::linkEntry(const SWKey*) {
}


/******************************************************************************
 * SWModule::prepText	- Prepares the text before returning it to external
 *					objects
 *
 * ENT:	buf	- buffer where text is stored and where to store the prep'd
 *				text.
 */

void SWModule::prepText(SWBuf &buf) {
	unsigned int to, from; 
	char space = 0, cr = 0, realdata = 0, nlcnt = 0;
	char *rawBuf = buf.getRawData();
	for (to = from = 0; rawBuf[from]; from++) {
		switch (rawBuf[from]) {
		case 10:
			if (!realdata)
				continue;
			space = (cr) ? 0 : 1;
			cr = 0;
			nlcnt++;
			if (nlcnt > 1) {
//				*to++ = nl;
				rawBuf[to++] = 10;
//				*to++ = nl[1];
//				nlcnt = 0;
			}
			continue;
		case 13:
			if (!realdata)
				continue;
//			*to++ = nl[0];
			rawBuf[to++] = 10;
			space = 0;
			cr = 1;
			continue;
		}
		realdata = 1;
		nlcnt = 0;
		if (space) {
			space = 0;
			if (rawBuf[from] != ' ') {
				rawBuf[to++] = ' ';
				from--;
				continue;
			}
		}
		rawBuf[to++] = rawBuf[from];
	}
	buf.setSize(to);

	while (to > 1) {			// remove trailing excess
		to--;
		if ((rawBuf[to] == 10) || (rawBuf[to] == ' '))
			buf.setSize(to);
		else break;
	}
}

SWORD_NAMESPACE_END
