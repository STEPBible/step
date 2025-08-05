/******************************************************************************
 *
 *  swordorb-impl.cpp -	
 *
 * $Id: swordorb-impl.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include "swordorb-impl.hpp"
#include <iostream>
#include <swmgr.h>
#include <installmgr.h>
#include <versekey.h>
#include <treekeyidx.h>
#include <swbuf.h>
#include <localemgr.h>
#include <vector>

/*
char* swordorb::SWModule_impl::helloWorld(const char* greeting) throw(CORBA::SystemException) {
  std::cout << "Server: Greeting was \"" << greeting << "\"" << std::endl;
  return CORBA::string_dup("Hello client, from server!");
}
*/

using sword::VerseKey;
using sword::SWBuf;
using sword::TreeKeyIdx;

namespace swordorb {

sword::RawText NULLMod("/dev/null", SWNULL, SWNULL);

ModInfoList *SWMgr_impl::getModInfoList() throw(CORBA::SystemException) {

	ModInfoList *milist = new ModInfoList;
	sword::SWModule *module = 0;
	int size = 0;
	for (sword::ModMap::iterator it = delegate->Modules.begin(); it != delegate->Modules.end(); ++it) {
		if ((!(it->second->getConfigEntry("CipherKey"))) || (*(it->second->getConfigEntry("CipherKey"))))
			size++;
	}
	milist->length(size);
	int i = 0;
	for (sword::ModMap::iterator it = delegate->Modules.begin(); it != delegate->Modules.end(); ++it) {
		module = it->second;
		if ((!(module->getConfigEntry("CipherKey"))) || (*(module->getConfigEntry("CipherKey")))) {
			SWBuf type = module->Type();
			SWBuf cat = module->getConfigEntry("Category");
			if (cat.length() > 0)
				type = cat;
			(*milist)[i].name = CORBA::string_dup(module->Name());
			(*milist)[i].description = CORBA::string_dup(module->Description());
			(*milist)[i].category = CORBA::string_dup(type.c_str());
			(*milist)[i++].language = CORBA::string_dup(module->Lang());
		}
	}
	return milist;
}



SWModule_ptr SWMgr_impl::getModuleByName(const char *name) throw(CORBA::SystemException) {
	SWModuleMap::iterator it;
	SWModule_ptr retVal;
	sword::SWModule *mod = delegate->Modules[name];
	it = moduleImpls.find((mod)?name:SWNULL);
	if (it == moduleImpls.end()) {
		moduleImpls[(mod)?name:SWNULL] = new SWModule_impl((mod)?mod:&NULLMod);
		it = moduleImpls.find((mod)?name:SWNULL);
	}
	if (it != moduleImpls.end()) {
		retVal = it->second->_this();
	}
	return ::swordorb::SWModule::_duplicate(retVal);
}


StringList *SWMgr_impl::getGlobalOptions() throw(CORBA::SystemException) {
	sword::StringList options = delegate->getGlobalOptions();
	StringList *retVal = new StringList;
	int count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(it->c_str());
	}
	return retVal;
}


StringList *SWMgr_impl::getGlobalOptionValues(const char *option) throw(CORBA::SystemException) {
	sword::StringList options = delegate->getGlobalOptionValues(option);
	StringList *retVal = new StringList;
	int count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(it->c_str());
	}
	return retVal;
}

void SWMgr_impl::terminate() throw(CORBA::SystemException) {
	exit(0);
}


CORBA::Boolean SWMgr_impl::testConnection() throw(CORBA::SystemException) {
	return true;
}

void SWMgr_impl::setJavascript(CORBA::Boolean val) throw(CORBA::SystemException) {
	delegate->setJavascript(val);
}

char *SWMgr_impl::filterText(const char *filterName, const char *text) throw(CORBA::SystemException) {
	SWBuf buf = text;
	delegate->setGlobalOption("Greek Accents", "Off");
	char errStatus = delegate->filterText(filterName, buf);
	return CORBA::string_dup((char *)buf.c_str());
}




