/******************************************************************************
 *
 *  versekey.cpp -	code for class 'VerseKey'- a standard Biblical
 *			verse key
 *
 * $Id: versekey.cpp 3822 2020-11-03 18:54:47Z scribe $
 *
 * Copyright 1998-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * Code changes have been made for STEPBible (www.stepbible.org) to use
 * bespoke versification, which uses custom canon definitions in JSON format.
 * The changes may be redistributed and/or modified under the terms of the
 * GNU General Public License, as published by the Free Software Foundation
 * version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */


#include <swmacs.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <ctype.h>

#include <utilstr.h>
#include <stringmgr.h>
#include <swkey.h>
#include <swlog.h>
#include <versekey.h>
#include <swlocale.h>
#include <roman.h>
#include <versificationmgr.h>

SWORD_NAMESPACE_START

static const char *classes[] = {"VerseKey", "SWKey", "SWObject", 0};
static const SWClass classdef(classes);

/******************************************************************************
 *  Initialize static members of VerseKey
 */

int           VerseKey::instance       = 0;


/******************************************************************************
 * VerseKey::init - initializes instance of VerseKey
 */

void VerseKey::init(const char *v11n) {
	myClass = &classdef;

	instance++;
	autonorm = 1;		// default auto normalization to true
	intros = false;		// default display intros option is false
	upperBound = 0;
	lowerBound = 0;
	boundSet = false;
	testament = 1;
	book = 1;
	chapter = 1;
	verse = 1;
	suffix = 0;
	tmpClone = 0;
	refSys = 0;

	setVersificationSystem(v11n);
}

/******************************************************************************
 * VerseKey Constructor - initializes instance of VerseKey
 *
 * ENT:	ikey - base key (will take various forms of 'BOOK CH:VS'.  See
 *		VerseKey::parse for more detailed information)
 */

VerseKey::VerseKey(const SWKey &ikey) : SWKey(ikey)
{
	init();
	copyFrom(ikey);
}


VerseKey::VerseKey(const SWKey *ikey) : SWKey(*ikey)
{
	init();
	if (ikey)
		copyFrom(*ikey);
}


/******************************************************************************
 * VerseKey Constructor - initializes instance of VerseKey
 *
 * ENT:	ikey - text key (will take various forms of 'BOOK CH:VS'.  See
 *		VerseKey::parse for more detailed information)
 */

VerseKey::VerseKey(const char *ikeyText) : SWKey(ikeyText)
{
	init();
	if (ikeyText)
		parse();
}


VerseKey::VerseKey(VerseKey const &k) : SWKey(k)
{
	init();
	copyFrom(k);
}


/******************************************************************************
 * VerseKey::setFromOther - Positions this VerseKey to another VerseKey
 */

void VerseKey::setFromOther(const VerseKey &ikey) {
	if (refSys == ikey.refSys) {
		testament = ikey.getTestament();
		book = ikey.getBook();
		chapter = ikey.getChapter();
		verse = ikey.getVerse();
		suffix = ikey.getSuffix();
	}
	else {
		// map verse between systems
		const char* map_book = ikey.getOSISBookName();
		int map_chapter = ikey.getChapter();
		int map_verse = ikey.getVerse();
		int map_range = map_verse;

		ikey.refSys->translateVerse(refSys, &map_book, &map_chapter, &map_verse, &map_range);
//dbg_mapping SWLOGD("verse: %s.%i.%i-%i\n", map_book, map_chapter, map_verse, map_range);
		
		book = refSys->getBookNumberByOSISName(map_book);

		// check existence
		if (book == -1) {
			book = 1;
			error = KEYERR_OUTOFBOUNDS;
		}
		else if (refSys->getBook(book-1)->getChapterMax() < map_chapter) {
			map_chapter = refSys->getBook(book-1)->getChapterMax();
			map_verse = refSys->getBook(book-1)->getVerseMax(map_chapter);
			error = KEYERR_OUTOFBOUNDS;
		}
		else if (map_chapter > 0 && refSys->getBook(book-1)->getVerseMax(map_chapter) < map_verse) {
			map_verse = refSys->getBook(book-1)->getVerseMax(map_chapter);
			error = KEYERR_OUTOFBOUNDS;
		}

		// set values
		if (book > BMAX[0])
			book -= BMAX[0], testament = 2;
		else
			testament = 1;

		//if (map_verse == 0) Headings(1);

		chapter = map_chapter;
		verse = map_verse;
		suffix = ikey.getSuffix();
		
		if (map_verse < map_range) {
			if (map_range > refSys->getBook(((testament>1)?BMAX[0]:0)+book-1)->getVerseMax(chapter))
				++map_range;
			verse = map_range;
			setUpperBound(this);
			verse = map_verse;
			setLowerBound(this);
		}
	}
}


void VerseKey::positionFrom(const SWKey &ikey) {
 	error = 0;
        const SWKey *fromKey = &ikey;
	const ListKey *tryList = SWDYNAMIC_CAST(const ListKey, fromKey);
	if (tryList) {
		const SWKey *k = tryList->getElement();
		if (k) fromKey = k;
	}
	const VerseKey *tryVerse = SWDYNAMIC_CAST(const VerseKey, fromKey);
	if (tryVerse) {
		setFromOther(*tryVerse);
	}
	else {
		SWKey::positionFrom(*fromKey);
// extraneous parse which inadvertently clears error flag
// SWKey::positionFrom already calls copyFrom which calls setText, which VerseKey::setText already calls parse()
//		parse();
	}

 	// should we always perform bounds checks?  Tried but seems to cause infinite recursion
	if (_compare(getUpperBound()) > 0) {
		setFromOther(getUpperBound());
		error = KEYERR_OUTOFBOUNDS;
	}
	if (_compare(getLowerBound()) < 0) {
		setFromOther(getLowerBound());
		error = KEYERR_OUTOFBOUNDS;
	}
}


/******************************************************************************
 * VerseKey::copyFrom - Equates this VerseKey to another VerseKey
 */

void VerseKey::copyFrom(const VerseKey &ikey) {
	autonorm = ikey.autonorm;
	intros = ikey.intros;
	testament = ikey.getTestament();
	book = ikey.getBook();
	chapter = ikey.getChapter();
	verse = ikey.getVerse();
	suffix = ikey.getSuffix();
	setLocale(ikey.getLocale());
	setVersificationSystem(ikey.getVersificationSystem());
	if (ikey.isBoundSet()) {
		setLowerBound(ikey.getLowerBound());
		setUpperBound(ikey.getUpperBound());
	}
}


/******************************************************************************
 * VerseKey::copyFrom - Equates this VerseKey to another SWKey
 */

void VerseKey::copyFrom(const SWKey &ikey) {
	// check to see if we can do a more specific copy
	// plus some optimizations
	const SWKey *fromKey = &ikey;
	const ListKey *tryList = SWDYNAMIC_CAST(const ListKey, fromKey);
	if (tryList) {
		const SWKey *k = tryList->getElement();
		if (k) fromKey = k;
	}
	const VerseKey *tryVerse = SWDYNAMIC_CAST(const VerseKey, fromKey);
	if (tryVerse) {
		copyFrom(*tryVerse);
	}
	else {
		SWKey::copyFrom(*fromKey);
// extraneous parse which inadvertently clears error flag
// SWKey::copyFrom already calls setText, which VerseKey::setText already calls parse()
//		parse();
	}
}


