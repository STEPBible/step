/******************************************************************************
 *
 *  flatapi.cpp -	This file contains an api usable by non-C++
 *			environments
 *
 * $Id: flatapi.cpp 3822 2020-11-03 18:54:47Z scribe $
 *
 * Copyright 2002-2014 CrossWire Bible Society (http://www.crosswire.org)
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

#include <iostream>
#include <vector>
#include <map>

#include <swversion.h>
#include <swmgr.h>
#include <installmgr.h>
#include <remotetrans.h>
#include <versekey.h>
#include <treekeyidx.h>
#include <filemgr.h>
#include <stringmgr.h>
#include <swbuf.h>
#include <swlog.h>
#include <localemgr.h>
#include <utilstr.h>
#include <rtfhtml.h>

#ifdef BIBLESYNC
#include <biblesync.hh>
#endif

#include "corba/orbitcpp/webmgr.hpp"

extern "C" {
#include <flatapi.h>
}

using sword::VerseKey;
using sword::SWVersion;
using sword::SWBuf;
using sword::TreeKeyIdx;


#define GETSWMGR(handle, failReturn) HandleSWMgr *hmgr = (HandleSWMgr *)handle; if (!hmgr) return failReturn; WebMgr *mgr = hmgr->mgr; if (!mgr) return failReturn;

#define GETSWMODULE(handle, failReturn) HandleSWModule *hmod = (HandleSWModule *)handle; if (!hmod) return failReturn; SWModule *module = hmod->mod; if (!module) return failReturn;

#define GETINSTMGR(handle, failReturn) HandleInstMgr *hinstmgr = (HandleInstMgr *)handle; if (!hinstmgr) return failReturn; InstallMgr *installMgr = hinstmgr->installMgr; if (!installMgr) return failReturn;

namespace {


void clearStringArray(const char ***stringArray) {
	if (*stringArray) {
		for (int i = 0; true; ++i) {
			if ((*stringArray)[i]) {
				delete [] (*stringArray)[i];
			}
			else break;
		}
		free((*stringArray));
		(*stringArray) = 0;
	}
}


void clearModInfoArray(org_crosswire_sword_ModInfo **modInfo) {
	if (*modInfo) {
		for (int i = 0; true; ++i) {
			if ((*modInfo)[i].name) {
				delete [] (*modInfo)[i].name;
				delete [] (*modInfo)[i].description;
				delete [] (*modInfo)[i].category;
				delete [] (*modInfo)[i].language;
				delete [] (*modInfo)[i].version;
				delete [] (*modInfo)[i].delta;
				delete [] (*modInfo)[i].cipherKey;
				clearStringArray(&((*modInfo)[i].features));
			}
			else break;
		}
		free((*modInfo));
		(*modInfo) = 0;
	}
}


struct pu {
	char last;
	org_crosswire_sword_SWModule_SearchCallback progressReporter;
	void init(org_crosswire_sword_SWModule_SearchCallback pr) { progressReporter = pr; last = 0; }
};
void percentUpdate(char percent, void *userData) {
	struct pu *p = (struct pu *)userData;

	if (percent != p->last) {
		p->progressReporter((int)percent);
		p->last = percent;
	}
}

#ifdef BIBLESYNC

using std::string;
BibleSync *bibleSync = 0;
org_biblesync_MessageReceivedCallback bibleSyncListener = 0;

void bibleSyncCallback(char cmd, string pkt_uuid, string bible, string ref, string alt, string group, string domain, string info, string dump) {
SWLOGD("bibleSync callback msg: %c; pkt_uuid: %s; bible: %s; ref: %s; alt: %s; group: %s; domain: %s; info: %s; dump: %s", cmd, pkt_uuid.c_str(), bible.c_str(), ref.c_str(), alt.c_str(), group.c_str(), domain.c_str(), info.c_str(), dump.c_str());
	if (bibleSyncListener) {
SWLOGD("bibleSync listener is true");
		switch(cmd) {
		// error
		case 'E':
		// mismatch
		case 'M':
		// new speaker
		case 'S':
		// dead speaker
		case 'D':
		// announce
		case 'A':
			break;
		// chat message
		case 'C': {
SWLOGD("bibleSync Chat Received: %s", ref.c_str());
			(*bibleSyncListener)(cmd, group.c_str(), alt.c_str());
			break;
		}
		// navigation
		case 'N':
SWLOGD("bibleSync Nav Received: %s", ref.c_str());
			(*bibleSyncListener)(cmd, ref.c_str(), 0);
			break;
		}

	}
}
#endif

class MyStatusReporter : public StatusReporter {
public:
	unsigned long last;
	org_crosswire_sword_InstallMgr_StatusCallback statusReporter;
	MyStatusReporter() : last(0), statusReporter(0) {}
	void init(org_crosswire_sword_InstallMgr_StatusCallback sr) { statusReporter = sr; last = 0xffffffff; }

	virtual void update(unsigned long totalBytes, unsigned long completedBytes) {

		if (!statusReporter) return;

		if (completedBytes != last) {
			statusReporter("update", totalBytes, completedBytes);
			last = completedBytes;
		}
	}


	virtual void preStatus(long totalBytes, long completedBytes, const char *message) {

		if (!statusReporter) return;

		statusReporter(message, totalBytes, completedBytes);
/*
		SWBuf output;
		output.setFormatted("[ Total Bytes: %ld; Completed Bytes: %ld", totalBytes, completedBytes);
		while (output.size() < 75) output += " ";
		output += "]";
//		cout << "\n" << output.c_str() << "\n ";
//		int p = (int)(74.0 * (double)completedBytes/totalBytes);
//		for (int i = 0; i < p; ++i) { cout << "="; }
//		cout << "\n\n" << message << "\n";
		last = 0;
*/
	}

};

class HandleSWModule {
public:
	SWModule *mod;
	char *renderBuf;
	char *stripBuf;
	char *renderHeader;
	char *rawEntry;
	char *configEntry;
	struct pu peeuuu;
	org_crosswire_sword_SearchHit *searchHits;
	const char **entryAttributes;
	const char **parseKeyList;
	const char **keyChildren;

