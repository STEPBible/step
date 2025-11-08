/******************************************************************************
 *
 *  versificationmgr.cpp -	implementation of class VersificationMgr used
 *				for managing versification systems
 *
 * $Id: versificationmgr.cpp 3822 2020-11-03 18:54:47Z scribe $
 *
 * Copyright 2008-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <versificationmgr.h>
#include <vector>
#include <map>
#include <treekey.h>
#include <canon.h>		// KJV internal versification system
#include <swlog.h>
#include <algorithm>

#include <canon_null.h>		// null v11n system

#include <canon_leningrad.h>	// Leningrad Codex (WLC) v11n system
#include <canon_mt.h>		// Masoretic Text (MT) v11n system
#include <canon_kjva.h>		// KJV + Apocrypha v11n system
#include <canon_nrsv.h>		// NRSV v11n system
#include <canon_nrsva.h>	// NRSV + Apocrypha v11n system
#include <canon_synodal.h>	// Russian Synodal v11n system
#include <canon_synodalprot.h>	// Russian Synodal v11n system
#include <canon_vulg.h>		// Vulgate v11n system
#include <canon_german.h>	// German v11n system
#include <canon_luther.h>	// Luther v11n system
#include <canon_catholic.h>	// Catholic v11n system (10 chapter Esther)
#include <canon_catholic2.h>	// Catholic2 v11n system (16 chapter Esther)
#include <canon_lxx.h>		// General LXX v11n system (includes GNT, as used in Orthodox Bibles)
#include <canon_orthodox.h>	// Orthodox v11n system as used in Orthodox Bibles
#include <canon_segond.h>	// French v11n system as used by Segond Bibles and its derivatives
#include <canon_calvin.h>	// French v11n system 
#include <canon_darbyfr.h>	// French v11n system based on John Darby's French translation

using std::vector;
using std::map;
using std::distance;
using std::lower_bound;


SWORD_NAMESPACE_START


VersificationMgr *VersificationMgr::getSystemVersificationMgr() {
	if (!systemVersificationMgr) {
		systemVersificationMgr = new VersificationMgr();
		systemVersificationMgr->registerVersificationSystem("KJV", otbooks, ntbooks, vm);
		systemVersificationMgr->registerVersificationSystem("Leningrad", otbooks_leningrad, ntbooks_null, vm_leningrad);
		systemVersificationMgr->registerVersificationSystem("MT", otbooks_mt, ntbooks_null, vm_mt);
		systemVersificationMgr->registerVersificationSystem("KJVA", otbooks_kjva, ntbooks, vm_kjva);
		systemVersificationMgr->registerVersificationSystem("NRSV", otbooks, ntbooks, vm_nrsv, mappings_nrsv);
		systemVersificationMgr->registerVersificationSystem("NRSVA", otbooks_nrsva, ntbooks, vm_nrsva);
		systemVersificationMgr->registerVersificationSystem("Synodal", otbooks_synodal, ntbooks_synodal, vm_synodal, mappings_synodal);
		systemVersificationMgr->registerVersificationSystem("SynodalProt", otbooks_synodalProt, ntbooks_synodal, vm_synodalProt);
		systemVersificationMgr->registerVersificationSystem("Vulg", otbooks_vulg, ntbooks_vulg, vm_vulg, mappings_vulg);
		systemVersificationMgr->registerVersificationSystem("German", otbooks_german, ntbooks, vm_german);
		systemVersificationMgr->registerVersificationSystem("Luther", otbooks_luther, ntbooks_luther, vm_luther);
		systemVersificationMgr->registerVersificationSystem("Catholic", otbooks_catholic, ntbooks, vm_catholic);
		systemVersificationMgr->registerVersificationSystem("Catholic2", otbooks_catholic2, ntbooks, vm_catholic2);
		systemVersificationMgr->registerVersificationSystem("LXX", otbooks_lxx, ntbooks, vm_lxx);
		systemVersificationMgr->registerVersificationSystem("Orthodox", otbooks_orthodox, ntbooks, vm_orthodox);
		systemVersificationMgr->registerVersificationSystem("Calvin", otbooks, ntbooks, vm_calvin, mappings_calvin);
		systemVersificationMgr->registerVersificationSystem("DarbyFr", otbooks, ntbooks, vm_darbyfr, mappings_darbyfr);
		systemVersificationMgr->registerVersificationSystem("Segond", otbooks, ntbooks, vm_segond, mappings_segond);
	}
	return systemVersificationMgr;
}


class VersificationMgr::System::Private {
public:
	/** Array[chapmax] of maximum verses in chapters */
	vector<Book> books;
	map<SWBuf, int> osisLookup;
	/** General mapping rule is that first verse of every chapter corresponds first
		verse of another chapter in default intermediate canon(kjva), so mapping data
		contains expections. Intermediate canon could not contain corresponding data.
		
		Each element in @variable mappings contains of all rules that are related to
		particular book.

		@typedef mappingRule is a pointer on uchar[7]: 1 value - book id 1-based, ot+nt,
		2-4 map to, 5-7 map from (chap,verse from, verse to if greater then "verse from").
		Size of rule would be 8 if there is inter-book mapping and target book is abscent
		in reference system, in this case @variable mappingsExtraBooks data is used and
		id is rule book id minus book count.
	*/
	typedef vector<const unsigned char*> mappingRule;
	vector<mappingRule> mappings;
	vector<const char*> mappingsExtraBooks;

	Private() {
	}
	Private(const VersificationMgr::System::Private &other) {
		books = other.books;
		osisLookup = other.osisLookup;
	}
	VersificationMgr::System::Private &operator =(const VersificationMgr::System::Private &other) {
		books = other.books;
		osisLookup = other.osisLookup;
		return *this;
	}
};


