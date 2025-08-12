/******************************************************************************
 *
 *  osis2mod.cpp - Utility to import a module in OSIS format
 *
 * $Id: osis2mod.cpp 3769 2020-07-26 17:27:10Z scribe $
 *
 * Copyright 2003-2014 CrossWire Bible Society (http://www.crosswire.org)
 *      CrossWire Bible Society
 *      P. O. Box 2528
 *      Tempe, AZ  85280-2528
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

#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
#endif

#include <ctype.h>
#include <stdio.h>
#include <fcntl.h>
#include <errno.h>
#include <stdlib.h>
#include <stack>
#include <vector>
#include <iostream>
#include <fstream>

#include <utilstr.h>
#include <swmgr.h>
#include <rawtext.h>
#include <rawtext4.h>
#include <swbuf.h>
#include <utilxml.h>
#include <listkey.h>
#include <versekey.h>
#include <swversion.h>

#include <ztext.h>
#include <ztext4.h>
#include <lzsscomprs.h>
#ifndef EXCLUDEZLIB
#include <zipcomprs.h>
#endif
#ifndef EXCLUDEBZIP2
#include <bz2comprs.h>
#endif
#ifndef EXCLUDEXZ
#include <xzcomprs.h>
#endif
#include <cipherfil.h>

#ifdef _ICU_
#include <utf8nfc.h>
#include <latin1utf8.h>
#include <utf8scsu.h>
#include <scsuutf8.h>
#endif
#include <utf8utf16.h>
#include <utf16utf8.h>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

// SM =============>>>
// Custom Versification
#include <versificationmgr.h>
extern "C"
{
	int load_custom_versification(const char* filename);
	extern char *custom_versification_name;
	extern struct sbook *otbooks_custom;
	extern struct sbook *ntbooks_custom;
	extern int *vm_custom;
	extern unsigned char *mappings_custom;
}
// SM <<<=============
using namespace std;

int       debug            =   0; // mask of debug flags
const int DEBUG_WRITE      =   1; // writing to module
const int DEBUG_VERSE      =   2; // verse start and end
const int DEBUG_QUOTE      =   4; // quotes, especially Words of Christ (WOC)
const int DEBUG_TITLE      =   8; // titles
const int DEBUG_INTERVERSE =  16; // inter-verse maerial
const int DEBUG_XFORM      =  32; // transformations
const int DEBUG_REV11N     =  64; // versification
const int DEBUG_REF        = 128; // parsing of osisID and osisRef
const int DEBUG_STACK      = 256; // cleanup of references
const int DEBUG_OTHER      = 512; // ins and outs of books, chapters and verses

// Exit codes
const int EXIT_BAD_ARG     =   1; // Bad parameter given for program
const int EXIT_NO_WRITE    =   2; // Could not open the module for writing
const int EXIT_NO_CREATE   =   3; // Could not create the module
const int EXIT_NO_READ     =   4; // Could not open the input file for reading.
const int EXIT_BAD_NESTING =   5; // BSP or BCV nesting is bad

#ifdef _ICU_
UTF8NFC    normalizer;
Latin1UTF8 converter;
#endif
SWFilter*  outputEncoder = NULL;
SWFilter*  outputDecoder = NULL;

int normalized = 0;
int converted  = 0;

SWText *module = 0;
VerseKey currentVerse;
SWBuf v11n     = "KJV";
char activeOsisID[255];
char currentOsisID[255];

SWBuf activeVerseText;

ListKey currentKeyIDs = ListKey();

std::vector<ListKey> linkedVerses;

static bool inCanonicalOSISBook = true; // osisID is for a book that is not in Sword's canon
static bool normalize           = true; // Whether to normalize UTF-8 to NFC

bool isOSISAbbrev(const char *buf) {
	VersificationMgr *vmgr = VersificationMgr::getSystemVersificationMgr();
	const VersificationMgr::System *av11n = vmgr->getVersificationSystem(currentVerse.getVersificationSystem());
	return av11n->getBookNumberByOSISName(buf) >= 0;
}

/**
 * Determine whether the string contains a valid unicode sequence.
 * The following table give the pattern of a valid UTF-8 character.
 * Unicode Range               1st       2nd       3rd       4th
 * U-00000000 - U-0000007F  0nnnnnnn
 * U-00000080 - U-000007FF  110nnnnn  10nnnnnn
 * U-00000800 - U-0000FFFF  1110nnnn  10nnnnnn  10nnnnnn
 * U-00010000 - U-0010FFFF  11110nnn  10nnnnnn  10nnnnnn  10nnnnnn
 *
 * Note:
 *   1.  The latest UTF-8 RFC allows for a max of 4 bytes.
 *       Earlier allowed 6.
 *   2.  The number of bits of the leading byte before the first 0
 *       is the total number of bytes.
 *   3.  The "n" are the bits of the unicode codepoint.
 * This routine does not check to see if the code point is in the range.
 * It could.
 *
 * param  txt the text to check
 * return   1 if all high order characters form a valid unicode sequence
 *         -1 if there are no high order characters.
 *            Note: this is also a valid unicode sequence
 *          0 if there are high order characters that do not form
 *            a valid unicode sequence
 * author DM Smith
 */
int detectUTF8(const char *txt) {
	unsigned int  countUTF8 = 0;
	int           count     = 0;
	
	// Cast it to make masking and shifting easier
	const unsigned char *p = (const unsigned char*) txt;
	while (*p) {
		// Is the high order bit set?
		if (*p & 0x80) {
			// Then count the number of high order bits that are set.
			// This determines the number of following bytes
			// that are a part of the unicode character
			unsigned char i = *p;
			for (count = 0; i & 0x80; count++) {
				i <<= 1;
			}

			// Validate count:
			// Count 0: bug in code that would cause core walking
			// Count 1: is a pattern of 10nnnnnn,
			//          which does not signal the start of a unicode character
			// Count 5 to 8: 111110nn, 1111110n and 11111110 and 11111111
			//          are not legal starts, either
			if (count < 2 || count > 4) return 0;

			// At this point we expect (count - 1) following characters
			// of the pattern 10nnnnnn
			while (--count && *++p) {
				// The pattern of each following character must be: 10nnnnnn
				// So, compare the top 2 bits.
				if ((0xc0 & *p) != 0x80) return  0;
			}

			// Oops, we've run out of bytes too soon: Cannot be UTF-8
			if (count) return 0;

			// We have a valid UTF-8 character, so count it
			countUTF8++;
		}

		// Advance to the next character to examine.
		p++;
	}
	
	// At this point it is either UTF-8 or 7-bit ascii
	return countUTF8 ? 1 : -1;
}

void prepareSWText(const char *osisID, SWBuf &text)
{
	// Always check on UTF8 and report on non-UTF8 entries
	int utf8State = detectUTF8(text.c_str());

	// Trust, but verify.
	if (!normalize && !utf8State) {
		cout << "WARNING(UTF8): " << osisID << ": Should be converted to UTF-8 (" << text << ")" << endl;
	}

#ifdef _ICU_
	if (normalize) {
		// Don't need to normalize text that is ASCII
		// But assume other non-UTF-8 text is Latin1 (cp1252) and convert it to UTF-8
		if (!utf8State) {
			cout << "INFO(UTF8): " << osisID << ": Converting to UTF-8 (" << text << ")" << endl;
			converter.processText(text, (SWKey *)2);  // note the hack of 2 to mimic a real key. TODO: remove all hacks
			converted++;

			// Prepare for double check. This probably can be removed.
			// But for now we are running the check again.
			// This is to determine whether we need to normalize output of the conversion.
			utf8State = detectUTF8(text.c_str());
		}

		// Double check. This probably can be removed.
		if (!utf8State) {
			cout << "ERROR(UTF8): " << osisID << ": Converting to UTF-8 (" << text << ")" << endl;
		}

		if (utf8State > 0) {
			SWBuf before = text;
			normalizer.processText(text, (SWKey *)2);  // note the hack of 2 to mimic a real key. TODO: remove all hacks
			if (before != text) {
				normalized++;
			}
		}
	}
#endif
}

