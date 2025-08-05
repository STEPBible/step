/******************************************************************************
 *
 *  swordstub.cpp -	JNI bindings
 *
 * $Id: swordstub.cpp 3822 2020-11-03 18:54:47Z scribe $
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
#include <map>

#include <jni.h>
#include <android/log.h>

#include <utilstr.h>
#include <swversion.h>
#include <swmgr.h>
#include <swlog.h>
#include <filemgr.h>
#include <swmodule.h>
#include <versekey.h>
#include <localemgr.h>
#include <stringmgr.h>
#include <treekeyidx.h>
#include <installmgr.h>
#include <remotetrans.h>
#include <rtfhtml.h>


#ifdef BIBLESYNC
#include <biblesync.hh>
#endif

#include "webmgr.hpp"
#include "org_crosswire_android_sword_SWMgr.h"
#include "org_crosswire_android_sword_SWModule.h"
#include "org_crosswire_android_sword_InstallMgr.h"


using std::cerr;
using std::map;
using std::vector;

using namespace sword;

namespace {
bool firstInit = true;
JavaVM *javaVM = nullptr;
WebMgr *mgr = nullptr;
InstallMgr *installMgr = nullptr;

#ifdef BIBLESYNC
BibleSync *bibleSync = nullptr;
using std::string;
jobject bibleSyncListener = nullptr;
JNIEnv *bibleSyncListenerEnv = nullptr;
#endif
SWBuf STORAGE_BASE;
const char *SDCARD_PATH = "/sdcard/sword";
const char *AND_BIBLE_MODULES_PATH = "/sdcard/Android/data/net.bible.android.activity/files";
//ANativeActivity *_activity;

// this method converts a UTF8 encoded SWBuf to a Java String, avoiding a bug in jni NewStringUTF
jstring strToUTF8Java(JNIEnv *env, const SWBuf &str) {
	const SWBuf safeStr = assureValidUTF8(str.c_str());
	jbyteArray array = env->NewByteArray(safeStr.size());
	env->SetByteArrayRegion(array, 0, safeStr.size(), (const jbyte *)safeStr.c_str());
	jstring strEncode = env->NewStringUTF("UTF-8");
	jclass cls = env->FindClass("java/lang/String");
	jmethodID ctor = env->GetMethodID(cls, "<init>", "([BLjava/lang/String;)V");
	jstring object = (jstring) env->NewObject(cls, ctor, array, strEncode);

	env->DeleteLocalRef(strEncode);
	env->DeleteLocalRef(array);
	env->DeleteLocalRef(cls);

	return object;
}

class InstallStatusReporter : public StatusReporter {
public:
	JNIEnv *env;
	jobject callback;
	unsigned long last;

	InstallStatusReporter() : env(nullptr), callback(nullptr), last(0) {
	}

	void init(JNIEnv *env, jobject callback) {
		this->env = env;
		this->callback = callback;
		last = 0xffffffff;
	}

	void update(unsigned long totalBytes, unsigned long completedBytes) override {

		// assert we have a callback
		if (!callback) return;

		if (completedBytes != last) {
			last = completedBytes;
			jclass cls = env->GetObjectClass(callback);
			jmethodID mid = env->GetMethodID(cls, "update", "(JJ)V");
			if (mid) {
				env->CallVoidMethod(callback, mid, (jlong)totalBytes, (jlong)completedBytes);
			}
			env->DeleteLocalRef(cls);
		}
	}

	void preStatus(long totalBytes, long completedBytes, const char *message) override {

		// assert we have a callback
		if (!callback) return;

		jclass cls = env->GetObjectClass(callback);
		jmethodID mid = env->GetMethodID(cls, "preStatus", "(JJLjava/lang/String;)V");
		if (mid != nullptr) {
			jstring msg = strToUTF8Java(env, message);
			env->CallVoidMethod(callback, mid, (jlong)totalBytes, (jlong)completedBytes, msg);
			env->DeleteLocalRef(msg);
		}
		env->DeleteLocalRef(cls);
	}
} *installStatusReporter = nullptr;
bool disclaimerConfirmed = false;

class AndroidLogger : public SWLog {
	vector<int> levelMapping;
public:
	AndroidLogger() {
		levelMapping.resize(10, 0);
		levelMapping[SWLog::LOG_ERROR] = ANDROID_LOG_ERROR;
		levelMapping[SWLog::LOG_WARN] = ANDROID_LOG_WARN;
		levelMapping[SWLog::LOG_INFO] = ANDROID_LOG_INFO;
		levelMapping[SWLog::LOG_TIMEDINFO] = ANDROID_LOG_INFO;
		levelMapping[SWLog::LOG_DEBUG] = ANDROID_LOG_DEBUG;
	}
	void logMessage(const char *message, int level) const override {
		SWBuf msg = message;
		if (msg.size() > 512) msg.setSize(512);
		__android_log_write(levelMapping[level], "libsword.so", msg.c_str());
	}
};

class AndroidStringMgr : public StringMgr {
public:
	char *upperUTF8(char *buf, unsigned int maxLen = 0) const override {
		if (!maxLen) maxLen = strlen(buf)+1;
		JNIEnv *myThreadsEnv = nullptr;

		// double check it's all ok
		int getEnvStat = javaVM->GetEnv((void**)&myThreadsEnv, JNI_VERSION_1_6);
		// should never happen
		if (getEnvStat == JNI_EDETACHED) {
			std::cout << "GetEnv: not attached" << std::endl;
			if (javaVM->AttachCurrentThread(&myThreadsEnv, nullptr) != 0) {
				std::cout << "Failed to attach" << std::endl;
			}
		}

		if (myThreadsEnv) {
			const SWBuf validBuf = assureValidUTF8(buf);
			unsigned long bufLen = validBuf.size();
			jbyteArray array = myThreadsEnv->NewByteArray(bufLen);
			myThreadsEnv->SetByteArrayRegion(array, 0, bufLen, (const jbyte *)validBuf.c_str());
			jstring strEncode = myThreadsEnv->NewStringUTF("UTF-8");
			jclass cls = myThreadsEnv->FindClass("java/lang/String");
			jmethodID ctor = myThreadsEnv->GetMethodID(cls, "<init>", "([BLjava/lang/String;)V");
			jstring object = (jstring) myThreadsEnv->NewObject(cls, ctor, array, strEncode);
			jmethodID toUpperCase = myThreadsEnv->GetMethodID(cls, "toUpperCase", "()Ljava/lang/String;");
			jstring objectUpper = (jstring)myThreadsEnv->CallObjectMethod(object, toUpperCase);

			const char *ret = (objectUpper?myThreadsEnv->GetStringUTFChars(objectUpper, nullptr):nullptr);
			if (ret) {
				unsigned long retLen = strlen(ret);
				if (retLen >= maxLen) retLen = maxLen-1;
				memcpy(buf, ret, retLen);
				buf[retLen] = 0;

				myThreadsEnv->ReleaseStringUTFChars(objectUpper, ret);
			}

			myThreadsEnv->DeleteLocalRef(strEncode);
			myThreadsEnv->DeleteLocalRef(array);
			myThreadsEnv->DeleteLocalRef(cls);
			myThreadsEnv->DeleteLocalRef(objectUpper);
			myThreadsEnv->DeleteLocalRef(object);
		}
//		javaVM->DetachCurrentThread();
		return buf;
	}
protected:
	bool supportsUnicode() const override { return true; }
};

static void init(JNIEnv *env) {

	if (firstInit) {
		SWLog::setSystemLog(new AndroidLogger());
		SWLog::getSystemLog()->setLogLevel(SWLog::LOG_DEBUG);
		StringMgr::setSystemStringMgr(new AndroidStringMgr());
		firstInit = false;
	}
	if (!mgr) {
SWLOGD("libsword: init() begin");
		SWBuf baseDir  = SDCARD_PATH;
		SWBuf confPath = baseDir + "/mods.d/globals.conf";
		// be sure we have at least some config file already out there
		if (!FileMgr::existsFile(confPath.c_str())) {
SWLOGD("libsword: init() sword config not found, attempting to create parent of: %s", confPath.c_str());
			FileMgr::createParent(confPath.c_str());
			remove(confPath.c_str());

SWLOGD("libsword: init() saving basic: %s", confPath.c_str());
			SWConfig config(confPath.c_str());
			config["Globals"]["HiAndroid"] = "weeee";
			config.save();
		}
		if (!FileMgr::existsFile(confPath.c_str())) {
			baseDir = STORAGE_BASE;
			confPath = baseDir + "/mods.d/globals.conf";
SWLOGD("libsword: init() sword config STILL not found, attempting to create parent of: %s", confPath.c_str());
			FileMgr::createParent(confPath.c_str());
			remove(confPath.c_str());

SWLOGD("libsword: init() saving basic: %s", confPath.c_str());
			SWConfig config(confPath.c_str());
			config["Globals"]["HiAndroid"] = "weeee";
			config.save();
		}
		confPath = STORAGE_BASE + "/extraConfig.conf";
		bool exists = FileMgr::existsFile(confPath.c_str());
		if (!exists) {
			SWConfig config(confPath.c_str());
			config["Globals"]["HiAndroid"] = "weeee";
			config.save();
			exists = true;
		}
SWLOGD("libsword: extraConfig %s at path: %s", exists?"Exists":"Absent", confPath.c_str());

SWLOGD("libsword: init() creating WebMgr using path: %s", baseDir.c_str());
		mgr = new WebMgr(baseDir, exists?confPath.c_str():nullptr);

SWLOGD("libsword: init() augmenting modules from: %s", AND_BIBLE_MODULES_PATH);
		// for And Bible modules
		mgr->augmentModules(AND_BIBLE_MODULES_PATH, true);
		// if our basedir isn't the sdcard, let's augment the sdcard
		if (strcmp(baseDir.c_str(), SDCARD_PATH)) { // NOLINT(bugprone-suspicious-string-compare)
SWLOGD("libsword: init() augmenting modules from: %s", SDCARD_PATH);
			mgr->augmentModules(SDCARD_PATH, true);
		}
		// if our basedir isn't the private storage base, let's augment the private
		// storage base in case a previous version of the app stored modules there.
		if (strcmp(baseDir.c_str(), STORAGE_BASE)) { // NOLINT(bugprone-suspicious-string-compare)
SWLOGD("libsword: init() augmenting modules from: %s", STORAGE_BASE.c_str());
			mgr->augmentModules(STORAGE_BASE, true);
		}
SWLOGD("libsword: init() adding locales from baseDir.");
		LocaleMgr::getSystemLocaleMgr()->loadConfigDir(SWBuf(STORAGE_BASE + "/locales.d").c_str());
		LocaleMgr::getSystemLocaleMgr()->loadConfigDir(SWBuf(STORAGE_BASE + "/uilocales.d").c_str());
		LocaleMgr::getSystemLocaleMgr()->loadConfigDir((SWBuf(SDCARD_PATH) + "/locales.d").c_str());
		LocaleMgr::getSystemLocaleMgr()->loadConfigDir((SWBuf(SDCARD_PATH) + "/uilocales.d").c_str());

		mgr->setGlobalOption("Footnotes", "On");
		mgr->setGlobalOption("Cross-references", "On");
SWLOGD("libsword: init() end.");
	}
}

void initInstall(JNIEnv *env, jobject progressReporter = nullptr) {

	if (!installStatusReporter) {
		installStatusReporter = new InstallStatusReporter();
	}
	installStatusReporter->init(env, progressReporter);
	if (!installMgr) {
SWLOGD("initInstall: installMgr is null");
		SWBuf baseDir  = SDCARD_PATH;
		baseDir += "/InstallMgr";
		SWBuf confPath = baseDir + "/InstallMgr.conf";
		// be sure we have at least some config file already out there
SWLOGD("initInstall: confPath: %s", confPath.c_str());
		if (!FileMgr::existsFile(confPath.c_str())) {
SWLOGD("initInstall: file doesn't exist: %s", confPath.c_str());
			FileMgr::createParent(confPath.c_str());
			SWConfig config(confPath.c_str());
			config["General"]["PassiveFTP"] = "true";
			config.save();
		}
		if (!FileMgr::existsFile(confPath.c_str())) {
			baseDir = STORAGE_BASE;
			confPath = baseDir + "/InstallMgr.conf";
SWLOGD("initInstall: file STILL doesn't exist, attempting to create parent of: %s", confPath.c_str());
			FileMgr::createParent(confPath.c_str());
			SWConfig config(confPath.c_str());
			config["General"]["PassiveFTP"] = "true";
			config.save();
		}
		installMgr = new InstallMgr(baseDir, installStatusReporter);
		if (disclaimerConfirmed) installMgr->setUserDisclaimerConfirmed(true);
SWLOGD("initInstall: instantiated InstallMgr with baseDir: %s", baseDir.c_str());
	}
}

#ifdef BIBLESYNC
void bibleSyncCallback(char cmd, string pkt_uuid, string bible, string ref, string alt, string group, string domain, string info, string dump) {
SWLOGD("bibleSync callback msg: %c; pkt_uuid: %s; bible: %s; ref: %s; alt: %s; group: %s; domain: %s; info: %s; dump: %s", cmd, pkt_uuid.c_str(), bible.c_str(), ref.c_str(), alt.c_str(), group.c_str(), domain.c_str(), info.c_str(), dump.c_str());
	if (bibleSyncListener) {
SWLOGD("bibleSync listener is true");
		jclass cls = bibleSyncListenerEnv->GetObjectClass(bibleSyncListener);
		switch (cmd) {
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
				jmethodID mid = bibleSyncListenerEnv->GetMethodID(cls, "chatReceived",
				                                                  "(Ljava/lang/String;Ljava/lang/String;)V");
				if (mid) {
SWLOGD("bibleSync listener mid is available");
					jstring user = strToUTF8Java(bibleSyncListenerEnv, group.c_str());
					jstring msg = strToUTF8Java(bibleSyncListenerEnv, alt.c_str());
					bibleSyncListenerEnv->CallVoidMethod(bibleSyncListener, mid, user, msg);
					bibleSyncListenerEnv->DeleteLocalRef(user);
					bibleSyncListenerEnv->DeleteLocalRef(msg);
				}
				break;
			}
				// navigation
			case 'N': {
SWLOGD("bibleSync Nav Received: %s", ref.c_str());
				jmethodID mid = bibleSyncListenerEnv->GetMethodID(cls, "navReceived",
				                                                  "(Ljava/lang/String;)V");
				if (mid) {
SWLOGD("bibleSync listener mid is available");
					jstring msg = strToUTF8Java(bibleSyncListenerEnv, ref.c_str());
					bibleSyncListenerEnv->CallVoidMethod(bibleSyncListener, mid, msg);
					bibleSyncListenerEnv->DeleteLocalRef(msg);
				}
				break;
			}
			default:
SWLOGD("bibleSync listener got unhandled cmd: '%c'", cmd);
				break;
		}
SWLOGD("bibleSync listener deleting local ref to cls");
		bibleSyncListenerEnv->DeleteLocalRef(cls);
	}
}
#endif

}


JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_version
		(JNIEnv *env, jobject me) {

	init(env);

	return strToUTF8Java(env, SWVersion::currentVersion.getText());
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    reInit
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_reInit
		(JNIEnv *env, jobject me) {

	jclass swmgrClass = env->GetObjectClass(me);
	jmethodID getStorageBasePath = env->GetMethodID(swmgrClass, "getStorageBasePath", "()Ljava/lang/String;");
	jstring basePathJS = (jstring)env->CallObjectMethod(me, getStorageBasePath);

	const char *basePath = (basePathJS?env->GetStringUTFChars(basePathJS, nullptr):nullptr);
	STORAGE_BASE = basePath;
	env->ReleaseStringUTFChars(basePathJS, basePath);
SWLOGD("setting STORAGE_BASE to: %s", STORAGE_BASE.c_str());

	delete mgr;
	mgr = nullptr;
}


JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_getPrefixPath
		(JNIEnv *env, jobject me) {

	init(env);

	return strToUTF8Java(env, mgr->prefixPath);
}

JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_getConfigPath
		(JNIEnv *env, jobject me) {

	init(env);

	return strToUTF8Java(env, mgr->configPath);
}


JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_getModInfoList
		(JNIEnv *env, jobject) {

	init(env);

	int size = 0;
	for (sword::ModMap::const_iterator it = mgr->getModules().begin(); it != mgr->getModules().end(); ++it) {
//		if ((!(it->second->getConfigEntry("CipherKey"))) || (*(it->second->getConfigEntry("CipherKey"))))
			size++;
	}

SWLOGD("getModInfoList returning %d length array\n", size);

	jclass clazzModInfo = env->FindClass("org/crosswire/android/sword/SWMgr$ModInfo");
	jclass clazzString  = env->FindClass("java/lang/String");

	jfieldID nameID     = env->GetFieldID(clazzModInfo, "name",        "Ljava/lang/String;");
	jfieldID descID     = env->GetFieldID(clazzModInfo, "description", "Ljava/lang/String;");
	jfieldID catID      = env->GetFieldID(clazzModInfo, "category",    "Ljava/lang/String;");
	jfieldID langID     = env->GetFieldID(clazzModInfo, "language",    "Ljava/lang/String;");
	jfieldID versionID  = env->GetFieldID(clazzModInfo, "version",     "Ljava/lang/String;");
	jfieldID deltaID    = env->GetFieldID(clazzModInfo, "delta",       "Ljava/lang/String;");
	jfieldID cipherKeyID= env->GetFieldID(clazzModInfo, "cipherKey",   "Ljava/lang/String;");
	jfieldID featuresID = env->GetFieldID(clazzModInfo, "features",    "[Ljava/lang/String;");

	jobjectArray ret = (jobjectArray) env->NewObjectArray(size, clazzModInfo, nullptr);

	int i = 0;
	for (sword::ModMap::const_iterator it = mgr->getModules().begin(); it != mgr->getModules().end(); ++it) {
		const SWModule *module = it->second;

		SWBuf type = module->getType();
		SWBuf cat = module->getConfigEntry("Category");
		SWBuf version = module->getConfigEntry("Version");
		if (cat.length() > 0) type = cat;

		jobject modInfo = env->AllocObject(clazzModInfo); 

		jstring val;
		val = strToUTF8Java(env, module->getName());        env->SetObjectField(modInfo, nameID     , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, module->getDescription()); env->SetObjectField(modInfo, descID     , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, type);                         env->SetObjectField(modInfo, catID      , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, module->getLanguage());    env->SetObjectField(modInfo, langID     , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, version);                      env->SetObjectField(modInfo, versionID  , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, "");                       env->SetObjectField(modInfo, deltaID    , val); env->DeleteLocalRef(val);
		const char *cipherKey = module->getConfigEntry("CipherKey");
		if (cipherKey) {
			val = strToUTF8Java(env, cipherKey);        env->SetObjectField(modInfo, cipherKeyID, val); env->DeleteLocalRef(val);
		}
		else                                                                env->SetObjectField(modInfo, cipherKeyID, (jobject) nullptr);

		ConfigEntMap::const_iterator start = module->getConfig().lower_bound("Feature");
		ConfigEntMap::const_iterator end   = module->getConfig().upper_bound("Feature");

		int featureCount = 0;
		for (ConfigEntMap::const_iterator fit = start; fit != end; ++fit) {
			++featureCount;
		}
		jobjectArray features = (jobjectArray) env->NewObjectArray(featureCount, clazzString, nullptr);
		featureCount = 0;
		for (ConfigEntMap::const_iterator fit = start; fit != end; ++fit) {
			env->SetObjectArrayElement(features, featureCount++, strToUTF8Java(env, fit->second));
		}
		env->SetObjectField(modInfo, featuresID, features);
		env->DeleteLocalRef(features);

		env->SetObjectArrayElement(ret, i++, modInfo);

		env->DeleteLocalRef(modInfo);

	}

//	env->DeleteLocalRef(ret);

	return ret;
}

/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getModuleByName
 * Signature: (Ljava/lang/String;)Lorg/crosswire/android/sword/SWModule;
 */
