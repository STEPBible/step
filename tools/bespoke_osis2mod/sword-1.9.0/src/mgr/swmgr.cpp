/******************************************************************************
 *
 *  swmgr.cpp -	used to interact with an install base of sword modules
 *
 * $Id: swmgr.cpp 3822 2020-11-03 18:54:47Z scribe $
 *
 * Copyright 1998-2014 CrossWire Bible Society (http://www.crosswire.org)
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

#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>

#include <sys/stat.h>
#ifndef _MSC_VER
#include <iostream>
#endif
#include <dirent.h>

#include <swmgr.h>
#include <rawtext.h>
#include <rawtext4.h>
#include <filemgr.h>
#include <rawgenbook.h>
#include <rawcom.h>
#include <rawcom4.h>
#include <hrefcom.h>
#include <rawld.h>
#include <rawld4.h>
#include <utilstr.h>
#include <gbfplain.h>
#include <thmlplain.h>
#include <osisplain.h>
#include <teiplain.h>
#include <papyriplain.h>
#include <gbfstrongs.h>
#include <gbffootnotes.h>
#include <gbfheadings.h>
#include <gbfredletterwords.h>
#include <gbfmorph.h>
#include <osisenum.h>
#include <osisglosses.h>
#include <osisheadings.h>
#include <osisfootnotes.h>
#include <osisstrongs.h>
#include <osismorph.h>
#include <osislemma.h>
#include <osisredletterwords.h>
#include <osismorphsegmentation.h>
#include <osisscripref.h>
#include <osisvariants.h>
#include <osisxlit.h>
#include <osisreferencelinks.h>
#include <thmlstrongs.h>
#include <thmlfootnotes.h>
#include <thmlheadings.h>
#include <thmlmorph.h>
#include <thmlvariants.h>
#include <thmllemma.h>
#include <thmlscripref.h>
#include <cipherfil.h>
#include <rawfiles.h>
#include <ztext.h>
#include <ztext4.h>
#include <zld.h>
#include <zcom.h>
#include <zcom4.h>
#include <lzsscomprs.h>
#include <utf8greekaccents.h>
#include <utf8cantillation.h>
#include <utf8hebrewpoints.h>
#include <utf8arabicpoints.h>
#include <greeklexattribs.h>
#include <swfiltermgr.h>
#include <swcipher.h>
#include <swoptfilter.h>
#include <rtfhtml.h>

#include <swlog.h>

#include <iterator>

#ifndef EXCLUDEZLIB
#include "zipcomprs.h"
#endif
#ifndef EXCLUDEBZIP2
#include "bz2comprs.h"
#endif
#ifndef EXCLUDEXZ
#include "xzcomprs.h"
#endif


#ifdef _ICU_
#include <utf8transliterator.h>
#endif


SWORD_NAMESPACE_START


#ifdef _ICU_
bool SWMgr::isICU = true;
#else
bool SWMgr::isICU = false;
#endif


#ifdef GLOBCONFPATH
const char *SWMgr::globalConfPath = GLOBCONFPATH;
#else
const char *SWMgr::globalConfPath = "/etc/sword.conf:/usr/local/etc/sword.conf";
#endif


const char *SWMgr::MODTYPE_BIBLES = "Biblical Texts";
const char *SWMgr::MODTYPE_COMMENTARIES = "Commentaries";
const char *SWMgr::MODTYPE_LEXDICTS = "Lexicons / Dictionaries";
const char *SWMgr::MODTYPE_GENBOOKS = "Generic Books";
const char *SWMgr::MODTYPE_DAILYDEVOS = "Daily Devotional";

namespace {
	void setSystemLogLevel(SWConfig *sysConf, const char *logLevel = 0) {
		SWBuf logLevelString = logLevel;
		// kindof cheese. we should probably pass this in.
		SWBuf logLocation = (sysConf ? "[SWORD] section of sword.conf" : "SWORD_LOGLEVEL");
		if (sysConf) {
			ConfigEntMap::iterator entry;
			if ((entry = sysConf->getSection("SWORD").find("LogLevel")) != sysConf->getSection("SWORD").end()) {
				logLevelString = entry->second;
			}
		}
		if (logLevelString.length()) {
			int logLevel =
					logLevelString == "ERROR"     ? SWLog::LOG_ERROR:
					logLevelString == "WARN"      ? SWLog::LOG_WARN:
					logLevelString == "INFO"      ? SWLog::LOG_INFO:
					logLevelString == "TIMEDINFO" ? SWLog::LOG_TIMEDINFO:
					logLevelString == "DEBUG"     ? SWLog::LOG_DEBUG:
					-1;
			if (logLevel < 0) SWLog::getSystemLog()->logError("Invalid LogLevel found in %s: LogLevel: %s", logLocation.c_str(), logLevelString.c_str());
			else {
				SWLog::getSystemLog()->setLogLevel(logLevel);
				SWLOGTI("Setting log level from %s to %s", logLocation.c_str(), logLevelString.c_str());
			}
		}
	}
}

void SWMgr::init() {
	SWOptionFilter *tmpFilter = 0;
	configPath  = 0;
	prefixPath  = 0;
	configType  = 0;
	myconfig    = 0;
	mysysconfig = 0;
	homeConfig  = 0;
	augmentHome = true;

	cipherFilters.clear();
	optionFilters.clear();
	cleanupFilters.clear();
	extraFilters.clear();
	tmpFilter = new ThMLVariants();
	optionFilters.insert(OptionFilterMap::value_type("ThMLVariants", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new GBFStrongs();
	optionFilters.insert(OptionFilterMap::value_type("GBFStrongs", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new GBFFootnotes();
	optionFilters.insert(OptionFilterMap::value_type("GBFFootnotes", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new GBFRedLetterWords();
	optionFilters.insert(OptionFilterMap::value_type("GBFRedLetterWords", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new GBFMorph();
	optionFilters.insert(OptionFilterMap::value_type("GBFMorph", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new GBFHeadings();
	optionFilters.insert(OptionFilterMap::value_type("GBFHeadings", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISHeadings();
	optionFilters.insert(OptionFilterMap::value_type("OSISHeadings", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISStrongs();
	optionFilters.insert(OptionFilterMap::value_type("OSISStrongs", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISMorph();
	optionFilters.insert(OptionFilterMap::value_type("OSISMorph", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISLemma();
	optionFilters.insert(OptionFilterMap::value_type("OSISLemma", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISFootnotes();
	optionFilters.insert(OptionFilterMap::value_type("OSISFootnotes", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISScripref();
	optionFilters.insert(OptionFilterMap::value_type("OSISScripref", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISRedLetterWords();
	optionFilters.insert(OptionFilterMap::value_type("OSISRedLetterWords", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISMorphSegmentation();
	optionFilters.insert(OptionFilterMap::value_type("OSISMorphSegmentation", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISGlosses();
	optionFilters.insert(OptionFilterMap::value_type("OSISGlosses", tmpFilter));
	optionFilters.insert(OptionFilterMap::value_type("OSISRuby", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISXlit();
	optionFilters.insert(OptionFilterMap::value_type("OSISXlit", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISEnum();
	optionFilters.insert(OptionFilterMap::value_type("OSISEnum", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new OSISVariants();
	optionFilters.insert(OptionFilterMap::value_type("OSISVariants", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new ThMLStrongs();
	optionFilters.insert(OptionFilterMap::value_type("ThMLStrongs", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new ThMLFootnotes();
	optionFilters.insert(OptionFilterMap::value_type("ThMLFootnotes", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new ThMLMorph();
	optionFilters.insert(OptionFilterMap::value_type("ThMLMorph", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new ThMLHeadings();
	optionFilters.insert(OptionFilterMap::value_type("ThMLHeadings", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new ThMLLemma();
	optionFilters.insert(OptionFilterMap::value_type("ThMLLemma", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new ThMLScripref();
	optionFilters.insert(OptionFilterMap::value_type("ThMLScripref", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new UTF8GreekAccents();
	optionFilters.insert(OptionFilterMap::value_type("UTF8GreekAccents", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new UTF8HebrewPoints();
	optionFilters.insert(OptionFilterMap::value_type("UTF8HebrewPoints", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new UTF8ArabicPoints();
	optionFilters.insert(OptionFilterMap::value_type("UTF8ArabicPoints", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new UTF8Cantillation();
	optionFilters.insert(OptionFilterMap::value_type("UTF8Cantillation", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new GreekLexAttribs();
	optionFilters.insert(OptionFilterMap::value_type("GreekLexAttribs", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

	tmpFilter = new PapyriPlain();
	optionFilters.insert(OptionFilterMap::value_type("PapyriPlain", tmpFilter));
	cleanupFilters.push_back(tmpFilter);

// UTF8Transliterator needs to be handled differently because it should always available as an option, for all modules
#ifdef _ICU_
	transliterator = new UTF8Transliterator();
	optionFilters.insert(OptionFilterMap::value_type("UTF8Transliterator", transliterator));
	options.push_back(transliterator->getOptionName());
	cleanupFilters.push_back(transliterator);
#endif

	gbfplain = new GBFPlain();
	cleanupFilters.push_back(gbfplain);
	extraFilters.insert(FilterMap::value_type("GBFPlain", gbfplain));

	thmlplain = new ThMLPlain();
	cleanupFilters.push_back(thmlplain);
	extraFilters.insert(FilterMap::value_type("ThMLPlain", thmlplain));

	osisplain = new OSISPlain();
	cleanupFilters.push_back(osisplain);
	extraFilters.insert(FilterMap::value_type("OSISPlain", osisplain));

	teiplain = new TEIPlain();
	cleanupFilters.push_back(teiplain);
	extraFilters.insert(FilterMap::value_type("TEIPlain", teiplain));

	// filters which aren't really used anywhere but which we want available for a "FilterName" -> filter mapping (e.g., filterText)
	SWFilter *f = new RTFHTML();
	extraFilters.insert(FilterMap::value_type("RTFHTML", f));
	cleanupFilters.push_back(f);
	
}


// TODO: because we're still calling deprecated virtual Load. Removed in 2.0
#if defined(__GNUC__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
#endif
void SWMgr::commonInit(SWConfig *iconfig, SWConfig *isysconfig, bool autoload, SWFilterMgr *filterMgr, bool multiMod) {

	init();

	mgrModeMultiMod = multiMod;
	this->filterMgr = filterMgr;
	if (filterMgr)
		filterMgr->setParentMgr(this);
	
	if (iconfig) {
		config   = iconfig;
		myconfig = 0;
	}
	else config = 0;
	if (isysconfig) {
		sysConfig   = isysconfig;
		mysysconfig = 0;
	}
	else sysConfig = 0;

	if (autoload)
		Load();
}
#if defined(__GNUC__)
#pragma GCC diagnostic pop
#endif


SWMgr::SWMgr(SWFilterMgr *filterMgr, bool multiMod) {
	commonInit(0, 0, true, filterMgr, multiMod);
}


SWMgr::SWMgr(SWConfig *iconfig, SWConfig *isysconfig, bool autoload, SWFilterMgr *filterMgr, bool multiMod) {
	commonInit(iconfig, isysconfig, autoload, filterMgr, multiMod);
}


#if defined(__GNUC__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
#endif
SWMgr::SWMgr(const char *iConfigPath, bool autoload, SWFilterMgr *filterMgr, bool multiMod, bool augmentHome) {

	init();

	mgrModeMultiMod = multiMod;
	SWBuf path;
	
	this->filterMgr = filterMgr;
	if (filterMgr)
		filterMgr->setParentMgr(this);
	
	this->augmentHome = augmentHome;

	path = iConfigPath;
	int len = (int)path.length();
	if ((len < 1) || ((iConfigPath[len-1] != '\\') && (iConfigPath[len-1] != '/')))
		path += "/";
	SWLOGTI("Checking at provided path: %s...", path.c_str());
	if (FileMgr::existsFile(path.c_str(), "mods.conf")) {
		stdstr(&prefixPath, path.c_str());
		path += "mods.conf";
		stdstr(&configPath, path.c_str());
	}
	else if (FileMgr::existsDir(path.c_str(), "mods.d")) {
		SWLOGTI("Found mods.d/");
		stdstr(&prefixPath, path.c_str());
		path += "mods.d";
		stdstr(&configPath, path.c_str());
		configType = 1;
	}
	else {
		SWLOGTI("Config not found at provided path.");
	}

	config = 0;
	sysConfig = 0;

	if (autoload && configPath)
		Load();
}
#if defined(__GNUC__)
#pragma GCC diagnostic pop
#endif


SWMgr::~SWMgr() {

	deleteAllModules();

	for (FilterList::iterator it = cleanupFilters.begin(); it != cleanupFilters.end(); it++)
		delete (*it);
			
	if (homeConfig)
		delete homeConfig;

	if (mysysconfig)
		delete mysysconfig;

	if (myconfig)
		delete myconfig;

	if (prefixPath)
		delete [] prefixPath;

	if (configPath)
		delete [] configPath;

	if (filterMgr)
		delete filterMgr;
}


void SWMgr::findConfig(char *configType, char **prefixPath, char **configPath, std::list<SWBuf> *augPaths, SWConfig **providedSysConf) {
	static bool setLogLevel = false;
	SWBuf path;
	SWBuf sysConfPath;
	ConfigEntMap::iterator entry;
	ConfigEntMap::iterator lastEntry;

	if (!setLogLevel) {
		SWBuf envLogLevel = FileMgr::getEnvValue("SWORD_LOGLEVEL");
		if (envLogLevel.length()) {
			setSystemLogLevel(0, envLogLevel);
			setLogLevel = true;
		}
	}

	SWConfig *sysConf = 0;
	SWBuf sysConfDataPath = "";

	*configType = 0;

	SWBuf homeDir = FileMgr::getSystemFileMgr()->getHomeDir();

	// check for a sysConf passed in to us
	SWLOGTI("Checking for provided SWConfig(\"sword.conf\")...");
	if (providedSysConf && *providedSysConf) {
		sysConf = *providedSysConf;
		SWLOGTI("found.");
		if (!setLogLevel) { setSystemLogLevel(sysConf); setLogLevel = true; }
	}

	// if we haven't been given our datapath in a sysconf, we need to track it down
	if (!sysConf) {
		// check working directory
		SWLOGTI("Checking working directory for sword.conf...");
		if (FileMgr::existsFile(".", "sword.conf")) {
			SWLOGTI("Overriding any systemwide or ~/.sword/ sword.conf with one found in current directory.");
			sysConfPath = "./sword.conf";
			sysConf = new SWConfig(sysConfPath);
			if ((entry = sysConf->getSection("Install").find("DataPath")) != sysConf->getSection("Install").end()) {
				sysConfDataPath = (*entry).second;
			}
			if (!setLogLevel) { setSystemLogLevel(sysConf); setLogLevel = true; }
			if (providedSysConf) {
				*providedSysConf = sysConf;
			}
			else {
				delete sysConf;
				sysConf = 0;
			}
		}
		if (!sysConfDataPath.size()) {
			SWLOGTI("Checking working directory for mods.conf...");
			if (FileMgr::existsFile(".", "mods.conf")) {
				SWLOGTI("found.");
				stdstr(prefixPath, "./");
				stdstr(configPath, "./mods.conf");
				return;
			}

			SWLOGTI("Checking working directory for mods.d...");
			if (FileMgr::existsDir(".", "mods.d")) {
				SWLOGTI("found.");
				stdstr(prefixPath, "./");
				stdstr(configPath, "./mods.d");
				*configType = 1;
				return;
			}

			// check working directory ../library/
			SWLOGTI("Checking working directory ../library/ for mods.d...");
			if (FileMgr::existsDir("../library", "mods.d")) {
				SWLOGTI("found.");
				stdstr(prefixPath, "../library/");
				stdstr(configPath, "../library/mods.d");
				*configType = 1;
				return;
			}

			// check environment variable SWORD_PATH
			SWLOGTI("Checking $SWORD_PATH...");

			SWBuf envsworddir = FileMgr::getEnvValue("SWORD_PATH");
			if (envsworddir.length()) {
				
				SWLOGTI("found (%s).", envsworddir.c_str());
				path = envsworddir;
				if ((envsworddir[envsworddir.length()-1] != '\\') && (envsworddir[envsworddir.length()-1] != '/'))
					path += "/";

				SWLOGTI("Checking $SWORD_PATH for mods.conf...");
				if (FileMgr::existsFile(path.c_str(), "mods.conf")) {
					SWLOGTI("found.");
					stdstr(prefixPath, path.c_str());
					path += "mods.conf";
					stdstr(configPath, path.c_str());
					return;
				}

				SWLOGTI("Checking $SWORD_PATH for mods.d...");
				if (FileMgr::existsDir(path.c_str(), "mods.d")) {
					SWLOGTI("found.");
					stdstr(prefixPath, path.c_str());
					path += "mods.d";
					stdstr(configPath, path.c_str());
					*configType = 1;
					return;
				}
			}


			// check for systemwide globalConfPath

			SWLOGTI("Parsing %s...", globalConfPath);
			char *globPaths = 0;
			char *gfp;
			stdstr(&globPaths, globalConfPath);
			for (gfp = strtok(globPaths, ":"); gfp; gfp = strtok(0, ":")) {
				SWLOGTI("Checking for %s...", gfp);
				if (FileMgr::existsFile(gfp)) {
					SWLOGTI("found.");
					break;
				}
			}
			if (gfp)
				sysConfPath = gfp;
			delete [] globPaths;

			if (homeDir.length()) {
				SWBuf tryPath = homeDir;
				tryPath += ".sword/sword.conf";
				if (FileMgr::existsFile(tryPath)) {
					SWLOGTI("Overriding any systemwide sword.conf with one found in users home directory (%s)", tryPath.c_str());
					sysConfPath = tryPath;
				}
				else {
					SWBuf tryPath = homeDir;
					tryPath += "sword/sword.conf";
					if (FileMgr::existsFile(tryPath)) {
						SWLOGTI("Overriding any systemwide sword.conf with one found in users home directory (%s)", tryPath.c_str());
						sysConfPath = tryPath;
					}
				}
			}
		}
	}

	if (!sysConf && sysConfPath.size()) {
		sysConf = new SWConfig(sysConfPath);
	}

	if (sysConf) {
		if (!setLogLevel) { setSystemLogLevel(sysConf); setLogLevel = true; }
		if ((entry = sysConf->getSection("Install").find("DataPath")) != sysConf->getSection("Install").end()) {
			sysConfDataPath = (*entry).second;
		}
		if (sysConfDataPath.size()) {
			if ((!sysConfDataPath.endsWith("\\")) && (!sysConfDataPath.endsWith("/")))
				sysConfDataPath += "/";

			path = sysConfDataPath;
			SWLOGTI("DataPath in %s is set to %s.", sysConfPath.c_str(), path.c_str());
			SWLOGTI("Checking for mods.conf in DataPath...");
			
			if (FileMgr::existsFile(path.c_str(), "mods.conf")) {
				SWLOGTI("found.");
				stdstr(prefixPath, path.c_str());
				path += "mods.conf";
				stdstr(configPath, path.c_str());
				*configType = 1;
			}

			SWLOGTI("Checking for mods.d in DataPath...");

			if (FileMgr::existsDir(path.c_str(), "mods.d")) {
				SWLOGTI("found.");
				stdstr(prefixPath, path.c_str());
				path += "mods.d";
				stdstr(configPath, path.c_str());
				*configType = 1;
			}
		}
	}

	// do some extra processing of sysConf if we have one
	if (sysConf) {
		if (!setLogLevel) { setSystemLogLevel(sysConf); setLogLevel = true; }
		if (augPaths) {
			augPaths->clear();
			entry     = sysConf->getSection("Install").lower_bound("AugmentPath");
			lastEntry = sysConf->getSection("Install").upper_bound("AugmentPath");
			for (;entry != lastEntry; entry++) {
				path = entry->second;
				if ((entry->second.c_str()[strlen(entry->second.c_str())-1] != '\\') && (entry->second.c_str()[strlen(entry->second.c_str())-1] != '/'))
					path += "/";
				augPaths->push_back(path);
			}
		}
		if (providedSysConf) {
			*providedSysConf = sysConf;
		}
		else delete sysConf;
	}

	if (*configType)
		return;

	// WE STILL HAVEN'T FOUND A CONFIGURATION.  LET'S LOOK IN SOME OS SPECIFIC
	// LOCATIONS
	//
	// for various flavors of windoze...
	// check %ALLUSERSPROFILE%/Application Data/sword/

	SWLOGTI("Checking $ALLUSERSPROFILE/Application Data/sword/...");

	SWBuf envallusersdir = FileMgr::getEnvValue("ALLUSERSPROFILE");
	if (envallusersdir.length()) {
		SWLOGTI("found (%s).", envallusersdir.c_str());
		path = envallusersdir;
		if ((!path.endsWith("\\")) && (!path.endsWith("/")))
			path += "/";

		path += "Application Data/sword/";
		SWLOGTI("Checking %s for mods.d...", path.c_str());
		if (FileMgr::existsDir(path.c_str(), "mods.d")) {
			SWLOGTI("found.");
			stdstr(prefixPath, path.c_str());
			path += "mods.d";
			stdstr(configPath, path.c_str());
			*configType = 1;
			return;
		}
	}

	// for Mac OSX...
	// check $HOME/Library/Application Support/Sword/

	SWLOGTI("Checking $HOME/Library/Application Support/Sword/...");

	SWBuf pathCheck = FileMgr::getSystemFileMgr()->getHomeDir();
	if (pathCheck.length()) {
		SWLOGTI("found (%s).", pathCheck.c_str());
		path = pathCheck;
		if ((!path.endsWith("\\")) && (!path.endsWith("/")))
			path += "/";

		SWLOGTI("Checking %s for mods.d...", path.c_str());
		if (FileMgr::existsDir(path.c_str(), "mods.d")) {
			SWLOGTI("found.");
			stdstr(prefixPath, path.c_str());
			path += "mods.d";
			stdstr(configPath, path.c_str());
			*configType = 1;
			return;
		}
	}

	// FINALLY CHECK PERSONAL HOME DIRECTORY LOCATIONS
	// check ~/.sword/

	SWLOGTI("Checking home directory for ~/.sword...");

	if (homeDir.length()) {
		path = homeDir;
		path += ".sword/";
		SWLOGTI("  Checking for %smods.conf...", path.c_str());
		if (FileMgr::existsFile(path.c_str(), "mods.conf")) {
			SWLOGTI("found.");
			stdstr(prefixPath, path.c_str());
			path += "mods.conf";
			stdstr(configPath, path.c_str());
			return;
		}

		SWLOGTI("  Checking for %smods.d...", path.c_str());
		if (FileMgr::existsDir(path.c_str(), "mods.d")) {
			SWLOGTI("found.");
			stdstr(prefixPath, path.c_str());
			path += "mods.d";
			stdstr(configPath, path.c_str());
			*configType = 2;
			return;
		}

		path = homeDir;
		path += "sword/";
		SWLOGTI("  Checking for %smods.d...", path.c_str());
		if (FileMgr::existsDir(path.c_str(), "mods.d")) {
			SWLOGTI("found.");
			stdstr(prefixPath, path.c_str());
			path += "mods.d";
			stdstr(configPath, path.c_str());
			*configType = 2;
			return;
		}
	}
}


void SWMgr::loadConfigDir(const char *ipath)
{
	SWBuf basePath = ipath;
	if (!basePath.endsWith("/") && !basePath.endsWith("\\")) basePath += "/";

	SWBuf newModFile;

	std::vector<DirEntry> dirList = FileMgr::getDirList(ipath);
	for (unsigned int i = 0; i < dirList.size(); ++i) {
		//check whether it ends with .conf, if it doesn't skip it!
		if (!dirList[i].name.endsWith(".conf")) {
			continue;
		}

		newModFile = basePath + dirList[i].name;
		if (config) {
			SWConfig tmpConfig(newModFile);
			config->augment(tmpConfig);
		}
		else	config = myconfig = new SWConfig(newModFile);
	}

	if (!config) {	// if no .conf file exist yet, create a default
		newModFile = basePath + "globals.conf";
		config = myconfig = new SWConfig(newModFile);
	}
}


void SWMgr::augmentModules(const char *ipath, bool multiMod) {
	SWBuf path = ipath;
	if (!path.endsWith("/") && !path.endsWith("\\")) path += "/";
	if (FileMgr::existsDir(path.c_str(), "mods.d")) {
		char *savePrefixPath = 0;
		char *saveConfigPath = 0;
		SWConfig *saveConfig = 0;
		stdstr(&savePrefixPath, prefixPath);
		stdstr(&prefixPath, path.c_str());
		path += "mods.d";
		stdstr(&saveConfigPath, configPath);
		stdstr(&configPath, path.c_str());
		saveConfig = config;
		config = myconfig = 0;
		loadConfigDir(configPath);

		if (multiMod) {
			// fix config's Section names to rename modules which are available more than once
			// find out which sections are in both config objects
			// inserting all configs first is not good because that overwrites old keys and new modules would share the same config
			for (SectionMap::iterator it = config->getSections().begin(); it != config->getSections().end();) {
				if (saveConfig->getSections().find((*it).first) != saveConfig->getSections().end()) { //if the new section is already present rename it
					ConfigEntMap entMap((*it).second);
					
					SWBuf name;
					int i = 1;
					do { //module name already used?
						name.setFormatted("%s_%d", (*it).first.c_str(), i);
						i++;
					} while (config->getSections().find(name) != config->getSections().end());
					
					config->getSections().insert(SectionMap::value_type(name, entMap) );
					SectionMap::iterator toErase = it++;
					config->getSections().erase(toErase);
				}
				else ++it;
			}
		}
		
		createAllModules(multiMod);

		stdstr(&prefixPath, savePrefixPath);
		delete []savePrefixPath;
		stdstr(&configPath, saveConfigPath);
		delete []saveConfigPath;

		(*saveConfig) += *config;
		
		homeConfig = myconfig;
		config = myconfig = saveConfig;
	}
}


/***********************************************************************
 * SWMgr::load - loads actual modules
 *
 * RET: status - 0 = ok; -1 no config found; 1 = no modules installed
 *
 */