// This routine converts an osisID or osisRef into one that SWORD can parse into a verse list
// An osisRef is made up of:
// a single osisID
// an osisID-osisID
// or
// an osisRef osisRef
//
// An osisID can have a work prefix which is terminated by a : and may have a grain
// which is started by a !
//
// However, SWORD cannot handle work prefixes or grains and expects ranges to be
// separated with a single;
void prepareSWVerseKey(SWBuf &buf) {
	// This routine modifies the buf in place
	char* s = buf.getRawData();
	char* p = s;
	bool inRange = false;
	while (*p) {
		if (inRange) {
			if (debug & DEBUG_REF) {
				cout << "DEBUG(REF): Copy range marker:" << *p << endl;;
			}

			// Range markers are copied as is
			*s++ = *p++;
		}

		// Look ahead to see if we are in a work prefix
		// but don't look past an osisID
		char *n = p;
		while (*n && *n != ':' && *n != ' ' && *n != '-') {
			n++;
		}

		// We have found a work prefix
		if (*n == ':') {
			// set p to skip the work prefix
			p = n + 1;

			if (debug & DEBUG_REF) {
				cout << "DEBUG(REF): Found a work prefix ";
				for (char *x = s; x <= n; x++) {
					cout << *x;
				}
				cout << endl;
			}
		}

		// Now we are in the meat of an osisID.
		// Copy it to its end but stop on a grain marker of '!'
		if (debug & DEBUG_REF) {
			cout << "DEBUG(REF): Copy osisID:";
		}

		while (*p && *p != '!' && *p != ' ' && *p != '-') {
			if (debug & DEBUG_REF) {
				cout << *p;
			}

			*s++ = *p++;
		}

		if (debug & DEBUG_REF) {
			cout << endl;
		}

		// The ! and everything following until we hit
		// the end of the osisID is part of the grain reference
		if (*p == '!') {
			n = p;
			while (*n && *n != ' ' && *n != '-') {
				n++;
			}

			if (debug & DEBUG_REF) {
				cout << "DEBUG(REF): Found a grain suffix ";
				for (char *x = p; x < n; x++) {
					cout << *x;
				}
				cout << endl;
			}

			p = n;
		}

		// At this point we have processed an osisID

		// if we are not in a range and the next characer is a -
		// then we are entering a range
		inRange = !inRange && *p == '-';

		if (debug & DEBUG_REF) {
			if (inRange) {
				cout << "DEBUG(REF): Found a range" << endl;
			}
		}

		// between ranges and stand alone osisIDs we might have whitespace
		if (!inRange && *p == ' ') {
			// skip this and subsequent spaces
			while (*p == ' ') {
				p++;
			}

			// replacing them all with a ';'
			*s++ = ';';

			if (debug & DEBUG_REF) {
				cout << "DEBUG(REF): replacing space with ;. Remaining: " << p << endl;
			}
		}
	}

	// Determine whether we have modified the buffer
	// We have modified the buffer if s is not sitting on the null byte of the original
	if (*s) {
		// null terminate the reference
		*s = '\0';
		// Since we modified the swbuf, we need to tell it what we have done
		buf.setSize(s - buf.c_str());

		if (debug & DEBUG_REF) {
			cout << "DEBUG(REF): shortended keyVal to`" << buf.c_str() << "`"<< endl;
		}
	}
}

/**
 * Determine whether a verse as given is valid for the versification.
 * This is done by comparing the before and after of normalization.
 */
bool isValidRef(const char *buf, const char *caller) {
	// Create a VerseKey that does not do auto normalization
	// Note: need to turn on headings so that a heading does not get normalized anyway
	// And set it to the reference under question
	VerseKey before;
	before.setVersificationSystem(currentVerse.getVersificationSystem());
	before.setAutoNormalize(false);
	before.setIntros(true);
	before.setText(buf);

	// If we are a heading we must bail
	// These will autonormalize to the last verse of the prior chapter
	if (!before.getTestament() || !before.getBook() || !before.getChapter() || !before.getVerse()) {
		return true;
	}

	// Create a VerseKey that does do auto normalization
	// And set it to the reference under question
	VerseKey after;
	after.setVersificationSystem(currentVerse.getVersificationSystem());
	after.setAutoNormalize(true);
	after.setText(buf);

	if (before == after)
	{
		return true;
	}

	// If we have gotten here the reference is not in the selected versification.
	// cout << "INFO(V11N): " << before << " is not in the " << currentVerse.getVersificationSystem() << " versification." << endl;
	if (debug & DEBUG_REV11N) {
		cout << "DEBUG(V11N)[" << caller << "]: " << before << " normalizes to "  << after << endl;
	}

	return false;
}

/**
 * This routine is used to ensure that all the text in the input is saved to the module.
 * Assumption: The input orders all the verses for a chapter in numerical order. Thus, any
 * verses that are not in the chosen versification (v11n) follow those that are.
 *
 * The prior implementation of this adjusted the verse to the last one that is in the chosen v11n.
 * If it the chapter were extra, then it is appended to the last verse of the last
 * chapter in the chosen v11n for that book. If it is just extra verses for a chapter, then it is
 * appended to the last verse of the chapter.
 *
 * The problem with this is when a OSIS verse refers to more than one verse, e.g.
 * osisID="Gen.1.29 Gen.1.30 Gen.1.31" (Gen.1.31 is the last verse of the chapter in the chosen v11n)
 * and then it is followed by Gen.1.32.
 *
 * This routine assumes that linking is postponed to the end so that in the example Gen.1.30-31
 * are not linked but rather empty. This routine will then find the last verse in the computed
 * chapter that has content.
 *
 * Alternative, we could have done linking as we went, but this routine would have needed
 * to find the first entry in the link set and elsewhere in the code when appending to a
 * verse, it would need to be checked for adjacent links and those would have needed to be adjusted.
 *
 * param key the key that may need to be adjusted
 */
void makeValidRef(VerseKey &key) {
	VerseKey saveKey;
	saveKey.setVersificationSystem(key.getVersificationSystem());
	saveKey.setAutoNormalize(false);
	saveKey.setIntros(true);
	saveKey = key;

	// Since isValidRef returned false constrain the key to the nearest prior reference.
	// If we are past the last chapter set the reference to the last chapter
	int chapterMax = key.getChapterMax();
	if (key.getChapter() > chapterMax) {
		key.setChapter(chapterMax);
	}

	// Either we set the chapter to the last chapter and now need to set to the last verse in the chapter
	// Or the verse is beyond the end of the chapter.
	// In any case we need to constrain the verse to it's chapter.
	int verseMax   = key.getVerseMax();
	key.setVerse(verseMax);

	if (debug & DEBUG_REV11N) {
		cout << "DEBUG(V11N) Chapter max:" << chapterMax << ", Verse Max:" << verseMax << endl;
	}

	// There are three cases we want to handle:
	// In the examples we are using the KJV versification where the last verse of Matt.7 is Matt.7.29.
	// In each of these cases the out-of-versification, extra verse is Matt.7.30.
	// 1) The "extra" verse follows the last verse in the chapter.
	//      <verse osisID="Matt.7.29">...</verse><verse osisID="Matt.7.30">...</verse>
	//    In this case re-versify Matt.7.30 as Matt.7.29.
	//
	// 2) The "extra" verse follows a range (a set of linked verses).
	//      <verse osisID="Matt.7.28-Matt.7.29">...</verse><verse osisID="Matt.7.30">...</verse>
	//    In this case, re-versify Matt.7.30 as Matt.7.28, the first verse in the linked set.
	//    Since we are post-poning linking, we want to re-reversify to the last entry in the module.
	//
	// 3) The last verse in the chapter is not in the input. There may be other verses missing as well.
	//      <verse osisID="Matt.7.8">...</verse><verse osisID="Matt.7.30">...</verse>
	//    In this case we should re-versify Matt.7.30 as Matt.7.29.
	//    However, since this and 2) are ambiguous, we'll re-reversify to the last entry in the module.
	
	while (!key.popError() && !module->hasEntry(&key)) {
		key.decrement(1);
	}

	cout << "INFO(V11N): " << saveKey.getOSISRef()
	     << " is not in the " << key.getVersificationSystem()
	     << " versification. Appending content to " << key.getOSISRef() << endl;
}

void writeEntry(SWBuf &text, bool force = false) {
	char keyOsisID[255];

	static SWBuf revision; revision.setFormatted("<milestone type=\"x-importer\" subType=\"x-osis2mod\" n=\"$Rev: 3769 $ (SWORD: %s)\"/>", SWVersion::currentVersion.getText());
	static bool firstOT = true;
	static bool firstNT = true;

	if (!inCanonicalOSISBook) {
		return;
	}

	strcpy(keyOsisID, currentVerse.getOSISRef());

	// set keyOsisID to anything that an osisID cannot be.
	if (force) {
		strcpy(keyOsisID, "-force");
	}

	static VerseKey lastKey;
	lastKey.setVersificationSystem(currentVerse.getVersificationSystem());
	lastKey.setAutoNormalize(0);
	lastKey.setIntros(1);

	VerseKey saveKey;
	saveKey.setVersificationSystem(currentVerse.getVersificationSystem());
	saveKey.setAutoNormalize(0);
	saveKey.setIntros(1);
	saveKey = currentVerse;

	// If we have seen a verse and the supplied one is different then we output the collected one.
	if (*activeOsisID && strcmp(activeOsisID, keyOsisID)) {

		if (!isValidRef(lastKey, "writeEntry")) {
			makeValidRef(lastKey);
		}

		currentVerse = lastKey;

		prepareSWText(activeOsisID, activeVerseText);

		// Put the revision into the module
		int testmt = currentVerse.getTestament();
		if ((testmt == 1 && firstOT) || (testmt == 2 && firstNT)) {
			VerseKey t;
			t.setVersificationSystem(currentVerse.getVersificationSystem());
			t.setAutoNormalize(0);
			t.setIntros(1);
			t = currentVerse;
			currentVerse.setBook(0);
			currentVerse.setChapter(0);
			currentVerse.setVerse(0);
			module->setEntry(revision);
			currentVerse = t;
			switch (testmt) {
			case 1:
				firstOT = false;
				break;
			case 2:
				firstNT = false;
				break;
			}
		}

		// If the desired output encoding is non-UTF-8, convert to that encoding
		if (outputEncoder) {
			outputEncoder->processText(activeVerseText, (SWKey *)2);  // note the hack of 2 to mimic a real key. TODO: remove all hacks
		}

		// If the entry already exists, then append this entry to the text.
		// This is for verses that are outside the chosen versification. They are appended to the prior verse.
		// The space should not be needed if we retained verse tags.
		if (module->hasEntry(&currentVerse)) {
			module->flush();
			SWBuf currentText = module->getRawEntry();
			cout << "INFO(WRITE): Appending entry: " << currentVerse.getOSISRef() << ": " << activeVerseText << endl;

			// If we have a non-UTF-8 encoding, we should decode it before concatenating, then re-encode it
			if (outputDecoder) {
				outputDecoder->processText(activeVerseText, (SWKey *)2);
				outputDecoder->processText(currentText, (SWKey *)2);
			}
			activeVerseText = currentText + " " + activeVerseText;
			if (outputEncoder) {
				outputEncoder->processText(activeVerseText, (SWKey *)2);
			}
		}

		if (debug & DEBUG_WRITE) {
			cout << "DEBUG(WRITE): " << activeOsisID << ":" << currentVerse.getOSISRef() << ": " << activeVerseText << endl;
		}

		module->setEntry(activeVerseText);
		activeVerseText = "";
	}

	// The following is for initial verse content and for appending interverse content.
	if (activeVerseText.length()) {
		activeVerseText += text;
	}
	else {
		// Eliminate leading whitespace on the beginning of each verse
		text.trimStart();
		activeVerseText = text;
	}
	// text has been consumed so clear it out.
	text = "";

	currentVerse = saveKey;
	lastKey = currentVerse;
	strcpy(activeOsisID, keyOsisID);
}