class VersificationMgr::Book::Private {
friend struct BookOffsetLess;
public:
	/** Array[chapmax] of maximum verses in chapters */
	vector<int> verseMax;
	vector<long> offsetPrecomputed;

	Private() {
		verseMax.clear();
	}
	Private(const VersificationMgr::Book::Private &other) {
		verseMax.clear();
		verseMax = other.verseMax;
		offsetPrecomputed = other.offsetPrecomputed;
	}
	VersificationMgr::Book::Private &operator =(const VersificationMgr::Book::Private &other) {
		verseMax.clear();
                int s = (int)other.verseMax.size();
                if (s) verseMax = other.verseMax;
		offsetPrecomputed = other.offsetPrecomputed;
		return *this;
	}
};


struct BookOffsetLess {
	bool operator() (const VersificationMgr::Book &o1, const VersificationMgr::Book &o2) const { return o1.p->offsetPrecomputed[0] < o2.p->offsetPrecomputed[0]; }
	bool operator() (const long &o1, const VersificationMgr::Book &o2) const { return o1 < o2.p->offsetPrecomputed[0]; }
	bool operator() (const VersificationMgr::Book &o1, const long &o2) const { return o1.p->offsetPrecomputed[0] < o2; }
	bool operator() (const long &o1, const long &o2) const { return o1 < o2; }
};


void VersificationMgr::Book::init() {
	p = new Private();
}


void VersificationMgr::System::init() {
	p = new Private();
	BMAX[0] = 0;
	BMAX[1] = 0;
	ntStartOffset = 0;
}


VersificationMgr::System::System(const System &other) {
	init();
	name = other.name;
	BMAX[0] = other.BMAX[0];
	BMAX[1] = other.BMAX[1];
	(*p) = *(other.p);
	ntStartOffset = other.ntStartOffset;
}


VersificationMgr::System &VersificationMgr::System::operator =(const System &other) {
	name = other.name;
	BMAX[0] = other.BMAX[0];
	BMAX[1] = other.BMAX[1];
	(*p) = *(other.p);
	ntStartOffset = other.ntStartOffset;
	return *this;
}


VersificationMgr::System::~System() {
	delete p;
}


const VersificationMgr::Book *VersificationMgr::System::getBook(int number) const {
	return (number < (signed int)p->books.size()) ? &(p->books[number]) : 0;
}


int VersificationMgr::System::getBookNumberByOSISName(const char *bookName) const {
	map<SWBuf, int>::const_iterator it = p->osisLookup.find(bookName);
	return (it != p->osisLookup.end()) ? it->second : -1;
}


