var	argscheck = require('cordova/argscheck'),
	channel   = require('cordova/channel'),
	utils     = require('cordova/utils'),
	exec      = require('cordova/exec'),
	cordova   = require('cordova');

channel.createSticky('onSWORDReady');
// Tell cordova channel to wait on the CordovaInfoReady event
channel.waitForInitialization('onSWORDReady');


function InstallMgr() {
}

InstallMgr.prototype.setUserDisclaimerConfirmed = function(callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_setUserDisclaimerConfirmed", []
	);
	return retVal;
}

InstallMgr.prototype.syncConfig = function(callback, progressNotify) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_syncConfig", [progressNotify]
	);
	return retVal;
}


InstallMgr.prototype.getRemoteSources = function(callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_getRemoteSources", []
	);
	return retVal;
}


InstallMgr.prototype.refreshRemoteSource = function(sourceName, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_refreshRemoteSource", [sourceName]
	);
	return retVal;
}

InstallMgr.prototype.getRemoteModInfoList = function(sourceName, callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_getRemoteModInfoList", [sourceName]
	);
	return retVal;
}

InstallMgr.prototype.getRemoteModuleByName = function(sourceName, modName, callback) {
	var mod = null;
	exec(function(m) { if (m && m.name) mod = new SWModule(m); if (callback) callback(mod); },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_getRemoteModuleByName", [sourceName, modName]
	);
	return mod;
}

// callback({ status : preStatus|update|complete, totalBytes : n, completedBytes : n, message : displayable });
InstallMgr.prototype.remoteInstallModule = function(sourceName, modName, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_remoteInstallModule", [sourceName, modName]
	);
	return retVal;
}

InstallMgr.prototype.uninstallModule = function(modName, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "InstallMgr_uninstallModule", [modName]
	);
	return retVal;
}

function SWModule(modInfo) {
	this.name             = modInfo.name;
	this.description      = modInfo.description;
	this.category         = modInfo.category;
	this.direction        = modInfo.direction;
	this.language         = modInfo.language;
	this.font             = modInfo.font;
	this.shortCopyright   = modInfo.shortCopyright;
	this.shortPromo       = modInfo.shortPromo;
	this.cipherKey        = modInfo.cipherKey;
	this.remoteSourceName = modInfo.remoteSourceName;
}

SWModule.prototype.SEARCHTYPE_REGEX     =  1;
SWModule.prototype.SEARCHTYPE_PHRASE    = -1;
SWModule.prototype.SEARCHTYPE_MULTIWORD = -2;
SWModule.prototype.SEARCHTYPE_ENTRYATTR = -3;
SWModule.prototype.SEARCHTYPE_LUCENE    = -4;

SWModule.prototype.SEARCHOPTION_ICASE   = 2;


SWModule.prototype.setKeyText = function(keyText, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_setKeyText", [this.name, keyText]
	);
	return retVal;
}

SWModule.prototype.search = function(expression, searchType, flags, scope, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_search", [this.name, expression, searchType, flags, scope]
	);
	return retVal;
}

SWModule.prototype.getKeyText = function(callback) {
	var retVal = null;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getKeyText", [this.name]
	);
	return retVal;
}

SWModule.prototype.getRenderText = function(callback) {
	var retVal = null;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getRenderText", [this.name]
	);
	return retVal;
}

SWModule.prototype.getStripText = function(callback) {
	var retVal = null;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getStripText", [this.name]
	);
	return retVal;
}

SWModule.prototype.getRawEntry = function(callback) {
	var retVal = null;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getRawEntry", [this.name]
	);
	return retVal;
}

SWModule.prototype.shareVerse = function(callback) {
	var retVal = null;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_sendText", [this.name]
	);
	return retVal;
}

/*
 * masterMod - SWModule to use for traversing chapter; null if self
 * 	useful for parallel display with alternate v11ns
 *
 * returns [ { verse : verseKey,  preVerse : 'text', text : 'text' }, ... }
 */
SWModule.prototype.getRenderChapter = function(masterMod, callback) {
	var retVal = null;
	if (!masterMod) masterMod = this;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getRenderChapter", [masterMod.name, this.name]
	);
	return retVal;
}

SWModule.prototype.getRenderHeader = function(callback) {
	var retVal = null;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getRenderHeader", [this.name]
	);
	return retVal;
}

SWModule.prototype.getKeyChildren = function(callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getKeyChildren", [this.name]
	);
	return retVal;
}

SWModule.prototype.getVerseKey = function(callback) {
	var retVal = {};
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getVerseKey", [this.name]
	);
	return retVal;
}

SWModule.prototype.getConfigEntry = function(key, callback) {
	var retVal = '';
	exec(callback?callback:function(m) { if (m) retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getConfigEntry", [this.name, key, this.remoteSourceName]
	);
	return retVal;
}


SWModule.prototype.popError = function(callback) {
	var retVal = 0;
	exec(callback?callback:function(m) { retVal = m; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_popError", [this.name]
	);
	return retVal;
}

SWModule.prototype.getEntryAttribute = function(level1Key, level2Key, level3Key, isFiltered, callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getEntryAttribute", [this.name, level1Key, level2Key, level3Key, isFiltered]
	);
	return retVal;
}

SWModule.prototype.next = function(callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_next", [this.name]
	);
	return retVal;
}

SWModule.prototype.previous = function(callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_previous", [this.name]
	);
	return retVal;
}