VerseKey::VerseKey(const char *min, const char *max, const char *v11n) : SWKey()
{
	init(v11n);
	ListKey tmpListKey = parseVerseList(min);
	if (tmpListKey.getCount()) {
		VerseKey *newElement = SWDYNAMIC_CAST(VerseKey, tmpListKey.getElement(0));
		setLowerBound(*newElement);
	}
	tmpListKey = parseVerseList(max, min, true);
	if (tmpListKey.getCount()) {
		VerseKey *newElement = SWDYNAMIC_CAST(VerseKey, tmpListKey.getElement(0));
		setUpperBound((newElement->isBoundSet())?newElement->getUpperBound():*newElement);
	}
	setPosition(TOP);
}


SWKey *VerseKey::clone() const
{
	return new VerseKey(*this);
}


/******************************************************************************
 * VerseKey Destructor - cleans up instance of VerseKey
 *
 * ENT:	ikey - text key
 */

VerseKey::~VerseKey() {

	delete tmpClone;

	--instance;
}

void VerseKey::registerCustomVersificationSystem(const char *name, const sbook *ot, const sbook *nt, int *chMax, const unsigned char *mappings){
	VersificationMgr::getSystemVersificationMgr()->registerCustomVersificationSystem(name, ot, nt, chMax, mappings);
}

void VerseKey::setVersificationSystem(const char *name) {
	const VersificationMgr::System *newRefSys = VersificationMgr::getSystemVersificationMgr()->getVersificationSystem(name);
	// TODO: cheese, but what should we do if requested v11n system isn't found?
	if (!newRefSys)   newRefSys = VersificationMgr::getSystemVersificationMgr()->getVersificationSystem("KJV");
	if (refSys != newRefSys) {
		refSys = newRefSys;
		BMAX[0] = refSys->getBMAX()[0];
		BMAX[1] = refSys->getBMAX()[1];

		// TODO: adjust bounds for versificaion system ???
		// TODO: when we have mapping done, rethink this
		//necessary as our bounds might not mean anything in the new v11n system
		clearBounds();
	}

}


const char *VerseKey::getVersificationSystem() const { return refSys->getName(); }



/******************************************************************************
 * VerseKey::parse - parses keytext into testament|book|chapter|verse
 *
 * RET:	error status
 */

char VerseKey::parse(bool checkAutoNormalize)
{
	testament = BMAX[1]?2:1;
	book      = BMAX[BMAX[1]?1:0];
	chapter   = 1;
	verse     = 1;

	int error = 0;

	if (keytext) {
		// pass our own copy of keytext as keytext memory may be freshed during parse 
		ListKey tmpListKey = parseVerseList(SWBuf(keytext).c_str());
		if (tmpListKey.getCount()) {
			this->positionFrom(*tmpListKey.getElement(0));
			error = this->error;
		} else error = 1;
	}
	if (checkAutoNormalize) {
		normalize(true);
	}
	freshtext();

	return (this->error) ? this->error : (this->error = error);
}


/******************************************************************************
 * VerseKey::freshtext - refreshes keytext based on
 *				testament|book|chapter|verse
 */

void VerseKey::freshtext() const
{
	char buf[2024];
	int realTest = testament;
	int realbook = book;

	if (book < 1) {
		if (testament < 1)
			sprintf(buf, "[ Module Heading ]");
		else sprintf(buf, "[ Testament %d Heading ]", (int)testament);
	}
	else {
		if (realbook > BMAX[realTest-1]) {
			realbook -= BMAX[realTest-1];
			if (realTest < 2)
				realTest++;
			if (realbook > BMAX[realTest-1])
				realbook = BMAX[realTest-1];
		}
		sprintf(buf, "%s %d:%d", getBookName(), chapter, verse);
		if (suffix) {
			buf[strlen(buf)+1] = 0;
			buf[strlen(buf)] = suffix;
		}
	}

	stdstr((char **)&keytext, buf);
}



/************************************************************************
 * VerseKey::getBookAbbrev - Attempts to find a book no from a name or
 *                           abbreviation
 *
 * ENT:	abbr - key for which to search;
 * RET:	book number or < 0 = not valid
 */

int VerseKey::getBookFromAbbrev(const char *iabbr) const
{
	int diff, abLen, min, max, target, retVal = -1;

	char *abbr = 0;

	int abbrevsCnt;

	const struct abbrev *abbrevs = getPrivateLocale()->getBookAbbrevs(&abbrevsCnt);

	StringMgr* stringMgr = StringMgr::getSystemStringMgr();
	const bool hasUTF8Support = StringMgr::hasUTF8Support();

	// The first iteration of this loop tries to uppercase
	// the string. If we still fail to match, we try
	// matching the string without any toupper logic.
	// This is useful for, say, Chinese user input
	// on a system that doesn't properly support
	// a true Unicode-toupper function (!hasUTF8Support)
	for (int i = 0; i < 2; i++) {
		stdstr(&abbr, iabbr, 2);
		strstrip(abbr);

		if (!i) {
			if (hasUTF8Support) { //we have support for UTF-8 handling; we expect UTF-8 encoded locales
				stringMgr->upperUTF8(abbr, (unsigned int)(strlen(abbr)*2));
			}
			else {
				stringMgr->upperLatin1(abbr);
			}
		}

		abLen = (int)strlen(abbr);

		if (abLen) {
			min = 0;
			max = abbrevsCnt;

			// binary search for a match
			while(1) {
				target = min + ((max - min) / 2);
				diff = strncmp(abbr, abbrevs[target].ab, abLen);
				if ((!diff)||(target >= max)||(target <= min))
					break;
				if (diff > 0)
					min = target;
				else	max = target;
			}

			// lets keep backing up till we find the 'first' valid match
			for (; target > 0; target--) {
				if (strncmp(abbr, abbrevs[target-1].ab, abLen))
					break;
			}

			if (!diff) {
				// lets keep moving forward till we find an abbrev in our refSys
				retVal = refSys->getBookNumberByOSISName(abbrevs[target].osis);
				while ((retVal < 0)  && (target < max) && (!strncmp(abbr, abbrevs[target+1].ab, abLen))) {
					target++;
					retVal = refSys->getBookNumberByOSISName(abbrevs[target].osis);
				}
			}
			else retVal = -1;
		}
		if (retVal > 0)
			break;
	}
	delete [] abbr;
	return retVal;
}


/******************************************************************************
 * VerseKey::validateCurrentLocale - be sure a locale book abbrevs set is complete
 *
 */
