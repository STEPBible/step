/******************************************************************************
 *
 * flatapi.h -	This file contains an api usable by non-C++ environments
 *
 * $Id: flatapi.h 3765 2020-07-26 10:31:09Z scribe $
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

#ifndef SWORDFLATAPI_H
#define SWORDFLATAPI_H

#include <inttypes.h>
#include "defs.h"

#ifdef __cplusplus
extern "C" {
#endif

#define SWHANDLE intptr_t

struct org_crosswire_sword_ModInfo {
	char *name;
	char *description;
	char *category;
	char *language;
	char *version;
	char *delta;
	char *cipherKey;
	const char **features;
};


struct org_crosswire_sword_SearchHit {
	const char *modName;
	char *key;
	long  score;
};


#undef org_crosswire_sword_SWModule_SEARCHTYPE_REGEX
#define org_crosswire_sword_SWModule_SEARCHTYPE_REGEX 1L
#undef org_crosswire_sword_SWModule_SEARCHTYPE_PHRASE
#define org_crosswire_sword_SWModule_SEARCHTYPE_PHRASE -1L
#undef org_crosswire_sword_SWModule_SEARCHTYPE_MULTIWORD
#define org_crosswire_sword_SWModule_SEARCHTYPE_MULTIWORD -2L
#undef org_crosswire_sword_SWModule_SEARCHTYPE_ENTRYATTR
#define org_crosswire_sword_SWModule_SEARCHTYPE_ENTRYATTR -3L
#undef org_crosswire_sword_SWModule_SEARCHTYPE_LUCENE
#define org_crosswire_sword_SWModule_SEARCHTYPE_LUCENE -4L

const int org_crosswire_sword_SWModule_VERSEKEY_TESTAMENT = 0;
const int org_crosswire_sword_SWModule_VERSEKEY_BOOK = 1;
const int org_crosswire_sword_SWModule_VERSEKEY_CHAPTER = 2;
const int org_crosswire_sword_SWModule_VERSEKEY_VERSE = 3;
const int org_crosswire_sword_SWModule_VERSEKEY_CHAPTERMAX = 4;
const int org_crosswire_sword_SWModule_VERSEKEY_VERSEMAX = 5;
const int org_crosswire_sword_SWModule_VERSEKEY_BOOKNAME = 6;
const int org_crosswire_sword_SWModule_VERSEKEY_OSISREF = 7;
const int org_crosswire_sword_SWModule_VERSEKEY_SHORTTEXT = 8;
const int org_crosswire_sword_SWModule_VERSEKEY_BOOKABBREV = 9;
const int org_crosswire_sword_SWModule_VERSEKEY_OSISBOOKNAME = 10;
// for backward compat.  Remove
const int org_crosswire_sword_SWModule_VERSEKEY_CHAPMAX = 4;

const int org_crosswire_sword_SWLog_LOG_ERROR = 1;
const int org_crosswire_sword_SWLog_LOG_WARN = 2;
const int org_crosswire_sword_SWLog_LOG_INFO = 3;
const int org_crosswire_sword_SWLog_LOG_TIMEDINFO = 4;
const int org_crosswire_sword_SWLog_LOG_DEBUG = 5;




/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    terminateSearch
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_terminateSearch
	(SWHANDLE hSWModule);

typedef void (*org_crosswire_sword_SWModule_SearchCallback)(int);

typedef void (*org_biblesync_MessageReceivedCallback)(char, const char *, const char *);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    search
 * Signature: (Ljava/lang/String;IJLjava/lang/String;Lorg/crosswire/android/sword/SWModule/SearchProgressReporter;)[Lorg/crosswire/android/sword/SWModule/SearchHit;
 */
const struct org_crosswire_sword_SearchHit * SWDLLEXPORT org_crosswire_sword_SWModule_search
	(SWHANDLE hSWModule, const char *searchString, int searchType, long flags, const char *scope, org_crosswire_sword_SWModule_SearchCallback progressReporter);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    error
 * Signature: ()C
 */
char SWDLLEXPORT org_crosswire_sword_SWModule_popError
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getEntrySize
 * Signature: ()J
 */
long SWDLLEXPORT org_crosswire_sword_SWModule_getEntrySize
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getEntryAttribute
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWModule_getEntryAttribute
	(SWHANDLE hSWModule, const char *level1, const char *level2, const char *level3, char filteredBool);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    parseKeyList
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWModule_parseKeyList
	(SWHANDLE hSWModule, const char *keyText);

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
	(SWHANDLE hSWModule, const char *key);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getKeyText
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getKeyText
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    hasKeyChildren
 * Signature: ()Z
 */
