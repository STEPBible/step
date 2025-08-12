/******************************************************************************
 *
 *  installmgr.cpp -	commandline InstallMgr utility
 *
 * $Id: installmgr.cpp 3788 2020-08-30 12:46:21Z scribe $
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

#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
#endif

#include <swmgr.h>
#include <installmgr.h>
#include <remotetrans.h>
#include <filemgr.h>
#include <iostream>
#include <map>
#include <swmodule.h>
#include <swoptfilter.h>
#include <stdio.h>
#include <swlog.h>
#include <swversion.h>

using namespace sword;
using std::cout;
using std::cerr;
using std::cin;
using std::map;


SWMgr *mgr = 0;
InstallMgr *installMgr = 0;
StatusReporter *statusReporter = 0;
SWBuf baseDir;
SWBuf confPath;

bool isConfirmedByForce;
bool isUnvPeerAllowed;


void usage(const char *progName = 0, const char *error = 0);


class MyInstallMgr : public InstallMgr {

public:
	MyInstallMgr(const char *privatePath = "./", StatusReporter *sr = 0) : InstallMgr(privatePath, sr) {}


	/*************************************************************
	 * Provide the necessary user disclaimer.  This is CrossWire
	 * policy to show this disclaimer before enabling Internet
	 * features.  Please follow this policy.
	 */
	virtual bool isUserDisclaimerConfirmed() const {
		// override this and show user disclaimer in whatever
		// display your UI prefers.  Here, we just use the
		// InstallMgr-provided default which sends the disclaimer
		// to std::cout and asks for confirmation with fgets
		//
		// This is unnecessarily duplicated here for your
		// convenience as an example.
		// you can copy and adjust for your frontend

		if (!userDisclaimerConfirmed) {
			std::cout << "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
			std::cout << "                -=+* WARNING *+=- -=+* WARNING *+=-\n\n\n";
			std::cout << "Although Install Manager provides a convenient way for installing\n";
			std::cout << "and upgrading SWORD components, it also uses a systematic method\n";
			std::cout << "for accessing sites which gives packet sniffers a target to lock\n";
			std::cout << "into for singling out users. \n\n\n";
			std::cout << "IF YOU LIVE IN A PERSECUTED COUNTRY AND DO NOT WISH TO RISK DETECTION,\n";
			std::cout << "YOU SHOULD *NOT* USE INSTALL MANAGER'S REMOTE SOURCE FEATURES.\n\n\n";
			std::cout << "Also, Remote Sources other than CrossWire may contain less than\n";
			std::cout << "quality modules, modules with unorthodox content, or even modules\n";
			std::cout << "which are not legitimately distributable.  Many repositories\n";
			std::cout << "contain wonderfully useful content.  These repositories simply\n";
			std::cout << "are not reviewed or maintained by CrossWire and CrossWire\n";
			std::cout << "cannot be held responsible for their content. CAVEAT EMPTOR.\n\n\n";
			std::cout << "If you understand this and are willing to enable remote source features\n";
			std::cout << "then type yes at the prompt\n\n";
			std::cout << "enable? [no] ";

			char prompt[10];
			fgets(prompt, 9, stdin);
			userDisclaimerConfirmed = (!strcmp(prompt, "yes\n"));
			std::cout << "\n";
		}
		return userDisclaimerConfirmed;
	}

};


bool isUnverifiedPeerAllowed() {
	static bool allowed = false;
	
	if (isUnvPeerAllowed) { 
		allowed = true;
	}
        if (!allowed) {
		cout << "\n\n";
		cout << "While connecting to an encrypted install source, SWORD can allow\n";
		cout << "unverified peers, e.g., self-signed certificates. While this is\n";
		cout << "generally considered safe because SWORD only retrieves Bible content\n";
		cout << "and does not send any data to the server, it could still possibly\n";
		cout << "allow a malicious actor to sit between you and the server, as with\n";
		cout << "unencrypted sources.  Type no to turn this off.\n\n";
		cout << "Would you like to allow unverified peers? [yes] ";

		char prompt[10];
		fgets(prompt, 9, stdin);
		allowed = (strcmp(prompt, "no\n"));
		cout << "\n";
	}
	return allowed;
}