signed char SWMgr::load() {
	signed char ret = 0;

	if (!config) {	// If we weren't passed a config object at construction, find a config file
		if (!configPath) {	// If we weren't passed a config path at construction...
			SWLOGTI("LOOKING UP MODULE CONFIGURATION...");
			SWConfig *externalSysConf = sysConfig;	// if we have a sysConf before findConfig, then we were provided one from an external source.
			findConfig(&configType, &prefixPath, &configPath, &augPaths, &sysConfig);
			if (!externalSysConf) mysysconfig = sysConfig;	// remind us to delete our own sysConfig in d-tor
			SWLOGTI("LOOKING UP MODULE CONFIGURATION COMPLETE.");
		}
		if (configPath) {
			SWLOGTI("LOADING MODULE CONFIGURATIONS...");
			if (configType)
				loadConfigDir(configPath);
			else	config = myconfig = new SWConfig(configPath);
			SWLOGTI("LOADING MODULE CONFIGURATIONS COMPLETE.");
		}
	}

	if (config) {

		SWLOGTI("LOADING MODULE LIBRARY...");

		SectionMap::iterator Sectloop, Sectend;
		ConfigEntMap::iterator Entryloop, Entryend;

		deleteAllModules();

		for (Sectloop = config->getSections().lower_bound("Globals"), Sectend = config->getSections().upper_bound("Globals"); Sectloop != Sectend; Sectloop++) {		// scan thru all 'Globals' sections
			for (Entryloop = (*Sectloop).second.lower_bound("AutoInstall"), Entryend = (*Sectloop).second.upper_bound("AutoInstall"); Entryloop != Entryend; Entryloop++)	// scan thru all AutoInstall entries
				InstallScan((*Entryloop).second.c_str());		// Scan AutoInstall entry directory for new modules and install
		}		
		if (configType) {	// force reload on config object because we may have installed new modules
			delete myconfig;
			config = myconfig = 0;
			loadConfigDir(configPath);
		}
		else	config->load();

		createAllModules(mgrModeMultiMod);

		for (std::list<SWBuf>::iterator pathIt = augPaths.begin(); pathIt != augPaths.end(); pathIt++) {
			augmentModules(pathIt->c_str(), mgrModeMultiMod);
		}
		if (augmentHome) {
			// augment config with ~/.sword/mods.d if it exists ---------------------
			SWBuf homeDir = FileMgr::getSystemFileMgr()->getHomeDir();
			if (homeDir.length() && configType != 2) { // 2 = user only
				SWBuf path = homeDir;
				path += ".sword/";
				augmentModules(path.c_str(), mgrModeMultiMod);
				path = homeDir;
				path += "sword/";
				augmentModules(path.c_str(), mgrModeMultiMod);
			}
		}
// -------------------------------------------------------------------------
		if (!getModules().size()) // config exists, but no modules
			ret = 1;

		SWLOGTI("LOADING MODULE LIBRARY COMPLETE.");
	}
	else {
		SWLog::getSystemLog()->logError("SWMgr: Can't find 'mods.conf' or 'mods.d'.  Try setting:\n\tSWORD_PATH=<directory containing mods.conf>\n\tOr see the README file for a full description of setup options (%s)", (configPath) ? configPath : "<configPath is null>");
		ret = -1;
	}

	return ret;
}