void VerseKey::validateCurrentLocale() const {
	if (SWLog::getSystemLog()->getLogLevel() >= SWLog::LOG_DEBUG) { //make sure log is wanted, this loop stuff costs a lot of time
		for (int i = 0; i < refSys->getBookCount(); i++) {
			const int bn = getBookFromAbbrev(getPrivateLocale()->translate(refSys->getBook(i)->getLongName()));
			if (bn != i+1) {
				char *abbr = 0;
				stdstr(&abbr, getPrivateLocale()->translate(refSys->getBook(i)->getLongName()), 2);
				strstrip(abbr);
				SWLog::getSystemLog()->logWarning("VerseKey::Book: %s does not have a matching toupper abbrevs entry! book number returned was: %d, should be %d. Required entry to add to locale:", abbr, bn, i);

				StringMgr* stringMgr = StringMgr::getSystemStringMgr();
				const bool hasUTF8Support = StringMgr::hasUTF8Support();
				if (hasUTF8Support) { //we have support for UTF-8 handling; we expect UTF-8 encoded locales
					stringMgr->upperUTF8(abbr, (unsigned int)(strlen(abbr)*2));
				}
				else {
					stringMgr->upperLatin1(abbr);
				}
				SWLOGD("%s=%s\n", abbr, refSys->getBook(i)->getOSISName());
				delete [] abbr;
			}
		}
	}
}


/******************************************************************************
 * VerseKey::parseVerseList - Attempts to parse a buffer into separate
 *				verse entries returned in a ListKey
 *
 * ENT:	buf		- buffer to parse;
 *	defaultKey	- if verse, chap, book, or testament is left off,
 *				pull info from this key (ie. Gen 2:3; 4:5;
 *				Gen would be used when parsing the 4:5 section)
 *	expandRange	- whether or not to expand eg. John 1:10-12 or just
 *				save John 1:10
 *
 * RET:	ListKey reference filled with verse entries contained in buf
 *
 * COMMENT: This code works but wreaks.  Rewrite to make more maintainable.
 */