void VersificationMgr::System::loadFromSBook(const sbook *ot, const sbook *nt, int *chMax, const unsigned char *mappings) {
	int chap = 0;
	int book = 0;
	long offset = 0;	// module heading
	offset++;			// testament heading
	while (ot->chapmax) {
		p->books.push_back(Book(ot->name, ot->osis, ot->prefAbbrev, ot->chapmax));
		offset++;		// book heading
		Book &b = p->books[p->books.size()-1];
		p->osisLookup[b.getOSISName()] = (int)p->books.size();
		for (int i = 0; i < ot->chapmax; i++) {
			b.p->verseMax.push_back(chMax[chap]);
			offset++;		// chapter heading
			b.p->offsetPrecomputed.push_back(offset);
			offset += chMax[chap++];
		}
		ot++;
		book++;
	}
	BMAX[0] = book;
	book = 0;
	ntStartOffset = offset;
	offset++;			// testament heading
	while (nt->chapmax) {
		p->books.push_back(Book(nt->name, nt->osis, nt->prefAbbrev, nt->chapmax));
		offset++;		// book heading
		Book &b = p->books[p->books.size()-1];
		p->osisLookup[b.getOSISName()] = (int)p->books.size();
		for (int i = 0; i < nt->chapmax; i++) {
			b.p->verseMax.push_back(chMax[chap]);
			offset++;		// chapter heading
			b.p->offsetPrecomputed.push_back(offset);
			offset += chMax[chap++];
		}
		nt++;
		book++;
	}
	BMAX[1] = book;

	// TODO: build offset speed array

	// parse mappings
	if (mappings != NULL) {
		const unsigned char *m=mappings;
		for (; *m != 0; m += strlen((const char*)m)+1) {
			p->mappingsExtraBooks.push_back((const char*)m);
		}
		p->mappings.resize(p->books.size()+p->mappingsExtraBooks.size());

		for (++m; *m != 0; m += 7) {
			p->mappings[m[0]-1].push_back(m);
			if (*m > p->books.size()) {
				p->mappings[m[7]-1].push_back(m);
				m += 1;
			}
		}
	}
}


VersificationMgr::Book::Book(const Book &other) {
	longName = other.longName;
	osisName = other.osisName;
	prefAbbrev = other.prefAbbrev;
	chapMax = other.chapMax;
	init();
	(*p) = *(other.p);
}


VersificationMgr::Book& VersificationMgr::Book::operator =(const Book &other) {
	longName = other.longName;
	osisName = other.osisName;
	prefAbbrev = other.prefAbbrev;
	chapMax = other.chapMax;
	init();
	(*p) = *(other.p);
	return *this;
}


VersificationMgr::Book::~Book() {
	delete p;
}


int VersificationMgr::Book::getVerseMax(int chapter) const {
	chapter--;
	return (p && (chapter < (signed int)p->verseMax.size()) && (chapter > -1)) ? p->verseMax[chapter] : -1;
}


int VersificationMgr::System::getBookCount() const {
	return (int)(p ? p->books.size() : 0);
}


long VersificationMgr::System::getOffsetFromVerse(int book, int chapter, int verse) const {
	long  offset = -1;
	chapter--;

	const Book *b = getBook(book);

	if (!b)                                        return -1;	// assert we have a valid book
	if ((chapter > -1) && (chapter >= (signed int)b->p->offsetPrecomputed.size())) return -1;	// assert we have a valid chapter

	offset = b->p->offsetPrecomputed[(chapter > -1)?chapter:0];
	if (chapter < 0) offset--;

/* old code
 *
	offset = offsets[testament-1][0][book];
	offset = offsets[testament-1][1][(int)offset + chapter];
	if (!(offset|verse)) // if we have a testament but nothing else.
		offset = 1;

*/

	return (offset + verse);
}


char VersificationMgr::System::getVerseFromOffset(long offset, int *book, int *chapter, int *verse) const {

	if (offset < 1) {	// just handle the module heading corner case up front (and error case)
		(*book) = -1;
		(*chapter) = 0;
		(*verse) = 0;
		return offset;	// < 0 = error
	}

	// binary search for book
	vector<Book>::iterator b = lower_bound(p->books.begin(), p->books.end(), offset, BookOffsetLess());
	if (b == p->books.end()) b--;
	(*book)    = distance(p->books.begin(), b)+1;
	if (offset < (*(b->p->offsetPrecomputed.begin()))-((((!(*book)) || (*book)==BMAX[0]+1))?2:1)) { // -1 for chapter headings
		(*book)--;
		if (b != p->books.begin()) {
			b--;	
		}
	}
	vector<long>::iterator c = lower_bound(b->p->offsetPrecomputed.begin(), b->p->offsetPrecomputed.end(), offset);

	// if we're a book heading, we are lessthan chapter precomputes, but greater book.  This catches corner case.
	if (c == b->p->offsetPrecomputed.end()) {
		c--;
	}
	if ((offset < *c) && (c == b->p->offsetPrecomputed.begin())) {
		(*chapter) = (offset - *c)+1;	// should be 0 or -1 (for testament heading)
		(*verse) = 0;
	}
	else {
		if (offset < *c) c--;
		(*chapter) = distance(b->p->offsetPrecomputed.begin(), c)+1;
		(*verse)   = (offset - *c);
	}
	return ((*chapter > 0) && (*verse > b->getVerseMax(*chapter))) ? KEYERR_OUTOFBOUNDS : 0;
}