void linkToEntry(VerseKey &linkKey, VerseKey &dest) {

	// Only link verses that are in the versification.
	if (!isValidRef(linkKey, "linkToEntry")) {
		return;
	}

	VerseKey saveKey;
	saveKey.setVersificationSystem(currentVerse.getVersificationSystem());
	saveKey.setAutoNormalize(0);
	saveKey.setIntros(1);
	saveKey = currentVerse;
	currentVerse = linkKey;

	cout << "INFO(LINK): Linking " << currentVerse.getOSISRef() << " to " << dest.getOSISRef() << "\n";
	module->linkEntry(&dest);

	currentVerse = saveKey;
}

// Return true if the content was handled or is to be ignored.
//        false if the what has been seen is to be accumulated and considered later.
bool handleToken(SWBuf &text, XMLTag token) {

	// Everything between the begin book tag and the first begin chapter tag is inBookIntro
	static bool               inBookIntro     = false;

	// Everything between the begin chapter tag and the first begin verse tag is inChapterIntro
	static bool               inChapterIntro  = false;

	// Flags indicating whether we are processing the content of a chapter
	static bool               inChapter       = false;

	// Flags indicating whether we are processing the content of a verse
	static bool               inVerse         = false;

	// Flags indicating whether we are processing the content of to be prepended to a verse
	static bool               inPreVerse      = false;
	static int                genID           = 1;

	// Flag indicating whether we are in "Words of Christ"
	static bool               inWOC           = false;
	// Tag for WOC quotes within a verse
	static XMLTag             wocTag          = "<q who=\"Jesus\" marker=\"\">";

	// Flag used to indicate where useful text begins
	static bool               firstDiv        = false;
	static bool               headerEnded     = false;

	// Retain the sID of book, chapter and verse (commentary) divs so that we can find them again.
	// This relies on transformBSP.
	static SWBuf              sidBook         = "";
	static SWBuf              sidChapter      = "";
	static SWBuf              sidVerse        = "";

	// Stack of quote elements used to handle Words of Christ
	static std::stack<XMLTag> quoteStack;

	// Stack of elements used to validate that books, chapters and verses are well-formed
	// This goes beyond simple xml well-formed and also considers milestoned div, chapter and verse
	// to be begin and end tags, too.
	// It is an error if books and chapters are not well formed (though not required by OSIS)
	// It is a warning that verses are not well formed (because some clients are not ready)
	static std::stack<XMLTag> tagStack;

	// The following are used to validate well-formedness
	static int                chapterDepth    = 0;
	static int                bookDepth       = 0;
	static int                verseDepth      = 0;

	int                       tagDepth        = tagStack.size();
	SWBuf                     tokenName       = token.getName();
	bool                      isEndTag        = token.isEndTag() || token.getAttribute("eID");
	SWBuf                     typeAttr        = token.getAttribute("type");
	SWBuf                     eidAttr         = token.getAttribute("eID");

	// process start tags
	if (!isEndTag) {

		// Remember non-empty start tags
		if (!token.isEmpty()) {
			tagStack.push(token);

			if (debug & DEBUG_STACK) {
				cout << "DEBUG(STACK): " << currentOsisID << ": push (" << tagStack.size() << ") " << token.getName() << endl;
			}
		}

		// throw away everything up to the first div (that is outside the header)
		if (!firstDiv) {
			if (headerEnded && (tokenName == "div")) {
				if (debug & DEBUG_OTHER) {
					cout << "DEBUG(FOUND): Found first div and pitching prior material: " << text << endl;
				}

				// TODO: Save off the content to use it to suggest the module's conf.
				firstDiv = true;
				text     = "";
			}
			else {
				// Collect the content so it can be used to suggest the module's conf.
				return false;
			}
		}

		//-- WITH osisID OR annotateRef -------------------------------------------------------------------------
		// Handle Book, Chapter, and Verse (or commentary equivalent)
		if (token.getAttribute("osisID") || token.getAttribute("annotateRef")) {

			// BOOK START, <div type="book" ...>
			if (tokenName == "div" && typeAttr == "book") {
				if (inBookIntro || inChapterIntro) { // this one should never happen, but just in case

					if (debug & DEBUG_TITLE) {
						cout << "DEBUG(TITLE): " << currentOsisID << ": OOPS INTRO " << endl;
						cout << "\tinChapterIntro = " << inChapterIntro << endl;
						cout << "\tinBookIntro = " << inBookIntro << endl;
					}

					currentVerse.setTestament(0);
					currentVerse.setBook(0);
					currentVerse.setChapter(0);
					currentVerse.setVerse(0);
					writeEntry(text);
				}
				currentVerse = token.getAttribute("osisID");
				currentVerse.setChapter(0);
				currentVerse.setVerse(0);
				strcpy(currentOsisID, currentVerse.getOSISRef());

				sidBook         = token.getAttribute("sID");
				inChapter       = false;
				inVerse         = false;
				inPreVerse      = false;
				inBookIntro     = true;
				inChapterIntro  = false;

				if (debug & DEBUG_TITLE) {
					cout << "DEBUG(TITLE): " << currentOsisID << ": Looking for book introduction" << endl;
				}

				bookDepth       = tagStack.size();
				chapterDepth    = 0;
				verseDepth      = 0;

				inCanonicalOSISBook = isOSISAbbrev(token.getAttribute("osisID"));
				if (!inCanonicalOSISBook) {
					cout << "WARNING(V11N): New book is " << token.getAttribute("osisID") << " and is not in " << v11n << " versification, ignoring" << endl;
				}
				else if (debug & DEBUG_OTHER) {
					cout << "DEBUG(FOUND): New book is " << currentVerse.getOSISRef() << endl;
				}

				return false;
			}

			// CHAPTER START, <chapter> or <div type="chapter" ...>
			if ((tokenName == "chapter") ||
			    (tokenName == "div" && typeAttr == "chapter")
			) {
				if (inBookIntro) {
					if (debug & DEBUG_TITLE) {
						cout << "DEBUG(TITLE): " << currentOsisID << ": BOOK INTRO "<< text << endl;
					}

					writeEntry(text);
				}

				currentVerse = token.getAttribute("osisID");
				currentVerse.setVerse(0);

				if (debug & DEBUG_OTHER) {
					cout << "DEBUG(FOUND): Current chapter is " << currentVerse.getOSISRef() << " (" << token.getAttribute("osisID") << ")" << endl;
				}

				strcpy(currentOsisID, currentVerse.getOSISRef());

				sidChapter      = token.getAttribute("sID");
				inChapter       = true;
				inVerse         = false;
				inPreVerse      = false;
				inBookIntro     = false;
				inChapterIntro  = true;

				if (debug & DEBUG_TITLE) {
					cout << "DEBUG(TITLE): " << currentOsisID << ": Looking for chapter introduction" << endl;
				}

				chapterDepth    = tagStack.size();
				verseDepth      = 0;

				return false;
			}

			// VERSE, <verse ...> OR COMMENTARY START, <div annotateType="xxx" ...>
			if ((tokenName == "verse") ||
			    (tokenName == "div" && token.getAttribute("annotateType"))
			) {
				if (debug & DEBUG_OTHER) {
					cout << "DEBUG(FOUND): Entering verse" << endl;
				}

				if (inChapterIntro) {
					if (debug & DEBUG_TITLE) {
						cout << "DEBUG(TITLE): " << currentOsisID << ": Done looking for chapter introduction" << endl;
					}

					if (text.length()) {
						if (debug & DEBUG_TITLE) {
							cout << "DEBUG(TITLE): " << currentOsisID << ": CHAPTER INTRO "<< text << endl;
						}

						writeEntry(text);
					}
				}

				// Did we have pre-verse material that needs to be marked?
				if (inPreVerse) {
					char genBuf[200];
					sprintf(genBuf, "<div type=\"x-milestone\" subType=\"x-preverse\" eID=\"pv%d\"/>", genID++);
					text.append(genBuf);
				}

				// Get osisID for verse or annotateRef for commentary
				SWBuf keyVal = token.getAttribute(tokenName == "verse" ? "osisID" : "annotateRef");

				// Massage the key into a form that parseVerseList can accept
				prepareSWVerseKey(keyVal);

				// The osisID or annotateRef can be more than a single verse
				// The first or only one is the currentVerse
				// Use the last verse seen (i.e. the currentVerse) as the basis for recovering from bad parsing.
				// This should never happen if the references are valid OSIS references
				ListKey verseKeys = currentVerse.parseVerseList(keyVal, currentVerse, true);
				int memberKeyCount = verseKeys.getCount();
				if (memberKeyCount) {
					verseKeys.setPosition(TOP);
					// get the first single verse
					currentVerse = verseKeys;
					// See if this osisID or annotateRef refers to more than one verse.
					// This can be done by incrementing, which will produce an error
					// if there is only one verse.
					verseKeys.increment(1);
					if (!verseKeys.popError()) {
						// If it does, save it until all verses have been seen.
						// At that point we will output links.
						cout << "DEBUG(LINK MASTER): " << currentVerse.getOSISRef() << endl;
						linkedVerses.push_back(verseKeys);
					}
				}
				else {
					cout << "ERROR(REF): Invalid osisID/annotateRef: " << token.getAttribute((tokenName == "verse") ? "osisID" : "annotateRef") << endl;
				}

				strcpy(currentOsisID, currentVerse.getOSISRef());

				if (debug & DEBUG_OTHER) {
					cout << "DEBUG(FOUND): New current verse is " << currentVerse.getOSISRef() << endl;
					cout << "DEBUG(FOUND): osisID/annotateRef is adjusted to: " << keyVal << endl;
				}

				sidVerse        = token.getAttribute("sID");
				inVerse         = true;
				inPreVerse      = false;
				inBookIntro     = false;
				inChapterIntro  = false;
				verseDepth      = tagStack.size();

				// Include the token if it is not a verse
				if (tokenName != "verse") {
					text.append(token);
				}
				else if (debug & DEBUG_VERSE)
				{
					// transform the verse into a milestone
					XMLTag t = "<milestone resp=\"v\" />";
					// copy all the attributes of the verse element to the milestone
					StringList attrNames = token.getAttributeNames();
					for (StringList::iterator loop = attrNames.begin(); loop != attrNames.end(); loop++) {
						const char* attr = (*loop).c_str();
						t.setAttribute(attr, token.getAttribute(attr));
					}
					text.append(t);
				}

				if (inWOC) {
					text.append(wocTag);
				}
				return true;
			}
		} // done with Handle Book, Chapter, and Verse (or commentary equivalent)

		// Now consider everything else.

/*
		// "majorSection" is code for the Book 1-5 of Psalms // This is incorrect assumption - majorSection can appear in any large book and can start and end inside chapters
		if (tokenName == "div" && typeAttr == "majorSection") {
			if (inBookIntro) {
				if (debug & DEBUG_TITLE) {
					cout << "DEBUG(TITLE): " << currentOsisID << ": BOOK INTRO "<< text << endl;
				}
				writeEntry(text);
			}

			if (debug & DEBUG_OTHER) {
				cout << "DEBUG(FOUND): majorSection found " << currentVerse.getOSISRef() << endl;
			}

			strcpy(currentOsisID, currentVerse.getOSISRef());

// as a result of the incorrect assumption these flags are set also incorrectly and cause problems in situations where majorSections do not follow the assumptions made during creation of this patch

			inChapter       = false;
			inVerse         = false;
			inPreVerse      = false;
			inBookIntro     = false;
			inChapterIntro  = true;

			if (debug & DEBUG_TITLE) {
				cout << "DEBUG(TITLE): " << currentOsisID << ": Looking for chapter introduction" << endl;
			}

			verseDepth      = 0;

			return false;
		}
*/
		// Handle WOC quotes.
		// Note this requires transformBSP to make them into milestones
		// Otherwise have to do it here
		if (tokenName == "q") {
			quoteStack.push(token);

			if (debug & DEBUG_QUOTE) {
				cout << "DEBUG(QUOTE): " << currentOsisID << ": quote top(" << quoteStack.size() << ") " << token << endl;
			}

			if (token.getAttribute("who") && !strcmp(token.getAttribute("who"), "Jesus")) {
				inWOC = true;

				// Output per verse WOC markup.
				text.append(wocTag);

				// Output the quotation mark if appropriate, inside the WOC.
				// If there is no marker attribute, let the SWORD engine manufacture one.
				// If there is a marker attribute and it has content, then output that.
				// If the marker attribute is present and empty, then there is nothing to do.
				// And have it within the WOC markup
				if (!token.getAttribute("marker") || token.getAttribute("marker")[0]) {
					token.setAttribute("who", 0); // remove the who="Jesus"
					text.append(token);
				}
				return true;
			}
			return false;
		}

		// Have we found the start of pre-verse material?
		// Pre-verse material follows the following rules
		// 1) Between the opening of a book and the first chapter, all the material is handled as an introduction to the book.
		// 2) Between the opening of a chapter and the first verse, the material is split between the introduction of the chapter
		//    and the first verse of the chapter.
		//    A <div> with a type of section will be taken as surrounding verses.
		//    A <title> of type other than main, chapter or sub, will be taken as a title for the verse.
		//    Once one of these conditions is met, the division between chapter introduction and pre-verse is set.
		// 3) Between verses, the material is split between the prior verse and the next verse.
		//    Basically, while end and empty tags are found, they belong to the prior verse.
		//    Once a begin tag is found, it belongs to the next verse.
		if (!inPreVerse && !inBookIntro) {
			if (inChapterIntro) {
				// Determine when we are no longer in a chapter heading, but in pre-verse material:
				// If we see one of the following:
				//     a section div
				//     a title that is not main, chapter or sub or unclassified (no type attribute)
				if ((tokenName == "div" && typeAttr == "section") ||
				    (tokenName == "title" && typeAttr.length() != 0 && typeAttr != "main" && typeAttr != "chapter" && typeAttr != "sub")
				) {
					if (debug & DEBUG_TITLE) {
						cout << "DEBUG(TITLE): " << currentOsisID << ": Done looking for chapter introduction" << endl;
					}

					if (text.length()) {
						if (debug & DEBUG_TITLE) {
							cout << "DEBUG(TITLE): " << currentOsisID << ": CHAPTER INTRO "<< text << endl;
						}

						// Since we have found the boundary, we need to write out the chapter heading
						writeEntry(text);
					}
					// And we are no longer in the chapter heading
					inChapterIntro  = false;
					// But rather, we are now in pre-verse material
					inPreVerse      = true;
				}
			}
			else if (!inVerse && inChapter) {
				inPreVerse = true;
			}

			if (inPreVerse) {
				char genBuf[200];
				sprintf(genBuf, "<div type=\"x-milestone\" subType=\"x-preverse\" sID=\"pv%d\"/>", genID);
				text.append(genBuf);
			}
		}

		if (debug & DEBUG_INTERVERSE) {
			if (!inVerse && !inBookIntro && !inChapterIntro) {
				cout << "DEBUG(INTERVERSE): " << currentOsisID << ": interverse start token " << token << ":" << text.c_str() << endl;
			}
		}

		return false;
	} // Done with procesing start and empty tags

	// Process end tags
	else {

		if (tagStack.empty()) {
			cout << "FATAL(NESTING): " << currentOsisID << ": tag expected" << endl;
			exit(EXIT_BAD_NESTING);
		}

		// Note: empty end tags have the eID attribute
		if (!token.isEmpty()) {
			XMLTag topToken = tagStack.top();
			tagDepth = tagStack.size();

			if (debug & DEBUG_STACK) {
				cout << "DEBUG(STACK): " << currentOsisID << ": pop(" << tagDepth << ") " << topToken.getName() << endl;
			}

			tagStack.pop();

			if (tokenName != topToken.getName()) {
				cout << "FATAL(NESTING): " << currentOsisID << ": Expected " << topToken.getName() << " found " << tokenName << endl;
//				exit(EXIT_BAD_NESTING); // (OSK) I'm sure this validity check is a good idea, but there's a bug somewhere that's killing the converter here.
						// So I'm disabling this line. Unvalidated OSIS files shouldn't be run through the converter anyway.
						// (DM) This has nothing to do with well-form or valid. It checks milestoned elements for proper nesting.
			}
		}

		// We haven't seen the first div outside the header so there is little to do.
		if (!firstDiv) {
			if (tokenName == "header") {
				headerEnded = true;

				if (debug & DEBUG_OTHER) {
					cout << "DEBUG(FOUND): End of header found" << endl;
				}
			}

			// Collect the content so it can be used to suggest the module's conf.
			return false;
		}

		// VERSE and COMMENTARY END
		if ((tokenName == "verse") ||
		    (tokenName == "div" && eidAttr == sidVerse)
		) {

			if (tagDepth != verseDepth) {
				cout << "WARNING(NESTING): verse " << currentOsisID << " is not well formed:(" << verseDepth << "," << tagDepth << ")" << endl;
			}

			// If we are in WOC then we need to terminate the <q who="Jesus" marker=""> that was added earlier in the verse.
			if (inWOC) {
				text.append("</q>");
			}


			// Include the token if it is not a verse
			if (tokenName != "verse") {
				text.append(token);
			}
			else if (debug & DEBUG_VERSE)
			{
				// transform the verse into a milestone
				XMLTag t = "<milestone resp=\"v\" />";
				// copy all the attributes of the verse element to the milestone
				StringList attrNames = token.getAttributeNames();
				for (StringList::iterator loop = attrNames.begin(); loop != attrNames.end(); loop++) {
					const char* attr = (*loop).c_str();
					t.setAttribute(attr, token.getAttribute(attr));
				}
				text.append(t);
			}

			writeEntry(text);

			inVerse     = false;
			inPreVerse  = false;
			verseDepth  = 0;

			return true;
		}
		
		// Handle WOC quotes.
		// Note this requires transformBSP to make them into milestones
		// Otherwise have to manage it here
		if (tokenName == "q") {
			XMLTag topToken = quoteStack.top();

			if (debug & DEBUG_QUOTE) {
				cout << "DEBUG(QUOTE): " << currentOsisID << ": quote pop(" << quoteStack.size() << ") " << topToken << " -- " << token << endl;
			}

			quoteStack.pop();

			// If we have found an end tag for a <q who="Jesus"> then we are done with the WOC
			// and we need to terminate the <q who="Jesus" marker=""> that was added earlier in the verse.
			if (token.getAttribute("who") && !strcmp(token.getAttribute("who"), "Jesus")) {

				if (debug & DEBUG_QUOTE) {
					cout << "DEBUG(QUOTE): " << currentOsisID << ": (" << quoteStack.size() << ") " << topToken << " -- " << token << endl;
				}

				inWOC = false;
				const char *sID = topToken.getAttribute("sID");
				const char *eID = token.getAttribute("eID");
				if (!sID) {
					sID = "";
				}
				if (!eID) {
					eID = "";
				}
				if (strcmp(sID, eID)) {
					cout << "ERROR(NESTING): improper nesting " << currentOsisID << ": matching (sID,eID) not found. Looking at (" << sID << "," << eID << ")" << endl;
				}


				// Output the quotation mark if appropriate, inside the WOC.
				// If there is no marker attribute, let the SWORD engine manufacture one.
				// If there is a marker attribute and it has content, then output that.
				// If the marker attribute is present and empty, then there is nothing to do.
				// And have it within the WOC markup
				if (!token.getAttribute("marker") || token.getAttribute("marker")[0]) {
					token.setAttribute("who", 0); // remove the who="Jesus"
					text.append(token);
				}

				// Now close the WOC
				text.append("</q>");
				return true;
			}
			return false;
		}

		// Look for the end of document, book and chapter
		// Also for material that goes with last entry
		if (!inVerse && !inBookIntro && !inChapterIntro) {
			// Is this the end of a chapter.
			if ((tokenName == "chapter") ||
			    (tokenName == "div" && eidAttr == sidChapter)
			) {
				text.append(token);
				writeEntry(text);
				inChapter    = false;
				sidChapter   = "";
				chapterDepth = 0;
				verseDepth   = 0;
				return true;
			}

			// Is it the end of a book
			if (tokenName == "div" && eidAttr == sidBook) {
				text.append(token);
				writeEntry(text);
				bookDepth    = 0;
				chapterDepth = 0;
				verseDepth   = 0;
				return true;
			}

			// Do not include the end of an osis document
			if (tokenName == "osisText" || tokenName == "osis") {
				bookDepth    = 0;
				chapterDepth = 0;
				verseDepth   = 0;
				text         = "";
				return true;
			}

			// When we are not inPreVerse, the interverse tags get appended to the preceeding verse.
			if (!inPreVerse) {
				text.append(token);
				writeEntry(text);

				if (debug & DEBUG_INTERVERSE) {
					cout << "DEBUG(INTERVERSE): " << currentOsisID << ": appending interverse end tag: " << tokenName << "(" << tagDepth << "," << chapterDepth << "," << bookDepth << ")" << endl;
				}

				return true;
			}

			if (debug & DEBUG_INTERVERSE) {
				cout << "DEBUG(INTERVERSE): " << currentOsisID << ": interverse end tag: " << tokenName << "(" << tagDepth << "," << chapterDepth << "," << bookDepth << ")" << endl;
			}

			return false;
		}

		return false;
	} // done with Processing end tags

	return false;
}