class MyStatusReporter : public StatusReporter {
	int last;
        virtual void update(unsigned long totalBytes, unsigned long completedBytes) {
		int p = (totalBytes > 0) ? (int)(74.0 * ((double)completedBytes / (double)totalBytes)) : 0;
		for (;last < p; ++last) {
			if (!last) {
				SWBuf output;
				output.setFormatted("[ File Bytes: %ld", totalBytes);
				while (output.size() < 75) output += " ";
				output += "]";
				cout << output.c_str() << "\n ";
			}
			cout << "-";
		}
		cout.flush();
	}
        virtual void preStatus(long totalBytes, long completedBytes, const char *message) {
		SWBuf output;
		output.setFormatted("[ Total Bytes: %ld; Completed Bytes: %ld", totalBytes, completedBytes);
		while (output.size() < 75) output += " ";
		output += "]";
		cout << "\n" << output.c_str() << "\n ";
		int p = (int)(74.0 * (double)completedBytes/totalBytes);
		for (int i = 0; i < p; ++i) { cout << "="; }
		cout << "\n\n" << message << "\n";
		last = 0;
	}
};      


void init() {
	if (!mgr) {
		mgr = new SWMgr();

		if (!mgr->config)
			usage(0, "ERROR: SWORD configuration not found.  Please configure SWORD before using this program.");

		SWBuf baseDir = FileMgr::getSystemFileMgr()->getHomeDir();
		if (baseDir.length() < 1) baseDir = ".";
		baseDir += "/.sword/InstallMgr";
		confPath = baseDir + "/InstallMgr.conf";
		statusReporter = new MyStatusReporter();
		installMgr = new MyInstallMgr(baseDir, statusReporter);
		if (isConfirmedByForce) { 
			installMgr->setUserDisclaimerConfirmed(true);
		}
	}
}


// clean up and exit if status is 0 or negative error code
void finish(int status) {
	delete statusReporter;
	delete installMgr;
	delete mgr;

	installMgr = 0;
	mgr        = 0;

	if (status < 1) {
		cout << "\n";
		exit(status);
	}
}


void createBasicConfig(bool enableRemote, bool addCrossWire, bool unverifiedPeerAllowed) {

	FileMgr::createParent(confPath.c_str());
	remove(confPath.c_str());

	InstallSource is("FTP");
	is.caption = "CrossWire";
	is.source = "ftp.crosswire.org";
	is.directory = "/pub/sword/raw";

	SWConfig config(confPath.c_str());
	config["General"]["PassiveFTP"] = "true";
	config["General"]["TimeoutMillis"] = "10000";
	config["General"]["UnverifiedPeerAllowed"] = (unverifiedPeerAllowed) ? "true" : "false";
	if (enableRemote) {
		config["Sources"]["FTPSource"] = is.getConfEnt();
	}
	config.save();
}


void initConfig() {
	init();

	bool enable = installMgr->isUserDisclaimerConfirmed();
	bool allowed = isUnverifiedPeerAllowed();

	createBasicConfig(enable, true, allowed);

	cout << "\n\nInitialized basic config file at [" << confPath << "]\n";
	cout << "with remote source features " << ((enable) ? "ENABLED" : "DISABLED") << "\n";
	cout << "with unverified peers " << ((allowed) ? "ALLOWED" : "DISALLOWED") << "\n";
}


void syncConfig() {
	init();

	if (!installMgr->isUserDisclaimerConfirmed()) {  // assert disclaimer is accepted
		cout << "\n\nDisclaimer not accepted.  Aborting.";
		return;
	}

	// be sure we have at least some config file already out there
	if (!FileMgr::existsFile(confPath.c_str())) {
		createBasicConfig(true, false, false);
		finish(1); // cleanup and don't exit
		init();    // re-init with InstallMgr which uses our new config
	}

	if (!installMgr->refreshRemoteSourceConfiguration()) 
		cout << "\nSync'd config file with master remote source list.\n";
	else cout << "\nFailed to sync config file with master remote source list.\n";
}