	HandleSWModule(SWModule *mod) : searchHits(0), entryAttributes(0), parseKeyList(0), keyChildren(0) {
		this->mod = mod;
		this->renderBuf = 0;
		this->stripBuf = 0;
		this->renderHeader = 0;
		this->rawEntry = 0;
		this->configEntry = 0;
	}
	~HandleSWModule() {
		delete [] renderBuf;
		delete [] stripBuf;
		delete [] renderHeader;
		delete [] rawEntry;
		delete [] configEntry;
		clearSearchHits();
		clearEntryAttributes();
		clearParseKeyList();
		clearKeyChildren();
	}

	void clearSearchHits() {
		if (searchHits) {
			for (int i = 0; true; ++i) {
				if (searchHits[i].modName) {
					delete [] searchHits[i].key;
				}
				else break;
			}
			free(searchHits);
			searchHits = 0;
		}
	}
	void clearEntryAttributes() {
		clearStringArray(&entryAttributes);
	}
	void clearParseKeyList() {
		clearStringArray(&parseKeyList);
	}
	void clearKeyChildren() {
		clearStringArray(&keyChildren);
	}
};


class HandleSWMgr {
public:
	WebMgr *mgr;
	org_crosswire_sword_ModInfo *modInfo;
	std::map<SWModule *, HandleSWModule *> moduleHandles;
	SWBuf filterBuf;
	static const char **globalOptions;
	static const char **globalOptionValues;
	static const char **availableLocales;

	HandleSWMgr(WebMgr *mgr) {
		this->mgr = mgr;
		this->modInfo = 0;
	}

	void clearModInfo() {
		clearModInfoArray(&modInfo);
	}

	~HandleSWMgr() {
		clearModInfo();
		for (std::map<SWModule *, HandleSWModule *>::const_iterator it = moduleHandles.begin(); it != moduleHandles.end(); ++it) {
			delete it->second;
		}
		delete mgr;
	}

	HandleSWModule *getModuleHandle(SWModule *mod) {
		if (!mod) return 0;
		if (moduleHandles.find(mod) == moduleHandles.end()) {
			moduleHandles[mod] = new HandleSWModule(mod);
		}
		return moduleHandles[mod];
	}

	static void clearGlobalOptions() {
		clearStringArray(&globalOptions);
	}

	static void clearGlobalOptionValues() {
		clearStringArray(&globalOptionValues);
	}

	static void clearAvailableLocales() {
		clearStringArray(&availableLocales);
	}
};


class HandleInstMgr {
public:
	static const char **remoteSources;
	InstallMgr *installMgr;
	org_crosswire_sword_ModInfo *modInfo;
	std::map<SWModule *, HandleSWModule *> moduleHandles;

	MyStatusReporter statusReporter;
	HandleInstMgr() : installMgr(0), modInfo(0) {}
	HandleInstMgr(InstallMgr *mgr) {
		this->installMgr = mgr;
		this->modInfo = 0;
	}

	~HandleInstMgr() {
		clearModInfo();
		for (std::map<SWModule *, HandleSWModule *>::const_iterator it = moduleHandles.begin(); it != moduleHandles.end(); ++it) {
			delete it->second;
		}
		delete installMgr;
	}

	HandleSWModule *getModuleHandle(SWModule *mod) {
		if (!mod) return 0;
		if (moduleHandles.find(mod) == moduleHandles.end()) {
			moduleHandles[mod] = new HandleSWModule(mod);
		}
		return moduleHandles[mod];
	}

	static void clearRemoteSources() {
		clearStringArray(&remoteSources);
	}

	void clearModInfo() {
		clearModInfoArray(&modInfo);
	}
};

org_crosswire_sword_StringMgr_toUpperUTF8 toUpperUTF8 = 0;

class FlatStringMgr : public StringMgr {
public:
	virtual char *upperUTF8(char *buf, unsigned int maxLen = 0) const {
		if (toUpperUTF8) {
			return (*toUpperUTF8)(buf, maxLen);
		}
		return buf;
	}
protected:
	virtual bool supportsUnicode() const { return toUpperUTF8 != 0; }
};


const char **HandleSWMgr::globalOptions = 0;
const char **HandleSWMgr::globalOptionValues = 0;
const char **HandleSWMgr::availableLocales = 0;

const char **HandleInstMgr::remoteSources = 0;

const char **tmpStringArrayRetVal = 0;
char *tmpStringRetVal = 0;

class InitStatics {
public:
	InitStatics() {

		HandleSWMgr::globalOptions = 0;
		HandleSWMgr::globalOptionValues = 0;
		HandleSWMgr::availableLocales = 0;

		HandleInstMgr::remoteSources = 0;

		if (!StringMgr::hasUTF8Support()) StringMgr::setSystemStringMgr(new FlatStringMgr());
	}
	~InitStatics() {

		HandleSWMgr::clearGlobalOptions();
		HandleSWMgr::clearGlobalOptionValues();

		HandleInstMgr::clearRemoteSources();

		clearStringArray(&tmpStringArrayRetVal);
		sword::stdstr(&tmpStringRetVal, (const char *)0);
		
	}
} _initStatics;


}

//
// SWLog methods
//
//

void SWDLLEXPORT org_crosswire_sword_SWLog_logError(const char *msg) {
	SWLog::getSystemLog()->logError(msg);
}

void SWDLLEXPORT org_crosswire_sword_SWLog_logDebug(const char *msg) {
	SWLog::getSystemLog()->logDebug(msg);
}

void SWDLLEXPORT org_crosswire_sword_SWLog_logWarning(const char *msg) {
	SWLog::getSystemLog()->logWarning(msg);
}

void SWDLLEXPORT org_crosswire_sword_SWLog_logInformation(const char *msg) {
	SWLog::getSystemLog()->logInformation(msg);
}

void SWDLLEXPORT org_crosswire_sword_SWLog_logTimedInformation(const char *msg) {
	SWLog::getSystemLog()->logTimedInformation(msg);
}

void SWDLLEXPORT org_crosswire_sword_SWLog_setLogLevel(int level) {
	SWLog::getSystemLog()->setLogLevel((char)level);
}

int SWDLLEXPORT org_crosswire_sword_SWLog_getLogLevel() {
	return SWLog::getSystemLog()->getLogLevel();
}