SWModule *SWMgr::createModule(const char *name, const char *driver, ConfigEntMap &section)
{
	SWBuf description, datapath, misc1;
	ConfigEntMap::iterator entry;
	SWModule *newmod = 0;
	SWBuf lang, sourceformat, encoding;
	signed char direction, enc, markup;

	description  = ((entry = section.find("Description")) != section.end()) ? (*entry).second : (SWBuf)"";
	lang  = ((entry = section.find("Lang")) != section.end()) ? (*entry).second : (SWBuf)"en";
 	sourceformat = ((entry = section.find("SourceType"))  != section.end()) ? (*entry).second : (SWBuf)"";
 	encoding = ((entry = section.find("Encoding"))  != section.end()) ? (*entry).second : (SWBuf)"";
	datapath = prefixPath;
	if ((prefixPath[strlen(prefixPath)-1] != '\\') && (prefixPath[strlen(prefixPath)-1] != '/'))
		datapath += "/";

	SWBuf versification = ((entry = section.find("Versification"))  != section.end()) ? (*entry).second : (SWBuf)"KJV";

	// DataPath - relative path to data used by module driver.  May be a directory, may be a File.
	//   Typically not useful by outside world.  See AbsoluteDataPath, PrefixPath, and RelativePrefixPath
	//   below.
	misc1 += ((entry = section.find("DataPath")) != section.end()) ? (*entry).second : (SWBuf)"";
	char *buf = new char [ strlen(misc1.c_str()) + 1 ];
	char *buf2 = buf;
	strcpy(buf, misc1.c_str());
//	for (; ((*buf2) && ((*buf2 == '.') || (*buf2 == '/') || (*buf2 == '\\'))); buf2++);
	for (; ((*buf2) && ((*buf2 == '/') || (*buf2 == '\\'))); buf2++);
	if (!strncmp(buf2, "./", 2)) { //remove the leading ./ in the module data path to make it look better
		buf2 += 2;
	}
	// PrefixPath - absolute directory path to the repository in which this module was found
	section["PrefixPath"] = datapath;
	if (*buf2)
		datapath += buf2;
	delete [] buf;

	section["AbsoluteDataPath"] = datapath;

	if (!stricmp(sourceformat.c_str(), "GBF"))
		markup = FMT_GBF;
	else if (!stricmp(sourceformat.c_str(), "ThML"))
		markup = FMT_THML;
	else if (!stricmp(sourceformat.c_str(), "OSIS"))
		markup = FMT_OSIS;
	else if (!stricmp(sourceformat.c_str(), "TEI"))
		markup = FMT_TEI;
	else
		markup = FMT_GBF;

	if (!stricmp(encoding.c_str(), "UTF-8")) {
		enc = ENC_UTF8;
	}
	else if (!stricmp(encoding.c_str(), "SCSU")) {
		enc = ENC_SCSU;
	}
	else if (!stricmp(encoding.c_str(), "UTF-16")) {
		enc = ENC_UTF16;
	}
	else enc = ENC_LATIN1;

	if ((entry = section.find("Direction")) == section.end()) {
		direction = DIRECTION_LTR;
	}
	else if (!stricmp((*entry).second.c_str(), "rtol")) {
		direction = DIRECTION_RTL;
	}
	else if (!stricmp((*entry).second.c_str(), "bidi")) {
		direction = DIRECTION_BIDI;
	}
	else {
		direction = DIRECTION_LTR;
	}

	if ((!stricmp(driver, "zText")) || (!stricmp(driver, "zCom")) || (!stricmp(driver, "zText4")) || (!stricmp(driver, "zCom4"))) {
		SWCompress *compress = 0;
		int blockType = CHAPTERBLOCKS;
		misc1 = ((entry = section.find("BlockType")) != section.end()) ? (*entry).second : (SWBuf)"CHAPTER";
		if (!stricmp(misc1.c_str(), "VERSE"))
			blockType = VERSEBLOCKS;
		else if (!stricmp(misc1.c_str(), "CHAPTER"))
			blockType = CHAPTERBLOCKS;
		else if (!stricmp(misc1.c_str(), "BOOK"))
			blockType = BOOKBLOCKS;
		
		misc1 = ((entry = section.find("CompressType")) != section.end()) ? (*entry).second : (SWBuf)"LZSS";
#ifndef EXCLUDEZLIB
		if (!stricmp(misc1.c_str(), "ZIP"))
			compress = new ZipCompress();
		else
#endif
#ifndef EXCLUDEBZIP2
		if (!stricmp(misc1.c_str(), "BZIP2"))
			compress = new Bzip2Compress();
		else
#endif
#ifndef EXCLUDEXZ
		if (!stricmp(misc1.c_str(), "XZ"))
			compress = new XzCompress();
		else
#endif
		if (!stricmp(misc1.c_str(), "LZSS"))
			compress = new LZSSCompress();

		if (compress) {
			if (!stricmp(driver, "zText"))
				newmod = new zText(datapath.c_str(), name, description.c_str(), blockType, compress, 0, enc, direction, markup, lang.c_str(), versification);
			else if (!stricmp(driver, "zText4"))
				newmod = new zText4(datapath.c_str(), name, description.c_str(), blockType, compress, 0, enc, direction, markup, lang.c_str(), versification);
			else if (!stricmp(driver, "zCom4"))
				newmod = new zCom4(datapath.c_str(), name, description.c_str(), blockType, compress, 0, enc, direction, markup, lang.c_str(), versification);
			else
				newmod = new zCom(datapath.c_str(), name, description.c_str(), blockType, compress, 0, enc, direction, markup, lang.c_str(), versification);
		}
	}

	if (!stricmp(driver, "RawText")) {
		newmod = new RawText(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), versification);
	}

	if (!stricmp(driver, "RawText4")) {
		newmod = new RawText4(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), versification);
	}

	// backward support old drivers
	if (!stricmp(driver, "RawGBF")) {
		newmod = new RawText(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str());
	}

	if (!stricmp(driver, "RawCom")) {
		newmod = new RawCom(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), versification);
	}

	if (!stricmp(driver, "RawCom4")) {
		newmod = new RawCom4(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), versification);
	}

	if (!stricmp(driver, "RawFiles")) {
		newmod = new RawFiles(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str());
	}

	if (!stricmp(driver, "HREFCom")) {
		misc1 = ((entry = section.find("Prefix")) != section.end()) ? (*entry).second : (SWBuf)"";
		newmod = new HREFCom(datapath.c_str(), misc1.c_str(), name, description.c_str());
	}

	int pos = 0;  //used for position of final / in AbsoluteDataPath, but also set to 1 for modules types that need to strip module name
	if (!stricmp(driver, "RawLD")) {
		bool caseSensitive = ((entry = section.find("CaseSensitiveKeys")) != section.end()) ? (*entry).second == "true": false;
		bool strongsPadding = ((entry = section.find("StrongsPadding")) != section.end()) ? (*entry).second == "true": true;
		newmod = new RawLD(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), caseSensitive, strongsPadding);
		pos = 1;
	}

	if (!stricmp(driver, "RawLD4")) {
		bool caseSensitive = ((entry = section.find("CaseSensitiveKeys")) != section.end()) ? (*entry).second == "true": false;
		bool strongsPadding = ((entry = section.find("StrongsPadding")) != section.end()) ? (*entry).second == "true": true;
		newmod = new RawLD4(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), caseSensitive, strongsPadding);
		pos = 1;
	}

	if (!stricmp(driver, "zLD")) {
		SWCompress *compress = 0;
		int blockCount;
		bool caseSensitive = ((entry = section.find("CaseSensitiveKeys")) != section.end()) ? (*entry).second == "true": false;
		bool strongsPadding = ((entry = section.find("StrongsPadding")) != section.end()) ? (*entry).second == "true": true;
		misc1 = ((entry = section.find("BlockCount")) != section.end()) ? (*entry).second : (SWBuf)"200";
		blockCount = atoi(misc1.c_str());
		blockCount = (blockCount) ? blockCount : 200;

		misc1 = ((entry = section.find("CompressType")) != section.end()) ? (*entry).second : (SWBuf)"LZSS";
#ifndef EXCLUDEZLIB
		if (!stricmp(misc1.c_str(), "ZIP"))
			compress = new ZipCompress();
		else
#endif
#ifndef EXCLUDEBZIP2
		if (!stricmp(misc1.c_str(), "BZIP2"))
			compress = new Bzip2Compress();
		else
#endif
#ifndef EXCLUDEXZ
		if (!stricmp(misc1.c_str(), "XZ"))
			compress = new XzCompress();
		else
#endif
		if (!stricmp(misc1.c_str(), "LZSS"))
			compress = new LZSSCompress();

		if (compress) {
			newmod = new zLD(datapath.c_str(), name, description.c_str(), blockCount, compress, 0, enc, direction, markup, lang.c_str(), caseSensitive, strongsPadding);
		}
		pos = 1;
	}

	if (!stricmp(driver, "RawGenBook")) {
		misc1 = ((entry = section.find("KeyType")) != section.end()) ? (*entry).second : (SWBuf)"TreeKey";
		newmod = new RawGenBook(datapath.c_str(), name, description.c_str(), 0, enc, direction, markup, lang.c_str(), misc1.c_str());
		pos = 1;
	}

	if (pos == 1) {
		SWBuf &dp = section["AbsoluteDataPath"];
		for (int i = (int)dp.length() - 1; i; i--) {
			if (dp[i] == '/') {
				dp.setSize(i);
				break;
			}
		}
/*
		SWBuf &rdp = section["RelativeDataPath"];
		for (int i = rdp.length() - 1; i; i--) {
			if (rdp[i] == '/') {
				rdp.setSize(i);
				break;
			}
		}
*/
	}

	if (newmod) {
		// if a specific module type is set in the config, use this
		if ((entry = section.find("Type")) != section.end())
			newmod->setType(entry->second.c_str());

		newmod->setConfig(&section);
	}
	
	return newmod;
}