JNIEXPORT jobject JNICALL Java_org_crosswire_android_sword_SWMgr_getModuleByName
		(JNIEnv *env, jobject me, jstring modNameJS) {

	init(env);

	jobject retVal = nullptr;

	const char *modName = env->GetStringUTFChars(modNameJS, nullptr);
	sword::SWModule *module = mgr->getModule(modName);
	env->ReleaseStringUTFChars(modNameJS, modName);

	if (module) {
		SWBuf type = module->getType();
		SWBuf cat = module->getConfigEntry("Category");
		if (cat.length() > 0) type = cat;
		jfieldID fieldID;
		jclass clazzSWModule = env->FindClass("org/crosswire/android/sword/SWModule");
		retVal = env->AllocObject(clazzSWModule); 
		fieldID = env->GetFieldID(clazzSWModule, "name", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, module->getName()));
		fieldID = env->GetFieldID(clazzSWModule, "description", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, module->getDescription()));
		fieldID = env->GetFieldID(clazzSWModule, "category", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, type.c_str()));
	}
	return retVal;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    setGlobalOption
 * Signature: (Ljava/lang/String;Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_setGlobalOption
		(JNIEnv *env, jobject me, jstring optionJS, jstring valueJS) {

	init(env);

	const char *option = env->GetStringUTFChars(optionJS, nullptr);
	const char *value  = env->GetStringUTFChars(valueJS, nullptr);

	mgr->setGlobalOption(option, value);

	env->ReleaseStringUTFChars(valueJS, value);
	env->ReleaseStringUTFChars(optionJS, option);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getGlobalOption
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_getGlobalOption
		(JNIEnv *env, jobject me, jstring optionJS) {

	init(env);

	const char *option = env->GetStringUTFChars(optionJS, nullptr);

	SWBuf value = mgr->getGlobalOption(option);

	env->ReleaseStringUTFChars(optionJS, option);

	return strToUTF8Java(env, value);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getGlobalOptionTip
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_getGlobalOptionTip
		(JNIEnv *env, jobject me, jstring optionJS) {

	init(env);

	const char *option = env->GetStringUTFChars(optionJS, nullptr);

	SWBuf value = mgr->getGlobalOptionTip(option);

	env->ReleaseStringUTFChars(optionJS, option);

	return strToUTF8Java(env, value);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    filterText
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_filterText
		(JNIEnv *env, jobject me, jstring filterNameJS, jstring textJS) {

	init(env);

	const char *filterName = env->GetStringUTFChars(filterNameJS, nullptr);
	const char *text  = env->GetStringUTFChars(textJS, nullptr);

	SWBuf buf = text;
	// hmmm, in the future, provide a param to specify filter value maybe?
	mgr->setGlobalOption("Greek Accents", "Off");
	mgr->filterText(filterName, buf);

	env->ReleaseStringUTFChars(textJS, text);
	env->ReleaseStringUTFChars(filterNameJS, filterName);

	return strToUTF8Java(env, buf);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getGlobalOptions
 * Signature: ()[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_getGlobalOptions
		(JNIEnv *env, jobject me) {

	init(env);

	sword::StringList options = mgr->getGlobalOptions();
	int count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}

	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);

	count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		jstring s = strToUTF8Java(env, *it);
		env->SetObjectArrayElement(ret, count++, s);
		env->DeleteLocalRef(s);
	}

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getExtraConfigSections
 * Signature: ()[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_getExtraConfigSections
		(JNIEnv *env, jobject me) {

	init(env);

	SWBuf baseDir = STORAGE_BASE;
	SWBuf confPath = baseDir + "/extraConfig.conf";
	int count = 0;
	bool exists = FileMgr::existsFile(confPath.c_str());
	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret;
SWLOGD("libsword: extraConfig %s at path: %s", exists?"Exists":"Absent", confPath.c_str());
	if (exists) {
		SWConfig config(confPath.c_str());
		SectionMap::const_iterator sit;
		for (sit = config.getSections().begin(); sit != config.getSections().end(); ++sit) {
			count++;
		}
SWLOGD("libsword: %d sections found in extraConfig", count);
		ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);
		count = 0;
		for (sit = config.getSections().begin(); sit != config.getSections().end(); ++sit) {
			jstring s = strToUTF8Java(env, sit->first);
			env->SetObjectArrayElement(ret, count++, s);
			env->DeleteLocalRef(s);
		}
	}
	else {
		ret = (jobjectArray) env->NewObjectArray(0, clazzString, nullptr);
	}

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getExtraConfigKeys
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_getExtraConfigKeys
		(JNIEnv *env, jobject me, jstring section) {

	init(env);

	const char *s = env->GetStringUTFChars(section, nullptr);

	SWBuf mySection = s;

	env->ReleaseStringUTFChars(section, s);

	SWBuf baseDir = STORAGE_BASE;
	SWBuf confPath = baseDir + "/extraConfig.conf";
	int count = 0;
	bool exists = FileMgr::existsFile(confPath.c_str());
	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret;
	if (exists) {
		SWConfig config(confPath.c_str());
		SectionMap::const_iterator sit = config.getSections().find(mySection.c_str());
		if (sit != config.getSections().end()) {
			ConfigEntMap::const_iterator it;
			for (it = sit->second.begin(); it != sit->second.end(); ++it) {
				count++;
			}
			ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);
			count = 0;
			for (it = sit->second.begin(); it != sit->second.end(); ++it) {
			   	jstring ss = strToUTF8Java(env, it->first);
				env->SetObjectArrayElement(ret, count++, ss);
				env->DeleteLocalRef(ss);
			}
		}
		else {
			ret = (jobjectArray) env->NewObjectArray(0, clazzString, nullptr);
		}
	}
	else {
		ret = (jobjectArray) env->NewObjectArray(0, clazzString, nullptr);
	}

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getExtraConfigValue
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_getExtraConfigValue
		(JNIEnv *env, jobject me, jstring section, jstring key) {

	init(env);

	const char *s = env->GetStringUTFChars(section, nullptr);

	SWBuf mySection = s;

	env->ReleaseStringUTFChars(section, s);

	const char *k = env->GetStringUTFChars(key, nullptr);

	SWBuf myKey = k;

	env->ReleaseStringUTFChars(key, k);

	jstring ret = nullptr;

	SWBuf baseDir = STORAGE_BASE;
	SWBuf confPath = baseDir + "/extraConfig.conf";
	bool exists = FileMgr::existsFile(confPath.c_str());
	if (exists) {
		SWConfig config(confPath.c_str());
		SectionMap::const_iterator sit = config.getSections().find(mySection.c_str());
		if (sit != config.getSections().end()) {
			ConfigEntMap::const_iterator it = sit->second.find(myKey.c_str());
			if (it != sit->second.end()) {
				ret = strToUTF8Java(env, it->second.c_str());
			}
		}
	}

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    setExtraConfigValue
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_setExtraConfigValue
		(JNIEnv *env, jobject me, jstring section, jstring key, jstring value) {

	init(env);

	const char *s = env->GetStringUTFChars(section, nullptr);

	SWBuf mySection = s;

	env->ReleaseStringUTFChars(section, s);

	const char *k = env->GetStringUTFChars(key, nullptr);

	SWBuf myKey = k;

	env->ReleaseStringUTFChars(key, k);

	const char *v = env->GetStringUTFChars(value, nullptr);

	SWBuf myValue = v;

	env->ReleaseStringUTFChars(value, v);

	SWBuf baseDir = STORAGE_BASE;
	SWBuf confPath = baseDir + "/extraConfig.conf";
	SWConfig config(confPath.c_str());
	config[mySection][myKey] = myValue;
	config.save();

	Java_org_crosswire_android_sword_SWMgr_reInit(env, me);

}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    addExtraConfig
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_addExtraConfig
		(JNIEnv *env, jobject me, jstring blob) {

	init(env);

	const char *b = env->GetStringUTFChars(blob, nullptr);

	SWBuf myBlob = b;

	env->ReleaseStringUTFChars(blob, b);

	jobjectArray ret;

	int count = 0;
	jclass clazzString = env->FindClass("java/lang/String");

	SWBuf baseDir = STORAGE_BASE;
	SWBuf tmpConfPath = baseDir + "/tmpConfig.conf";
	FileMgr::removeFile(tmpConfPath.c_str());
	FileDesc *fd = FileMgr::getSystemFileMgr()->open(tmpConfPath.c_str(), FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	fd->getFd();
	fd->write(myBlob.c_str(), (long)myBlob.size());
	FileMgr::getSystemFileMgr()->close(fd);

	SWConfig newConfig(tmpConfPath.c_str());
	FileMgr::removeFile(tmpConfPath.c_str());
	SectionMap::const_iterator sit;
	for (sit = newConfig.getSections().begin(); sit != newConfig.getSections().end(); ++sit) {
		count++;
	}
	ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);
	count = 0;
	for (sit = newConfig.getSections().begin(); sit != newConfig.getSections().end(); ++sit) {
		jstring s = strToUTF8Java(env, sit->first.c_str());
		env->SetObjectArrayElement(ret, count++, s);
		env->DeleteLocalRef(s);
	}

	SWBuf confPath = baseDir + "/extraConfig.conf";
	SWConfig config(confPath.c_str());
	config.augment(newConfig);
	config.save();

	Java_org_crosswire_android_sword_SWMgr_reInit(env, me);

	return ret;
}


// TODO: not used yet.  Maybe not necessary
/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    putResource
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_putResource
		(JNIEnv *env, jobject me, jstring pathJS, jstring dataJS, jstring typeJS) {

	init(env);

	const char *s = env->GetStringUTFChars(pathJS, nullptr);

	SWBuf path = s;

	env->ReleaseStringUTFChars(pathJS, s);

	s = env->GetStringUTFChars(dataJS, nullptr);

	SWBuf data = s;

	env->ReleaseStringUTFChars(dataJS, s);

	s = env->GetStringUTFChars(typeJS, nullptr);

	SWBuf type = s;

	env->ReleaseStringUTFChars(typeJS, s);

	SWBuf baseDir = STORAGE_BASE;
	SWBuf fullPath = baseDir + "/" + path;
	FileMgr::createParent(fullPath.c_str());
	FileMgr::removeFile(fullPath.c_str());
	FileDesc *fd = FileMgr::getSystemFileMgr()->open(fullPath.c_str(), FileMgr::CREAT|FileMgr::WRONLY, FileMgr::IREAD|FileMgr::IWRITE);
	fd->getFd();
	fd->write(data.c_str(), (long)data.size());
	FileMgr::getSystemFileMgr()->close(fd);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getGlobalOptionValues
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_getGlobalOptionValues
		(JNIEnv *env, jobject me, jstring optionJS) {

	init(env);

	const char *option = env->GetStringUTFChars(optionJS, nullptr);

	sword::StringList options = mgr->getGlobalOptionValues(option);

	env->ReleaseStringUTFChars(optionJS, option);

	int count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		count++;
	}
	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);

	count = 0;
	for (sword::StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		jstring s = strToUTF8Java(env, *it);
		env->SetObjectArrayElement(ret, count++, s);
		env->DeleteLocalRef(s);
	}

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    setCipherKey
 * Signature: (Ljava/lang/String;Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_setCipherKey
		(JNIEnv *env, jobject me , jstring modNameJS, jstring keyJS) {

	init(env);

	const char *modName = env->GetStringUTFChars(modNameJS, nullptr);
	const char *key     = env->GetStringUTFChars(keyJS, nullptr);

	mgr->setCipherKey(modName, key);

	env->ReleaseStringUTFChars(keyJS, key);
	env->ReleaseStringUTFChars(modNameJS, modName);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    setJavascript
 * Signature: (Z)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_setJavascript
		(JNIEnv *env, jobject me, jboolean val) {

	init(env);

	mgr->setJavascript(val == JNI_TRUE);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    getAvailableLocales
 * Signature: ()[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWMgr_getAvailableLocales
		(JNIEnv *env, jobject me) {

	init(env);

	sword::StringList localeNames = LocaleMgr::getSystemLocaleMgr()->getAvailableLocales();
	int count = 0;
	for (sword::StringList::const_iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		count++;
	}

	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);

	count = 0;
	for (sword::StringList::const_iterator it = localeNames.begin(); it != localeNames.end(); ++it) {
		jstring s = strToUTF8Java(env, *it);
		env->SetObjectArrayElement(ret, count++, s);
		env->DeleteLocalRef(s);
	}
	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    setDefaultLocale
 * Signature: (Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_setDefaultLocale
		(JNIEnv *env, jobject me, jstring localeNameJS) {

	init(env);

	const char *localeName = env->GetStringUTFChars(localeNameJS, nullptr);

	LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(localeName);

	env->ReleaseStringUTFChars(localeNameJS, localeName);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    translate
 * Signature: (Ljava/lang/String;Ljava/lang/String)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWMgr_translate
		(JNIEnv *env, jobject me, jstring textJS, jstring localeNameJS) {
	const char *text = env->GetStringUTFChars(textJS, nullptr);
	const char *localeName = env->GetStringUTFChars(localeNameJS, nullptr);

	SWBuf translation = assureValidUTF8(LocaleMgr::getSystemLocaleMgr()->translate(text, (localeName && strcmp(localeName, "null"))?localeName:nullptr)); // NOLINT(bugprone-suspicious-string-compare)

	env->ReleaseStringUTFChars(localeNameJS, localeName);
	env->ReleaseStringUTFChars(textJS, text);

	return strToUTF8Java(env, translation);
}


// SWModule methods ----------------------------------------------------------------------------------


SWModule *getModule
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = nullptr;
	jclass clazzSWModule = env->FindClass("org/crosswire/android/sword/SWModule");
	jfieldID fieldID = env->GetFieldID(clazzSWModule, "name", "Ljava/lang/String;");
	jfieldID sourceFieldID = env->GetFieldID(clazzSWModule, "remoteSourceName", "Ljava/lang/String;");
	jstring modNameJS = (jstring)env->GetObjectField(me, fieldID);
	jstring sourceNameJS = (jstring)env->GetObjectField(me, sourceFieldID);
	const char *modName = (modNameJS?env->GetStringUTFChars(modNameJS, nullptr):nullptr);
	const char *sourceName = (sourceNameJS?env->GetStringUTFChars(sourceNameJS, nullptr):nullptr);
SWLOGD("libsword: lookup up module %s from source: %s", modName?modName:"<null>", sourceName?sourceName:"<null>");

	if (sourceName && *sourceName) {
		initInstall(env);
		InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);
		if (source != installMgr->sources.end()) {
			SWMgr *smgr = source->second->getMgr();
			module = smgr->getModule(modName);
		}
	}
	else module = mgr->getModule(modName);

	if (modName) env->ReleaseStringUTFChars(modNameJS, modName);
	if (sourceName) env->ReleaseStringUTFChars(sourceNameJS, sourceName);

	return module;
}

/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    setKeyText
 * Signature: (Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_setKeyText
		(JNIEnv *env, jobject me, jstring keyTextJS) {

	init(env);

	SWModule *module = getModule(env, me);

	if (module) {
		const char *keyText = env->GetStringUTFChars(keyTextJS, nullptr);
SWLOGD("setKeyText(%s, %s)", module->getName(), keyText);
		SWKey *key = module->getKey();
		VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
		if (vkey && (*keyText=='+' ||*keyText=='-')) {
			if (!stricmp(keyText+1, "book")) {
				int newBook = vkey->getBook() + ((*keyText=='+')?1:-1);
SWLOGD("setting book to %d", newBook);
				vkey->setBook((signed char)newBook);
				env->ReleaseStringUTFChars(keyTextJS, keyText);
				return;
			}
			else if (!stricmp(keyText+1, "chapter")) {
				vkey->setChapter(vkey->getChapter() + ((*keyText=='+')?1:-1));
				env->ReleaseStringUTFChars(keyTextJS, keyText);
				return;
			}
		}

		module->setKey(keyText);
		env->ReleaseStringUTFChars(keyTextJS, keyText);
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getKeyText
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getKeyText
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = getModule(env, me);

	jstring retVal = nullptr;
	if (module) {
		retVal = strToUTF8Java(env, module->getKeyText());
	}
	return retVal;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getRenderText
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getRenderText
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = getModule(env, me);

	jstring retVal = nullptr;
	if (module) {
		retVal = strToUTF8Java(env, module->renderText());
	}
	return retVal;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getRenderHeader
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getRenderHeader
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = getModule(env, me);

	jstring retVal = nullptr;
	if (module) {
		retVal = strToUTF8Java(env, ((const char *)(module->getRenderHeader() ? module->getRenderHeader():"")));
	}
	return retVal;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    terminateSearch
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_terminateSearch
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = getModule(env, me);

	if (module) {
		module->terminateSearch = true;
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    error
 * Signature: ()C
 */
JNIEXPORT jchar JNICALL Java_org_crosswire_android_sword_SWModule_error
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = getModule(env, me);
	
	int error = (module) ? module->popError() : -99;
	return error;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getEntrySize
 * Signature: ()J
 */
JNIEXPORT jlong JNICALL Java_org_crosswire_android_sword_SWModule_getEntrySize
		(JNIEnv *env, jobject me) {

	init(env);

	SWModule *module = getModule(env, me);

	return (module) ? module->getEntrySize() : 0;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getEntryAttribute
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWModule_getEntryAttribute
		(JNIEnv *env, jobject me, jstring level1JS, jstring level2JS, jstring level3JS, jboolean filteredJS) {

	init(env);

	const char *level1 = env->GetStringUTFChars(level1JS, nullptr);
	const char *level2 = env->GetStringUTFChars(level2JS, nullptr);
	const char *level3 = env->GetStringUTFChars(level3JS, nullptr);
	bool filtered = (filteredJS == JNI_TRUE);
SWLOGD("calling getEntryAttributes(%s, %s, %s, %s", level1, level2, level3, (filtered?"true":"false"));

	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret = nullptr;

	SWModule *module = getModule(env, me);

	if (module) {

		module->renderText();	// force parse
		vector<SWBuf> results;

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

		ret = (jobjectArray) env->NewObjectArray(results.size(), clazzString, nullptr);

SWLOGD("getEntryAttributes: size returned: %d", results.size());

		for (int i = 0; i < results.size(); ++i) {
			jstring s;
			if (filtered) {
				SWBuf rendered = module->renderText(results[i].c_str());
				s = strToUTF8Java(env, rendered.c_str());
			}
			else {
				s = strToUTF8Java(env, results[i].c_str());
			}
			env->SetObjectArrayElement(ret, i, s);
			env->DeleteLocalRef(s);
		}
	}

	env->ReleaseStringUTFChars(level3JS, level3);
	env->ReleaseStringUTFChars(level2JS, level2);
	env->ReleaseStringUTFChars(level1JS, level1);

	return (ret) ? ret : (jobjectArray) env->NewObjectArray(0, clazzString, nullptr);
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    parseKeyList
 * Signature: (Ljava/lang/String;)[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWModule_parseKeyList
		(JNIEnv *env, jobject me, jstring keyListTextJS) {

	init(env);

	const char *keyListText = env->GetStringUTFChars(keyListTextJS, nullptr);

	SWModule *module = getModule(env, me);
	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret = nullptr;

	if (module) {
		SWKey *k = module->getKey();
		VerseKey *parser = SWDYNAMIC_CAST(VerseKey, k);
		if (parser) {
			sword::ListKey result;
			result = parser->parseVerseList(keyListText, *parser, true);
			int count = 0;
			for (result = sword::TOP; !result.popError(); result++) {
				count++;
			}
			ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);

			count = 0;
			for (result = sword::TOP; !result.popError(); result++) {
				jstring s = strToUTF8Java(env, result.getText());
				env->SetObjectArrayElement(ret, count++, s);
				env->DeleteLocalRef(s);
			}
		}
		else	{
			ret = (jobjectArray) env->NewObjectArray(1, clazzString, nullptr);
			jstring s = strToUTF8Java(env, keyListText);
			env->SetObjectArrayElement(ret, 0, s);
			env->DeleteLocalRef(s);
		}
	}
	else	{
		ret = (jobjectArray) env->NewObjectArray(1, clazzString, nullptr);
		jstring s = strToUTF8Java(env, keyListText);
		env->SetObjectArrayElement(ret, 0, s);
		env->DeleteLocalRef(s);
	}

	env->ReleaseStringUTFChars(keyListTextJS, keyListText);

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    hasKeyChildren
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_org_crosswire_android_sword_SWModule_hasKeyChildren
		(JNIEnv *env, jobject me) {

	init(env);


	SWModule *module = getModule(env, me);
	jboolean retVal = JNI_FALSE;

	if (module) {
		sword::SWKey *key = module->getKey();

		TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
		if (tkey) {
			retVal = (tkey->hasChildren())?JNI_TRUE:JNI_FALSE;
		}
	}
	return retVal;
}

/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getKeyChildren
 * Signature: ()[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWModule_getKeyChildren
		(JNIEnv *env, jobject me) {

	init(env);


	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret = nullptr;

	SWModule *module = getModule(env, me);

	if (module) {
		sword::SWKey *key = module->getKey();
		int count = 0;

		sword::VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);
		if (vkey) {
			ret = (jobjectArray) env->NewObjectArray(11, clazzString, nullptr);
			SWBuf num;
			num.appendFormatted("%d", vkey->getTestament());
			env->SetObjectArrayElement(ret, 0, strToUTF8Java(env, num));
			num = "";
			num.appendFormatted("%d", vkey->getBook());
			env->SetObjectArrayElement(ret, 1, strToUTF8Java(env, num));
			num = "";
			num.appendFormatted("%d", vkey->getChapter());
			env->SetObjectArrayElement(ret, 2, strToUTF8Java(env, num));
			num = "";
			num.appendFormatted("%d", vkey->getVerse());
			env->SetObjectArrayElement(ret, 3, strToUTF8Java(env, num));
			num = "";
			num.appendFormatted("%d", vkey->getChapterMax());
			env->SetObjectArrayElement(ret, 4, strToUTF8Java(env, num));
			num = "";
			num.appendFormatted("%d", vkey->getVerseMax());
			env->SetObjectArrayElement(ret, 5, strToUTF8Java(env, num));
			env->SetObjectArrayElement(ret, 6, strToUTF8Java(env, vkey->getBookName()));
			env->SetObjectArrayElement(ret, 7, strToUTF8Java(env, vkey->getOSISRef()));
			env->SetObjectArrayElement(ret, 8, strToUTF8Java(env, vkey->getShortText()));
			env->SetObjectArrayElement(ret, 9, strToUTF8Java(env, vkey->getBookAbbrev()));
			env->SetObjectArrayElement(ret, 10, strToUTF8Java(env, vkey->getOSISBookName()));
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
				ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);
				count = 0;
				if (tkey->firstChild()) {
					do {
						jstring s = strToUTF8Java(env, tkey->getLocalName());
						env->SetObjectArrayElement(ret, count++, s);
						env->DeleteLocalRef(s);
					}
					while (tkey->nextSibling());
					tkey->parent();
				}
			}
		}
	}
	else ret = (jobjectArray) env->NewObjectArray(0, clazzString, nullptr);
	return ret;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getKeyParent
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getKeyParent
		(JNIEnv *env, jobject me) {

	init(env);


	SWBuf retVal = "";

	SWModule *module = getModule(env, me);

	if (module) {

		sword::SWKey *key = module->getKey();

		TreeKeyIdx *tkey = SWDYNAMIC_CAST(TreeKeyIdx, key);
		if (tkey) {
			if (tkey->parent()) {
				retVal = tkey->getText();
			}
		}
	}
	return strToUTF8Java(env, retVal);
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    previous
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_previous
		(JNIEnv *env, jobject me) {

	init(env);


	SWModule *module = getModule(env, me);

	if (module) {
		module->decrement();
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    next
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_next
		(JNIEnv *env, jobject me) {

	init(env);


	SWModule *module = getModule(env, me);

	if (module) {
		module->increment();
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    begin
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_begin
		(JNIEnv *env, jobject me) {

	init(env);


	SWModule *module = getModule(env, me);

	if (module) {
		module->setPosition(sword::TOP);
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getStripText
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getStripText
		(JNIEnv *env, jobject me) {

	init(env);


	SWBuf retVal = "";

	SWModule *module = getModule(env, me);

	if (module) {
		retVal = module->stripText();
	}

	return strToUTF8Java(env, retVal);
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getRawEntry
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getRawEntry
		(JNIEnv *env, jobject me) {

	init(env);


	SWBuf retVal = "";

	SWModule *module = getModule(env, me);

	if (module) {
		retVal = module->getRawEntry();
	}

	return strToUTF8Java(env, retVal);
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    setRawEntry
 * Signature: (Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_setRawEntry
		(JNIEnv *env, jobject me, jstring newEntryTextJS) {

	init(env);


	const char *newEntryText = env->GetStringUTFChars(newEntryTextJS, nullptr);

	SWModule *module = getModule(env, me);

	if (module) {
		module->setEntry(newEntryText);
	}

	env->ReleaseStringUTFChars(newEntryTextJS, newEntryText);
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    getConfigEntry
 * Signature: (Ljava/lang/String;)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL Java_org_crosswire_android_sword_SWModule_getConfigEntry
		(JNIEnv *env, jobject me, jstring configKeyJS) {

	init(env);


	jstring retVal = nullptr;

	const char *configKey = env->GetStringUTFChars(configKeyJS, nullptr);
SWLOGD("getConfigEntry(%s)\n", configKey);

	SWModule *module = getModule(env, me);

	if (module) {
SWLOGD("getConfigEntry, found module.");


		const char *configValue = module->getConfigEntry(configKey);
//SWLOGD("getConfigEntry, configValue: %s", configValue);
		if (configValue) {
			SWBuf confValue = configValue;
			// special processing if we're requesting About-- kindof cheese
			if (!strcmp("About", configKey)) {
				RTFHTML().processText(confValue);
			}
//SWLOGD("getConfigEntry, configValue: %s", confValue.c_str());
			retVal = strToUTF8Java(env, confValue.c_str());
		}
	}

	env->ReleaseStringUTFChars(configKeyJS, configKey);

	return retVal;
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    deleteSearchFramework
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWModule_deleteSearchFramework
		(JNIEnv *env, jobject me) {

	init(env);


	SWModule *module = getModule(env, me);

	if (module) {
		module->deleteSearchFramework();
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    hasSearchFramework
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_org_crosswire_android_sword_SWModule_hasSearchFramework
		(JNIEnv *env, jobject me) {

	init(env);


	SWModule *module = getModule(env, me);

	return (module && module->hasSearchFramework()) ? JNI_TRUE : JNI_FALSE;
}


struct pu {
	pu(JNIEnv *env, jobject pr) : env(env), progressReporter(pr), last(0) {
SWLOGD("building progressReporter");
		jclass cls = env->GetObjectClass(progressReporter);
		mid = env->GetMethodID(cls, "progressReport", "(I)V");
		env->DeleteLocalRef(cls);
	}
	~pu() {
	}
	JNIEnv *env;
	jobject progressReporter;
	jmethodID mid;
	char last;
};


void percentUpdate(char percent, void *userData) {
	struct pu *p = (struct pu *)userData;

	// assert we've actually been given a progressReporter
	if (!p->progressReporter) return;

	if (percent != p->last) {
		p->last = percent;
		if (p->mid != nullptr) {
			p->env->CallVoidMethod(p->progressReporter, p->mid, (jint)percent);
		}
	}
}


/*
 * Class:     org_crosswire_android_sword_SWModule
 * Method:    search
 * Signature: (Ljava/lang/String;IJLjava/lang/String;Lorg/crosswire/android/sword/SWModule/SearchProgressReporter;)[Lorg/crosswire/android/sword/SWModule/SearchHit;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_SWModule_search
		(JNIEnv *env, jobject me, jstring expressionJS, jint srchType, jlong flags, jstring scopeJS, jobject progressReporter) {

	init(env);

	const int MAX_RETURN_COUNT = 999999;

	const char *expression = env->GetStringUTFChars(expressionJS, nullptr);
	const char *scope = scopeJS ? env->GetStringUTFChars(scopeJS, nullptr) : nullptr;

	jclass clazzSearchHit = env->FindClass("org/crosswire/android/sword/SWModule$SearchHit");
	jobjectArray ret = nullptr;

	SWModule *module = getModule(env, me);

	// TODO: remove this from the stack
	pu *peeuuu = new pu(env, progressReporter);

	if (module) {
		ListKey lscope;
		ListKey result;

		if ((scope) && (strlen(scope)) > 0) {
			SWKey *p = module->createKey();
			VerseKey *parser = SWDYNAMIC_CAST(VerseKey, p);
			if (!parser) {
				delete p;
				parser = new VerseKey();
			}
			*parser = module->getKeyText();
			lscope = parser->parseVerseList(scope, *parser, true);
			result = module->search(expression, srchType, flags, &lscope, nullptr, &percentUpdate, peeuuu);
			delete parser;
		}
		else	result = module->search(expression, srchType, flags, nullptr, nullptr, &percentUpdate, peeuuu);

		delete peeuuu;

		int count = 0;
		for (result = sword::TOP; !result.popError(); result++) count++;

		if (count > MAX_RETURN_COUNT) count = MAX_RETURN_COUNT;

		ret = (jobjectArray) env->NewObjectArray(count, clazzSearchHit, nullptr);

		// if we're sorted by score, let's re-sort by verse, because Java can always re-sort by score
		result = sword::TOP;
		if ((count) && (long)result.getElement()->userData)
			result.sort();

		int i = 0;
		jstring modName = strToUTF8Java(env, module->getName());
		jfieldID fieldIDModName = env->GetFieldID(clazzSearchHit, "modName", "Ljava/lang/String;");
		jfieldID fieldIDKey     = env->GetFieldID(clazzSearchHit, "key"    , "Ljava/lang/String;");
		jfieldID fieldIDScore   = env->GetFieldID(clazzSearchHit, "score"  , "J");
		for (result = sword::TOP; !result.popError(); result++) {
			jobject searchHit = env->AllocObject(clazzSearchHit);

			env->SetObjectField(searchHit, fieldIDModName, modName);
			jstring key = strToUTF8Java(env, result.getText());
			env->SetObjectField(searchHit, fieldIDKey, key);
			env->DeleteLocalRef(key);
			env->SetLongField(searchHit, fieldIDScore, (jlong)result.getElement()->userData);

			env->SetObjectArrayElement(ret, i++, searchHit);
			env->DeleteLocalRef(searchHit);
			if (i >= MAX_RETURN_COUNT) break;
		}
		env->DeleteLocalRef(modName);
	}

	if (scope) env->ReleaseStringUTFChars(scopeJS, scope);
	env->ReleaseStringUTFChars(expressionJS, expression);

	return (ret) ? ret : (jobjectArray) env->NewObjectArray(0, clazzSearchHit, nullptr);
}



// InstallMgr methods ----------------------------------------------------------------------------------


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    reInit
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_InstallMgr_reInit
		(JNIEnv *env, jobject me) {

	delete installMgr;
	installMgr = nullptr;
}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    syncConfig
 * Signature: ()I
 */
JNIEXPORT jint JNICALL Java_org_crosswire_android_sword_InstallMgr_syncConfig
		(JNIEnv *env, jobject me) {

	initInstall(env);

	return installMgr->refreshRemoteSourceConfiguration();
}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    uninstallModule
 * Signature: (Ljava/lang/String;)I
 */
JNIEXPORT jint JNICALL Java_org_crosswire_android_sword_InstallMgr_uninstallModule
		(JNIEnv *env, jobject me, jstring modNameJS) {

	init(env);
	initInstall(env);

	const char *modName = env->GetStringUTFChars(modNameJS, nullptr);

SWLOGD("uninstallModule %s\n", modName);

	const SWModule *module = mgr->getModule(modName);

	env->ReleaseStringUTFChars(modNameJS, modName);

	if (!module) {
		return -2;
	}
	int retVal = installMgr->removeModule(mgr, module->getName());


	return retVal;
}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    getRemoteSources
 * Signature: ()[Ljava/lang/String;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_InstallMgr_getRemoteSources
		(JNIEnv *env, jobject me) {

	initInstall(env);

	jclass clazzString = env->FindClass("java/lang/String");
	jobjectArray ret;

	int count = 0;
	for (InstallSourceMap::const_iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); ++it) {
		count++;
	}
SWLOGD("getRemoteSources: count: %d\n", count);
	ret = (jobjectArray) env->NewObjectArray(count, clazzString, nullptr);
	count = 0;
	for (InstallSourceMap::const_iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); ++it) {
		jstring s = strToUTF8Java(env, it->second->caption);
		env->SetObjectArrayElement(ret, count++, s);
		env->DeleteLocalRef(s);
	}

	return ret;
}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    refreshRemoteSource
 * Signature: (Ljava/lang/String;)I
 */
JNIEXPORT jint JNICALL Java_org_crosswire_android_sword_InstallMgr_refreshRemoteSource
		(JNIEnv *env, jobject me, jstring sourceNameJS) {

	initInstall(env);

	const char *sourceName = env->GetStringUTFChars(sourceNameJS, nullptr);

	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);

	env->ReleaseStringUTFChars(sourceNameJS, sourceName);

	if (source == installMgr->sources.end()) {
		return -3;
	}


	return installMgr->refreshRemoteSource(source->second);
}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    getRemoteModInfoList
 * Signature: (Ljava/lang/String;)[Lorg/crosswire/android/sword/SWMgr/ModInfo;
 */
JNIEXPORT jobjectArray JNICALL Java_org_crosswire_android_sword_InstallMgr_getRemoteModInfoList
		(JNIEnv *env, jobject me, jstring sourceNameJS) {

SWLOGD("getRemoteModInfoList\n");
	init(env);
	initInstall(env);

	const char *sourceName = env->GetStringUTFChars(sourceNameJS, nullptr);
SWLOGD("sourceName: %s\n", sourceName);

	jclass clazzModInfo = env->FindClass("org/crosswire/android/sword/SWMgr$ModInfo");
	jclass clazzString  = env->FindClass("java/lang/String");

	jfieldID nameID     = env->GetFieldID(clazzModInfo, "name",        "Ljava/lang/String;");
	jfieldID descID     = env->GetFieldID(clazzModInfo, "description", "Ljava/lang/String;");
	jfieldID catID      = env->GetFieldID(clazzModInfo, "category",    "Ljava/lang/String;");
	jfieldID langID     = env->GetFieldID(clazzModInfo, "language",    "Ljava/lang/String;");
	jfieldID versionID  = env->GetFieldID(clazzModInfo, "version",     "Ljava/lang/String;");
	jfieldID deltaID    = env->GetFieldID(clazzModInfo, "delta",       "Ljava/lang/String;");
	jfieldID cipherKeyID= env->GetFieldID(clazzModInfo, "cipherKey",   "Ljava/lang/String;");
	jfieldID featuresID = env->GetFieldID(clazzModInfo, "features",    "[Ljava/lang/String;");
	jobjectArray ret = nullptr;
	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
SWLOGD("remoteListModules returning 0 length array\n");
		ret = (jobjectArray) env->NewObjectArray(0, clazzModInfo, nullptr);

		env->ReleaseStringUTFChars(sourceNameJS, sourceName);
//		env->DeleteLocalRef(ret);

		return ret;
	}
SWLOGD("found source: %s\n", sourceName);

	map<SWModule *, int> modStats = InstallMgr::getModuleStatus(*mgr, *source->second->getMgr());

	int size = 0;
	for (map<SWModule *, int>::const_iterator it = modStats.begin(); it != modStats.end(); ++it) {
		size++;
	}

SWLOGD("remoteListModules returning %d length array\n", size);
	ret = (jobjectArray) env->NewObjectArray(size, clazzModInfo, nullptr);

	int i = 0;
	for (map<SWModule *, int>::const_iterator it = modStats.begin(); it != modStats.end(); ++it) {
		SWModule *module = it->first;
		unsigned int status = it->second;

		SWBuf version   = module->getConfigEntry("Version");
		SWBuf statusString = " ";
		if (status & InstallMgr::MODSTAT_NEW) statusString = "*";
		if (status & InstallMgr::MODSTAT_OLDER) statusString = "-";
		if (status & InstallMgr::MODSTAT_UPDATED) statusString = "+";

		SWBuf type = module->getType();
		SWBuf cat = module->getConfigEntry("Category");
		if (cat.length() > 0) type = cat;
		jobject modInfo = env->AllocObject(clazzModInfo); 

		jstring val;
		val = strToUTF8Java(env, module->getName());        env->SetObjectField(modInfo, nameID     , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, module->getDescription()); env->SetObjectField(modInfo, descID     , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, type);             env->SetObjectField(modInfo, catID      , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, module->getLanguage());    env->SetObjectField(modInfo, langID     , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, version);          env->SetObjectField(modInfo, versionID  , val); env->DeleteLocalRef(val);
		val = strToUTF8Java(env, statusString);     env->SetObjectField(modInfo, deltaID    , val); env->DeleteLocalRef(val);
		const char *cipherKey = module->getConfigEntry("CipherKey");
		if (cipherKey) {
			val = strToUTF8Java(env, cipherKey);            env->SetObjectField(modInfo, cipherKeyID, val); env->DeleteLocalRef(val);
		}
		else                                                                env->SetObjectField(modInfo, cipherKeyID, (jobject)nullptr);

		ConfigEntMap::const_iterator start = module->getConfig().lower_bound("Feature");
		ConfigEntMap::const_iterator end   = module->getConfig().upper_bound("Feature");

		int featureCount = 0;
		for (ConfigEntMap::const_iterator fit = start; fit != end; ++fit) {
			++featureCount;
		}
		jobjectArray features = (jobjectArray) env->NewObjectArray(featureCount, clazzString, nullptr);
		featureCount = 0;
		for (ConfigEntMap::const_iterator fit = start; fit != end; ++fit) {
			val = strToUTF8Java(env, fit->second);
			env->SetObjectArrayElement(features, featureCount++, val);
			env->DeleteLocalRef(val);
		}
		env->SetObjectField(modInfo, featuresID, features);
		env->DeleteLocalRef(features);

		env->SetObjectArrayElement(ret, i++, modInfo);

		env->DeleteLocalRef(modInfo);
	}

	env->ReleaseStringUTFChars(sourceNameJS, sourceName);
//	env->DeleteLocalRef(ret);

	return ret;
}

/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    remoteInstallModule
 * Signature: (Ljava/lang/String;Ljava/lang/String;)I
 */
JNIEXPORT jint JNICALL Java_org_crosswire_android_sword_InstallMgr_remoteInstallModule
		(JNIEnv *env, jobject me, jstring sourceNameJS, jstring modNameJS, jobject progressReporter) {

	init(env);
	initInstall(env, progressReporter);

	const char *sourceName = env->GetStringUTFChars(sourceNameJS, nullptr);
SWLOGD("remoteInstallModule: sourceName: %s\n", sourceName);
	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName);
	env->ReleaseStringUTFChars(sourceNameJS, sourceName);

	if (source == installMgr->sources.end()) {
		return -3;
	}

	InstallSource *is = source->second;
	SWMgr *rmgr = is->getMgr();

	const char *modName = env->GetStringUTFChars(modNameJS, nullptr);
SWLOGD("remoteInstallModule: modName: %s\n", modName);
	const SWModule *module = rmgr->getModule(modName);
	env->ReleaseStringUTFChars(modNameJS, modName);

	if (!module) {
		return -4;
	}

	int error = installMgr->installModule(mgr, nullptr, module->getName(), is);

	if (progressReporter) {
		jclass cls = env->GetObjectClass(progressReporter);
		jmethodID mid = env->GetMethodID(cls, "preStatus", "(JJLjava/lang/String;)V");
		if (mid) {
			jstring msg = strToUTF8Java(env, "Complete");
			env->CallVoidMethod(progressReporter, mid, (jlong)0, (jlong)0, msg);
			env->DeleteLocalRef(msg);
		}
		env->DeleteLocalRef(cls);
	}

	return error;
}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    getRemoteModuleByName
 * Signature: (Ljava/lang/String;Ljava/lang/String;)Lorg/crosswire/android/sword/SWModule;
 */
JNIEXPORT jobject JNICALL Java_org_crosswire_android_sword_InstallMgr_getRemoteModuleByName
		(JNIEnv *env, jobject me, jstring sourceNameJS, jstring modNameJS) {

	jobject retVal = nullptr;

	initInstall(env);

	const char *sourceNameC = env->GetStringUTFChars(sourceNameJS, nullptr);
	SWBuf sourceName = sourceNameC;
SWLOGD("getRemoteModuleByName: sourceName: %s\n", sourceName.c_str());
	InstallSourceMap::const_iterator source = installMgr->sources.find(sourceName.c_str());
	env->ReleaseStringUTFChars(sourceNameJS, sourceNameC);

	if (source == installMgr->sources.end()) {
SWLOGD("Couldn't find remote source [%s]\n", sourceName.c_str());
		return nullptr;
	}

	SWMgr *smgr = source->second->getMgr();

	const char *modNameC = env->GetStringUTFChars(modNameJS, nullptr);
	SWBuf modName = modNameC;
	sword::SWModule *module = smgr->getModule(modName.c_str());
	env->ReleaseStringUTFChars(modNameJS, modNameC);

	if (module) {
SWLOGD("Found remote module [%s]: %s\n", sourceName.c_str(), modName.c_str());
		SWBuf type = module->getType();
		SWBuf cat = module->getConfigEntry("Category");
		if (cat.length() > 0) type = cat;
		jfieldID fieldID;
		jclass clazzSWModule = env->FindClass("org/crosswire/android/sword/SWModule");
		retVal = env->AllocObject(clazzSWModule); 
		fieldID = env->GetFieldID(clazzSWModule, "name", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, module->getName()));
		fieldID = env->GetFieldID(clazzSWModule, "description", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, module->getDescription()));
		fieldID = env->GetFieldID(clazzSWModule, "category", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, type));
		fieldID = env->GetFieldID(clazzSWModule, "remoteSourceName", "Ljava/lang/String;"); env->SetObjectField(retVal, fieldID, strToUTF8Java(env, sourceName));
SWLOGD("returning remote module [%s]: %s\n", sourceName.c_str(), modName.c_str());
	}

	return retVal;

}


/*
 * Class:     org_crosswire_android_sword_InstallMgr
 * Method:    setUserDisclaimerConfirmed
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_InstallMgr_setUserDisclaimerConfirmed
		(JNIEnv *env, jobject me) {

	initInstall(env);

	disclaimerConfirmed = true;
	installMgr->setUserDisclaimerConfirmed(true);
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    sendBibleSyncMessage
 * Signature: (Ljava/lang/String;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_sendBibleSyncMessage
		(JNIEnv *env, jobject me, jstring osisRefJS) {
SWLOGD("libsword: sendBibleSyncMessage() begin");

	if (!bibleSync) {
SWLOGD("libsword: sendBibleSyncMessage() bibleSync not active; message not sent.");
		return;
	}
	const char *osisRefString = env->GetStringUTFChars(osisRefJS, nullptr);
	SWBuf modName = "Bible";
	SWBuf osisRef = osisRefString;
	const char *modNamePrefix = osisRef.stripPrefix(':');
	if (modNamePrefix) modName = modNamePrefix;

#ifdef BIBLESYNC
	BibleSync_xmit_status result = bibleSync->Transmit(modName.c_str(), osisRef.c_str());
#endif
SWLOGD("libsword: sendBibleSyncMessage() finished with status code: %d", result);

	env->ReleaseStringUTFChars(osisRefJS, osisRefString);
}


/*
 * NOTE: this method blocks and should be called in a new thread
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    startBibleSync
 * Signature: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lorg/crosswire/android/sword/SWMgr/BibleSyncListener;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_startBibleSync
  (JNIEnv *env, jobject me, jstring appNameJS, jstring userNameJS, jstring passphraseJS, jobject bibleSyncListenerMe) {

SWLOGD("startBibleSync() start");
	// only one thread
	static bool starting = false;
	if (starting) return;
	starting = true;
	// kill any previous loop
	if (bibleSyncListener) bibleSyncListener = nullptr;
#ifdef BIBLESYNC
	const char *paramString = env->GetStringUTFChars(appNameJS, nullptr);
	SWBuf appName = paramString;
	env->ReleaseStringUTFChars(appNameJS, paramString);
	paramString = env->GetStringUTFChars(userNameJS, nullptr);
	SWBuf userName = paramString;
	env->ReleaseStringUTFChars(userNameJS, paramString);
	paramString = env->GetStringUTFChars(passphraseJS, nullptr);
	SWBuf passphrase = paramString;
	env->ReleaseStringUTFChars(passphraseJS, paramString);

	// in case we're restarting, wait for our loop to finish for sure
	if (::bibleSync) {
SWLOGD("startBibleSync() sleeping 3 seconds");
		sleep(3);
	}

	bibleSyncListener = bibleSyncListenerMe;
	bibleSyncListenerEnv = env;
SWLOGD("startBibleSync - calling init");

	if (!bibleSync) {
SWLOGD("bibleSync initializing c-tor");
		bibleSync = new BibleSync(appName.c_str(), SWVersion::currentVersion.getText(), userName.c_str());
SWLOGD("bibleSync initializing setMode");
		bibleSync->setMode(BSP_MODE_PERSONAL, bibleSyncCallback, passphrase.c_str());
	}
SWLOGD("startBibleSync - starting while listener");
	starting = false;
	while (bibleSyncListener) {
SWLOGD("bibleSyncListener - while loop iteration");
		BibleSync::Receive(bibleSync);
SWLOGD("bibleSyncListener - sleeping for 2 seconds");
		sleep(2);
	}
	delete bibleSync;
	bibleSync = nullptr;
#else
SWLOGD("registerBibleSyncListener: !!! BibleSync disabled in native code.");
#endif
}


/*
 * Class:     org_crosswire_android_sword_SWMgr
 * Method:    stopBibleSync
 * Signature: (V;)V
 */
JNIEXPORT void JNICALL Java_org_crosswire_android_sword_SWMgr_stopBibleSync
		(JNIEnv *env, jobject me) {

SWLOGD("stopBibleSync()");
#ifdef BIBLESYNC
	// if we have a listen loop going, just break the loop; the bibleSync cleanup will happen there
	if (bibleSyncListener) bibleSyncListener = nullptr;
	else if (bibleSync) {
		delete bibleSync;
		bibleSync = nullptr;
	}
#else
SWLOGD("registerBibleSyncListener: !!! BibleSync disabled in native code.");
#endif
}

jint JNI_OnLoad(JavaVM *vm, void *reserved) {
	javaVM = vm;
	return JNI_VERSION_1_2;
}

void JNI_OnUnload(JavaVM *vm, void *reserved) {
	delete bibleSync;
	delete installMgr;
	delete mgr;
}