//
// SWModule methods
//
//

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    terminateSearch
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_terminateSearch
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, );

	module->terminateSearch = true;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    search
 * Signature: (Ljava/lang/String;IJLjava/lang/String;Lorg/crosswire/sword/SWModule/SearchProgressReporter;)[Lorg/crosswire/sword/SWModule/SearchHit;
 */
const struct org_crosswire_sword_SearchHit * SWDLLEXPORT org_crosswire_sword_SWModule_search
  (SWHANDLE hSWModule, const char *searchString, int searchType, long flags, const char *scope, org_crosswire_sword_SWModule_SearchCallback progressReporter) {

	GETSWMODULE(hSWModule, 0);

	hmod->clearSearchHits();

	sword::ListKey lscope;
	sword::ListKey result;


	hmod->peeuuu.init(progressReporter);
	if ((scope) && (strlen(scope)) > 0) {
		sword::SWKey *p = module->createKey();
		sword::VerseKey *parser = SWDYNAMIC_CAST(VerseKey, p);
		if (!parser) {
			delete p;
			parser = new VerseKey();
		}
		*parser = module->getKeyText();
		lscope = parser->parseVerseList(scope, *parser, true);
		result = module->search(searchString, searchType, flags, &lscope, 0, &percentUpdate, &(hmod->peeuuu));
		delete parser;
	}
	else	result = module->search(searchString, searchType, flags, 0, 0, &percentUpdate, &(hmod->peeuuu));

	int count = 0;
	for (result = sword::TOP; !result.popError(); result++) count++;

	// if we're sorted by score, let's re-sort by verse, because Java can always re-sort by score
	result = sword::TOP;
	if ((count) && (long)result.getElement()->userData)
		result.sort();

	struct org_crosswire_sword_SearchHit *retVal = (struct org_crosswire_sword_SearchHit *)calloc(count+1, sizeof(struct org_crosswire_sword_SearchHit));
	
	int i = 0;
	for (result = sword::TOP; !result.popError(); result++) {
		// don't alloc this; we have a persistent const char * in SWModule we can just reference
		retVal[i].modName = module->getName();
		stdstr(&(retVal[i].key), assureValidUTF8(result.getShortText()));
		retVal[i++].score = (long)result.getElement()->userData;
		// in case we limit count to a max number of hits
		if (i >= count) break;
	}
	hmod->searchHits = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    error
 * Signature: ()C
 */
char SWDLLEXPORT org_crosswire_sword_SWModule_popError
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, -1);

	return module->popError();
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getEntrySize
 * Signature: ()J
 */
long SWDLLEXPORT org_crosswire_sword_SWModule_getEntrySize
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	return module->getEntrySize();
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getEntryAttribute
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWModule_getEntryAttribute
  (SWHANDLE hSWModule, const char *level1, const char *level2, const char *level3, char filteredBool) {

	GETSWMODULE(hSWModule, 0);

	hmod->clearEntryAttributes();

	module->renderText();	// force parse
	std::vector<SWBuf> results;

	sword::AttributeTypeList &entryAttribs = module->getEntryAttributes();
	sword::AttributeTypeList::const_iterator i1Start, i1End;
	sword::AttributeList::const_iterator i2Start, i2End;
	sword::AttributeValue::const_iterator i3Start, i3End;

	if ((level1) && (*level1) && *level1 != '-') {
		i1Start = entryAttribs.find(level1);
		i1End = i1Start;
		if (i1End != entryAttribs.end())
			++i1End;
	}
	else {
		i1Start = entryAttribs.begin();
		i1End   = entryAttribs.end();
	}
	for (;i1Start != i1End; ++i1Start) {
		if (level1 && *level1 && *level1 == '-') {
			results.push_back(i1Start->first);
		}
		else {
			if (level2 && *level2 && *level2 != '-') {
				i2Start = i1Start->second.find(level2);
				i2End = i2Start;
				if (i2End != i1Start->second.end())
					++i2End;
			}
			else {
				i2Start = i1Start->second.begin();
				i2End   = i1Start->second.end();
			}
			for (;i2Start != i2End; ++i2Start) {
				if (level2 && *level2 && *level2 == '-') {
					results.push_back(i2Start->first);
				}
				else {
					// allow '-' to get all keys; allow '*' to get all key=value
					if (level3 && *level3 && *level3 != '-' && *level3 != '*') {
						i3Start = i2Start->second.find(level3);
						i3End = i3Start;
						if (i3End != i2Start->second.end())
							++i3End;
					}
					else {
						i3Start = i2Start->second.begin();
						i3End   = i2Start->second.end();
					}
					for (;i3Start != i3End; ++i3Start) {
						if (level3 && *level3 && *level3 == '-') {
							results.push_back(i3Start->first);
						}
						else if (level3 && *level3 && *level3 == '*') {
							results.push_back(i3Start->first + "=" + i3Start->second);
						}
						else {
							results.push_back(i3Start->second);
						}
					}
					if (i3Start != i3End)
						break;
				}
			}
			if (i2Start != i2End)
				break;
		}
	}

	const char **retVal = (const char **)calloc(results.size()+1, sizeof(const char *));
	for (int i = 0; i < (int)results.size(); i++) {
		if (filteredBool) {
			stdstr((char **)&(retVal[i]), assureValidUTF8(module->renderText(results[i].c_str())));
		}
		else {
			stdstr((char **)&(retVal[i]), assureValidUTF8(results[i].c_str()));
		}
	}

	hmod->entryAttributes = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    parseKeyList
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWModule_parseKeyList
  (SWHANDLE hSWModule, const char *keyText) {

	GETSWMODULE(hSWModule, 0);

	hmod->clearParseKeyList();

	sword::VerseKey *parser = dynamic_cast<VerseKey *>(module->getKey());
	const char **retVal = 0;
	if (parser) {
		sword::ListKey result;
		result = parser->parseVerseList(keyText, *parser, true);
		int count = 0;
		for (result = sword::TOP; !result.popError(); result++) {
			count++;
		}
		retVal = (const char **)calloc(count+1, sizeof(const char *));
		count = 0;
		for (result = sword::TOP; !result.popError(); result++) {
			stdstr((char **)&(retVal[count++]), assureValidUTF8(VerseKey(result).getOSISRef()));
		}
	}
	else	{
		retVal = (const char **)calloc(2, sizeof(const char *));
		stdstr((char **)&(retVal[0]), assureValidUTF8(keyText));
	}

	hmod->parseKeyList = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    setKeyText
 * Signature: (Ljava/lang/String;)V
 */
// Special values handled for VerseKey modules:
//	[+-][book|chapter]	- [de|in]crement by chapter or book
//	(e.g.	"+chapter" will increment the VerseKey 1 chapter)
//	[=][key]		- position absolutely and don't normalize
//	(e.g.	"jn.1.0" for John Chapter 1 intro; "jn.0.0" For Book of John Intro)
void SWDLLEXPORT org_crosswire_sword_SWModule_setKeyText
  (SWHANDLE hSWModule, const char *keyText) {

	GETSWMODULE(hSWModule, );

	sword::SWKey *key = module->getKey();
	sword::VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
	if (vkey) {
		if ((*keyText=='+' || *keyText=='-')) {
			if (!sword::stricmp(keyText+1, "book")) {
				vkey->setBook(vkey->getBook() + ((*keyText=='+')?1:-1));
				return;
			}
			else if (!sword::stricmp(keyText+1, "chapter")) {
				vkey->setChapter(vkey->getChapter() + ((*keyText=='+')?1:-1));
				return;
			}
		}
		else if (*keyText=='=') {
			vkey->setIntros(true);
			vkey->setAutoNormalize(false);
			vkey->setText(keyText+1);
			return;
		}
	}

	module->setKey(keyText);
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getKeyText
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getKeyText
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	return module->getKeyText();
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    hasKeyChildren
 * Signature: ()Z
 */
char SWDLLEXPORT org_crosswire_sword_SWModule_hasKeyChildren
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	sword::SWKey *key = module->getKey();
	char retVal = 0;

	TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
	if (tkey) {
		retVal = tkey->hasChildren()?1:0;
	}
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getKeyChildren
 * Signature: ()[Ljava/lang/String;
 */

// This method returns child nodes for a genbook,
// but has special handling if called on a VerseKey module:
//  [0..] [org_crosswire_sword_SWModule_VERSEKEY_TESTAMENT, VERSEKEY_BOOK, VERSEKEY_CHAPTER, VERSEKEY_VERSE, VERSEKEY_CHAPTERMAX, ... ]
const char ** SWDLLEXPORT org_crosswire_sword_SWModule_getKeyChildren
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	hmod->clearKeyChildren();

	sword::SWKey *key = module->getKey();
	const char **retVal = 0;
	int count = 0;

	sword::VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
	if (vkey) {
		retVal = (const char **)calloc(12, sizeof(const char *));
		SWBuf num;
		num.appendFormatted("%d", vkey->getTestament());
		stdstr((char **)&(retVal[0]), num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getBook());
		stdstr((char **)&(retVal[1]), num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getChapter());
		stdstr((char **)&(retVal[2]), num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getVerse());
		stdstr((char **)&(retVal[3]), num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getChapterMax());
		stdstr((char **)&(retVal[4]), num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getVerseMax());
		stdstr((char **)&(retVal[5]), num.c_str());
		stdstr((char **)&(retVal[6]), vkey->getBookName());
		stdstr((char **)&(retVal[7]), vkey->getOSISRef());
		stdstr((char **)&(retVal[8]), vkey->getShortText());
		stdstr((char **)&(retVal[9]), vkey->getBookAbbrev());
		stdstr((char **)&(retVal[10]), vkey->getOSISBookName());
	}
	else {
		TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
		if (tkey) {
			if (tkey->firstChild()) {
				do {
					count++;
				}
				while (tkey->nextSibling());
				tkey->parent();
			}
			retVal = (const char **)calloc(count+1, sizeof(const char *));
			count = 0;
			if (tkey->firstChild()) {
				do {
					stdstr((char **)&(retVal[count++]), assureValidUTF8(tkey->getLocalName()));
				}
				while (tkey->nextSibling());
				tkey->parent();
			}
		}
	}

	hmod->keyChildren = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getName
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getName
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	return module->getName();
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getDescription
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getDescription
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	return module->getDescription();
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getCategory
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getCategory
  (SWHANDLE hSWModule) {

	static SWBuf type;

	GETSWMODULE(hSWModule, 0);

	type = module->getType();
	SWBuf cat = module->getConfigEntry("Category");
	if (cat.length() > 0)
		type = cat;

	return type.c_str();
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getKeyParent
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getKeyParent
  (SWHANDLE hSWModule) {

	static SWBuf retVal;

	GETSWMODULE(hSWModule, 0);

	sword::SWKey *key = module->getKey();

	retVal = "";

	TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
	if (tkey) {
		if (tkey->parent()) {
			retVal = tkey->getText();
		}
	}
	return assureValidUTF8(retVal.c_str());
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    previous
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_previous
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, );

	module->decrement();
}


/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    next
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_next
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, );

	module->increment();
}


/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    begin
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_begin
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, );

	module->setPosition(sword::TOP);
}


/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getStripText
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_stripText
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	stdstr(&(hmod->stripBuf), assureValidUTF8((const char *)module->stripText()));

	return hmod->stripBuf;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getRenderText
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_renderText
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	stdstr(&(hmod->renderBuf), assureValidUTF8((const char *)module->renderText().c_str()));

	return hmod->renderBuf;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getRenderHeader
 * Signature: ()Ljava/lang/String;
 */
// CSS styles associated with this text
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getRenderHeader
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	stdstr(&(hmod->renderHeader), assureValidUTF8(((const char *)(module->getRenderHeader() ? module->getRenderHeader():""))));

	return hmod->renderHeader;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getRawEntry
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getRawEntry
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	stdstr(&(hmod->rawEntry), assureValidUTF8(((const char *)module->getRawEntry())));

	return hmod->rawEntry;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    setRawEntry
 * Signature: (Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_setRawEntry
  (SWHANDLE hSWModule, const char *entryBuffer) {

	GETSWMODULE(hSWModule, );

	module->setEntry(entryBuffer);
}


/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getConfigEntry
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getConfigEntry
  (SWHANDLE hSWModule, const char *key) {

	GETSWMODULE(hSWModule, 0);

	const char *exists = module->getConfigEntry(key);
	SWBuf confValue = exists;
	// special processing if we're requesting About-- kindof cheese
	if (!strcmp("About", key) && exists) {
		RTFHTML().processText(confValue);
	}
	SWBuf assuredBuf = assureValidUTF8(confValue.c_str());
	stdstr(&(hmod->configEntry), (exists ? assuredBuf.c_str() : 0));

	return hmod->configEntry;
}

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    deleteSearchFramework
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_deleteSearchFramework
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, );

	module->deleteSearchFramework(); 
}