// ------------------------------------------------------------------------




char *SWModule_impl::getCategory() throw(CORBA::SystemException) {
	SWBuf type = delegate->Type();
	SWBuf cat = delegate->getConfigEntry("Category");
	if (cat.length() > 0)
		type = cat;
	return CORBA::string_dup((char *)type.c_str());
}


StringList *SWModule_impl::parseKeyList(const char *keyText) throw(CORBA::SystemException) {
	sword::VerseKey *parser = dynamic_cast<VerseKey *>(delegate->getKey());
	StringList *retVal = new StringList;
	if (parser) {
		sword::ListKey result;
		result = parser->ParseVerseList(keyText, *parser, true);
		int count = 0;
		for (result = sword::TOP; !result.Error(); result++) {
			count++;
		}
		retVal->length(count);
		count = 0;
		for (result = sword::TOP; !result.Error(); result++) {
			(*retVal)[count++] = CORBA::string_dup((const char *)result);
		}
	}
	else	{
		retVal->length(1);
		(*retVal)[0] = CORBA::string_dup(keyText);
	}

	return retVal;
}


SearchHitList *SWModule_impl::search(const char *istr, SearchType searchType, CORBA::Long flags, const char *scope) throw(CORBA::SystemException) {
	int stype = 2;
	sword::ListKey lscope;
	if (searchType == REGEX) stype = 0;
	if (searchType == PHRASE) stype = -1;
	if (searchType == MULTIWORD) stype = -2;
	if (searchType == ENTRYATTR) stype = -3;
	if (searchType == LUCENE) stype = -4;
	sword::ListKey result;

	if ((scope) && (strlen(scope)) > 0) {
		sword::SWKey *p = delegate->CreateKey();
        	sword::VerseKey *parser = SWDYNAMIC_CAST(VerseKey, p);
	        if (!parser) {
        		delete p;
	                parser = new VerseKey();
	        }
	        *parser = delegate->getKeyText();
		lscope = parser->ParseVerseList(scope, *parser, true);
		result = delegate->Search(istr, stype, flags, &lscope);
                delete parser;
	}
	else	result = delegate->Search(istr, stype, flags);

	SearchHitList *retVal = new SearchHitList;
	int count = 0;
	for (result = sword::TOP; !result.Error(); result++) count++;
	retVal->length(count);
	int i = 0;

	// if we're sorted by score, let's re-sort by verse, because Java can always re-sort by score
	result = sword::TOP;
	if ((count) && (long)result.getElement()->userData)
		result.sort();

	for (result = sword::TOP; !result.Error(); result++) {
		(*retVal)[i].modName = CORBA::string_dup(delegate->Name());
		(*retVal)[i].key = CORBA::string_dup((const char *)result);
		(*retVal)[i++].score = (long)result.getElement()->userData;
	}

	return retVal;
}


StringList *SWModule_impl::getEntryAttribute(const char *level1, const char *level2, const char *level3, CORBA::Boolean filtered) throw(CORBA::SystemException) {
	delegate->RenderText();	// force parse
	std::vector<SWBuf> results;
	StringList *retVal = new StringList;

	sword::AttributeTypeList &entryAttribs = delegate->getEntryAttributes();
	sword::AttributeTypeList::iterator i1Start, i1End;
	sword::AttributeList::iterator i2Start, i2End;
	sword::AttributeValue::iterator i3Start, i3End;

	if ((level1) && (*level1)) {
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
		if ((level2) && (*level2)) {
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
			if ((level3) && (*level3)) {
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
				results.push_back(i3Start->second);
			}
			if (i3Start != i3End)
				break;
		}
		if (i2Start != i2End)
			break;
	}

	retVal->length(results.size());
	for (int i = 0; i < results.size(); i++) {
		if (filtered) {
			(*retVal)[i] = CORBA::string_dup(delegate->RenderText(results[i].c_str()));
		}
		else {
			(*retVal)[i] = CORBA::string_dup(results[i].c_str());
		}
	}

	return retVal;
}