/**
 * Support normalizations necessary for a SWORD module.
 * OSIS allows for document structure (Book, Section, Paragraph or BSP)
 * to overlap Bible versification (Book, Chapter, Verse).
 * Most SWORD applications need to display verses in isolation or in HTML table cells,
 * requiring each stored entry (i.e. verses) to be well-formed xml.
 * This routine normalizes container elements which could cross verse boundaries into milestones.
 * For most of these OSIS elements, there is a milestone form. However, p is not milestoneable.
 * For this reason, p is transformed into div elements with type x-p.
 * param t the tag to transform
 * return the transformed tag or the original one
 */
XMLTag transformBSP(XMLTag t) {
	static std::stack<XMLTag> bspTagStack;
	static int sID = 1;
	char buf[11];
	SWBuf typeAttr = t.getAttribute("type");

	// Support simplification transformations
	if (t.isEmpty()) {

		if (debug & DEBUG_XFORM) {
			cout << "DEBUG(XFORM): " << currentOsisID << ": xform empty " << t << endl;
		}

		return t;
	}

	SWBuf tagName = t.getName();
	if (!t.isEndTag()) {
		// Transform <p> into <div type="x-p"> and milestone it
		if (tagName == "p") {
			t.setText("<div type=\"x-p\" />");
			sprintf(buf, "gen%d", sID++);
			t.setAttribute("sID", buf);
		}

		// Transform <tag> into <tag  sID="">, where tag is a milestoneable element.
		// The following containers are milestoneable.
		// abbr, closer, div, foreign, l, lg, salute, signed, speech
		// Leaving out:
		//   abbr       When would this ever cross a boundary?
		//   seg        as it is used for a divineName hack
		//   foreign    so that it can be easily italicized
		//   div type="colophon" so that it can be treated as a block
		else if (tagName == "chapter" ||
			 tagName == "closer"  ||
			 (tagName == "div" && typeAttr != "colophon") ||
			 tagName == "l"       ||
			 tagName == "lg"      ||
			 tagName == "q"       ||
			 tagName == "salute"  ||
			 tagName == "signed"  ||
			 tagName == "speech"  ||
			 tagName == "verse"
		) {
			t.setEmpty(true);
			sprintf(buf, "gen%d", sID++);
			t.setAttribute("sID", buf);
		}
		bspTagStack.push(t);

		if (debug & DEBUG_XFORM) {
			cout << "DEBUG(XFORM): " << currentOsisID << ": xform push (" << bspTagStack.size() << ") " << t << " (tagname=" << tagName << ")" << endl;
			XMLTag topToken = bspTagStack.top();
			cout << "DEBUG(XFORM): " << currentOsisID << ": xform top(" << bspTagStack.size() << ") " << topToken << endl;
		}
	}
	else {
		if (!bspTagStack.empty()) {
			XMLTag topToken = bspTagStack.top();

			if (debug & DEBUG_XFORM) {
				cout << "DEBUG(XFORM): " << currentOsisID << ": xform pop(" << bspTagStack.size() << ") " << topToken << endl;
			}

			bspTagStack.pop();
			SWBuf topTypeAttr = topToken.getAttribute("type");

			// Look for the milestoneable container tags handled above.
			// Have to treat div type="colophon" differently
			if (tagName == "chapter" ||
			    tagName == "closer"  ||
			    (tagName == "div" && topTypeAttr != "colophon") ||
			    tagName == "l"       ||
			    tagName == "lg"      ||
			    tagName == "p"       ||
			    tagName == "q"       ||
			    tagName == "salute"  ||
			    tagName == "signed"  ||
			    tagName == "speech"  ||
			    tagName == "verse"
			) {
				// make this a clone of the start tag with sID changed to eID
				// Note: in the case of </p> the topToken is a <div type="x-p">
				t = topToken;
				t.setAttribute("eID", t.getAttribute("sID"));
				t.setAttribute("sID", 0);
			}
		}
		else {
			cout << "FATAL(TAGSTACK): " << currentOsisID << ": closing tag without opening tag" << endl;
		}
	}

	return t;
}