void SWMgr::addGlobalOptionFilters(SWModule *module, ConfigEntMap &section) {

	ConfigEntMap::iterator start = section.lower_bound("GlobalOptionFilter");
	ConfigEntMap::iterator end   = section.upper_bound("GlobalOptionFilter");

	for (;start != end; ++start) {
		OptionFilterMap::iterator it;
		SWBuf filterName = start->second;


		// special cases for filters with parameters

		if (filterName.startsWith("OSISReferenceLinks")) {
			SWBuf params = filterName;
			filterName = params.stripPrefix('|', true);
			SWBuf optionName = params.stripPrefix('|', true);
			SWBuf optionTip = params.stripPrefix('|', true);
			SWBuf optionType = params.stripPrefix('|', true);
			SWBuf optionSubType = params.stripPrefix('|', true);
			SWBuf optionDefaultValue = params.stripPrefix('|', true);
			// we'll key off of type and subtype.
			filterName = filterName + "." + optionType + "." + optionSubType;

			it = optionFilters.find(filterName);
			if (it == optionFilters.end()) {
				SWOptionFilter *tmpFilter = new OSISReferenceLinks(optionName, optionTip, optionType, optionSubType, optionDefaultValue);
				optionFilters.insert(OptionFilterMap::value_type(filterName, tmpFilter));
				cleanupFilters.push_back(tmpFilter);
			}
		}


		it = optionFilters.find(filterName);
		if (it != optionFilters.end()) {
			module->addOptionFilter((*it).second);	// add filter to module and option as a valid option
			StringList::iterator loop;
			for (loop = options.begin(); loop != options.end(); loop++) {
				if (!strcmp((*loop).c_str(), (*it).second->getOptionName()))
					break;
			}
			if (loop == options.end())	// if we have not yet included the option
				options.push_back((*it).second->getOptionName());
		}
	}
	if (filterMgr)
		filterMgr->addGlobalOptions(module, section, start, end);
#ifdef _ICU_
	module->addOptionFilter(transliterator);
#endif
}


