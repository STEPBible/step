/******************************************************************************
 *
 *  swordorb-impl.cpp -	omniorb bindings
 *
 * $Id: swordorb-impl.cpp 3593 2018-09-06 17:01:31Z scribe $
 *
 * Copyright 2009-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <csignal>

#include <swordorb-impl.hpp>

#include <swmgr.h>
#include <installmgr.h>
#include <versekey.h>
#include <treekeyidx.h>
#include <swbuf.h>
#include <localemgr.h>
#include <utilstr.h>


using sword::VerseKey;
using sword::SWBuf;
using sword::TreeKeyIdx;


sword::RawText NULLMod("/dev/null", SWNULL, SWNULL);




swordorb_SWModule_i::swordorb_SWModule_i(sword::SWModule *delegate)
{
	this->delegate = delegate;
}

void swordorb_SWModule_i::terminateSearch() {
	delegate->terminateSearch = true;
}

swordorb::SearchHitList* swordorb_SWModule_i::search(const char* istr, swordorb::SearchType srchType, ::CORBA::Long flags, const char* scope) {
	int stype = 2;
	sword::ListKey lscope;
	if (srchType == swordorb::REGEX) stype = 0;
	if (srchType == swordorb::PHRASE) stype = -1;
	if (srchType == swordorb::MULTIWORD) stype = -2;
	if (srchType == swordorb::ENTRYATTR) stype = -3;
	if (srchType == swordorb::LUCENE) stype = -4;
	sword::ListKey result;

	if ((scope) && (strlen(scope)) > 0) {
		sword::SWKey *p = delegate->createKey();
        	sword::VerseKey *parser = SWDYNAMIC_CAST(VerseKey, p);
	        if (!parser) {
        		delete p;
	                parser = new VerseKey();
	        }
	        *parser = delegate->getKeyText();
		lscope = parser->parseVerseList(scope, *parser, true);
		result = delegate->search(istr, stype, flags, &lscope);
                delete parser;
	}
	else	result = delegate->search(istr, stype, flags);

	swordorb::SearchHitList *retVal = new swordorb::SearchHitList;
	int count = 0;
	for (result = sword::TOP; !result.popError(); result++) count++;
	retVal->length(count);
	int i = 0;

	// if we're sorted by score, let's re-sort by verse, because Java can always re-sort by score
	result = sword::TOP;
	if ((count) && (long)result.getElement()->userData)
		result.sort();

	for (result = sword::TOP; !result.popError(); result++) {
		(*retVal)[i].modName = CORBA::string_dup(assureValidUTF8(delegate->getName()));
		(*retVal)[i].key = CORBA::string_dup(assureValidUTF8((const char *)result));
		(*retVal)[i++].score = (long)result.getElement()->userData;
	}

	return retVal;
}

::CORBA::Char swordorb_SWModule_i::error() {
	return delegate->popError();
}

::CORBA::Long swordorb_SWModule_i::getEntrySize(){
	return delegate->getEntrySize();
}

swordorb::StringList* swordorb_SWModule_i::getEntryAttribute(const char* level1, const char* level2, const char* level3, ::CORBA::Boolean filtered){
	delegate->renderText();	// force parse
	std::vector<SWBuf> results;
	swordorb::StringList *retVal = new swordorb::StringList;

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
			(*retVal)[i] = CORBA::string_dup(assureValidUTF8(delegate->renderText(results[i].c_str())));
		}
		else {
			(*retVal)[i] = CORBA::string_dup(assureValidUTF8(results[i].c_str()));
		}
	}

	return retVal;
}

swordorb::StringList* swordorb_SWModule_i::parseKeyList(const char* keyText){
	sword::VerseKey *parser = dynamic_cast<VerseKey *>(delegate->getKey());
	parser->setIntros(true);
	swordorb::StringList *retVal = new swordorb::StringList;
	if (parser) {
		sword::ListKey result;
		result = parser->parseVerseList(keyText, *parser, true);
		int count = 0;
		for (result = sword::TOP; !result.popError(); result++) {
			count++;
		}
		retVal->length(count);
		count = 0;
		for (result = sword::TOP; !result.popError(); result++) {
			(*retVal)[count++] = CORBA::string_dup(assureValidUTF8(VerseKey(result).getOSISRef()));
		}
	}
	else	{
		retVal->length(1);
		(*retVal)[0] = CORBA::string_dup(assureValidUTF8(keyText));
	}

	return retVal;
}

void swordorb_SWModule_i::setKeyText(const char* keyText) {
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
			vkey->setIntros(true);
			vkey->setAutoNormalize(false);
			vkey->setText(keyText+1);
			return;
		}
	}

	delegate->setKey(keyText);
}

char* swordorb_SWModule_i::getKeyText(){
	return CORBA::string_dup(assureValidUTF8((char *)delegate->getKeyText()));
}

::CORBA::Boolean swordorb_SWModule_i::hasKeyChildren(){
	sword::SWKey *key = delegate->getKey();
	bool retVal = false;

	TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
	if (tkey) {
		retVal = tkey->hasChildren();
	}
	return retVal;
}


swordorb::StringList* swordorb_SWModule_i::getKeyChildren(){
	sword::SWKey *key = delegate->getKey();
	swordorb::StringList *retVal = new swordorb::StringList;
	int count = 0;

	sword::VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
	if (vkey) {
		retVal->length(10);
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
		(*retVal)[7] = CORBA::string_dup(vkey->getOSISRef());
		(*retVal)[8] = CORBA::string_dup(vkey->getShortText());
		(*retVal)[9] = CORBA::string_dup(vkey->getBookAbbrev());
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
					(*retVal)[count++] = CORBA::string_dup(assureValidUTF8(tkey->getLocalName()));
				}
				while (tkey->nextSibling());
				tkey->parent();
			}
		}
	}
	return retVal;
}

char* swordorb_SWModule_i::getKeyParent(){
	sword::SWKey *key = delegate->getKey();
	SWBuf retVal = "";

	TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
	if (tkey) {
		if (tkey->parent()) {
			retVal = tkey->getText();
		}
	}
	return CORBA::string_dup(assureValidUTF8((const char *)retVal));
}

char* swordorb_SWModule_i::getName(){
	return CORBA::string_dup(assureValidUTF8((char *)delegate->getName()));
}

char* swordorb_SWModule_i::getDescription(){
	return CORBA::string_dup(assureValidUTF8((char *)delegate->getDescription()));
}

char* swordorb_SWModule_i::getCategory(){
	SWBuf type = delegate->getType();
	SWBuf cat = delegate->getConfigEntry("Category");
	if (cat.length() > 0)
		type = cat;
	return CORBA::string_dup(assureValidUTF8((char *)type.c_str()));
}

void swordorb_SWModule_i::previous(){
	delegate->decrement();
}

void swordorb_SWModule_i::next(){
	delegate->increment();
}

void swordorb_SWModule_i::begin(){
	delegate->setPosition(sword::TOP);
}

char* swordorb_SWModule_i::getStripText(){
	return CORBA::string_dup(assureValidUTF8((const char *)delegate->stripText()));
}

char* swordorb_SWModule_i::getRenderText(){
	return CORBA::string_dup(assureValidUTF8((const char *)delegate->renderText()));
}

char* swordorb_SWModule_i::getRenderHeader(){
	return CORBA::string_dup(assureValidUTF8(((const char *)(delegate->getRenderHeader() ? delegate->getRenderHeader():""))));
}

char* swordorb_SWModule_i::getRawEntry(){
	return CORBA::string_dup(assureValidUTF8((const char *)delegate->getRawEntry()));
}

void swordorb_SWModule_i::setRawEntry(const char* entryBuffer){
	delegate->setEntry(entryBuffer);
}

char* swordorb_SWModule_i::getConfigEntry(const char* key){
	return CORBA::string_dup(assureValidUTF8(((char *)delegate->getConfigEntry(key)) ? (char *)delegate->getConfigEntry(key):SWNULL));
}

void swordorb_SWModule_i::deleteSearchFramework(){
	delegate->deleteSearchFramework(); 
}

::CORBA::Boolean swordorb_SWModule_i::hasSearchFramework(){
	return (delegate->hasSearchFramework() && delegate->isSearchOptimallySupported("God", -4, 0, 0));
}


// -------------------------------------------------------------------------


swordorb_SWMgr_i::swordorb_SWMgr_i(WebMgr *delegate)
{
	this->delegate = delegate;
}

//   Methods corresponding to IDL attributes and operations
swordorb::ModInfoList* swordorb_SWMgr_i::getModInfoList() {

	swordorb::ModInfoList *milist = new swordorb::ModInfoList;
	sword::SWModule *module = 0;

	int size = 0;
	for (sword::ModMap::iterator it = delegate->Modules.begin(); it != delegate->Modules.end(); ++it) {
		if ((!(it->second->getConfigEntry("CipherKey"))) || (*(it->second->getConfigEntry("CipherKey"))))
			size++;
	}

//	if (size > 183) size = 183;
	milist->length(size);
	int i = 0;
	for (sword::ModMap::iterator it = delegate->Modules.begin(); it != delegate->Modules.end(); ++it) {
		module = it->second;
		if ((!(module->getConfigEntry("CipherKey"))) || (*(module->getConfigEntry("CipherKey")))) {
			SWBuf type = module->getType();
			SWBuf cat = module->getConfigEntry("Category");
			if (cat.length() > 0)
				type = cat;
			(*milist)[i].name = CORBA::string_dup(assureValidUTF8(module->getName()));
			(*milist)[i].description = CORBA::string_dup(assureValidUTF8(module->getDescription()));
			(*milist)[i].category = CORBA::string_dup(assureValidUTF8(type.c_str()));
			(*milist)[i++].language = CORBA::string_dup(assureValidUTF8(module->getLanguage()));
			if (i >= size) break;
		}
	}
	return milist;
}

swordorb::SWModule_ptr swordorb_SWMgr_i::getModuleByName(const char* name){
	SWModuleMap::iterator it;
	swordorb::SWModule_ptr retVal;
	sword::SWModule *mod = delegate->Modules[name];
	it = moduleImpls.find((mod)?name:SWNULL);
	if (it == moduleImpls.end()) {
		moduleImpls[(mod)?name:SWNULL] = new swordorb_SWModule_i((mod)?mod:&NULLMod);
		it = moduleImpls.find((mod)?name:SWNULL);
	}
	if (it != moduleImpls.end()) {
		retVal = it->second->_this();
	}
	return swordorb::SWModule::_duplicate(retVal);
}

char* swordorb_SWMgr_i::getPrefixPath(){
	return CORBA::string_dup(assureValidUTF8(delegate->prefixPath));
}

char* swordorb_SWMgr_i::getConfigPath(){
	return CORBA::string_dup(assureValidUTF8(delegate->configPath));
}

void swordorb_SWMgr_i::setGlobalOption(const char* option, const char* value){
	delegate->setGlobalOption(option, value);
}

char* swordorb_SWMgr_i::getGlobalOption(const char* option){
	return CORBA::string_dup(assureValidUTF8((char *)delegate->getGlobalOption(option)));
}

char* swordorb_SWMgr_i::getGlobalOptionTip(const char* option){
	return CORBA::string_dup(assureValidUTF8((char *)delegate->getGlobalOptionTip(option)));
}

char* swordorb_SWMgr_i::filterText(const char* filterName, const char* text){
	SWBuf buf = text;
	delegate->setGlobalOption("Greek Accents", "Off");
	char errStatus = delegate->filterText(filterName, buf);
	return CORBA::string_dup(assureValidUTF8((char *)buf.c_str()));
}

swordorb::StringList* swordorb_SWMgr_i::getGlobalOptions(){
	sword::StringList options = delegate->getGlobalOptions();
	swordorb::StringList *retVal = new swordorb::StringList;
	int count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(assureValidUTF8(it->c_str()));
	}
	return retVal;
}

swordorb::StringList* swordorb_SWMgr_i::getGlobalOptionValues(const char* option){
	sword::StringList options = delegate->getGlobalOptionValues(option);
	swordorb::StringList *retVal = new swordorb::StringList;
	int count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (sword::StringList::iterator it = options.begin(); it != options.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(assureValidUTF8(it->c_str()));
	}
	return retVal;
}

void swordorb_SWMgr_i::setCipherKey(const char* modName, const char* key){
	delegate->setCipherKey(modName, key);
}

void swordorb_SWMgr_i::terminate(){
	raise(SIGTERM);
}

::CORBA::Boolean swordorb_SWMgr_i::testConnection(){
	return true;
}

void swordorb_SWMgr_i::setJavascript(::CORBA::Boolean val){
	delegate->setJavascript(val);
}

swordorb::StringList* swordorb_SWMgr_i::getAvailableLocales(){
	sword::StringList localeNames = LocaleMgr::getSystemLocaleMgr()->getAvailableLocales();
	swordorb::StringList *retVal = new swordorb::StringList;
	int count = 0;
	for (sword::StringList::iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		count++;
	}
	retVal->length(count);
	count = 0;
	for (sword::StringList::iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		(*retVal)[count++] = CORBA::string_dup(assureValidUTF8(it->c_str()));
	}
	return retVal;
}

void swordorb_SWMgr_i::setDefaultLocale(const char* name){
	LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(name);
}


char* swordorb_SWMgr_i::translate(const char* text, const char* localeName) {
	return CORBA::string_dup(LocaleMgr::getSystemLocaleMgr()->translate(text, localeName));
}

swordorb::StringList* swordorb_SWMgr_i::getRepos() {
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
swordorb::_objref_SWMgr* swordorb_SWMgr_i::getShadowMgr(const char*) {
	return 0;
}