ListKey VerseKey::parseVerseList(const char *buf, const char *defaultKey, bool expandRange, bool useChapterAsVerse) {

	// hold on to our own copy of params, as threads/recursion may change outside values
	const char *bufStart = buf;
	SWBuf iBuf = buf;
	buf = iBuf.c_str();
	SWBuf iDefaultKey = defaultKey;
	if (defaultKey) defaultKey = iDefaultKey.c_str();

	char book[2048];	// TODO: bad, remove
	char number[2048];	// TODO: bad, remove
	*book = 0;
	*number = 0;
	int tobook = 0;
	int tonumber = 0;
	char suffix = 0;
	int chap = -1, verse = -1;
	int bookno = 0;
	int loop;
	char comma = 0;
	char dash = 0;
	const char *orig = buf;
	int q;
	ListKey tmpListKey;
	ListKey internalListKey;
	char lastPartial = 0;
	bool inTerm = true;
	int notAllDigits = 0;
	bool doubleF = false;

	// assert we have a buffer
	if (!buf) return internalListKey;

	VerseKey *curKey  = (VerseKey *)this->clone();
	VerseKey *lastKey = (VerseKey *)this->clone();
	lastKey->clearBounds();
	curKey->clearBounds();

	// some silly checks for corner cases
	if (!strcmp(buf, "[ Module Heading ]")) {
		curKey->setVerse(0);
		curKey->setChapter(0);
		curKey->setBook(0);
		curKey->setTestament(0);
		lastKey->setLowerBound(*curKey);
		lastKey->setUpperBound(*curKey);
		internalListKey << *lastKey;
		delete curKey;
		delete lastKey;
		return internalListKey;
	}
	if ((!strncmp(buf, "[ Testament ", 12)) &&
	    (isdigit(buf[12])) &&
	    (!strcmp(buf+13, " Heading ]"))) {
		curKey->setVerse(0);
		curKey->setChapter(0);
		curKey->setBook(0);
		curKey->setTestament(buf[12]-48);
		lastKey->setLowerBound(*curKey);
		lastKey->setUpperBound(*curKey);
		internalListKey << *lastKey;
		delete curKey;
		delete lastKey;
		return internalListKey;
	}

	curKey->setAutoNormalize(isAutoNormalize());
	lastKey->setAutoNormalize(false);
	if (defaultKey) *lastKey = defaultKey;

	while (*buf) {
		switch (*buf) {
		case ':':
			if (buf[1] != ' ') {		// for silly "Mat 1:1: this verse...."
				number[tonumber] = 0;
				tonumber = 0;
				if (*number) {
					if (chap >= 0)
						verse = atoi(number);
					else	chap  = atoi(number);
				}
				*number = 0;
				comma = 0;
				break;
			}
			goto terminate_range;
			// otherwise drop down to next case
		case ' ':
			inTerm = true;
			while (true) {
				if ((!*number) || (chap < 0))
					break;
				for (q = 1; ((buf[q]) && (buf[q] != ' ')); q++);
				if (buf[q] == ':')
					break;
				inTerm = false;
				break;
			}
			if (inTerm) {
				if (tobook < 1 || book[tobook-1] != ' ') {
					book[tobook++] = ' ';
				}
				break;
			}

		case '-':
			if (chap == -1) {
				book[tobook] = *buf;
				book[tobook+1] = *(buf+1);
				book[tobook+2] = 0;
				int bookno = getBookFromAbbrev(book);
				if (bookno > -1) {
					tobook++;
					buf++;
					break;
				}
			}
		case ',': // on number new verse
		case ';': // on number new chapter
terminate_range:
			number[tonumber] = 0;
			tonumber = 0;
			if (*number) {
				if (chap >= 0)
					verse = atoi(number);
				else	chap = atoi(number);
			}
			*number = 0;
			book[tobook] = 0;
			tobook = 0;
			bookno = -1;
			if (*book) {
				loop = (int)strlen(book) - 1;

				for (; loop+1; loop--) { if (book[loop] == ' ') book[loop] = 0; else break; }

				if (loop > 0 && isdigit(book[loop-1]) && book[loop] >= 'a' && book[loop] <= 'z') {
					book[loop--] = 0;
				}
				for (; loop+1; loop--) {
					if ((isdigit(book[loop])) || (book[loop] == ' ')) {
						book[loop] = 0;
						continue;
					}
					else {
						if ((SW_toupper(book[loop])=='F')&&(loop)) {
							if ((isdigit(book[loop-1])) || (book[loop-1] == ' ') || (SW_toupper(book[loop-1]) == 'F')) {
								book[loop] = 0;
								continue;
							}
						}
					}
					break;
				}

				for (loop = (int)strlen(book) - 1; loop+1; loop--) {
					if (book[loop] == ' ') {
						// "PS C" is ok, but "II C" is not ok
						if (isRoman(&book[loop+1]) && !isRoman(book,loop)) {
							if (verse == -1) {
								verse = chap;
								chap = fromRoman(&book[loop+1]);
								book[loop] = 0;
							}
						}
	        				break;
					}
				}

				// check for special inscriptio and subscriptio which are saved as book intro and chap 1 intro (for INTF)
				for (loop = (int)strlen(book) - 1; loop+1; loop--) {
					if (book[loop] == ' ') {
						if (!strnicmp(&book[loop+1], "inscriptio", (int)strlen(&book[loop+1]))) {
							book[loop] = 0;
							verse = 0;
							chap = 0;
						}
						else if (!strnicmp(&book[loop+1], "subscriptio", (int)strlen(&book[loop+1]))) {
							book[loop] = 0;
							verse = 0;
							chap = 1;
						}
	        				break;
					}
				}

				if ((!stricmp(book, "V")) || (!stricmp(book, "VER"))) {	// Verse abbrev
					if (verse == -1) {
						verse = chap;
						chap = lastKey->getChapter();
						*book = 0;
					}
				}
				if ((!stricmp(book, "ch")) || (!stricmp(book, "chap"))) {	// Verse abbrev
					strcpy(book, lastKey->getBookName());
				}
				bookno = getBookFromAbbrev(book);
				if ((bookno > -1) && (suffix == 'f') && (book[strlen(book)-1] == 'f')) {
					suffix = 0;
				}
			}
			if (((bookno > -1) || (!*book)) && ((*book) || (chap >= 0) || (verse >= 0))) {
				char partial = 0;
				curKey->setVerse(1);
				curKey->setChapter(1);
				curKey->setBook(1);

				if (bookno < 0) {
					curKey->setTestament(lastKey->getTestament());
					curKey->setBook(lastKey->getBook());
				}
				else {
					int t = 1;
					if (bookno > BMAX[0]) {
						t++;
						bookno -= BMAX[0];
					}
					curKey->setTestament(t);
					curKey->setBook(bookno);
				}
				

				if (((comma)||((verse < 0)&&(bookno < 0)))&&(!lastPartial)) {
//				if (comma) {
					curKey->setChapter(lastKey->getChapter());
					curKey->setVerse(chap);  // chap because this is the first number captured
					if (suffix) {
						curKey->setSuffix(suffix);
					}
				}
				else {
					if (useChapterAsVerse && verse < 0 && chap > 0 && curKey->getChapterMax() == 1) {
						verse = chap;
						chap = 1;
					}

					
					if (chap >= 0) {
						curKey->setChapter(chap);
					}
					else {
						partial++;
						curKey->setChapter(1);
					}
					if (verse >= 0) {
						curKey->setVerse(verse);
						if (suffix) {
							curKey->setSuffix(suffix);
						}
					}
					else {
						partial++;
						curKey->setVerse(1);
					}
				}

				// check for '-'
				for (q = 0; ((buf[q]) && (buf[q] == ' ')); q++);
				if ((buf[q] == '-') && (expandRange)) {	// if this is a dash save lowerBound and wait for upper
					buf+=q;
					lastKey->setLowerBound(*curKey);
					lastKey->setPosition(TOP);
					tmpListKey << *lastKey;
					((VerseKey *)tmpListKey.getElement())->setAutoNormalize(isAutoNormalize());
					tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
				}
				else {
					if (!dash) { 	// if last separator was not a dash just add
						if (expandRange && partial) {
							lastKey->setLowerBound(*curKey);
							if (partial > 1)
								curKey->setPosition(MAXCHAPTER);
							if (partial > 0)
								*curKey = MAXVERSE;
							lastKey->setUpperBound(*curKey);
							*lastKey = TOP;
							tmpListKey << *lastKey;
							((VerseKey *)tmpListKey.getElement())->setAutoNormalize(isAutoNormalize());
							tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
						}
						else {
							bool f = false;
							if (curKey->getSuffix() == 'f') {
								curKey->setSuffix(0);
								f = true;
							}
							lastKey->setLowerBound(*curKey);
							if (f && doubleF) (*curKey) = MAXVERSE;
							else if (f) (*curKey)++;
							lastKey->setUpperBound(*curKey);
							*lastKey = TOP;
							tmpListKey << *lastKey;
							((VerseKey *)tmpListKey.getElement())->setAutoNormalize(isAutoNormalize());
							tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
						}
					}
					else	if (expandRange) {
						VerseKey *newElement = SWDYNAMIC_CAST(VerseKey, tmpListKey.getElement());
						if (newElement) {
							if (partial > 1)
								*curKey = MAXCHAPTER;
							if (partial > 0)
								*curKey = MAXVERSE;
							newElement->setUpperBound(*curKey);
							*lastKey = *curKey;
							*newElement = TOP;
							tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
						}
					}
				}
				lastPartial = partial;
			}
			*book = 0;
			chap = -1;
			verse = -1;
			suffix = 0;
			if (*buf == ',')
				comma = 1;
			else	comma = 0;
			if (*buf == '-')
				dash = 1;
			else	dash = 0;
			break;
		case 10:	// ignore these
		case 13:
		case '[':
		case ']':
		case '(':
		case ')':
		case '{':
		case '}':
			break;
		case '.':
			if (buf > orig) {			// ignore (break) if preceeding char is not a digit 
				for (notAllDigits = tobook; notAllDigits; notAllDigits--) {
					if ((!isdigit(book[notAllDigits-1])) && (!strchr(" .", book[notAllDigits-1])))
						break;
				}
				if (!notAllDigits && !isdigit(buf[1]))
					break;
			}

			number[tonumber] = 0;
			tonumber = 0;
			if (*number) {
				if (chap >= 0)
					verse = atoi(number);
				else	chap  = atoi(number);
				*number = 0;
			}
			else if (chap == -1 && (tobook < 1 || book[tobook-1] != ' ')) {
				book[tobook++] = ' ';
			}
			
			break;

		default:
			if (isdigit(*buf)) {
				number[tonumber++] = *buf;
				suffix = 0;
				doubleF = 0;
			}
			else {
				switch (*buf) {
				case ' ':    // ignore these and don't reset number
				case 'F':
					break;
				default:
					// suffixes (and oddly 'f'-- ff.)
					if ((*buf >= 'a' && *buf <= 'z' && (chap >=0 || bookno > -1 || lastKey->isBoundSet()))
							|| *buf == 'f') {
						// if suffix is already an 'f', then we need to mark if we're doubleF.
						doubleF = (*buf == 'f' && suffix == 'f');
						if (suffix && !doubleF) {
							// we've already had a suffix one, so this is another letter, thus any number is not a number, e.g., '2jn'. We're on 'n'
							number[tonumber] = 0;
							tonumber = 0;
						}
						suffix = *buf;
					}
					else {
						number[tonumber] = 0;
						tonumber = 0;
					}
					break;
				}
			}
			if (chap == -1)
				book[tobook++] = *buf;
		}
		buf++;
	}
	number[tonumber] = 0;
	tonumber = 0;
	if (*number) {
		if (chap >= 0)
			verse = atoi(number);
		else	chap  = atoi(number);
	}
	*number = 0;
	book[tobook] = 0;
	tobook = 0;
	if (*book) {
		loop = (int)strlen(book) - 1;

		// strip trailing spaces
		for (; loop+1; loop--) { if (book[loop] == ' ') book[loop] = 0; else break; }

		// check if endsWith([0-9][a-z]) and kill the last letter, e.g., ...12a, and chop off the 'a'
		// why?  What's this for? wouldn't this mess up 2t?
		if (loop > 0 && isdigit(book[loop-1]) && book[loop] >= 'a' && book[loop] <= 'z') {
			book[loop--] = 0;
		}

		// skip trailing spaces and numbers
		for (; loop+1; loop--) {
			if ((isdigit(book[loop])) || (book[loop] == ' ')) {
				book[loop] = 0;
				continue;
			}
			else {
				if ((SW_toupper(book[loop])=='F')&&(loop)) {
					if ((isdigit(book[loop-1])) || (book[loop-1] == ' ') || (SW_toupper(book[loop-1]) == 'F')) {
						book[loop] = 0;
						continue;
					}
				}
			}
			break;
		}

		// check for roman numeral chapter
		for (loop = (int)strlen(book) - 1; loop+1; loop--) {
			if (book[loop] == ' ') {
				// "PS C" is ok, but "II C" is not ok
				if (isRoman(&book[loop+1]) && !isRoman(book,loop)) {
					if (verse == -1) {
						verse = chap;
						chap = fromRoman(&book[loop+1]);
						book[loop] = 0;
					}
				}
				break;
			}
		}
		// check for special inscriptio and subscriptio which are saved as book intro and chap 1 intro (for INTF)
		for (loop = (int)strlen(book) - 1; loop+1; loop--) {
			if (book[loop] == ' ') {
				if (!strnicmp(&book[loop+1], "inscriptio", (int)strlen(&book[loop+1]))) {
					book[loop] = 0;
					verse = 0;
					chap = 0;
					suffix = 0;
				}
				else if (!strnicmp(&book[loop+1], "subscriptio", (int)strlen(&book[loop+1]))) {
					book[loop] = 0;
					verse = 0;
					chap = 1;
					suffix = 0;
				}
				break;
			}
		}

		if ((!stricmp(book, "V")) || (!stricmp(book, "VER"))) {	// Verse abbrev.
			if (verse == -1) {
				verse = chap;
				chap = lastKey->getChapter();
				*book = 0;
			}
		}

		if ((!stricmp(book, "ch")) || (!stricmp(book, "chap"))) {	// Verse abbrev
			strcpy(book, lastKey->getBookName());
		}
		bookno = getBookFromAbbrev(book);
		if ((bookno > -1) && (suffix == 'f') && (book[strlen(book)-1] == 'f')) {
			suffix = 0;
		}
	}
	if (((bookno > -1) || (!*book)) && ((*book) || (chap >= 0) || (verse >= 0))) {
		char partial = 0;
		curKey->setVerse(1);
		curKey->setChapter(1);
		curKey->setBook(1);

		if (bookno < 0) {
			curKey->setTestament(lastKey->getTestament());
			curKey->setBook(lastKey->getBook());
		}
		else {
			int t = 1;
			if (bookno > BMAX[0]) {
				t++;
				bookno -= BMAX[0];
			}
			curKey->setTestament(t);
			curKey->setBook(bookno);
		}

		if (((comma)||((verse < 0)&&(bookno < 0)))&&(!lastPartial)) {
			curKey->setChapter(lastKey->getChapter());
			curKey->setVerse(chap);  // chap because this is the first number captured
			if (suffix) {
				curKey->setSuffix(suffix);
			}
		}
		else {
			if (useChapterAsVerse && verse < 0 && chap > 0 && curKey->getChapterMax() == 1) {
				verse = chap;
				chap = 1;
			}

			
			if (chap >= 0) {
				curKey->setChapter(chap);
			}
			else {
				partial++;
				curKey->setChapter(1);
			}
			if (verse >= 0) {
				curKey->setVerse(verse);
				if (suffix) {
					curKey->setSuffix(suffix);
				}
			}
			else {
				partial++;
				curKey->setVerse(1);
			}
		}

		if ((*buf == '-') && (expandRange)) {	// if this is a dash save lowerBound and wait for upper
			lastKey->setLowerBound(*curKey);
			*lastKey = TOP;
			tmpListKey << *lastKey;
			tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
		}
		else {
			if (!dash) { 	// if last separator was not a dash just add
				if (expandRange && partial) {
					lastKey->setLowerBound(*curKey);
					if (partial > 1)
						*curKey = MAXCHAPTER;
					if (partial > 0)
						*curKey = MAXVERSE;
					lastKey->setUpperBound(*curKey);
					*lastKey = TOP;
					tmpListKey << *lastKey;
					tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
				}
				else {
					bool f = false;
					if (curKey->getSuffix() == 'f') {
						curKey->setSuffix(0);
						f = true;
					}
					lastKey->setLowerBound(*curKey);
					if (f && doubleF) (*curKey) = MAXVERSE;
					else if (f) (*curKey)++;
					lastKey->setUpperBound(*curKey);
					*lastKey = TOP;
					tmpListKey << *lastKey;
					tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
				}
			}
			else if (expandRange) {
				VerseKey *newElement = SWDYNAMIC_CAST(VerseKey, tmpListKey.getElement());
				if (newElement) {
					if (partial > 1)
						*curKey = MAXCHAPTER;
					if (partial > 0)
						*curKey = MAXVERSE;
					newElement->setUpperBound(*curKey);
					*newElement = TOP;
					tmpListKey.getElement()->userData = (SW_u64)(bufStart + (buf - iBuf.c_str()));
				}
			}
		}
	}
	*book = 0;
	tmpListKey = TOP;
	internalListKey = tmpListKey;
	internalListKey = TOP;	// Align internalListKey to first element before passing back;

	delete curKey;
	delete lastKey;

	return internalListKey;
}