char SWMgr::filterText(const char *filterName, SWBuf &text, const SWKey *key, const SWModule *module) {
	signed char retVal = -1;
	// why didn't we use find here?
	for (OptionFilterMap::iterator it = optionFilters.begin(); it != optionFilters.end(); it++) {
		if ((*it).second->getOptionName()) {
			if (!stricmp(filterName, (*it).second->getOptionName())) {
				retVal = it->second->processText(text, key, module);
				break;
			}
		}
	}

	if (retVal == -1) {
		FilterMap::iterator it = extraFilters.find(filterName);
		if (it != extraFilters.end()) {
			retVal = it->second->processText(text, key, module);
		}
	}

	return retVal;
}


void SWMgr::addLocalOptionFilters(SWModule *module, ConfigEntMap &section) {

	ConfigEntMap::iterator start = section.lower_bound("LocalOptionFilter");
	ConfigEntMap::iterator end   = section.upper_bound("LocalOptionFilter");

	for (;start != end; start++) {
		OptionFilterMap::iterator it;
		it = optionFilters.find((*start).second);
		if (it != optionFilters.end()) {
			module->addOptionFilter((*it).second);	// add filter to module
		}
	}

	if (filterMgr)
		filterMgr->addLocalOptions(module, section, start, end);
}


// manually specified StripFilters for special cases, like Papyri marks and such
void SWMgr::addLocalStripFilters(SWModule *module, ConfigEntMap &section) {

	ConfigEntMap::iterator start = section.lower_bound("LocalStripFilter");
	ConfigEntMap::iterator end   = section.upper_bound("LocalStripFilter");

	for (;start != end; start++) {
		OptionFilterMap::iterator it;
		it = optionFilters.find((*start).second);
		if (it != optionFilters.end()) {
			module->addStripFilter((*it).second);	// add filter to module
		}
	}
}


