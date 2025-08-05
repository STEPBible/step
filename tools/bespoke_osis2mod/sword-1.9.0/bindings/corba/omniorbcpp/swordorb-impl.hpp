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

#ifndef SWORDORB_IMPL_H
#define SWORDORB_IMPL_H

#include "swordorb.h"
#include "../orbitcpp/webmgr.hpp"
#include <swmodule.h>
#include <swmgr.h>
#include <rawtext.h>
#include <string>
#include <map>


static const char *SWNULL = "<SWNULL>";
extern sword::RawText NULLMod;


class swordorb_SWModule_i: public POA_swordorb::SWModule {
private:
	sword::SWModule *delegate;
  // Make sure all instances are built on the heap by making the
  // destructor non-public
  //virtual ~swordorb_SWModule_i();
public:
  // standard constructor
  swordorb_SWModule_i(sword::SWModule *delegate);
  virtual ~swordorb_SWModule_i() {}

  // methods corresponding to defined IDL attributes and operations
  void terminateSearch();
  swordorb::SearchHitList* search(const char* istr, swordorb::SearchType srchType, ::CORBA::Long flags, const char* scope);
  ::CORBA::Char error();
  ::CORBA::Long getEntrySize();
  swordorb::StringList* getEntryAttribute(const char* level1, const char* level2, const char* level3, ::CORBA::Boolean filtered);
  swordorb::StringList* parseKeyList(const char* keyText);
  void setKeyText(const char* key);
  char* getKeyText();
  ::CORBA::Boolean hasKeyChildren();
  swordorb::StringList* getKeyChildren();
  char* getKeyParent();
  char* getName();
  char* getDescription();
  char* getCategory();
  void previous();
  void next();
  void begin();
  char* getStripText();
  char* getRenderText();
  char* getRenderHeader();
  char* getRawEntry();
  void setRawEntry(const char* entryBuffer);
  char* getConfigEntry(const char* key);
  char* translate(const char* text, const char* localeName);
  void deleteSearchFramework();
  ::CORBA::Boolean hasSearchFramework();

};


// ----------------------------------------------------------------------------------

typedef std::map<std::string, swordorb_SWModule_i *> SWModuleMap;

// ----------------------------------------------------------------------------------


class swordorb_SWMgr_i: public POA_swordorb::SWMgr {
private:
	WebMgr *delegate;
	SWModuleMap moduleImpls;
  // Make sure all instances are built on the heap by making the
  // destructor non-public
  //virtual ~swordorb_SWMgr_i();
public:
  // standard constructor
  swordorb_SWMgr_i(WebMgr *delegate);
  virtual ~swordorb_SWMgr_i() {};

  // methods corresponding to defined IDL attributes and operations
  swordorb::ModInfoList* getModInfoList();
  swordorb::SWModule_ptr getModuleByName(const char* name);
  char* getPrefixPath();
  char* getConfigPath();
  void setGlobalOption(const char* option, const char* value);
  char* getGlobalOption(const char* option);
  char* getGlobalOptionTip(const char* option);
  char* filterText(const char* filterName, const char* text);
  swordorb::StringList* getGlobalOptions();
  swordorb::StringList* getGlobalOptionValues(const char* option);
  void setCipherKey(const char* modName, const char* key);
  void terminate();
  ::CORBA::Boolean testConnection();
  void setJavascript(::CORBA::Boolean val);
  swordorb::StringList* getAvailableLocales();
  void setDefaultLocale(const char* name);
  char* translate(const char* text, const char* localeName);
  swordorb::StringList* getRepos();
  swordorb::_objref_SWMgr* getShadowMgr(const char*);

};


#endif