/******************************************************************************
 * VerseKey::setLowerBound	- sets / gets the lower boundary for this key
 */

void VerseKey::setLowerBound(const VerseKey &lb)
{
	initBounds();

	lowerBound = lb.getIndex();
	lowerBoundComponents.test   = lb.getTestament();
	lowerBoundComponents.book   = lb.getBook();
	lowerBoundComponents.chap   = lb.getChapter();
	lowerBoundComponents.verse  = lb.getVerse();
	lowerBoundComponents.suffix = lb.getSuffix();

	// both this following check and UpperBound check force upperBound to
	// change allowing LowerBound then UpperBound logic to always flow
	// and set values without restrictions, as expected
	if (upperBound < lowerBound) upperBound = lowerBound;
	boundSet = true;
}


/******************************************************************************
 * VerseKey::setUpperBound	- sets / gets the upper boundary for this key
 */

void VerseKey::setUpperBound(const VerseKey &ub)
{
	initBounds();

	upperBound = ub.getIndex();
	upperBoundComponents.test   = ub.getTestament();
	upperBoundComponents.book   = ub.getBook();
	upperBoundComponents.chap   = ub.getChapter();
	upperBoundComponents.verse  = ub.getVerse();
	upperBoundComponents.suffix = ub.getSuffix();

	// see setLowerBound comment, above
	if (upperBound < lowerBound) upperBound = lowerBound;
	boundSet = true;
}


/******************************************************************************
 * VerseKey::getLowerBound	- gets the lower boundary for this key
 */

VerseKey &VerseKey::getLowerBound() const
{
	initBounds();
	if (!isAutoNormalize()) {
		tmpClone->testament = lowerBoundComponents.test;
		tmpClone->book      = lowerBoundComponents.book;
		tmpClone->chapter   = lowerBoundComponents.chap;
		tmpClone->setVerse   (lowerBoundComponents.verse);
		tmpClone->setSuffix  (lowerBoundComponents.suffix);
	}
	else {
		tmpClone->setIndex(lowerBound);
		tmpClone->setSuffix  (lowerBoundComponents.suffix);
	}

	return (*tmpClone);
}