/***************************************************
 * VersificationMgr
 */

class VersificationMgr::Private {
public:
	Private() {
	}
	Private(const VersificationMgr::Private &other) {
		systems = other.systems;
	}
	VersificationMgr::Private &operator =(const VersificationMgr::Private &other) {
		systems = other.systems;
		return *this;
	}
	map<SWBuf, System> systems;
};
// ---------------- statics -----------------
VersificationMgr *VersificationMgr::systemVersificationMgr = 0;

class __staticsystemVersificationMgr {
public:
	__staticsystemVersificationMgr() { }
	~__staticsystemVersificationMgr() { delete VersificationMgr::systemVersificationMgr; }
} _staticsystemVersificationMgr;


void VersificationMgr::init() {
	p = new Private();
}


VersificationMgr::~VersificationMgr() {
	delete p;
}


void VersificationMgr::setSystemVersificationMgr(VersificationMgr *newVersificationMgr) {
	if (systemVersificationMgr)
		delete systemVersificationMgr;
	systemVersificationMgr = newVersificationMgr;
}


const VersificationMgr::System *VersificationMgr::getVersificationSystem(const char *name) const {
	map<SWBuf, System>::const_iterator it = p->systems.find(name);
	return (it != p->systems.end()) ? &(it->second) : 0;
}

void VersificationMgr::registerCustomVersificationSystem(const char *name, const sbook *ot, const sbook *nt, int *chMax, const unsigned char *mappings){
	if (systemVersificationMgr) {
		systemVersificationMgr->registerVersificationSystem(name, ot, nt, chMax, mappings);
	}
}

void VersificationMgr::registerVersificationSystem(const char *name, const sbook *ot, const sbook *nt, int *chMax, const unsigned char *mappings) {
	p->systems[name] = name;
	System &s = p->systems[name];
	s.loadFromSBook(ot, nt, chMax, mappings);
}


void VersificationMgr::registerVersificationSystem(const char *name, const TreeKey *tk) {
}


const StringList VersificationMgr::getVersificationSystems() const {
	StringList retVal;
	for (map<SWBuf, System>::const_iterator it = p->systems.begin(); it != p->systems.end(); it++) {
		retVal.push_back(it->first);
	}
	return retVal;
}