void SWMgr::addRawFilters(SWModule *module, ConfigEntMap &section) {
	SWBuf sourceformat, cipherKey;
	ConfigEntMap::iterator entry;

	cipherKey = ((entry = section.find("CipherKey")) != section.end()) ? (*entry).second : (SWBuf)"";
	if (cipherKey.length()) {
		SWFilter *cipherFilter = new CipherFilter(cipherKey.c_str());
		cipherFilters.insert(FilterMap::value_type(module->getName(), cipherFilter));
		cleanupFilters.push_back(cipherFilter);
		module->addRawFilter(cipherFilter);
	}

	if (filterMgr)
		filterMgr->addRawFilters(module, section);
}


void SWMgr::addEncodingFilters(SWModule *module, ConfigEntMap &section) {
	if (filterMgr)
		filterMgr->addEncodingFilters(module, section);
}


void SWMgr::addRenderFilters(SWModule *module, ConfigEntMap &section) {
	SWBuf sourceformat;
	ConfigEntMap::iterator entry;

	sourceformat = ((entry = section.find("SourceType")) != section.end()) ? (*entry).second : (SWBuf)"";

	// Temporary: To support old module types
	// TODO: Remove at 1.6.0 release?
	if (!sourceformat.length()) {
		sourceformat = ((entry = section.find("ModDrv")) != section.end()) ? (*entry).second : (SWBuf)"";
		if (!stricmp(sourceformat.c_str(), "RawGBF"))
			sourceformat = "GBF";
		else sourceformat = "";
	}

// process module	- eg. follows
//	if (!stricmp(sourceformat.c_str(), "GBF")) {
//		module->AddRenderFilter(gbftortf);
//	}

	if (filterMgr)
		filterMgr->addRenderFilters(module, section);

}