/**
 * Write out all links in the module.
 * Waiting is necessary because writeEntry might ultimately append
 * text to a verse moving it's offset in the data file.
 * While we are minimizing it by postponing the write until we have
 * gathered the next verse, the following scenario is happening:
 * A module is using linked verses and has some verses that are not
 * in the chosen versification. If the out-of-canon verse happens following
 * a linked verse, the out-of-canon verse is appended to the prior
 * verse. Care has to be taken that the linked verses all point to
 * the first of the set.
 */
void writeLinks()
{
	// Link all the verses
	VerseKey destKey;
	destKey.setVersificationSystem(currentVerse.getVersificationSystem());
	destKey.setAutoNormalize(0);
	destKey.setIntros(1);

	VerseKey linkKey;
	linkKey.setVersificationSystem(currentVerse.getVersificationSystem());
	linkKey.setAutoNormalize(0);
	linkKey.setIntros(1);
	for (unsigned int i = 0; i < linkedVerses.size(); i++) {
		// The verseKeys is a list of verses
		// where the first is the real verse
		// and the others link to it.
		ListKey verseKeys = linkedVerses[i];
		verseKeys.setPosition(TOP);
		destKey = verseKeys.getElement();
		verseKeys.increment(1);

		while (!verseKeys.popError()) {
			linkKey = verseKeys.getElement();
			linkToEntry(linkKey, destKey);
			verseKeys.increment(1);
		}
	}
}