void VersificationMgr::System::translateVerse(const System *dstSys, const char **book, int *chapter, int *verse, int *verse_end) const {
//dbg_mapping SWLOGD("translate verse from %s to %s: %s.%i.%i-%i\n",getName(), dstSys->getName(), *book, *chapter, *verse, *verse_end);

	if (!strcmp(getName(),"KJVA") || !strcmp(getName(),"KJV")) {
		if (!strcmp(dstSys->getName(),"KJVA") || !strcmp(dstSys->getName(),"KJV"))
			return;
		// reversed mapping
		//dbg_mapping SWLOGD("Perform reversed mapping.\n");
		int b = dstSys->getBookNumberByOSISName(*book)-1;

		//dbg_mapping SWLOGD("\tgetBookNumberByOSISName %i %s.\n", b, *book);

		if (b < 0) {
			//dbg_mapping SWLOGD("\tmappingsExtraBooks.size() %i.\n", dstSys->p->mappingsExtraBooks.size());
			for (int i=0; i<(int)dstSys->p->mappingsExtraBooks.size(); ++i) {
				//dbg_mapping SWLOGD("\t%s %s.\n", *book, dstSys->p->mappingsExtraBooks[i]);
				if (!strcmp(*book, dstSys->p->mappingsExtraBooks[i])) {
					b = (int)p->books.size()+i-2;
					break;
				}
			}
		}

		//dbg_mapping SWLOGD("\tb %i.\n", b);

		if (b >= (int)dstSys->p->mappings.size() || b < 0) {
			//dbg_mapping SWLOGD("no modification");
			return;
		}
		
		const unsigned char *a = NULL;
		
		// reversed mapping should use forward search for item
		for (unsigned int i=0; i<dstSys->p->mappings[b].size(); ++i) {
			const unsigned char *m = dstSys->p->mappings[b][i];

			if (m[0] != b+1) continue; // filter inter-book rules

			if (m[4] == *chapter && m[5] <= *verse) {
				//dbg_mapping SWLOGD("found mapping %i %i %i %i %i %i\n",m[1],m[2],m[3],m[4],m[5],m[6]);
				if (m[5] == *verse || (m[6] >= *verse && m[5] <= *verse)) {
					// inside of any mapping range
					*chapter = m[1];
					*verse = m[2];
					*verse_end = m[3];
					if (*m >= dstSys->p->books.size()) {
						SWLog::getSystemLog()->logWarning("map to extra books, possible bug source\n");
						*book = dstSys->getBook(m[7]-1)->getOSISName();
					}
					return;
				}
				// destination mapping can have duplicate items, use the last (by using <=)
				if (a == NULL || (a[5]>a[6]?a[5]:a[6]) <= (m[5]>m[6]?m[5]:m[6]))
					a = m;
			}
		}
		if (a != NULL) {
			//dbg_mapping SWLOGD("set appropriate: %i %i %i %i %i %i\n",a[1],a[2],a[3],a[4],a[5],a[6]);
			(*chapter) = a[1];
			// shift verse
			const int d = (a[3]>a[2]?a[3]:a[2])-(a[6]>a[5]?a[6]:a[5]);
			if (*verse < *verse_end)
				*verse_end += d;
			else
				*verse_end = (*verse) + d;
			*verse += d;
			if (*a > dstSys->p->books.size()) {
				//dbg_mapping SWLOGD("appropriate: %i %i %i %i %i %i %i %i\n",a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7]);
				//dbg_mapping SWLOGD("book: %s\n", dstSys->getBook(a[7]-1)->getOSISName());
				*book = dstSys->getBook(a[7]-1)->getOSISName();
			}
			return;
		}
		//dbg_mapping SWLOGD("There is no mapping.\n");
	}
	else if (strcmp(dstSys->getName(),"KJVA") && strcmp(dstSys->getName(),"KJV")) {
		const System *kjva = getSystemVersificationMgr()->getVersificationSystem("KJVA");
		const int src_verse = *verse;
		
		translateVerse(kjva, book, chapter, verse, verse_end);
		
		int interm_verse = *verse, interm_range = *verse_end, interm_chapter = *chapter;
		const char *interm_book = *book;
		
		kjva->translateVerse(dstSys, book, chapter, verse, verse_end);
		
		// contraction->expansion fix
		if (verse < verse_end && !(interm_verse < interm_range)) {
			kjva->translateVerse(this, &interm_book, &interm_chapter, &interm_verse, &interm_range);
			if (interm_verse < interm_range) {
				*verse += src_verse - interm_verse;
				if (*verse > *verse_end)
					*verse = *verse_end;
				else
					*verse_end = *verse;
			}
		}
	}
	else {
		//dbg_mapping SWLOGD("Perform forward mapping.\n");
		const int b = getBookNumberByOSISName(*book)-1;
		if (b >= (int)p->mappings.size())
			return;
		// forward mapping should use reversed search for item
		for (int i = (int)p->mappings[b].size()-1; i>=0; --i) {
			const unsigned char *m = p->mappings[b][i];
			if (m[1] < *chapter) {
				SWLog::getSystemLog()->logWarning("There is no mapping for this chapter.\n");
				return;
			}
			if (m[1] == *chapter && m[2] <= *verse) {
				//dbg_mapping SWLOGD("found mapping %i %i %i %i %i %i\n",m[1],m[2],m[3],m[4],m[5],m[6]);
				if (m[2] == *verse || (m[3] >= *verse && m[2] <= *verse)) {
					*chapter = m[4];
					*verse = m[5];
					*verse_end = m[6];
				}
				else {
					*chapter = m[4];
					// shift verse
					const int d = (m[6]>m[5]?m[6]:m[5])-(m[3]>m[2]?m[3]:m[2]);
					if (*verse < *verse_end)
						*verse_end += d;
					else
						*verse_end = (*verse) + d;
					*verse += d;
				}
				if (*m > p->books.size())
					*book = p->mappingsExtraBooks[m[0]-p->books.size()-1];
				return;
			}
		}
		//dbg_mapping SWLOGD("No mapping.\n");
	}
}

SWORD_NAMESPACE_END