void SWMgr::addStripFilters(SWModule *module, ConfigEntMap &section)
{
	SWBuf sourceformat;
	ConfigEntMap::iterator entry;

	sourceformat = ((entry = section.find("SourceType")) != section.end()) ? (*entry).second : (SWBuf)"";
	// Temporary: To support old module types
	if (!sourceformat.length()) {
		sourceformat = ((entry = section.find("ModDrv")) != section.end()) ? (*entry).second : (SWBuf)"";
		if (!stricmp(sourceformat.c_str(), "RawGBF"))
			sourceformat = "GBF";
		else sourceformat = "";
	}
	
	if (!stricmp(sourceformat.c_str(), "GBF")) {
		module->addStripFilter(gbfplain);
	}
	else if (!stricmp(sourceformat.c_str(), "ThML")) {
		module->addStripFilter(thmlplain);
	}
	else if (!stricmp(sourceformat.c_str(), "OSIS")) {
		module->addStripFilter(osisplain);
	}
	else if (!stricmp(sourceformat.c_str(), "TEI")) {
		module->addStripFilter(teiplain);
	}

	if (filterMgr)
		filterMgr->addStripFilters(module, section);

}


void SWMgr::InstallScan(const char *dirname)
{
	FileDesc *conffd = 0;
	SWBuf newModFile;
	SWBuf targetName;
	SWBuf basePath = dirname;
	if (!basePath.endsWith("/") && !basePath.endsWith("\\")) basePath += "/";

	std::vector<DirEntry> dirList = FileMgr::getDirList(dirname);
	for (unsigned int i = 0; i < dirList.size(); ++i) {
		newModFile = basePath + dirList[i].name;

		// mods.d
		if (configType) {
			if (conffd)
				FileMgr::getSystemFileMgr()->close(conffd);
			targetName = configPath;
			if ((configPath[strlen(configPath)-1] != '\\') && (configPath[strlen(configPath)-1] != '/'))
				targetName += "/";
			targetName += dirList[i].name;
			conffd = FileMgr::getSystemFileMgr()->open(targetName.c_str(), FileMgr::WRONLY|FileMgr::CREAT, FileMgr::IREAD|FileMgr::IWRITE);
		}

		// mods.conf
		else {
			if (!conffd) {
				conffd = FileMgr::getSystemFileMgr()->open(config->getFileName().c_str(), FileMgr::WRONLY|FileMgr::APPEND);
				if (conffd && conffd->getFd() >= 0)
					conffd->seek(0L, SEEK_END);
				else {
					FileMgr::getSystemFileMgr()->close(conffd);
					conffd = 0;
				}
			}
		}
		addModToConfig(conffd, newModFile.c_str());
		FileMgr::removeFile(newModFile.c_str());
	}
	if (conffd)
		FileMgr::getSystemFileMgr()->close(conffd);
}