void usage(const char *app, const char *error = 0, const bool verboseHelp = false) {
	
	if (error) fprintf(stderr, "\n%s: %s\n", app, error);
	
	fprintf(stderr, "OSIS Bible/commentary module creation tool for The SWORD Project\n");
	fprintf(stderr, "\nusage: %s <output/path> <osisDoc> [OPTIONS]\n", app);
	fprintf(stderr, "  <output/path>\t\t an existing folder that the module will be written\n");
	fprintf(stderr, "  <osisDoc>\t\t path to the validated OSIS document, or '-' to\n");
	fprintf(stderr, "\t\t\t\t read from standard input\n");
	fprintf(stderr, "  -a\t\t\t augment module if exists (default is to create new)\n");
	fprintf(stderr, "  -z <l|z|b|x>\t\t compression type (default: none)\n");
	fprintf(stderr, "\t\t\t\t l - LZSS; z - ZIP; b - bzip2; x - xz\n");
	fprintf(stderr, "  -b <2|3|4>\t\t compression block size (default: 4)\n");
	fprintf(stderr, "\t\t\t\t 2 - verse; 3 - chapter; 4 - book\n");
	fprintf(stderr, "  -l <1-9>\t\t compression level (default varies by compression type)\n");
	fprintf(stderr, "  -c <cipher_key>\t encipher module using supplied key\n");
	fprintf(stderr, "\t\t\t\t (default no enciphering)\n");

#ifdef _ICU_
	fprintf(stderr, "  -e <1|2|s>\t\t convert Unicode encoding (default: 1)\n");
	fprintf(stderr, "\t\t\t\t 1 - UTF-8 ; 2 - UTF-16 ; s - SCSU\n");
	fprintf(stderr, "  -N\t\t\t do not normalize to NFC\n");
	if (verboseHelp) {
		fprintf(stderr, "\t\t\t\t (default is to convert to UTF-8, if needed,\n");
		fprintf(stderr, "\t\t\t\t  and then normalize to NFC)\n");
		fprintf(stderr, "\t\t\t\t Note: UTF-8 texts should be normalized to NFC.\n");
	}
#endif

	fprintf(stderr, "  -s <2|4>\t\t bytes used to store entry size (default is 2).\n");
	if (verboseHelp) {
		fprintf(stderr, "\t\t\t\t Note: useful for commentaries with very large\n");
		fprintf(stderr, "\t\t\t\t entries in uncompressed modules\n");
		fprintf(stderr, "\t\t\t\t (2 bytes to store size equal 65535 characters)\n");
	}
	fprintf(stderr, "  -v <v11n>\t\t specify a versification scheme to use (default is KJV)\n");
	fprintf(stderr, "\t\t\t\t Note: The following are valid values for v11n:");

	VersificationMgr *vmgr = VersificationMgr::getSystemVersificationMgr();
	StringList av11n = vmgr->getVersificationSystems();
	for (StringList::iterator loop = av11n.begin(); loop != av11n.end(); loop++) {
		if ((distance(av11n.begin(), loop) % 3) == 0) {
			fprintf(stderr, "\n\t\t\t\t   %-12s", (*loop).c_str());
		}
		else {
			fprintf(stderr, "\t%-12s", (*loop).c_str());
		}
	}
	fprintf(stderr, "\n");
	fprintf(stderr, "  -V <versification json file path>\t\t defines a versification scheme to use (overides -v)\n");
	
	if (verboseHelp) {
		fprintf(stderr, "  -d <flags>\t\t turn on debugging (default is 0)\n");
		fprintf(stderr, "\t\t\t\t Note: This flag may change in the future.\n");
		fprintf(stderr, "\t\t\t\t Flags: The following are valid values:\n");
		fprintf(stderr, "\t\t\t\t\t0   - no debugging\n");
		fprintf(stderr, "\t\t\t\t\t1   - writes to module, very verbose\n");
		fprintf(stderr, "\t\t\t\t\t2   - verse start and end\n");
		fprintf(stderr, "\t\t\t\t\t4   - quotes, esp. Words of Christ\n");
		fprintf(stderr, "\t\t\t\t\t8   - titles\n");
		fprintf(stderr, "\t\t\t\t\t16  - inter-verse material\n");
		fprintf(stderr, "\t\t\t\t\t32  - BSP to BCV transformations\n");
		fprintf(stderr, "\t\t\t\t\t64  - v11n exceptions\n");
		fprintf(stderr, "\t\t\t\t\t128 - parsing of osisID and osisRef\n");
		fprintf(stderr, "\t\t\t\t\t256 - internal stack\n");
		fprintf(stderr, "\t\t\t\t\t512 - miscellaneous\n");
		fprintf(stderr, "\t\t\t\t This argument can be used more than once. (Or\n");
		fprintf(stderr, "\t\t\t\t the flags may be added together.)\n");
	}
	fprintf(stderr, "  -h \t\t\t print verbose usage text\n");
	
	fprintf(stderr, "\n");
	fprintf(stderr, "See http://www.crosswire.org/wiki/osis2mod for more details.\n");
	fprintf(stderr, "\n");
	exit(EXIT_BAD_ARG);
}