/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    hasSearchFramework
 * Signature: ()Z
 */
char SWDLLEXPORT org_crosswire_sword_SWModule_hasSearchFramework
  (SWHANDLE hSWModule) {

	GETSWMODULE(hSWModule, 0);

	return (module->hasSearchFramework() && module->isSearchOptimallySupported("God", -4, 0, 0));
}




//
// SWMgr methods
//
//


/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    new
 * Signature: ()V
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_SWMgr_new() { 
	SWConfig *sysConf = 0;
	return (SWHANDLE) new HandleSWMgr(new WebMgr(sysConf));
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    new
 * Signature: ()V
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_SWMgr_newWithPath(const char *path) { 
	SWBuf confPath = path;
	if (!confPath.endsWith("/")) confPath.append('/');
	SWBuf modsd = confPath + "mods.d";
	// be sure we have at least some config file already out there
	if (!FileMgr::existsFile(modsd.c_str())) {
		modsd.append("/globals.conf");
		FileMgr::createParent(modsd.c_str());
		SWConfig config(modsd.c_str());
		config["Globals"]["HiAndroid"] = "weeee";
		config.save();
	}
	SWBuf extraPath = confPath + "extraConfig.conf";
	bool exists = FileMgr::existsFile(extraPath.c_str());
SWLOGD("libsword: extraConfig %s at path: %s", exists?"Exists":"Absent", extraPath.c_str());

SWLOGD("libsword: init() adding locales from baseDir.");
	LocaleMgr::getSystemLocaleMgr()->loadConfigDir(SWBuf(confPath + "locales.d").c_str());
	LocaleMgr::getSystemLocaleMgr()->loadConfigDir(SWBuf(confPath + "uilocales.d").c_str());
SWLOGD("libsword: init() creating WebMgr using path: %s", path);
	return (SWHANDLE) new HandleSWMgr(new WebMgr(confPath.c_str(), exists?extraPath.c_str():0));
}


/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    delete
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_delete(SWHANDLE hSWMgr) {
	HandleSWMgr *hmgr = (HandleSWMgr *)hSWMgr;
	if (hmgr) delete hmgr;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    version
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_version
  (SWHANDLE hSWMgr) {
	// we don't actually need an SWMgr to get version
	static SWVersion v;
	return v.currentVersion;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getModInfoList
 * Signature: ()[Lorg/crosswire/sword/SWMgr/ModInfo;
 */
const struct org_crosswire_sword_ModInfo * SWDLLEXPORT org_crosswire_sword_SWMgr_getModInfoList
  (SWHANDLE hSWMgr) {

	GETSWMGR(hSWMgr, 0);

	sword::SWModule *module = 0;

	hmgr->clearModInfo();

	int size = 0;
	for (sword::ModMap::const_iterator it = mgr->getModules().begin(); it != mgr->getModules().end(); ++it) {
		if ((!(it->second->getConfigEntry("CipherKey"))) || (*(it->second->getConfigEntry("CipherKey"))))
			size++;
	}

	struct org_crosswire_sword_ModInfo *milist = (struct org_crosswire_sword_ModInfo *)calloc(size+1, sizeof(struct org_crosswire_sword_ModInfo));
	int i = 0;
	for (sword::ModMap::const_iterator it = mgr->getModules().begin(); it != mgr->getModules().end(); ++it) {
		module = it->second;
		SWBuf type = module->getType();
		SWBuf cat = module->getConfigEntry("Category");
		SWBuf version = module->getConfigEntry("Version");
		if (cat.length() > 0) type = cat;
		stdstr(&(milist[i].name), assureValidUTF8(module->getName()));
		stdstr(&(milist[i].description), assureValidUTF8(module->getDescription()));
		stdstr(&(milist[i].category), assureValidUTF8(type.c_str()));
		stdstr(&(milist[i].language), assureValidUTF8(module->getLanguage()));
		stdstr(&(milist[i].version), assureValidUTF8(version.c_str()));
		stdstr(&(milist[i].delta), "");
		const char *cipherKey = module->getConfigEntry("CipherKey");
		if (cipherKey) {
			stdstr(&(milist[i].cipherKey), assureValidUTF8(cipherKey));
		}
		else	milist[i].cipherKey = 0;

		ConfigEntMap::const_iterator start = module->getConfig().lower_bound("Feature");
		ConfigEntMap::const_iterator end   = module->getConfig().upper_bound("Feature");

		int featureCount = 0;
		for (ConfigEntMap::const_iterator it = start; it != end; ++it) {
			++featureCount;
		}
		milist[i].features = (const char **)calloc(featureCount+1, sizeof(const char *));
		featureCount = 0;
		for (ConfigEntMap::const_iterator it = start; it != end; ++it) {
			stdstr((char **)&(milist[i].features[featureCount++]), assureValidUTF8(it->second));
		}

		if (++i >= size) break;
	}
	hmgr->modInfo = milist;
	return milist;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getModuleByName
 * Signature: (Ljava/lang/String;)Lorg/crosswire/sword/SWModule;
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_SWMgr_getModuleByName
  (SWHANDLE hSWMgr, const char *moduleName) {

	GETSWMGR(hSWMgr, 0);

	return (SWHANDLE)hmgr->getModuleHandle(hmgr->mgr->getModule(moduleName));
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getPrefixPath
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getPrefixPath
  (SWHANDLE hSWMgr) {

	GETSWMGR(hSWMgr, 0);

	return mgr->prefixPath;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getConfigPath
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getConfigPath
  (SWHANDLE hSWMgr) {

	GETSWMGR(hSWMgr, 0);

	return mgr->configPath;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setGlobalOption
 * Signature: (Ljava/lang/String;Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setGlobalOption
  (SWHANDLE hSWMgr, const char *option, const char *value) {

	GETSWMGR(hSWMgr, );
	mgr->setGlobalOption(option, value);
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOption
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOption
  (SWHANDLE hSWMgr, const char *option) {

	GETSWMGR(hSWMgr, 0);

	return mgr->getGlobalOption(option);
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOptionTip
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOptionTip
  (SWHANDLE hSWMgr, const char *option) {

	GETSWMGR(hSWMgr, 0);

	return mgr->getGlobalOptionTip(option);
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    filterText
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_filterText
  (SWHANDLE hSWMgr, const char *filterName, const char *text) {

	GETSWMGR(hSWMgr, 0);

	hmgr->filterBuf = text;

// why was this in bindings/corba/omniorb?
//	mgr->setGlobalOption("Greek Accents", "Off");

	char errStatus = mgr->filterText(filterName, hmgr->filterBuf);
	(void)errStatus;
	return hmgr->filterBuf.c_str();
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOptions
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOptions
  (SWHANDLE hSWMgr) {

	GETSWMGR(hSWMgr, 0);

	const char **retVal;
	hmgr->clearGlobalOptions();

	sword::StringList options = mgr->getGlobalOptions();
	int count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	retVal = (const char **)calloc(count+1, sizeof(const char *));
	count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		stdstr((char **)&(retVal[count++]), it->c_str());
	}

	hmgr->globalOptions = retVal;
	return retVal;
}


/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    getSections
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWConfig_getSections
		(const char *confPath) {

	clearStringArray(&tmpStringArrayRetVal);
	int count = 0;
	const char **retVal = 0;
	bool exists = FileMgr::existsFile(confPath);
SWLOGD("libsword: getConfigSections %s at path: %s", exists?"Exists":"Absent", confPath);
	if (exists) {
		SWConfig config(confPath);
		SectionMap::const_iterator sit;
		for (sit = config.getSections().begin(); sit != config.getSections().end(); ++sit) {
			count++;
		}
SWLOGD("libsword: %d sections found in config", count);
		retVal = (const char **)calloc(count+1, sizeof(const char *));
		count = 0;
		for (sit = config.getSections().begin(); sit != config.getSections().end(); ++sit) {
			stdstr((char **)&(retVal[count++]), assureValidUTF8(sit->first.c_str()));
		}
	}
	else {
		retVal = (const char **)calloc(1, sizeof(const char *));
	}

	tmpStringArrayRetVal = retVal;
	return retVal;
}



/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    getSectionKeys
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWConfig_getSectionKeys
		(const char *confPath, const char *section) {

	clearStringArray(&tmpStringArrayRetVal);
	int count = 0;
	const char **retVal = 0;
	bool exists = FileMgr::existsFile(confPath);
	if (exists) {
		SWConfig config(confPath);
		SectionMap::const_iterator sit = config.getSections().find(section);
		if (sit != config.getSections().end()) {
			ConfigEntMap::const_iterator it;
			for (it = sit->second.begin(); it != sit->second.end(); ++it) {
				count++;
			}
			retVal = (const char **)calloc(count+1, sizeof(const char *));
			count = 0;
			for (it = sit->second.begin(); it != sit->second.end(); ++it) {
				stdstr((char **)&(retVal[count++]), assureValidUTF8(it->first.c_str()));
			}
		}
		else {
			retVal = (const char **)calloc(1, sizeof(const char *));
		}
	}
	else {
		retVal = (const char **)calloc(1, sizeof(const char *));
	}

	tmpStringArrayRetVal = retVal;
	return retVal;
}


/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    getKeyValue
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWConfig_getKeyValue
		(const char *confPath, const char *section, const char *key) {

	stdstr(&tmpStringRetVal, 0);
	bool exists = FileMgr::existsFile(confPath);
	if (exists) {
		SWConfig config(confPath);
		SectionMap::const_iterator sit = config.getSections().find(section);
		if (sit != config.getSections().end()) {
			ConfigEntMap::const_iterator it = sit->second.find(key);
			if (it != sit->second.end()) {
				stdstr(&tmpStringRetVal, assureValidUTF8(it->second.c_str()));
			}
		}
	}

	return tmpStringRetVal;
}


/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    setKeyValue
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWConfig_setKeyValue
		(const char *confPath, const char *section, const char *key, const char *value) {

	SWConfig config(confPath);
	config[section][key] = value;
	config.save();
}


/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    augmentConfig
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWConfig_augmentConfig
		(const char *confPath, const char *configBlob) {


	clearStringArray(&tmpStringArrayRetVal);
	const char **retVal = 0;
	int count = 0;

	SWBuf myBlob = configBlob;

	SWConfig config(confPath);

	FileMgr::removeFile(confPath);
	FileDesc *fd = FileMgr::getSystemFileMgr()->open(confPath, FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	fd->getFd();
	fd->write(myBlob.c_str(), myBlob.size());
	FileMgr::getSystemFileMgr()->close(fd);

	SWConfig newConfig(confPath);

	config.augment(newConfig);
	config.save();

	SectionMap::const_iterator sit;
	for (sit = newConfig.getSections().begin(); sit != newConfig.getSections().end(); ++sit) {
		count++;
	}
	retVal = (const char **)calloc(count+1, sizeof(const char *));
	count = 0;
	for (sit = newConfig.getSections().begin(); sit != newConfig.getSections().end(); ++sit) {
		stdstr((char **)&(retVal[count++]), assureValidUTF8(sit->first.c_str()));
	}

	tmpStringArrayRetVal = retVal;
	return retVal;
}


/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOptionValues
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOptionValues
  (SWHANDLE hSWMgr, const char *option) {

	GETSWMGR(hSWMgr, 0);

	const char **retVal = 0;
	hmgr->clearGlobalOptionValues();

	sword::StringList options = mgr->getGlobalOptionValues(option);
	int count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	retVal = (const char **)calloc(count+1, sizeof(const char *));
	count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		stdstr((char **)&(retVal[count++]), it->c_str());
	}

	hmgr->globalOptionValues = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setCipherKey
 * Signature: (Ljava/lang/String;Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setCipherKey
  (SWHANDLE hSWMgr, const char *modName, const char *key) {

	GETSWMGR(hSWMgr, );

	mgr->setCipherKey(modName, key);
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setJavascript
 * Signature: (Z)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setJavascript
  (SWHANDLE hSWMgr, char valueBool) {

	GETSWMGR(hSWMgr, );

	mgr->setJavascript(valueBool);
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getAvailableLocales
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWMgr_getAvailableLocales
  (SWHANDLE hSWMgr) {

	GETSWMGR(hSWMgr, 0);

	hmgr->clearAvailableLocales();
	sword::StringList localeNames = LocaleMgr::getSystemLocaleMgr()->getAvailableLocales();
	const char **retVal = 0;
	int count = 0;
	for (sword::StringList::const_iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		count++;
	}
	retVal = (const char **)calloc(count+1, sizeof(const char *));
	count = 0;
	for (sword::StringList::const_iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		stdstr((char **)&(retVal[count++]), it->c_str());
	}

	hmgr->availableLocales = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setDefaultLocale
 * Signature: (Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setDefaultLocale
  (SWHANDLE hSWMgr, const char *name) {

	// we don't actually need an SWMgr instance for this
	GETSWMGR(hSWMgr, );

	LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(name);
}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    translate
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_translate
  (SWHANDLE hSWMgr, const char *text, const char *localeName) {

	GETSWMGR(hSWMgr, 0);

	return LocaleMgr::getSystemLocaleMgr()->translate(text, localeName);
}




//
// InstallMgr methods
//
//

void SWDLLEXPORT org_crosswire_sword_StringMgr_setToUpper
  (org_crosswire_sword_StringMgr_toUpperUTF8 toUpperUTF8Funct) {
	toUpperUTF8 = toUpperUTF8Funct;
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    new
 * Signature: (Ljava/lang/String;Lorg/crosswire/sword/SWModule/SearchProgressReporter;)V
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_InstallMgr_new
  (const char *baseDir, org_crosswire_sword_InstallMgr_StatusCallback statusReporter) {
	SWBuf confPath = SWBuf(baseDir) + "/InstallMgr.conf";
	// be sure we have at least some config file already out there
	if (!FileMgr::existsFile(confPath.c_str())) {
		FileMgr::createParent(confPath.c_str());
//		remove(confPath.c_str());

		SWConfig config(confPath.c_str());
		config["General"]["PassiveFTP"] = "true";
		config.save();
	}
	HandleInstMgr *hinstmgr = new HandleInstMgr();
	hinstmgr->statusReporter.init(statusReporter);
	hinstmgr->installMgr = new InstallMgr(baseDir, &(hinstmgr->statusReporter));
	return (SWHANDLE) hinstmgr;
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    delete
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_InstallMgr_delete
  (SWHANDLE hInstallMgr) {
	HandleInstMgr *hinstMgr = (HandleInstMgr *)hInstallMgr;
	if (hinstMgr) delete hinstMgr;
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    setUserDisclaimerConfirmed
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed
  (SWHANDLE hInstallMgr) {

	GETINSTMGR(hInstallMgr, );

	installMgr->setUserDisclaimerConfirmed(true);
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    syncConfig
 * Signature: ()I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_syncConfig
  (SWHANDLE hInstallMgr) {

	GETINSTMGR(hInstallMgr, -1);

	return installMgr->refreshRemoteSourceConfiguration();
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    uninstallModule
 * Signature: (Lorg/crosswire/sword/SWMgr;Ljava/lang/String;)I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_uninstallModule
  (SWHANDLE hInstallMgr, SWHANDLE hSWMgr_removeFrom, const char *modName) {

	GETINSTMGR(hInstallMgr, -1);
	GETSWMGR(hSWMgr_removeFrom, -1);

	SWModule *module = mgr->getModule(modName);
	if (!module) {
		return -2;
	}
	return installMgr->removeModule(mgr, module->getName());
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    getRemoteSources
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_InstallMgr_getRemoteSources
  (SWHANDLE hInstallMgr) {

	GETINSTMGR(hInstallMgr, 0);

	hinstmgr->clearRemoteSources();
	sword::StringList vals = LocaleMgr::getSystemLocaleMgr()->getAvailableLocales();
	const char **retVal = 0;
	int count = 0;
	for (InstallSourceMap::const_iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); ++it) {
		count++;
	}
	retVal = (const char **)calloc(count+1, sizeof(const char *));
	count = 0;
	for (InstallSourceMap::const_iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); ++it) {
		stdstr((char **)&(retVal[count++]), it->second->caption.c_str());
	}

	hinstmgr->remoteSources = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    refreshRemoteSource
 * Signature: (Ljava/lang/String;)I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_refreshRemoteSource
  (SWHANDLE hInstallMgr, const char *sourceName) {

	GETINSTMGR(hInstallMgr, -1);

	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
		return -3;
	}

	return installMgr->refreshRemoteSource(source->second);
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    getRemoteModInfoList
 * Signature: (Lorg/crosswire/sword/SWMgr;Ljava/lang/String;)[Lorg/crosswire/sword/SWMgr/ModInfo;
 */
const struct org_crosswire_sword_ModInfo * SWDLLEXPORT org_crosswire_sword_InstallMgr_getRemoteModInfoList
  (SWHANDLE hInstallMgr, SWHANDLE hSWMgr_deltaCompareTo, const char *sourceName) {

	GETINSTMGR(hInstallMgr, 0);
	GETSWMGR(hSWMgr_deltaCompareTo, 0);

	struct org_crosswire_sword_ModInfo *retVal = 0;

	hinstmgr->clearModInfo();

	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
		retVal = (struct org_crosswire_sword_ModInfo *)calloc(1, sizeof(struct org_crosswire_sword_ModInfo));
		hinstmgr->modInfo = retVal;
		return retVal;
	}

	std::map<SWModule *, int> modStats = installMgr->getModuleStatus(*mgr, *source->second->getMgr());

	int size = 0;
	for (std::map<SWModule *, int>::const_iterator it = modStats.begin(); it != modStats.end(); ++it) {
		size++;
	}
	retVal = (struct org_crosswire_sword_ModInfo *)calloc(size+1, sizeof(struct org_crosswire_sword_ModInfo));
	int i = 0;
	for (std::map<SWModule *, int>::const_iterator it = modStats.begin(); it != modStats.end(); ++it) {
		SWModule *module = it->first;
		int status = it->second;

		SWBuf version = module->getConfigEntry("Version");
		SWBuf statusString = " ";
		if (status & InstallMgr::MODSTAT_NEW) statusString = "*";
		if (status & InstallMgr::MODSTAT_OLDER) statusString = "-";
		if (status & InstallMgr::MODSTAT_UPDATED) statusString = "+";

		SWBuf type = module->getType();
		SWBuf cat = module->getConfigEntry("Category");
		if (cat.length() > 0) type = cat;

		stdstr(&(retVal[i].name), assureValidUTF8(module->getName()));
		stdstr(&(retVal[i].description), assureValidUTF8(module->getDescription()));
		stdstr(&(retVal[i].category), assureValidUTF8(type.c_str()));
		stdstr(&(retVal[i].language), assureValidUTF8(module->getLanguage()));
		stdstr(&(retVal[i].version), assureValidUTF8(version.c_str()));
		stdstr(&(retVal[i].delta), assureValidUTF8(statusString.c_str()));
		const char *cipherKey = module->getConfigEntry("CipherKey");
		if (cipherKey) {
			stdstr(&(retVal[i].cipherKey), assureValidUTF8(cipherKey));
		}
		else	retVal[i].cipherKey = 0;

		ConfigEntMap::const_iterator start = module->getConfig().lower_bound("Feature");
		ConfigEntMap::const_iterator end   = module->getConfig().upper_bound("Feature");

		int featureCount = 0;
		for (ConfigEntMap::const_iterator it = start; it != end; ++it) {
			++featureCount;
		}
		retVal[i].features = (const char **)calloc(featureCount+1, sizeof(const char *));
		featureCount = 0;
		for (ConfigEntMap::const_iterator it = start; it != end; ++it) {
			stdstr((char **)&(retVal[i].features[featureCount++]), assureValidUTF8(it->second));
		}
		if (++i >= size) break;
	}
	hinstmgr->modInfo = retVal;
	return retVal;
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    remoteInstallModule
 * Signature: (Lorg/crosswire/sword/SWMgr;Ljava/lang/String;Ljava/lang/String;)I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_remoteInstallModule
  (SWHANDLE hInstallMgr_from, SWHANDLE hSWMgr_to, const char *sourceName, const char *modName) {

	GETINSTMGR(hInstallMgr_from, -1);
	GETSWMGR(hSWMgr_to, -1);

	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);

	if (source == installMgr->sources.end()) {
		return -3;
	}

	InstallSource *is = source->second;
	SWMgr *rmgr = is->getMgr();
	SWModule *module = rmgr->getModule(modName);

	if (!module) {
		return -4;
	}

	int error = installMgr->installModule(mgr, 0, module->getName(), is);

	return error;
}

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    getRemoteModuleByName
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Lorg/crosswire/sword/SWModule;
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_InstallMgr_getRemoteModuleByName
  (SWHANDLE hInstallMgr, const char *sourceName, const char *modName) {

	GETINSTMGR(hInstallMgr, 0);

	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);

	if (source == installMgr->sources.end()) {
		return 0;
	}

	SWMgr *mgr = source->second->getMgr();

	sword::SWModule *module = mgr->getModule(modName);

	if (!module) {
		return 0;
	}

	return (SWHANDLE)hinstmgr->getModuleHandle(module);

}

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    sendBibleSyncMessage
 * Signature: (Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_sendBibleSyncMessage
		(SWHANDLE hMgr, const char *osisRefRaw) {
SWLOGD("libsword: sendBibleSyncMessage() begin");

#ifdef BIBLESYNC
	if (!bibleSync) {
SWLOGD("libsword: sendBibleSyncMessage() bibleSync not active; message not sent.");
		return;
	}
	SWBuf modName = "Bible";
	SWBuf osisRef = osisRefRaw;
	const char *modNamePrefix = osisRef.stripPrefix(':');
	if (modNamePrefix) modName = modNamePrefix;

	BibleSync_xmit_status result = bibleSync->Transmit(modName.c_str(), osisRef.c_str());
SWLOGD("libsword: sendBibleSyncMessage() finished with status code: %d", result);
#else
SWLOGD("libsword: sendBibleSyncMessage() bibleSync not active; message not sent.");
#endif

}


/*
 * NOTE: this method blocks and should be called in a new thread
 * Class:     org_crosswire_sword_SWMgr
 * Method:    startBibleSync
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lorg/crosswire/sword/SWMgr/BibleSyncListener;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_startBibleSync
  (SWHANDLE hMgr, const char *appNameJS, const char *userNameJS, const char *passphraseJS, org_biblesync_MessageReceivedCallback callback) {

SWLOGD("startBibleSync() start");
	// only one thread
	static bool starting = false;
	if (starting) return;
	starting = true;
	// kill any previous loop
#ifdef BIBLESYNC
	if (bibleSyncListener) bibleSyncListener = 0;
	SWBuf appName = appNameJS;
	SWBuf userName = userNameJS;
	SWBuf passphrase = passphraseJS;

	// in case we're restarting, wait for our loop to finish for sure
	if (bibleSync) {
SWLOGD("startBibleSync() sleeping 3 seconds");
		sleep(3);
	}

	bibleSyncListener = callback;
SWLOGD("startBibleSync - calling init");

	if (!bibleSync) {
SWLOGD("bibleSync initializing c-tor");
		bibleSync = new BibleSync(appName.c_str(), (const char *)SWVersion().currentVersion, userName.c_str());
SWLOGD("bibleSync initializing setMode");
		bibleSync->setMode(BSP_MODE_PERSONAL, bibleSyncCallback, passphrase.c_str());
	}
SWLOGD("startBibleSync - starting while listener");
	starting = false;
	while(bibleSyncListener) {
SWLOGD("bibleSyncListener - while loop iteration");
		BibleSync::Receive(bibleSync);
SWLOGD("bibleSyncListener - sleeping for 2 seconds");
		sleep(2);
	}
	delete bibleSync;
	bibleSync = 0;
#else
SWLOGD("registerBibleSyncListener: !!! BibleSync disabled in native code.");
#endif
}


/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    stopBibleSync
 * Signature: (V;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_stopBibleSync
		(SWHANDLE hMgr) {

SWLOGD("stopBibleSync()");
#ifdef BIBLESYNC
	// if we have a listen loop going, just break the loop; the bibleSync cleanup will happen there
	if (::bibleSyncListener) ::bibleSyncListener = 0;
	else if (bibleSync) {
		delete bibleSync;
		bibleSync = 0;
	}
#else
SWLOGD("registerBibleSyncListener: !!! BibleSync disabled in native code.");
#endif
}