SWModule.prototype.begin = function(callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_begin", [this.name]
	);
	return retVal;
}

SWModule.prototype.getBookNames = function(callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_getBookNames", [this.name]
	);
	return retVal;
}

SWModule.prototype.parseKeyList = function(keyText, callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_parseKeyList", [this.name, keyText]
	);
	return retVal;
}

SWModule.prototype.setRawEntry = function(entryText, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWModule_setRawEntry", [this.name, entryText]
	);
	return retVal;
}


function SWMgr() {
}


SWMgr.prototype.getModInfoList = function(callback) {
	if (!this.hasOwnProperty('_lastModInfoList')) this._lastModInfoList = [];
	exec(function(m) { if (m && m.length > 0) this._lastModInfoList = m; if (callback) callback(m); },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getModInfoList", []
	);
	return this._lastModInfoList;
}

SWMgr.prototype.getModuleByName = function(modName, callback) {
	var mod = null;
	exec(function(m) { if (m && m.name) mod = new SWModule(m); if (callback) callback(mod); },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getModuleByName", [modName]
	);
	return mod;
}

SWMgr.prototype.getExtraConfigSections = function(callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getExtraConfigSections", []
	);
	return retVal;
}

SWMgr.prototype.getExtraConfigKeys = function(section, callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getExtraConfigKeys", [section]
	);
	return retVal;
}

SWMgr.prototype.getExtraConfigValue = function(section, key, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getExtraConfigValue", [section, key]
	);
	return retVal;
}

SWMgr.prototype.setExtraConfigValue = function(section, key, value, callback) {
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_setExtraConfigValue", [section, key, value]
	);
}

SWMgr.prototype.addExtraConfig = function(confBlob, callback) {
	var retVal = null;
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_addExtraConfig", [confBlob]
	);
	return retVal;
}

SWMgr.prototype.startBibleSync = function(appName, userName, passphrase, callback) {
	exec(callback,
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_startBibleSync", [appName, userName, passphrase]
	);
}

SWMgr.prototype.stopBibleSync = function() {
	exec(function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_stopBibleSync", []
	);
}

SWMgr.prototype.sendBibleSyncMessage = function(osisRef, callback) {
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_sendBibleSyncMessage", [osisRef]
	);
}

SWMgr.prototype.setJavascript = function(val, callback) {
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_setJavascript", [val]
	);
}

SWMgr.prototype.getAvailableLocales = function(callback) {
	var retVal = [];
	exec(callback?callback:function(r) { retVal = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getAvailableLocales", []
	);
	return retVal;
}

SWMgr.prototype.setDefaultLocale = function(val, callback) {
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_setDefaultLocale", [val]
	);
}

SWMgr.prototype.translate = function(text, locale, callback) {
	// support overloaded (text, callback)
	if (!callback && locale) { callback = locale; locale = null; }
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_translate", [text, locale]
	);
}

SWMgr.prototype.setGlobalOption = function(option, value, callback) {
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_setGlobalOption", [option, value]
	);
}

SWMgr.prototype.getPrefixPath = function(callback) {
	exec(callback?callback:function() {},
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "SWMgr_getPrefixPath", []
	);
}

function HTTPUtils() {}

HTTPUtils.prototype.METHOD_GET  =  0;
HTTPUtils.prototype.METHOD_POST =  1;

HTTPUtils.prototype.makeRequest = function(url, postData, callback, method) {
	var result = null;
	if (!method) method = this.METHOD_POST;
	exec(callback?callback:function(r) { if (r && r.length > 0) result = r; },
		function(err) { utils.alert('[ERROR] problem: ' + err); },
		"SWORD", "HTTPUtils_makeRequest", [url, postData, method]
	);
	return result;
}



/*
	public native String      getConfigPath();
	public native String      getGlobalOption(String option);
	public native String      getGlobalOptionTip(String option);
	public native String      filterText(String filterName, String text);
	public native String[]    getGlobalOptions();
	public native String[]    getGlobalOptionValues(String option);
	public native void        setCipherKey(String modName, String key);
	public native void        setJavascript(boolean val);
*/


/**
 * This is the SWORD namespace and access to singleton SWMgr, InstallMgr, and HTTPUtils.
 * @constructor
 */
function SWORD() {

	var me = this;

	this.available = false;
	this.version = null;

	this.installMgr = new InstallMgr();
	this.mgr        = new SWMgr();
	this.httpUtils  = new HTTPUtils();

	channel.onCordovaReady.subscribe(function() {
		me.init(function(info) {
			me.available = true;
			me.version = info.version;
			channel.onSWORDReady.fire();
		},function(e) {
			me.available = false;
			utils.alert("[ERROR] Error initializing SWORD: " + e);
		});
	});
}


SWORD.prototype.CATEGORY_BIBLES       = "Biblical Texts";
SWORD.prototype.CATEGORY_COMMENTARIES = "Commentaries";
SWORD.prototype.CATEGORY_LEXDICTS     = "Lexicons / Dictionaries";
SWORD.prototype.CATEGORY_GENBOOKS     = "Generic Books";
SWORD.prototype.CATEGORY_DAILYDEVOS   = "Daily Devotional";
SWORD.prototype.osisOT                = ['Gen', 'Exod', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Isa', 'Jer', 'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal'];
SWORD.prototype.osisNT                = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev'];


SWORD.prototype.init = function(successCallback, errorCallback) {
	exec(successCallback, errorCallback, "SWORD", "initSWORD", []);
};


module.exports = new SWORD();