/******************************************************************************
 * VerseKey::getUpperBound	- sets / gets the upper boundary for this key
 */

VerseKey &VerseKey::getUpperBound() const
{
	initBounds();
	if (!isAutoNormalize()) {
		tmpClone->testament = upperBoundComponents.test;
		tmpClone->book      = upperBoundComponents.book;
		tmpClone->chapter   = upperBoundComponents.chap;
		tmpClone->setVerse   (upperBoundComponents.verse);
		tmpClone->setSuffix  (upperBoundComponents.suffix);
	}
	else {
		tmpClone->setIndex(upperBound);
		tmpClone->setSuffix  (upperBoundComponents.suffix);
	}

	return (*tmpClone);
}


/******************************************************************************
 * VerseKey::clearBounds	- clears bounds for this VerseKey
 */

void VerseKey::clearBounds() const {
	delete tmpClone;
	tmpClone = 0;
	boundSet = false;
}


void VerseKey::initBounds() const {
	if (!tmpClone) {
		tmpClone = (VerseKey *)this->clone();
		tmpClone->setAutoNormalize(false);
		tmpClone->setIntros(true);
		tmpClone->setTestament((BMAX[1])?2:1);
		tmpClone->setBook(BMAX[(BMAX[1])?1:0]);
		tmpClone->setChapter(tmpClone->getChapterMax());
		tmpClone->setVerse(tmpClone->getVerseMax());
		upperBound = tmpClone->getIndex();
		upperBoundComponents.test   = tmpClone->getTestament();
		upperBoundComponents.book   = tmpClone->getBook();
		upperBoundComponents.chap   = tmpClone->getChapter();
		upperBoundComponents.verse  = tmpClone->getVerse();
		upperBoundComponents.suffix = tmpClone->getSuffix();

		lowerBound = 0;
		lowerBoundComponents.test   = 0;
		lowerBoundComponents.book   = 0;
		lowerBoundComponents.chap   = 0;
		lowerBoundComponents.verse  = 0;
		lowerBoundComponents.suffix = 0;

	}
	else tmpClone->setLocale(getLocale());
}


/******************************************************************************
 * VerseKey::getText - refreshes keytext before returning if cast to
 *				a (char *) is requested
 */

const char *VerseKey::getText() const {
	freshtext();
	return keytext;
}


const char *VerseKey::getShortText() const {
	static char *stext = 0;
	char buf[2047];
	freshtext();
	if (book < 1) {
		if (testament < 1)
			sprintf(buf, "[ Module Heading ]");
		else sprintf(buf, "[ Testament %d Heading ]", (int)testament);
	}
	else {
		sprintf(buf, "%s %d:%d", getBookAbbrev(), chapter, verse);
	}
	stdstr(&stext, buf);
	return stext;
}


const char *VerseKey::getBookName() const {
	return getPrivateLocale()->translate(refSys->getBook(((testament>1)?BMAX[0]:0)+book-1)->getLongName());
}


const char *VerseKey::getOSISBookName() const {
	return refSys->getBook(((testament>1)?BMAX[0]:0)+book-1)->getOSISName();
}


const char *VerseKey::getBookAbbrev() const {
	return getPrivateLocale()->translate((SWBuf("prefAbbr_")+refSys->getBook(((testament>1)?BMAX[0]:0)+book-1)->getPreferredAbbreviation()).c_str());
}


/******************************************************************************
 * VerseKey::setPosition(SW_POSITION)	- Positions this key
 *
 * ENT:	p	- position
 *
 * RET:	*this
 */

void VerseKey::setPosition(SW_POSITION p) {
	switch (p) {
	case POS_TOP: {
		const VerseKey *lb = &getLowerBound();
		testament = (lb->getTestament() || intros) ? lb->getTestament() : 1;
		book      = (lb->getBook()      || intros) ? lb->getBook() : 1;
		chapter   = (lb->getChapter()   || intros) ? lb->getChapter() : 1;
		verse     = (lb->getVerse()     || intros) ? lb->getVerse() : 1;
		suffix    = lb->getSuffix();
		break;
	}
	case POS_BOTTOM: {
		const VerseKey *ub = &getUpperBound();
		testament = (ub->getTestament() || intros) ? ub->getTestament() : 1;
		book      = (ub->getBook()      || intros) ? ub->getBook() : 1;
		chapter   = (ub->getChapter()   || intros) ? ub->getChapter() : 1;
		verse     = (ub->getVerse()     || intros) ? ub->getVerse() : 1;
		suffix    = ub->getSuffix();
		break;
	}
	case POS_MAXVERSE:
		suffix    = 0;
		verse     = 1;
		normalize();
		verse     = getVerseMax();
		suffix    = 0;
		break;
	case POS_MAXCHAPTER:
		suffix    = 0;
		verse     = 1;
		chapter   = 1;
		normalize();
		chapter   = getChapterMax();
		break;
	}
	normalize(true);
	popError();	// clear error from normalize
}

int VerseKey::getChapterMax() const {
	if (book < 1) return 0;
	const VersificationMgr::Book *b = refSys->getBook(((testament>1)?BMAX[0]:0)+book-1);
	return (b) ? b->getChapterMax() : -1;
}

int VerseKey::getVerseMax() const {
	if (book < 1) return 0;
	const VersificationMgr::Book *b = refSys->getBook(((testament>1)?BMAX[0]:0)+book-1);
	return (b) ? b->getVerseMax(chapter) : -1;
}


/******************************************************************************
 * VerseKey::increment	- Increments key a number of verses
 *
 * ENT:	step	- Number of verses to jump forward
 *
 * RET: *this
 */

void VerseKey::increment(int step) {
	// if we're not autonormalizing and we're already not normalized
	if (!autonorm && chapter > 0 && verse > getVerseMax()) {
		verse += step;
		checkBounds();
		return;
	}
	char ierror = 0;
	setIndex(getIndex() + step);
	while ((!verse) && (!intros) && (!ierror)) {
		setIndex(getIndex() + 1);
		ierror = popError();
	}

	error = (ierror) ? ierror : error;
}


/******************************************************************************
 * VerseKey::decrement	- Decrements key a number of verses
 *
 * ENT:	step	- Number of verses to jump backward
 *
 * RET: *this
 */

void VerseKey::decrement(int step) {
	// if we're not autonormalizing and we're already not normalized
	if (!autonorm && chapter > 0 && verse > getVerseMax()) {
		verse -= step;
		checkBounds();
		return;
	}
	char ierror = 0;
	setIndex(getIndex() - step);
	while ((!verse) && (!intros) && (!ierror)) {
		setIndex(getIndex() - 1);
		ierror = popError();
	}
	if ((ierror) && (!intros))
		(*this)++;

	error = (ierror) ? ierror : error;
}


/******************************************************************************
 * VerseKey::normalize	- checks limits and normalizes if necessary (e.g.
 *				Matthew 29:47 = Mark 2:2).  If last verse is
 *				exceeded, key is set to last Book CH:VS
 * RET: *this
 */