char SWDLLEXPORT org_crosswire_sword_SWModule_hasKeyChildren
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getKeyChildren
 * Signature: ()[Ljava/lang/String;
 */

// This method returns child nodes for a genbook,
// but has special handling if called on a VerseKey module:
//  [0..7] [testament, book, chapter, verse, chapterMax, verseMax, bookName, osisRef]
const char ** SWDLLEXPORT org_crosswire_sword_SWModule_getKeyChildren
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getName
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getName
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getDescription
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getDescription
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getCategory
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getCategory
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getKeyParent
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getKeyParent
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    previous
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_previous
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    next
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_next
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    begin
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_begin
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getStripText
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_stripText
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getRenderText
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_renderText
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getRenderHeader
 * Signature: ()Ljava/lang/String;
 */
// CSS styles associated with this text
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getRenderHeader
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getRawEntry
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getRawEntry
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    setRawEntry
 * Signature: (Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_setRawEntry
	(SWHANDLE hSWModule, const char *entryBuffer);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    getConfigEntry
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWModule_getConfigEntry
	(SWHANDLE hSWModule, const char *key);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    deleteSearchFramework
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWModule_deleteSearchFramework
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWModule
 * Method:    hasSearchFramework
 * Signature: ()Z
 */
char SWDLLEXPORT org_crosswire_sword_SWModule_hasSearchFramework
	(SWHANDLE hSWModule);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    new
 * Signature: ()V
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_SWMgr_new
	();


/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    newWithPath
 * Signature: ()V
 * Signature: (Ljava/lang/String;)V
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_SWMgr_newWithPath
	(const char *path);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    delete
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_delete
	(SWHANDLE hSWMgr);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    version
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_version
	(SWHANDLE hSWMgr);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getModInfoList
 * Signature: ()[Lorg/crosswire/android/sword/SWMgr/ModInfo;
 */
const struct org_crosswire_sword_ModInfo * SWDLLEXPORT org_crosswire_sword_SWMgr_getModInfoList
	(SWHANDLE hSWMgr);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getModuleByName
 * Signature: (Ljava/lang/String;)Lorg/crosswire/android/sword/SWModule;
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_SWMgr_getModuleByName
	(SWHANDLE hSWMgr, const char *moduleName);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getPrefixPath
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getPrefixPath
	(SWHANDLE hSWMgr);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getConfigPath
 * Signature: ()Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getConfigPath
	(SWHANDLE hSWMgr);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setGlobalOption
 * Signature: (Ljava/lang/String;Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setGlobalOption
	(SWHANDLE hSWMgr, const char *option, const char *value);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOption
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOption
	(SWHANDLE hSWMgr, const char *option);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOptionTip
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOptionTip
	(SWHANDLE hSWMgr, const char *option);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    filterText
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_filterText
	(SWHANDLE hSWMgr, const char *filterName, const char *text);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOptions
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOptions
	(SWHANDLE hSWMgr);


/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    getSections
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWConfig_getSections
	(const char *confPath);

/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    getSectionKeys
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWConfig_getSectionKeys
	(const char *confPath, const char *section);

/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    getKeyValue
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWConfig_getKeyValue
	(const char *confPath, const char *section, const char *key);

/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    setKeyValue
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWConfig_setKeyValue
	(const char *confPath, const char *section, const char *key, const char *value);

/*
 * Class:     org_crosswire_sword_SWConfig
 * Method:    augmentConfig
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWConfig_augmentConfig
	(const char *confPath, const char *configBlob);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getGlobalOptionValues
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWMgr_getGlobalOptionValues
	(SWHANDLE hSWMgr, const char *option);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setCipherKey
 * Signature: (Ljava/lang/String;Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setCipherKey
	(SWHANDLE hSWMgr, const char *modName, const char *key);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setJavascript
 * Signature: (Z)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setJavascript
	(SWHANDLE hSWMgr, char valueBool);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    getAvailableLocales
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_SWMgr_getAvailableLocales
	(SWHANDLE hSWMgr);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    setDefaultLocale
 * Signature: (Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_setDefaultLocale
	(SWHANDLE hSWMgr, const char *name);

/*
 * Class:     org_crosswire_sword_SWMgr
 * Method:    translate
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
const char * SWDLLEXPORT org_crosswire_sword_SWMgr_translate
	(SWHANDLE hSWMgr, const char *text, const char *localeName);





//
// InstallMgr methods
//
//

typedef void (*org_crosswire_sword_InstallMgr_StatusCallback)(const char *, unsigned long, unsigned long);
typedef char * (*org_crosswire_sword_StringMgr_toUpperUTF8)(const char *, unsigned long);

void SWDLLEXPORT org_crosswire_sword_StringMgr_setToUpper
	(org_crosswire_sword_StringMgr_toUpperUTF8 toUpperUTF8);
/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    new
 * Signature: (Ljava/lang/String;Lorg/crosswire/android/sword/SWModule/SearchProgressReporter;)V
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_InstallMgr_new
	(const char *baseDir, org_crosswire_sword_InstallMgr_StatusCallback statusReporter);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    delete
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_InstallMgr_delete
	(SWHANDLE hInstallMgr);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    setUserDisclaimerConfirmed
 * Signature: ()V
 */
void SWDLLEXPORT org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed
	(SWHANDLE hInstallMgr);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    syncConfig
 * Signature: ()I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_syncConfig
	(SWHANDLE hInstallMgr);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    uninstallModule
 * Signature: (Lorg/crosswire/android/sword/SWMgr;Ljava/lang/String;)I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_uninstallModule
	(SWHANDLE hInstallMgr, SWHANDLE hSWMgr_removeFrom, const char *modName);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    getRemoteSources
 * Signature: ()[Ljava/lang/String;
 */
const char ** SWDLLEXPORT org_crosswire_sword_InstallMgr_getRemoteSources
	(SWHANDLE hInstallMgr);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    refreshRemoteSource
 * Signature: (Ljava/lang/String;)I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_refreshRemoteSource
	(SWHANDLE hInstallMgr, const char *sourceName);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    getRemoteModInfoList
 * Signature: (Lorg/crosswire/android/sword/SWMgr;Ljava/lang/String;)[Lorg/crosswire/android/sword/SWMgr/ModInfo;
 */
const struct org_crosswire_sword_ModInfo * SWDLLEXPORT org_crosswire_sword_InstallMgr_getRemoteModInfoList
	(SWHANDLE hInstallMgr, SWHANDLE hSWMgr_deltaCompareTo, const char *sourceName);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    remoteInstallModule
 * Signature: (Lorg/crosswire/android/sword/SWMgr;Ljava/lang/String;Ljava/lang/String;)I
 */
int SWDLLEXPORT org_crosswire_sword_InstallMgr_remoteInstallModule
	(SWHANDLE hInstallMgr_from, SWHANDLE hSWMgr_to, const char *sourceName, const char *modName);

/*
 * Class:     org_crosswire_sword_InstallMgr
 * Method:    getRemoteModuleByName
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Lorg/crosswire/android/sword/SWModule;
 */
SWHANDLE SWDLLEXPORT org_crosswire_sword_InstallMgr_getRemoteModuleByName
	(SWHANDLE hInstallMgr, const char *sourceName, const char *modName);

/*
 * NOTE: this method blocks and should be called in a new thread
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    startBibleSync
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lorg/crosswire/android/sword/SWMgr/BibleSyncListener;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_startBibleSync
	(SWHANDLE hMgr, const char *appNameJS, const char *userNameJS, const char *passphraseJS, org_biblesync_MessageReceivedCallback callback);

/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    stopBibleSync
 * Signature: (V;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_stopBibleSync
	(SWHANDLE hMgr);

/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    sendBibleSyncMessage
 * Signature: (Ljava/lang/String;)V
 */
void SWDLLEXPORT org_crosswire_sword_SWMgr_sendBibleSyncMessage
	(SWHANDLE hMgr, const char *osisRefRaw);

void SWDLLEXPORT org_crosswire_sword_SWLog_logError(const char *msg);
void SWDLLEXPORT org_crosswire_sword_SWLog_logDebug(const char *msg);
void SWDLLEXPORT org_crosswire_sword_SWLog_logWarning(const char *msg);
void SWDLLEXPORT org_crosswire_sword_SWLog_logInformation(const char *msg);
void SWDLLEXPORT org_crosswire_sword_SWLog_logTimedInformation(const char *msg);
void SWDLLEXPORT org_crosswire_sword_SWLog_setLogLevel(int level);
int SWDLLEXPORT org_crosswire_sword_SWLog_getLogLevel();

#ifdef __cplusplus
}
#endif
#endif