void processOSIS(istream& infile) {
	typedef enum {
		CS_NOT_IN_COMMENT,            // or seen starting "<"
		CS_SEEN_STARTING_EXCLAMATION,
		CS_SEEN_STARTING_HYPHEN,
		CS_IN_COMMENT,
		CS_SEEN_ENDING_HYPHEN,
		CS_SEEN_SECOND_ENDING_HYPHEN,
		CS_SEEN_ENDING_GREATER_THAN
	} t_commentstate;

	typedef enum {
		ET_NUM,
		ET_HEX,
		ET_CHAR,
		ET_NONE,
		ET_ERR
	} t_entitytype;

	activeOsisID[0] = '\0';

	strcpy(currentOsisID,"N/A");

	currentVerse.setVersificationSystem(v11n);
	currentVerse.setAutoNormalize(false);
	currentVerse.setIntros(true);  // turn on mod/testmnt/book/chap headings
	currentVerse.setPersist(true);

	module->setKey(currentVerse);
	module->setPosition(TOP);

	SWBuf token;
	SWBuf text;
	bool incomment = false;
	t_commentstate commentstate = CS_NOT_IN_COMMENT;
	bool intoken = false;
	bool inWhitespace = false;
	bool seeingSpace = false;
	unsigned char curChar = '\0';
	SWBuf entityToken;
	bool inentity = false;
	t_entitytype entitytype = ET_NONE;
	unsigned char attrQuoteChar = '\0';
	bool inattribute = false;
	unsigned int linePos = 1;
	unsigned int charPos = 0;

	while (infile.good()) {

		int possibleChar = infile.get();

		// skip the character if it is bad. infile.good() will catch the problem
		if (possibleChar == -1) {
			continue;
		}

		curChar = (unsigned char) possibleChar;

		// All newlines are simply whitespace
		// Does a SWORD module actually require this?
		if (curChar == '\n') {
			curChar = ' ';
			charPos = 0;
			linePos++;
		}
		charPos++;

		// Look for entities:
		// These are of the form &#dddd;, &xHHHH; or &llll;
		// where dddd is a sequence of digits
		//       HHHH is a sequence of [A-Fa-f0-9]
		//       llll is amp, lt, gt, quot or apos
		//            but we will look for a sequence of [A-Za-z0-9]
		// All but &amp;, &lt;, &gt;, &quot;, &apos; will produce a WARNING
		// In the future:
		//    &#dddd; and &xHHHH; should be converted to UTF-8,
		//        with a WARNING if the text is not UTF-8
		//    &llll; other than the xml standard 5 should produce a WARNING

		// For entity diagnostics track whether the text is an attribute value
		if (inattribute && (curChar == '\'' || curChar == '"')) {
			if (attrQuoteChar == curChar) {
				inattribute = false;
				attrQuoteChar = '\0';
			}
			else {
				attrQuoteChar = curChar;
			}
		}
		if (intoken && curChar == '=') {
			inattribute = true;
			attrQuoteChar = '\0';
		}

		if (!inentity && curChar == '&') {
			inentity = true;
			entitytype = ET_NONE;
			entityToken = "&";
			continue;
		}

		if (inentity) {
			if (curChar == ';') {
				inentity = false;
			}
			else {
				switch (entitytype) {
				    case ET_NONE:
					// A hex entity cannot start with X in XML, but it can in HTML
					// Allow for it here and complain later
					if (curChar == 'x' || curChar == 'X') {
						entitytype = ET_HEX;
					}
					else
					if (curChar == '#') {
						entitytype = ET_NUM;
					}
					else
					if ((curChar >= 'A' && curChar <= 'Z') ||
					    (curChar >= 'a' && curChar <= 'z') ||
					    (curChar >= '0' && curChar <= '9')) {
						entitytype = ET_CHAR;
					}
					else {
						inentity = false;
						entitytype = ET_ERR;
					}
					break;

				    case ET_NUM :
					if (!(curChar >= '0' && curChar <= '9')) {
						inentity = false;
						entitytype = ET_ERR;
					}
					break;
				    case ET_HEX :
					if ((curChar >= 'G' && curChar <= 'Z') ||
					    (curChar >= 'g' && curChar <= 'z')) {
						// Starts out as a HEX entity, but it isn't one
						entitytype = ET_CHAR;
					}
					else
					if (!((curChar >= 'A' && curChar <= 'F') ||
					      (curChar >= 'a' && curChar <= 'f') ||
					      (curChar >= '0' && curChar <= '9'))) {
						inentity = false;
						entitytype = ET_ERR;
					}
					break;
				    case ET_CHAR :
					if (!((curChar >= 'A' && curChar <= 'Z') ||
					      (curChar >= 'a' && curChar <= 'z') ||
					      (curChar >= '0' && curChar <= '9'))) {
						inentity = false;
						entitytype = ET_ERR;
					}
					break;
				    default:
					cout << "FATAL(ENTITY): unknown entitytype on entity end: " << entitytype << endl;
					exit(EXIT_BAD_NESTING);
				}
			}

			if (entitytype != ET_ERR) {
				entityToken.append((char) curChar);
			}

			// It is an entity, perhaps invalid, if curChar is ';', error otherwise
			// Test to see if we now have an entity or a failure
			// It may not be a valid entity.
			if (!inentity) {
				switch (entitytype) {
				    case ET_ERR :
					// Remove the leading &
					entityToken << 1;
					cout << "WARNING(PARSE): malformed entity, replacing &" << entityToken << " with &amp;" << entityToken << endl;
					if (intoken) {
						token.append("&amp;");
						token.append(entityToken);
					}
					else {
						text.append("&amp;");
						text.append(entityToken);
					}
					break;
				    case ET_HEX :
					if (entityToken[1] != 'x') {
						cout << "WARNING(PARSE): HEX entity must begin with &x, found " << entityToken << endl;
					}
					else {
						cout << "WARNING(PARSE): SWORD does not search HEX entities, found " << entityToken << endl;
					}
					break;
				    case ET_CHAR :
					if (strcmp(entityToken, "&amp;")  &&
				            strcmp(entityToken, "&lt;")   &&
				            strcmp(entityToken, "&gt;")   &&
				            strcmp(entityToken, "&quot;") &&
				            strcmp(entityToken, "&apos;")) {
						cout << "WARNING(PARSE): XML only supports 5 Character entities &amp;, &lt;, &gt;, &quot; and &apos;, found " << entityToken << endl;
					}
					else
					if (!strcmp(entityToken, "&apos;")) {
						cout << "WARNING(PARSE): While valid for XML, XHTML does not support &apos;." << endl;
						if (!inattribute) {
							cout << "WARNING(PARSE): &apos; is unnecessary outside of attribute values. Replacing with '. " << endl;
							entityToken = "'";
						}
						else {
							switch (attrQuoteChar) {
							    case '"' :
								cout << "WARNING(PARSE): &apos; is unnecessary inside double quoted attribute values. Replacing with '. " << endl;
								entityToken = "'";
								break;
							    case '\'' :
								cout << "WARNING(PARSE): &apos; is only needed within single quoted attribute values. Considering using double quoted attribute and replacing with '." << endl;
								break;
							}
						}
					}
					else
					if (!strcmp(entityToken, "&quot;")) {
						cout << "WARNING(PARSE): While valid for XML, &quot; is only needed within double quoted attribute values" << endl;
						if (!inattribute) {
							cout << "WARNING(PARSE): &quot; is unnecessary outside of attribute values. Replace with \"." << endl;
							entityToken = "\"";
						}
						else {
							switch (attrQuoteChar) {
							    case '"' :
								cout << "WARNING(PARSE): &quot; is only needed within double quoted attribute values. Considering using single quoted attribute and replacing with \"." << endl;
								break;
							    case '\'' :
								cout << "WARNING(PARSE): &quot; is unnecessary inside single quoted attribute values. Replace with \"." << endl;
								entityToken = "\"";
								break;
							}
						}
					}
					break;
				    case ET_NUM :
					cout << "WARNING(PARSE): SWORD does not search numeric entities, found " << entityToken << endl;
					break;
				    case ET_NONE :
				    default:
					break;
				}

				// Put the entity into the stream.
				if (intoken) {
					token.append(entityToken);
				}
				else {
					text.append(entityToken);
				}

				if (curChar == ';') {
					// The character was handled, so go get the next one.
					continue;
				}
			}
			else {
				// The character was handled, so go get the next one.
				continue;
			}
		}


		if (!intoken && curChar == '<') {
			intoken = true;
			token = "<";
			inattribute = false;
			attrQuoteChar = '\0';
			continue;
		}

		// Handle XML comments starting with "<!--", ending with "-->"
		if (intoken && !incomment) {
			switch (commentstate) {
				case CS_NOT_IN_COMMENT :
					if (curChar == '!') {
						commentstate = CS_SEEN_STARTING_EXCLAMATION;
						token.append((char) curChar);
						continue;
					} else {
						break;
					}

				case CS_SEEN_STARTING_EXCLAMATION :
					if (curChar == '-') {
						commentstate = CS_SEEN_STARTING_HYPHEN;
						token.append((char) curChar);
						continue;
					} else {
						commentstate = CS_NOT_IN_COMMENT;
						break;
					}

				case CS_SEEN_STARTING_HYPHEN :
					if (curChar == '-') {
						incomment = true;
						commentstate = CS_IN_COMMENT;
						token.append((char) curChar);

						if (debug & DEBUG_OTHER) {
							cout << "DEBUG(COMMENTS): in comment" << endl;
						}

						continue;
					} else {
						commentstate = CS_NOT_IN_COMMENT;
						break;
					}

				default:
					cout << "FATAL(COMMENTS): unknown commentstate on comment start: " << commentstate << endl;
					exit(EXIT_BAD_NESTING);
			}
		}

		if (incomment) {
			switch (commentstate) {
				case CS_IN_COMMENT:
					if (curChar == '-') {
						commentstate = CS_SEEN_ENDING_HYPHEN;
						continue;
					} else {
						// ignore the character
						continue;
					}

				case CS_SEEN_ENDING_HYPHEN :
					if (curChar == '-') {
						commentstate = CS_SEEN_SECOND_ENDING_HYPHEN;
						continue;
					} else {
						// ignore character
						commentstate = CS_IN_COMMENT;
						continue;
					}

				case CS_SEEN_SECOND_ENDING_HYPHEN :
					if (curChar == '>') {
						intoken = false;
						incomment = false;
						commentstate = CS_NOT_IN_COMMENT;

						if (debug & DEBUG_OTHER) {
							cout << "DEBUG(COMMENTS): out of comment" << endl;
						}

						continue;
					} else {
						// ignore character
						commentstate = CS_IN_COMMENT;
						continue;
					}

				default:
					cout << "FATAL(COMMENTS): unknown commentstate on comment end: " << commentstate << endl;
					exit(EXIT_BAD_NESTING);
			}
		}

		// Outside of tokens merge adjacent whitespace
		if (!intoken) {
			seeingSpace = isspace(curChar)!=0;
			if (seeingSpace) {
				if (inWhitespace) {
					continue;
				}
				// convert all whitespace to blanks
				curChar = ' ';
			}
			inWhitespace = seeingSpace;
		}

		if (intoken && curChar == '>') {
			intoken = false;
			inWhitespace = false;
			token.append('>');
			// take this isalpha if out to check for bugs in text
			if (isalpha(token[1]) ||
			    (((token[1] == '/') || (token[1] == '?')) && isalpha(token[2]))) {
				//cout << "Handle:" << token.c_str() << endl;
				XMLTag t = transformBSP(token.c_str());

				if (!handleToken(text, t)) {
					text.append(t);
				}
			} else {
				cout << "WARNING(PARSE): malformed token: " << token << endl;
			}
			continue;
		}

		if (intoken) {
			token.append((char) curChar);
		}
		else {
			switch (curChar) {
				case '>' : cout << "WARNING(PARSE): > should be &gt;" << endl; text.append("&gt;"); break;
				case '<' : cout << "WARNING(PARSE): < should be &lt;" << endl; text.append("&lt;"); break;
				default  : text.append((char) curChar); break;
			}
		}
	}

	// Force the last entry from the text buffer.
	text = "";
	writeEntry(text, true);
	writeLinks();

#ifdef _ICU_
	if (converted)  fprintf(stderr, "osis2mod converted %d verses to UTF-8\n", converted);
	if (normalized) fprintf(stderr, "osis2mod normalized %d verses to NFC\n", normalized);
#endif
}