void uninstallModule(const char *modName) {
	init();
	SWModule *module = mgr->getModule(modName);
	if (!module) {
		fprintf(stderr, "Couldn't find module [%s] to remove\n", modName);
		finish(-2);
	}
	installMgr->removeModule(mgr, module->getName());
	cout << "Removed module: [" << modName << "]\n";
}


void listRemoteSources() {
	init();
	cout << "Remote Sources:\n\n";
	for (InstallSourceMap::iterator it = installMgr->sources.begin(); it != installMgr->sources.end(); it++) {
		cout << "[" << it->second->caption << "]\n";
		cout << "\tType     : " << it->second->type << "\n";
		cout << "\tSource   : " << it->second->source << "\n";
		cout << "\tDirectory: " << it->second->directory << "\n";
	}
}


void refreshRemoteSource(const char *sourceName) {
	init();
	InstallSourceMap::iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
		fprintf(stderr, "Couldn't find remote source [%s]\n", sourceName);
		finish(-3);
	}

	if (!installMgr->refreshRemoteSource(source->second))
		cout << "\nRemote Source Refreshed\n";
	else	cerr << "\nError Refreshing Remote Source\n";
}


void listModules(SWMgr *otherMgr = 0, bool onlyNewAndUpdates = false, bool utilModules = false) {
	init();
	SWModule *module;
	if (!otherMgr) otherMgr = mgr;
	std::map<SWModule *, int> mods = InstallMgr::getModuleStatus(*mgr, *otherMgr, utilModules);
	for (std::map<SWModule *, int>::iterator it = mods.begin(); it != mods.end(); it++) {
		module = it->first;
		SWBuf version = module->getConfigEntry("Version");
		SWBuf status = " ";
		if (it->second & InstallMgr::MODSTAT_NEW) status = "*";
		if (it->second & InstallMgr::MODSTAT_OLDER) status = "-";
		if (it->second & InstallMgr::MODSTAT_UPDATED) status = "+";

		if (!onlyNewAndUpdates || status == "*" || status == "+") {
			cout << status << "[" << module->getName() << "]  \t(" << version << ")  \t- " << module->getDescription() << "\n";
		}
	}
}


void remoteListModules(const char *sourceName, bool onlyNewAndUpdated = false, bool utilModules = false) {
	init();
	cout << "Available Modules:\n(be sure to refresh remote source (-r) first for most current list)\n\n";
	InstallSourceMap::iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
		fprintf(stderr, "Couldn't find remote source [%s]\n", sourceName);
		finish(-3);
	}
	listModules(source->second->getMgr(), onlyNewAndUpdated, utilModules);
}


void remoteDescribeModule(const char *sourceName, const char *modName) {
	init();
	InstallSourceMap::iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
		fprintf(stderr, "Couldn't find remote source [%s]\n", sourceName);
		finish(-3);
	}
	SWMgr *mgr = source->second->getMgr();
	SWModule *m = mgr->getModule(modName);
	if (!m) {
		fprintf(stderr, "Couldn't find module [%s] in source [%s]\n", modName, sourceName);
		finish(-3);
	}
	cout << "Module Description\n\n";
	for (ConfigEntMap::const_iterator it = m->getConfig().begin(); it != m->getConfig().end(); ++it) {
		cout << "[" << it->first << "]:" << it->second << "\n";
	}
	cout << "\nOption Features available for module: " << m->getName() << "\n\n";
	for (OptionFilterList::const_iterator it = m->getOptionFilters().begin(); it != m->getOptionFilters().end(); ++it) {
		cout << (*it)->getOptionName() << " (" << (*it)->getOptionTip() << ")\n";
		StringList optionValues = (*it)->getOptionValues();
		for (StringList::const_iterator it2 = optionValues.begin(); it2 != optionValues.end(); ++it2) {
			cout << "\t" << *it2 << "\n";
		}
	}
}