void SWModule_impl::setKeyText(const char *keyText) throw(CORBA::SystemException) {
	sword::SWKey *key = delegate->getKey();
	sword::VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
	if (vkey) {
		if ((*keyText=='+' || *keyText=='-')) {
			if (!stricmp(keyText+1, "book")) {
				vkey->setBook(vkey->getBook() + ((*keyText=='+')?1:-1));
				return;
			}
			else if (!stricmp(keyText+1, "chapter")) {
				vkey->setChapter(vkey->getChapter() + ((*keyText=='+')?1:-1));
				return;
			}
		}
		else if (*keyText=='=') {
			vkey->Headings(true);
			vkey->AutoNormalize(false);
			vkey->setText(keyText+1);
			return;
		}
	}

	delegate->KeyText(keyText);
}

StringList *SWModule_impl::getKeyChildren() throw(CORBA::SystemException) {
	sword::SWKey *key = delegate->getKey();
	StringList *retVal = new StringList;
	int count = 0;

	sword::VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
	if (vkey) {
		retVal->length(7);
		SWBuf num;
		num.appendFormatted("%d", vkey->getTestament());
		(*retVal)[0] = CORBA::string_dup(num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getBook());
		(*retVal)[1] = CORBA::string_dup(num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getChapter());
		(*retVal)[2] = CORBA::string_dup(num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getVerse());
		(*retVal)[3] = CORBA::string_dup(num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getChapterMax());
		(*retVal)[4] = CORBA::string_dup(num.c_str());
		num = "";
		num.appendFormatted("%d", vkey->getVerseMax());
		(*retVal)[5] = CORBA::string_dup(num.c_str());
		(*retVal)[6] = CORBA::string_dup(vkey->getBookName());
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
			retVal->length(count);
			count = 0;
			if (tkey->firstChild()) {
				do {
					(*retVal)[count++] = CORBA::string_dup(tkey->getLocalName());
				}
				while (tkey->nextSibling());
				tkey->parent();
			}
		}
	}
	return retVal;
}

CORBA::Boolean SWModule_impl::hasKeyChildren() throw(CORBA::SystemException) {
	sword::SWKey *key = delegate->getKey();
	bool retVal = false;

	TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
	if (tkey) {
		retVal = tkey->hasChildren();
	}
	return retVal;
}


char *SWModule_impl::getKeyParent() throw(CORBA::SystemException) {
	sword::SWKey *key = delegate->getKey();
	SWBuf retVal = "";

	TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
	if (tkey) {
		if (tkey->parent()) {
			retVal = tkey->getText();
		}
	}
	return CORBA::string_dup((const char *)retVal);
}


StringList *SWMgr_impl::getAvailableLocales() throw(CORBA::SystemException) {
	sword::StringList localeNames = LocaleMgr::getSystemLocaleMgr()->getAvailableLocales();
	StringList *retVal = new StringList;
	int count = 0;
	for (sword::StringList::iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (sword::StringList::iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(it->c_str());
	}
	return retVal;
}


void SWMgr_impl::setDefaultLocale(const char *name) throw(CORBA::SystemException) {
	LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(name);
}

char* SWMgr_impl::translate(const char* text, const char* localeName) throw(CORBA::SystemException) {
	return CORBA::string_dup(LocaleMgr::getSystemLocaleMgr()->translate(text, localeName));
}

swordorb::StringList *SWMgr_impl::getRepos() throw(CORBA::SystemException) {
	swordorb::StringList *retVal = new swordorb::StringList;
	int count = 0;
	sword::InstallMgr *installMgr = new sword::InstallMgr();
	for (InstallSourceMap::iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (InstallSourceMap::iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(assureValidUTF8(it->second->caption.c_str()));
	}
	delete installMgr;
	return retVal;
}

// Don't call me yet
swordorb::SWMgr_ptr SWMgr_impl::getShadowMgr (CORBA_char const *repoName) throw (CORBA::SystemException) {
	return 0;
}
}