void VerseKey::normalize(bool autocheck)
{

	if ((!autocheck || autonorm)	// only normalize if we were explicitely called or if autonorm is turned on
	) {
		error = 0;

		while ((testament < 3) && (testament > 0)) {


			if (book > BMAX[testament-1]) {
				book -= (BMAX[testament-1] + (intros?1:0));
				testament++;
				continue;
			}
			if (book < (intros?0:1)) {
				if (--testament > 0) {
					book += (BMAX[testament-1] + (intros?1:0));
				}
				continue;
			}


			if (chapter > getChapterMax()) {
				chapter -= (getChapterMax() + (intros?1:0));
				book++;
				continue;
			}
			if (chapter < (intros?0:1)) {
				--book;
				if (book < (intros?0:1)) {
					if (--testament > 0) {
						book += (BMAX[testament-1] + (intros?1:0));
					}
				}
				chapter += (getChapterMax() + (intros?1:0));
				continue;
			}


			if (chapter > 0 && verse > getVerseMax()) {
				verse -= (getVerseMax() + (intros?1:0));
				chapter++;
				continue;
			}
			if (verse < (intros?0:1)) {
				if (--chapter < (intros?0:1)) {
					--book;
					if (book < (intros?0:1)) {
						if (--testament > 0) {
							book += (BMAX[testament-1] + (intros?1:0));
						}
					}
					chapter += (getChapterMax() + (intros?1:0));
				}
				verse += (getVerseMax() + (intros?1:0));
				continue;
			}

			break;  // If we've made it this far (all failure checks continue) we're ok
		}

		if (testament > (BMAX[1]?2:1)) {
			testament = BMAX[1]?2:1;
			book      = BMAX[testament-1];
			chapter   = getChapterMax();
			verse     = getVerseMax();
			error     = KEYERR_OUTOFBOUNDS;
		}

		if (testament < 1) {
			error     = ((!intros) || (testament < 0) || (book < 0)) ? KEYERR_OUTOFBOUNDS : 0;
			testament = ((intros) ? 0 : 1);
			book      = ((intros) ? 0 : 1);
			chapter   = ((intros) ? 0 : 1);
			verse     = ((intros) ? 0 : 1);
		}

			// should we always perform bounds checks?  Tried but seems to cause infinite recursion
		if (_compare(getUpperBound()) > 0) {
			positionFrom(getUpperBound());
			error = KEYERR_OUTOFBOUNDS;
		}
		if (_compare(getLowerBound()) < 0) {
			positionFrom(getLowerBound());
			error = KEYERR_OUTOFBOUNDS;
		}
	}
}


/******************************************************************************
 * VerseKey::getTestament - Gets testament
 *
 * RET:	value of testament
 */

char VerseKey::getTestament() const
{
	return testament;
}


/******************************************************************************
 * VerseKey::getBook - Gets book
 *
 * RET:	value of book
 */

char VerseKey::getBook() const
{
	return book;
}


/******************************************************************************
 * VerseKey::getChapter - Gets chapter
 *
 * RET:	value of chapter
 */

int VerseKey::getChapter() const
{
	return chapter;
}


/******************************************************************************
 * VerseKey::getVerse - Gets verse
 *
 * RET:	value of verse
 */

int VerseKey::getVerse() const
{
	return verse;
}


/******************************************************************************
 * VerseKey::setTestament - Sets/gets testament
 *
 * ENT:	itestament - value which to set testament
 *		[MAXPOS(char)] - only get
 *
 */

void VerseKey::setTestament(char itestament)
{
	suffix  = 0;
	verse   = (intros) ? 0 : 1;
	chapter = (intros) ? 0 : 1;
	book    = (intros) ? 0 : 1;
	testament = itestament;
	normalize(true);
}


/******************************************************************************
 * VerseKey::setBook - Sets/gets book
 *
 * ENT:	ibook - value which to set book
 */

void VerseKey::setBook(char ibook)
{
	suffix  = 0;
	verse   = (intros) ? 0 : 1;
	chapter = (intros) ? 0 : 1;
	book    = ibook;
	normalize(true);
}



/******************************************************************************
 * VerseKey::setBookName - Sets/gets book by name
 *
 * ENT:	bname - book name/abbrev
 */

void VerseKey::setBookName(const char *bname)
{
	int bnum = getBookFromAbbrev(bname);
	if (bnum > -1) {
		if (bnum > BMAX[0]) {
			bnum -= BMAX[0];
			testament = 2;
		}
		else	testament = 1;
		setBook(bnum);
	}
	else error = KEYERR_OUTOFBOUNDS;
}
	

/******************************************************************************
 * VerseKey::setChapter - Sets/gets chapter
 *
 * ENT:	ichapter - value which to set chapter
 */

void VerseKey::setChapter(int ichapter)
{
	suffix  = 0;
	verse   = (intros) ? 0 : 1;
	chapter = ichapter;
	normalize(true);
}


/******************************************************************************
 * VerseKey::setVerse - Sets/gets verse
 *
 * ENT:	iverse - value which to set verse
 *		[MAXPOS(int)] - only get
 *
 * RET:	if unchanged ->          value of verse
 *	if   changed -> previous value of verse
 */

void VerseKey::setVerse(int iverse)
{
	suffix  = 0;
	verse   = iverse;
	normalize(true);
}


char VerseKey::getSuffix() const {
	return suffix;
}

void VerseKey::setSuffix(char suf) {
	suffix = suf;
}

/******************************************************************************
 * VerseKey::isAutoNormalize - gets flag that tells VerseKey to auto-
 *				matically normalize itself when modified
 */

bool VerseKey::isAutoNormalize() const
{
	return autonorm;
}

void VerseKey::setAutoNormalize(bool iautonorm)
{
	autonorm = iautonorm?1:0;
	normalize(true);
}


/******************************************************************************
 * VerseKey::setIntros - Sets flag that tells VerseKey to include
 *					chap/book/testmnt/module introductions
 *
 * ENT:	val - value which to set intros
 *
 */

void VerseKey::setIntros(bool val)
{
	intros = val;
	normalize(true);
}

bool VerseKey::isIntros() const
{
	return intros;
}


/******************************************************************************
 * VerseKey::getIndex - Gets index based upon current verse
 *
 * RET:	offset
 */

long VerseKey::getIndex() const
{
	long  offset;

	if (!testament) { // if we want module heading
		offset = 0;
	}
	else if (!book) {	// we want testament heading
		offset = ((testament == 2) ? refSys->getNTStartOffset():0) + 1;
	}
	else {
		offset = refSys->getOffsetFromVerse((((testament>1)?BMAX[0]:0)+book-1), chapter, verse);
	}
	return offset;
}


/******************************************************************************
 * VerseKey::getTestamentIndex - Gets index based upon current verse
 *
 * RET:	offset
 */

long VerseKey::getTestamentIndex() const
{
	long offset = getIndex();
	return (testament > 1) ? offset - refSys->getNTStartOffset() : offset;
}