void localDirListModules(const char *dir) {
	cout << "Available Modules:\n\n";
	SWMgr mgr(dir);
	listModules(&mgr);
}


void remoteInstallModule(const char *sourceName, const char *modName) {
	init();
	InstallSourceMap::iterator source = installMgr->sources.find(sourceName);
	if (source == installMgr->sources.end()) {
		fprintf(stderr, "Couldn't find remote source [%s]\n", sourceName);
		finish(-3);
	}
	InstallSource *is = source->second;
	SWMgr *rmgr = is->getMgr();
	SWModule *module = rmgr->getModule(modName);
	if (!module) {
		fprintf(stderr, "Remote source [%s] does not make available module [%s]\n", sourceName, modName);
		finish(-4);
	}

	int error = installMgr->installModule(mgr, 0, module->getName(), is);
	if (error) {
		cout << "\nError installing module: [" << module->getName() << "] (write permissions?)\n";
	} else cout << "\nInstalled module: [" << module->getName() << "]\n";
}


void localDirInstallModule(const char *dir, const char *modName) {
	init();
	SWMgr lmgr(dir);
	SWModule *module = lmgr.getModule(modName);
	if (!module) {
		fprintf(stderr, "Module [%s] not available at path [%s]\n", modName, dir);
		finish(-4);
	}
	int error = installMgr->installModule(mgr, dir, module->getName());
	if (error) {
		cout << "\nError installing module: [" << module->getName() << "] (write permissions?)\n";
	} else cout << "\nInstalled module: [" << module->getName() << "]\n";
}


void usage(const char *progName, const char *error) {

	if (error) fprintf(stderr, "\n%s: %s\n", (progName ? progName : "installmgr"), error);

	fprintf(stderr, "\nusage: %s [--allow...] <command> [command ...]\n"
		"\t(SWORD: %s)\n"
		"\n\t--allow-internet-access-and-risk-tracing-and-jail-or-martyrdom \n"
		"\n\t  This aptly named option will allow the program to connect to the internet without asking for user confirmation\n"
		"\t  In many places this may well be a risky or even foolish undertaking.\n"
		"\t  Please take special care before you use this option in scripts, particularly in scripts you want to offer for public download.\n" 
		"\t  What may appear to be safe for you, may well not be safe for someone else, who uses your scripts. \n"
		"\n\t--allow-unverified-tls-peer \n"
		"\n\t  This option will allow the program to connect to unverified peers\n"
		"\t  (e.g., hosts using self-signed certificates) without asking for user confirmation.\n"
		"\n\t  Commands (run in order they are passed):\n\n"
		"\t -init\t\t\t\tcreate a basic user config file.\n"
		"\t\t\t\t\t\tWARNING: overwrites existing.\n"
		"\t -sc\t\t\t\tsync config with known remote repo list\n"
		"\t\t\t\t\t\tNOTE: also creates if none exists\n"
		"\t -s\t\t\t\tlist remote sources\n"
		"\t -r  <remoteSrcName>\t\trefresh remote source\n"
		"\t -rl <remoteSrcName>\t\tlist available user modules from remote source\n"
		"\t -rlu <remoteSrcName>\t\tlist available utility modules from remote source\n"
		"\t -rd <remoteSrcName>\t\tlist new/updated user modules from remote source\n"
		"\t -rdu <remoteSrcName>\t\tlist new/updated utility modules from remote source\n"
		"\t -rdesc <remoteSrcName> <modName>\tdescribe module from remote source\n"
		"\t -ri <remoteSrcName> <modName>\tinstall module from remote source\n"
		"\t -l\t\t\t\tlist installed user modules\n"
		"\t -lu\t\t\t\tlist installed utility modules\n"
		"\t -u <modName>\t\t\tuninstall module\n"
		"\t -ll <path>\t\t\tlist available modules at local path\n"
		"\t -li <path> <modName>\t\tinstall module from local path\n"
		"\t -d\t\t\t\tturn debug output on\n"
		, (progName ? progName : "installmgr"), SWVersion::currentVersion.getText());
	finish(-1);
}