char SWMgr::addModToConfig(FileDesc *conffd, const char *fname)
{
	FileDesc *modfd;
	char ch;

	SWLOGTI("Found new module [%s]. Installing...", fname);
	modfd = FileMgr::getSystemFileMgr()->open(fname, FileMgr::RDONLY);
	ch = '\n';
	conffd->write(&ch, 1);
	while (modfd->read(&ch, 1) == 1)
		conffd->write(&ch, 1);
	ch = '\n';
	conffd->write(&ch, 1);
	FileMgr::getSystemFileMgr()->close(modfd);
	return 0;
}


void SWMgr::setGlobalOption(const char *option, const char *value)
{
	for (OptionFilterMap::iterator it = optionFilters.begin(); it != optionFilters.end(); it++) {
		if ((*it).second->getOptionName()) {
			if (!stricmp(option, (*it).second->getOptionName()))
				(*it).second->setOptionValue(value);
		}
	}
}


const char *SWMgr::getGlobalOption(const char *option)
{
	for (OptionFilterMap::iterator it = optionFilters.begin(); it != optionFilters.end(); it++) {
		if ((*it).second->getOptionName()) {
			if (!stricmp(option, (*it).second->getOptionName()))
				return (*it).second->getOptionValue();
		}
	}
	return 0;
}


const char *SWMgr::getGlobalOptionTip(const char *option)
{
	for (OptionFilterMap::iterator it = optionFilters.begin(); it != optionFilters.end(); it++) {
		if ((*it).second->getOptionName()) {
			if (!stricmp(option, (*it).second->getOptionName()))
				return (*it).second->getOptionTip();
		}
	}
	return 0;
}


StringList SWMgr::getGlobalOptions()
{
	return options;
}


StringList SWMgr::getGlobalOptionValues(const char *option)
{
	StringList options;
	for (OptionFilterMap::iterator it = optionFilters.begin(); it != optionFilters.end(); it++) {
		if ((*it).second->getOptionName()) {
			if (!stricmp(option, (*it).second->getOptionName())) {
				options = (*it).second->getOptionValues();
				break;	// just find the first one.  All option filters with the same option name should expect the same values
			}
		}
	}
	return options;
}

#if defined(__GNUC__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
#endif

// TODO: use deprecated public 'Modules' property for now until we remove deprecation
// and store in private property
// also old deprecated virtuals so client overrides still are called

void SWMgr::createAllModules(bool multiMod) {
SWLOGD("libsword: SWMgr::createAllModules");
	SectionMap::iterator it;
	ConfigEntMap::iterator entry;
	SWModule *newmod;
	SWBuf driver, misc1;
	for (it = config->getSections().begin(); it != config->getSections().end(); it++) {
		ConfigEntMap &section = (*it).second;
		newmod = 0;
		
		driver = ((entry = section.find("ModDrv")) != section.end()) ? (*entry).second : (SWBuf)"";
		if (driver.length()) {
			newmod = createModule((*it).first, driver, section);
			if (newmod) {
				// Filters to add for this module and globally announce as an option to the user
				// e.g. translit, strongs, redletterwords, etc, so users can turn these on and off globally
				// TODO: addGlobalOptionFilters(newmod, section);
				AddGlobalOptions(newmod, section, section.lower_bound("GlobalOptionFilter"), section.upper_bound("GlobalOptionFilter"));

				// Only add the option to the module, don't announce it's availability
				// These are useful for like: filters that parse special entryAttribs in a text
				// or whatever you might want to happen on entry lookup
				// TODO: addLocalOptionFilters(newmod, section);
				AddLocalOptions(newmod, section, section.lower_bound("LocalOptionFilter"), section.upper_bound("LocalOptionFilter"));

				//STRIP FILTERS

				// add all basic strip filters for for the modtype
				// TODO: addStripFilters(newmod, section);
				addStripFilters(newmod, section);

				// Any module-specific processing specified in module config
				// as entries LocalStripFilter=
				// e.g. for papyri, removed all [](). notation
				// TODO: addLocalStripFilters(newmod, section);
				AddStripFilters(newmod, section, section.lower_bound("LocalStripFilter"), section.upper_bound("LocalStripFilter"));

				// TODO: addRawFilters(newmod, section);
				addRawFilters(newmod, section);
				// TODO: addRenderFilters(newmod, section);
				addRenderFilters(newmod, section);
				// TODO: addEncodingFilters(newmod, section);
				addEncodingFilters(newmod, section);
				
				// place our module in module container, removing first if one
				// already exists by our same name
				SWModule *oldmod = getModule(newmod->getName());
				if (oldmod) {
					delete oldmod;
				}
				
				// if it's not a utility module save it to Modules
				if (	SWBuf("Utility") != newmod->getType() &&
					SWBuf("Utility") != newmod->getConfigEntry("Category")) {
					Modules[newmod->getName()] = newmod;
				}
				else	utilModules[newmod->getName()] = newmod;
			}
		}
	}
}


void SWMgr::deleteAllModules() {

	ModMap::iterator it;

	for (it = getModules().begin(); it != getModules().end(); ++it) {
		delete (*it).second;
	}
	for (it = getUtilModules().begin(); it != getUtilModules().end(); ++it) {
		delete (*it).second;
	}

	Modules.clear();
	utilModules.clear();
}


void SWMgr::deleteModule(const char *modName) {
	ModMap::iterator it = Modules.find(modName);
	if (it != Modules.end()) {
		delete (*it).second;
		Modules.erase(it);
	}
	else {
		it = utilModules.find(modName);
		if (it != utilModules.end()) {
			delete (*it).second;
			utilModules.erase(it);
		}
	}
}

signed char SWMgr::setCipherKey(const char *modName, const char *key) {
	FilterMap::iterator it;

	// check for filter that already exists
	it = cipherFilters.find(modName);
	if (it != cipherFilters.end()) {
		((CipherFilter *)(*it).second)->getCipher()->setCipherKey(key);
		return 0;
	}
	// check if module exists
	else {
		SWModule *mod = getModule(modName);
		if (mod) {
			SWFilter *cipherFilter = new CipherFilter(key);
			cipherFilters.insert(FilterMap::value_type(modName, cipherFilter));
			cleanupFilters.push_back(cipherFilter);
			mod->addRawFilter(cipherFilter);
			return 0;
		}
	}
	return -1;
}


ModMap &SWMgr::getModules() { return Modules; }
ModMap &SWMgr::getUtilModules() { return utilModules; }

SWBuf SWMgr::getHomeDir() { return FileMgr::getSystemFileMgr()->getHomeDir(); }

#if defined(__GNUC__)
#pragma GCC diagnostic pop
#endif

SWORD_NAMESPACE_END