int main(int argc, char **argv) {

	fprintf(stderr, "You are running osis2mod: $Rev: 3769C $ (SWORD: %s)\n", SWVersion::currentVersion.getText());
	
	if (argc > 1) {
		for (int i = 1; i < argc; i++) {
			if (!strcmp(argv[i], "-h") || !strcmp(argv[i], "--help")) {
				usage(*argv, "", true);
			}
		}
	}

	// Let's test our command line arguments
	if (argc < 3) {
		usage(*argv);
	}

	// variables for arguments, holding defaults
	const char* program    = argv[0];
	const char* path       = argv[1];
	const char* osisDoc    = argv[2];
	int append             = 0;
	SWBuf compType         = "";
	bool isCommentary      = false;
	int iType              = 4;
	int entrySize          = 0;
	SWBuf cipherKey        = "";
	SWCompress *compressor = 0;
	int compLevel      = 0;

	// SM ===============>>>
	// Custom Versification
	int custom_v11n = 0;
	SWBuf v11n_json = "";
	// SM <<<===============
	for (int i = 3; i < argc; i++) {
		if (!strcmp(argv[i], "-a")) {
			append = 1;
		}
		else if (!strcmp(argv[i], "-z")) {
			compType = "ZIP";
			if (i+1 < argc && argv[i+1][0] != '-') {
				switch (argv[++i][0]) {
				case 'l': compType = "LZSS"; break;
				case 'z': compType = "ZIP"; break;
				case 'b': compType = "BZIP2"; break;
				case 'x': compType = "XZ"; break;
				}
			}
		}
		else if (!strcmp(argv[i], "-Z")) {
			if (compType.size()) usage(*argv, "Cannot specify both -z and -Z");
			compType = "LZSS";
		}
		else if (!strcmp(argv[i], "-b")) {
			if (i+1 < argc) {
				iType = atoi(argv[++i]);
				if ((iType >= 2) && (iType <= 4)) continue;
			}
			usage(*argv, "-b requires one of <2|3|4>");
		}
		else if (!strcmp(argv[i], "-N")) {
			normalize = false;
		}
		else if (!strcmp(argv[i], "-e")) {
			if (i+1 < argc) {
				switch (argv[++i][0]) {
				case '1': // leave as UTF-8
					outputEncoder = NULL;
					outputDecoder = NULL;
					break;

				case '2':
					outputEncoder = new UTF8UTF16();
					outputDecoder = new UTF16UTF8();
					break;
#ifdef _ICU_
				case 's':
					outputEncoder = new UTF8SCSU();
					outputDecoder = new SCSUUTF8();
					break;
#endif
				default:
					outputEncoder = NULL;
					outputDecoder = NULL;
				}
			}
		}
		else if (!strcmp(argv[i], "-c")) {
			if (i+1 < argc) cipherKey = argv[++i];
			else usage(*argv, "-c requires <cipher_key>");
		}
		else if (!strcmp(argv[i], "-v")) {
			if (i+1 < argc) v11n = argv[++i];
			else usage(*argv, "-v requires <v11n>");
		}
		else if (!strcmp(argv[i], "-s")) {
			if (i+1 < argc) {
				entrySize = atoi(argv[++i]);
				if (entrySize == 2 || entrySize == 4) {
					continue;
				}
			}
			usage(*argv, "-s requires one of <2|4>");
		}
		else if (!strcmp(argv[i], "-C")) {
			isCommentary = true;
		}
		else if (!strcmp(argv[i], "-d")) {
			if (i+1 < argc) debug |= atoi(argv[++i]);
			else usage(*argv, "-d requires <flags>");
		}
		else if (!strcmp(argv[i], "-l")) {
			if (i+1 < argc) {
				compLevel = atoi(argv[++i]);
			}
			else usage(*argv, "-l requires a value from 1-9");
			
			if (compLevel < 0 || compLevel > 10) {
				usage(*argv, "-l requires a value from 1-9");
			}
		}
		// SM ===============>>>
		// Custom Versification
		else if (!strcmp(argv[i], "-V")) {
			if (i + 1 < argc){
				v11n_json = argv[++i];				
				custom_v11n = 1;
			}
			else usage(*argv, "-V requires <custom v11n json file path>");
		}
		// SM <<<===============
		else usage(*argv, (((SWBuf)"Unknown argument: ")+ argv[i]).c_str());
	}

	if (isCommentary) isCommentary = true;  // avoid unused warning for now

	if (compType == "LZSS") {
		compressor = new LZSSCompress();
	}
	else if (compType == "ZIP") {
#ifndef EXCLUDEZLIB
		compressor = new ZipCompress();
#else
		usage(*argv, "ERROR: SWORD library not compiled with ZIP compression support.\n\tBe sure libz is available when compiling SWORD library");
#endif
	}
	else if (compType == "BZIP2") {
#ifndef EXCLUDEBZIP2
		compressor = new Bzip2Compress();
#else
		usage(*argv, "ERROR: SWORD library not compiled with bzip2 compression support.\n\tBe sure libbz2 is available when compiling SWORD library");
#endif
	}
	else if (compType == "XZ") {
#ifndef EXCLUDEXZ
		compressor = new XzCompress();
#else
		usage(*argv, "ERROR: SWORD library not compiled with xz compression support.\n\tBe sure liblzma is available when compiling SWORD library");
#endif		
	}

	if (compressor && compLevel > 0) {
		compressor->setLevel(compLevel);
	}

#ifndef _ICU_
	if (normalize) {
		normalize = false;
		cout << "WARNING(UTF8): " << program << " is not compiled with support for ICU. Assuming -N." << endl;
	}
#endif

	if (debug & DEBUG_OTHER) {
		cout << "DEBUG(ARGS):\n\tpath: " << path << "\n\tosisDoc: " << osisDoc << "\n\tcreate: " << append << "\n\tcompressType: " << compType << "\n\tblockType: " << iType << "\n\tcompressLevel: " << compLevel << "\n\tcipherKey: " << cipherKey.c_str() << "\n\tnormalize: " << normalize << endl;
	}
	// SM =============>>>
	// Custom Versification
	if (custom_v11n)
	{
		load_custom_versification(v11n_json.c_str());
		currentVerse.registerCustomVersificationSystem(custom_versification_name, otbooks_custom, ntbooks_custom, vm_custom, mappings_custom);
		v11n = custom_versification_name;
	}
	// SM <<<=============

	if (!append) {  // == 0 then create module
	// Try to initialize a default set of datafiles and indicies at our
	// datapath location passed to us from the user.
		if (compressor) {
			if (entrySize == 4) {
				if (zText4::createModule(path, iType, v11n)) {
					fprintf(stderr, "ERROR: %s: couldn't create module at path: %s \n", program, path);
					exit(EXIT_NO_CREATE);
				}
			}
			else {
				if (zText::createModule(path, iType, v11n)) {
					fprintf(stderr, "ERROR: %s: couldn't create module at path: %s \n", program, path);
					exit(EXIT_NO_CREATE);
				}
			}
		}
		else if (entrySize == 4) {
			if (RawText4::createModule(path, v11n)) {
				fprintf(stderr, "ERROR: %s: couldn't create module at path: %s \n", program, path);
				exit(EXIT_NO_CREATE);
			}
		}
		else {
			if (RawText::createModule(path, v11n)) {
				fprintf(stderr, "ERROR: %s: couldn't create module at path: %s \n", program, path);
				exit(EXIT_NO_CREATE);
			}
		}
	}

	// Do some initialization stuff
	if (compressor) {
		if (entrySize == 4) {
			// Create a compressed text module allowing very large entries
			// Taking defaults except for first, fourth, fifth and last argument
			module = new zText4(
				path,           // ipath
				0,              // iname
				0,              // idesc
				iType,          // iblockType
				compressor,     // icomp
				0,              // idisp
				ENC_UNKNOWN,    // enc
				DIRECTION_LTR,  // dir
				FMT_UNKNOWN,    // markup
				0,              // lang
				v11n            // versification
		       );
		}
		else {
			// Create a compressed text module allowing reasonable sized entries
			// Taking defaults except for first, fourth, fifth and last argument
			module = new zText(
				path,           // ipath
				0,              // iname
				0,              // idesc
				iType,          // iblockType
				compressor,     // icomp
				0,              // idisp
				ENC_UNKNOWN,    // enc
				DIRECTION_LTR,  // dir
				FMT_UNKNOWN,    // markup
				0,              // lang
				v11n            // versification
		       );
		}
	}
	else if (entrySize == 4) {
		// Create a raw text module allowing very large entries
		// Taking defaults except for first and last argument
		module = new RawText4(
				path,           // ipath
				0,              // iname
				0,              // idesc
				0,              // idisp
				ENC_UNKNOWN,    // encoding
				DIRECTION_LTR,  // dir
				FMT_UNKNOWN,    // markup
				0,              // ilang
				v11n            // versification
			);
	}
	else {
		// Create a raw text module allowing reasonable sized entries
		// Taking defaults except for first and last argument
		module = new RawText(
				path,           // ipath
				0,              // iname
				0,              // idesc
				0,              // idisp
				ENC_UNKNOWN,    // encoding
				DIRECTION_LTR,  // dir
				FMT_UNKNOWN,    // markup
				0,              // ilang
				v11n            // versification
			);
	}

	SWFilter *cipherFilter = 0;

	if (cipherKey.length()) {
		fprintf(stderr, "Adding cipher filter with phrase: %s\n", cipherKey.c_str() );
		cipherFilter = new CipherFilter(cipherKey.c_str());
		module->addRawFilter(cipherFilter);
	}

	if (!module->isWritable()) {
		fprintf(stderr, "The module is not writable. Writing text to it will not work.\nExiting.\n" );
		exit(EXIT_NO_WRITE);
	}

	// Either read from std::cin (aka stdin), when the argument is a '-'
	// or from a specified file.
	if (!strcmp(osisDoc, "-")) {
		processOSIS(cin);
	}
	else {
		// Let's see if we can open our input file
		ifstream infile(osisDoc);
		if (infile.fail()) {
			fprintf(stderr, "ERROR: %s: couldn't open input file: %s \n", program, osisDoc);
			exit(EXIT_NO_READ);
		}
		processOSIS(infile);
		infile.close();
	}

	delete module;
	if (cipherFilter)
		delete cipherFilter;
	if (outputEncoder)
		delete outputEncoder;
	if (outputDecoder)
		delete outputDecoder;

	fprintf(stderr, "SUCCESS: %s: has finished its work and will now rest\n", program);
	exit(0); // success
}