/******************************************************************************
 * VerseKey::setIndex - Sets index based upon current verse
 *
 * ENT:	iindex - value to set index to
 *
 */

void VerseKey::setIndex(long iindex)
{
	// assert we're sane
	if (iindex < 0) {
		error = KEYERR_OUTOFBOUNDS;
		return;
	}

	int b;
	error = refSys->getVerseFromOffset(iindex, &b, &chapter, &verse);
	book = (unsigned char)b;
	testament = 1;
	if (book > BMAX[0]) {
		book -= BMAX[0];
		testament = 2;
	}
	// special case for Module and Testament heading
	if (book < 0) { testament = 0; book = 0; }
	if (chapter < 0) { book = 0; chapter = 0; }

	checkBounds();
}

void VerseKey::checkBounds() {

	long i = getIndex();

	initBounds();
	if (i > upperBound) {
		setIndex(upperBound);
		i = getIndex();
		error = KEYERR_OUTOFBOUNDS;
	}
	if (i < lowerBound) {
		setIndex(lowerBound);
		error = KEYERR_OUTOFBOUNDS;
	}
}


/******************************************************************************
 * VerseKey::compare	- Compares another SWKey object
 *
 * ENT:	ikey - key to compare with this one
 *
 * RET:	>0 if this versekey is greater than compare versekey
 *	<0 <
 *	 0 =
 */

int VerseKey::compare(const SWKey &ikey)
{
	const SWKey *testKey = &ikey;
	const VerseKey *vkey = (const VerseKey *)SWDYNAMIC_CAST(const VerseKey, testKey);
	if (vkey) {
		return _compare(*vkey);
	}
	const VerseKey ivkey = (const char *)ikey;
	return _compare(ivkey);
}


/******************************************************************************
 * VerseKey::_compare	- Compares another VerseKey object
 *
 * ENT:	ikey - key to compare with this one
 *
 * RET:	>0 if this versekey is greater than compare versekey
 *	<0 <
 *	 0 =
 */

int VerseKey::_compare(const VerseKey &ivkey)
{
	unsigned long keyval1 = 0;
	unsigned long keyval2 = 0;

	keyval1 += getTestament()       * 1000000000;
	keyval2 += ivkey.getTestament() * 1000000000;
	keyval1 += getBook()            * 10000000;
	keyval2 += ivkey.getBook()      * 10000000;
	keyval1 += getChapter()         * 10000;
	keyval2 += ivkey.getChapter()   * 10000;
	keyval1 += getVerse()           * 50;
	keyval2 += ivkey.getVerse()     * 50;
	keyval1 += (int)getSuffix();
	keyval2 += (int)ivkey.getSuffix();
	keyval1 = (keyval1 != keyval2) ? ((keyval1 > keyval2) ? 1 : -1) : 0; // -1 | 0 | 1
	return (int)keyval1;
}


const char *VerseKey::getOSISRef() const {
	static char buf[5][254];
	static int loop = 0;

	if (loop > 4)
		loop = 0;

	if (getVerse())
		sprintf(buf[loop], "%s.%d.%d", getOSISBookName(), getChapter(), getVerse());
	else if (getChapter())
		sprintf(buf[loop], "%s.%d", getOSISBookName(), getChapter());
	else if (getBook())
		sprintf(buf[loop], "%s", getOSISBookName());
	else	buf[loop][0] = 0;
	return buf[loop++];
}


/******************************************************************************
 * VerseKey::getRangeText - returns parsable range text for this key
 */

const char *VerseKey::getRangeText() const {
	if (isBoundSet() && lowerBound != upperBound) {
		SWBuf buf = (const char *)getLowerBound();
		buf += "-";
		buf += (const char *)getUpperBound();
		stdstr(&rangeText, buf.c_str());
	}
	else stdstr(&rangeText, getText());
	return rangeText;
}


/******************************************************************************
 * VerseKey::getShortRangeText - returns short parsable range text for this key
 */

const char *VerseKey::getShortRangeText() const {
	if (isBoundSet() && (lowerBound != upperBound)) {
		SWBuf buf = getLowerBound().getShortText();
		buf += "-";
		if ( getUpperBound().getTestament() == getLowerBound().getTestament()
		  && getUpperBound().getBook() == getLowerBound().getBook()
		  && getUpperBound().getChapter() == getLowerBound().getChapter()) {
			buf.appendFormatted("%d", getUpperBound().getVerse());
		}
		else if ( getUpperBound().getTestament() == getLowerBound().getTestament()
		       && getUpperBound().getBook() == getLowerBound().getBook()) {
			buf.appendFormatted("%d:%d", getUpperBound().getChapter(), getUpperBound().getVerse());
		}
		else buf += getUpperBound().getShortText();
		stdstr(&rangeText, buf.c_str());
	}
	else stdstr(&rangeText, getShortText());
	return rangeText;
}


/******************************************************************************
 * VerseKey::getOSISRefRangeText - returns parsable range text for this key
 */

const char *VerseKey::getOSISRefRangeText() const {
	if (isBoundSet() && (lowerBound != upperBound)) {
		SWBuf buf = getLowerBound().getOSISRef();
		buf += "-";
		buf += getUpperBound().getOSISRef();
		stdstr(&rangeText, buf.c_str());
	}
	else stdstr(&rangeText, getOSISRef());
	return rangeText;
}


// TODO:  this is static so we have no context.  We can only parse KJV v11n now
// 		possibly add a const char *versification = KJV param?
const char *VerseKey::convertToOSIS(const char *inRef, const SWKey *lastKnownKey) {
	static SWBuf outRef;

	outRef = "";

	VerseKey defLanguage;
	ListKey verses = defLanguage.parseVerseList(inRef, (*lastKnownKey), true);
	const char *startFrag = inRef;
	for (int i = 0; i < verses.getCount(); i++) {
		SWKey *element = verses.getElement(i);
//		VerseKey *element = SWDYNAMIC_CAST(VerseKey, verses.GetElement(i));
		SWBuf buf;
		// TODO: This code really needs to not use fixed size arrays
		char frag[800];
		char preJunk[800];
		char postJunk[800];
		memset(frag, 0, 800);
		memset(preJunk, 0, 800);
		memset(postJunk, 0, 800);
		while ((*startFrag) && (strchr(" {}:;,()[].", *startFrag))) {
			outRef += *startFrag;
			startFrag++;
		}
		memmove(frag, startFrag, (size_t)((const char *)element->userData - startFrag) + 1);
		frag[((const char *)element->userData - startFrag) + 1] = 0;
		int j;
		for (j = strlen(frag)-1; j && (strchr(" {}:;,()[].", frag[j])); j--);
		if (frag[j+1])
			strcpy(postJunk, frag+j+1);
		frag[j+1]=0;
		startFrag += ((const char *)element->userData - startFrag) + 1;
		buf = "<reference osisRef=\"";
		buf += element->getOSISRefRangeText();
		buf += "\">";
		buf += frag;
		buf += "</reference>";
		buf += postJunk;

		outRef += buf;

	}
	if (startFrag < (inRef + strlen(inRef)))
		outRef += startFrag;
	return outRef.c_str();
}
SWORD_NAMESPACE_END