int main(int argc, char **argv) {
	
	isConfirmedByForce = false;
	isUnvPeerAllowed = false;
	
	if (argc < 2) usage(*argv);

	for (int i = 1; i < argc; i++) {
		if (!strcmp(argv[i], "-d")) {
			SWLog::getSystemLog()->setLogLevel(SWLog::LOG_DEBUG);
		}
		else if (!strcmp(argv[i], "--allow-internet-access-and-risk-tracing-and-jail-or-martyrdom")) {
			isConfirmedByForce = true;
		}
		else if (!strcmp(argv[i], "--allow-unverified-tls-peer")) {
			isUnvPeerAllowed = true;
		}
		else if (!strcmp(argv[i], "-init")) {
			initConfig();
		}
		else if (!strcmp(argv[i], "-l")) {	// list installed user modules
			cout << "Installed User Modules:\n\n";
			listModules();
		}
		else if (!strcmp(argv[i], "-lu")) {	// list installed utility modules
			cout << "Installed Utility Modules:\n\n";
			listModules(0, false, true);
		}
		else if (!strcmp(argv[i], "-ll")) {	// list from local directory
			if (i+1 < argc) localDirListModules(argv[++i]);
			else usage(*argv, "-ll requires <path>");
		}
		else if (!strcmp(argv[i], "-li")) {	// install from local directory
			if (i+2 < argc) {
				const char *path = argv[++i];
				const char *modName = argv[++i];
				localDirInstallModule(path, modName);
			}
			else usage(*argv, "-li requires <path> <modName>");
		}
		else if (!strcmp(argv[i], "-u")) {	// uninstall module
			if (i+1 < argc) uninstallModule(argv[++i]);
			else usage(*argv, "-u requires <modName>");
		}
		else if (!strcmp(argv[i], "-s")) {	// list sources
			listRemoteSources();
		}
		else if (!strcmp(argv[i], "-sc")) {	// sync config with master
			syncConfig();
		}
		else if (!strcmp(argv[i], "-r")) {	// refresh remote source
			if (i+1 < argc) refreshRemoteSource(argv[++i]);
			else usage(*argv, "-r requires <remoteSrcName>");
		}
		else if (!strcmp(argv[i], "-rl")) {	// list remote user modules
			if (i+1 < argc) remoteListModules(argv[++i]);
			else usage(*argv, "-rl requires <remoteSrcName>");
		}
		else if (!strcmp(argv[i], "-rlu")) {	// list remote utility modules
			if (i+1 < argc) remoteListModules(argv[++i], false, true);
			else usage(*argv, "-rlu requires <remoteSrcName>");
		}
		else if (!strcmp(argv[i], "-rd")) {	// list differences between remote source and installed user modules
			if (i+1 < argc) remoteListModules(argv[++i], true);
			else usage(*argv, "-rd requires <remoteSrcName>");
		}
		else if (!strcmp(argv[i], "-rdu")) {	// list differences between remote source and installed utility modules
			if (i+1 < argc) remoteListModules(argv[++i], true, true);
			else usage(*argv, "-rdu requires <remoteSrcName>");
		}
		else if (!strcmp(argv[i], "-rdesc")) {	// describe remove module
			if (i+2 < argc) {
				const char *source = argv[++i];
				const char *modName = argv[++i];
				remoteDescribeModule(source, modName);
			}
			else usage(*argv, "-rdesc requires <remoteSrcName> <modName>");
		}
		else if (!strcmp(argv[i], "-ri")) {	// install from remote directory
			if (i+2 < argc) {
				const char *source = argv[++i];
				const char *modName = argv[++i];
				remoteInstallModule(source, modName);
			}
			else usage(*argv, "-ri requires <remoteSrcName> <modName>");
		}
		else usage(*argv, (((SWBuf)"Unknown argument: ")+ argv[i]).c_str());
	}

	finish(0);

	return 0;
}
