/******************************************************************************
 *
 *  swordorb-impl.hpp -	
 *
 * $Id: swordorb-impl.hpp 2833 2013-06-29 06:40:28Z chrislit $
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

#ifndef _ORBIT_CPP_IDL_sword_IMPL_HH
#define _ORBIT_CPP_IDL_sword_IMPL_HH

#include "swordorb-cpp-skels.h"
#include "webmgr.hpp"
#include <swmodule.h>
#include <swmgr.h>
#include <rawtext.h>
#include <map>


namespace swordorb {

static const char *SWNULL = "<SWNULL>";
extern sword::RawText NULLMod;


//Inherit from abstract Skeleton:
class SWModule_impl : public POA_swordorb::SWModule {
	sword::SWModule *delegate;
public:
	SWModule_impl(sword::SWModule *delegate)  { this->delegate = delegate; }

	SearchHitList *search(const char *istr, SearchType searchType, CORBA::Long flags, const char *scope) throw(CORBA::SystemException);
	StringList *parseKeyList(const char *keyText) throw(CORBA::SystemException);
	void  terminateSearch() throw(CORBA::SystemException) { delegate->terminateSearch = true; }
	char  error() throw(CORBA::SystemException) { return delegate->Error(); }
	CORBA::Long getEntrySize() throw(CORBA::SystemException) { return delegate->getEntrySize(); }
	void  setKeyText(const char *key) throw(CORBA::SystemException);
	char *getKeyText() throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->KeyText()); }
	StringList *getKeyChildren() throw(CORBA::SystemException);
	char *getKeyParent() throw(CORBA::SystemException);
	CORBA::Boolean hasKeyChildren() throw(CORBA::SystemException);
	char *getName() throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->Name()); }
	char *getDescription() throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->Description()); }
	char *getCategory() throw(CORBA::SystemException);
	void  previous() throw(CORBA::SystemException) { delegate->decrement(); }
	void  next() throw(CORBA::SystemException) { delegate->increment(); }
	void  begin() throw(CORBA::SystemException) { delegate->setPosition(sword::TOP); }
	char *getStripText() throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->StripText()); }
	StringList *getEntryAttribute(const char *level1, const char *level2, const char *level3, CORBA::Boolean filtered) throw(CORBA::SystemException);
	char *getRenderText() throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->RenderText()); }
	char *getRenderHeader() throw(CORBA::SystemException) { return CORBA::string_dup((char *)((delegate->getRenderHeader()?delegate->getRenderHeader():""))); }
	char *getRawEntry() throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->getRawEntry()); }
	void  setRawEntry(const char *entryBuffer) throw(CORBA::SystemException) { delegate->setEntry(entryBuffer); }
	char *getConfigEntry(const char *key) throw(CORBA::SystemException) { return CORBA::string_dup(((char *)delegate->getConfigEntry(key)) ? (char *)delegate->getConfigEntry(key):SWNULL); }
	void deleteSearchFramework() throw(CORBA::SystemException) { delegate->deleteSearchFramework(); }
	CORBA::Boolean hasSearchFramework() throw(CORBA::SystemException) { return (delegate->hasSearchFramework() && delegate->isSearchOptimallySupported("God", -4, 0, 0)); }

};

// ----------------------------------------------------------------------------------

typedef std::map<std::string, SWModule_impl *> SWModuleMap;

// ----------------------------------------------------------------------------------

class SWMgr_impl : public POA_swordorb::SWMgr {
	WebMgr *delegate;
	SWModuleMap moduleImpls;
public:
	SWMgr_impl(WebMgr *delegate)  { this->delegate = delegate; }

	ModInfoList *getModInfoList() throw(CORBA::SystemException);
	SWModule_ptr getModuleByName(const char *name) throw(CORBA::SystemException);
	char *filterText(const char *filterName, const char *text) throw(CORBA::SystemException);
	char *getPrefixPath() throw(CORBA::SystemException) { return CORBA::string_dup(delegate->prefixPath); }
	char *getConfigPath() throw(CORBA::SystemException) { return CORBA::string_dup(delegate->configPath); }
	void  setGlobalOption(const char *option, const char *value) throw(CORBA::SystemException) { delegate->setGlobalOption(option, value); }
	char *getGlobalOption(const char *option) throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->getGlobalOption(option)); }
	char *getGlobalOptionTip(const char *option) throw(CORBA::SystemException) { return CORBA::string_dup((char *)delegate->getGlobalOptionTip(option)); }
	StringList *getGlobalOptions() throw(CORBA::SystemException);
	StringList *getGlobalOptionValues(const char *option) throw(CORBA::SystemException);
	void     setCipherKey(const char *modName, const char *key) throw(CORBA::SystemException) { delegate->setCipherKey(modName, key); }
	void     terminate() throw(CORBA::SystemException);
	CORBA::Boolean     testConnection() throw(CORBA::SystemException);
	void setJavascript(CORBA::Boolean) throw(CORBA::SystemException);
	StringList *getAvailableLocales() throw(CORBA::SystemException);
	void setDefaultLocale(const char *name) throw(CORBA::SystemException);
	char *translate(const char *text, const char *locale) throw(CORBA::SystemException);
	StringList *getRepos() throw(CORBA::SystemException);
	swordorb::SWMgr_ptr getShadowMgr (CORBA_char const *repoName) throw (CORBA::SystemException);

};
};


#endif
