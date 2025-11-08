/******************************************************************************
 *
 * installmgr.h -	class InstallMgr: primary class to access all
 * 			module installation functionality
 *
 * $Id: installmgr.h 3805 2020-09-19 12:19:28Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef INSTALLMGR_H
#define INSTALLMGR_H

#include <defs.h>
#include <swbuf.h>
#include <map>
#include <set>

SWORD_NAMESPACE_START

class SWMgr;
class SWModule;
class SWConfig;
class RemoteTransport;
class StatusReporter;

/** A remote installation source configuration
*/
class SWDLLEXPORT InstallSource {
	SWMgr *mgr;
public:
	InstallSource(const char *type, const char *confEnt = 0);
	virtual ~InstallSource();
	SWBuf getConfEnt() {
		return caption +"|" + source + "|" + directory + "|" + u + "|" + p + "|" + uid;
	}
	SWBuf caption;
	SWBuf source;
	SWBuf directory;
	SWBuf u;
	SWBuf p;
	SWBuf uid;

	SWBuf type;
	SWBuf localShadow;
	void *userData;
	SWMgr *getMgr();
	void flush();
};

/** A standard map of remote install sources.
 */
typedef std::map<SWBuf, InstallSource *> InstallSourceMap;

/** Class to handle installation and maintenance of a SWORD library of books.
 */
class SWDLLEXPORT InstallMgr {

protected:
	std::set<SWBuf> defaultMods;
	char *privatePath;
	SWBuf confPath;
	StatusReporter *statusReporter;
	bool passive;
	long timeoutMillis;
	SWBuf u, p;
	bool unverifiedPeerAllowed;

	/** override this method and provide your own custom RemoteTransport subclass
	 */
	virtual RemoteTransport *createFTPTransport(const char *host, StatusReporter *statusReporter);

	/** override this method and provide your own custom HTTP RemoteTransport
	 */
	virtual RemoteTransport *createHTTPTransport(const char *host, StatusReporter *statusReporter);


	/** we have a transport member to set as current running transport so we
	 *  can ask it to terminate below, if user requests
	 */
	RemoteTransport *transport;

public:

	static bool userDisclaimerConfirmed;
	static const unsigned int MODSTAT_OLDER;
	static const unsigned int MODSTAT_SAMEVERSION;
	static const unsigned int MODSTAT_UPDATED;
	static const unsigned int MODSTAT_NEW;
	static const unsigned int MODSTAT_CIPHERED;
	static const unsigned int MODSTAT_CIPHERKEYPRESENT;

	SWConfig *installConf;

	/** all remote sources configured for this installmgr.  Use this to gain access
	 *  to individual remote sources.
	 */
	InstallSourceMap sources;

	/** Username and Password supplied here can be used to identify your frontend
	 *  by supplying a valid anon password like installmgr@macsword.com
	 *  This will get overridden if a password is required and provided in an indivual
	 *  source configuration.
	 */
	InstallMgr(const char *privatePath = "./", StatusReporter *statusReporter = 0, SWBuf u="ftp", SWBuf p="installmgr@user.com");
	virtual ~InstallMgr();

	/** Call to re-read InstallMgr.conf
	 */
	void readInstallConf();

	/** Call to dump sources and other settings to InstallMgr.conf
	 */
	void saveInstallConf();

	/** Removes all configured sources from memory.  Call saveInstallConf() to persist
	 */
	void clearSources();

	/** call to delete all files of a locally installed module.
	 */
	virtual int removeModule(SWMgr *manager, const char *modName);

	/** mostly an internally used method to remote download from a remote source
	 * to a local destination
	 */
	virtual int remoteCopy(InstallSource *is, const char *src, const char *dest, bool dirTransfer = false, const char *suffix = "");

	/** call to install a module from a local path (fromLocation) or remote InstallSource (is) (leave the other 0)
	 */
	virtual int installModule(SWMgr *destMgr, const char *fromLocation, const char *modName, InstallSource *is = 0);


	/** call to obtain and locally cache the available content list of the remote source
	 */
	virtual int refreshRemoteSource(InstallSource *is);


	/** call to populate installmgr configuration with all known
	 *  remote sources from the master list at CrossWire
	 */
	virtual int refreshRemoteSourceConfiguration();


	/** Override this and provide an input mechanism to allow your users
	 *  to confirm that they understand this important disclaimer.
	 *  This method will be called immediately before attempting to perform
	 *  any network function.
	 *  If you would like your confirmation to always show at a predefined
	 *  time before attempting network operations, then you can call this
	 *  method yourself at the desired time.
	 *
	 *  Return true if your user confirms.
	 *
	 *  User disclaimer should ask user for confirmation of 2 critical items:
	 *  and the default answer should be NO
	 *  (due to possibly the wrong language for the disclaimer)
	 *
	 *  1) detection OK (Not in persecuted country)
	 *  2) repos other than CrossWire may have questionable content
	 *
	 *  A sample default impl is provided below:
	 *
	 */
	virtual bool isUserDisclaimerConfirmed() const; /* {

		bool confirmed = userDisclaimerConfirmed;
		
		if (!confirmed) {
			cout << "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
			cout << "                -=+* WARNING *+=- -=+* WARNING *+=-\n\n\n";
			cout << "Although Install Manager provides a convenient way for installing\n";
			cout << "and upgrading SWORD components, it also uses a systematic method\n";
			cout << "for accessing sites which gives packet sniffers a target to lock\n";
			cout << "into for singling out users. \n\n\n";
			cout << "IF YOU LIVE IN A PERSECUTED COUNTRY AND DO NOT WISH TO RISK DETECTION,\n";
			cout << "YOU SHOULD *NOT* USE INSTALL MANAGER'S REMOTE SOURCE FEATURES.\n\n\n";
			cout << "Also, Remote Sources other than CrossWire may contain less than\n";
			cout << "quality modules, modules with unorthodox content, or even modules\n";
			cout << "which are not legitimately distributable.  Many repositories\n";
			cout << "contain wonderfully useful content.  These repositories simply\n";
			cout << "are not reviewed or maintained by CrossWire and CrossWire\n";
			cout << "cannot be held responsible for their content. CAVEAT EMPTOR.\n\n\n";
			cout << "If you understand this and are willing to enable remote source features\n";
			cout << "then type yes at the prompt\n\n";
			cout << "enable? [no] ";

			char prompt[10];
			fgets(prompt, 9, stdin);
			confirmed = (!strcmp(prompt, "yes\n"));
			cout << "\n";
		}
		return confirmed;
	} */


	/** Preferred method of reporting user disclaimer confirmation is to override the above method
	 * instead of using the setter below. This is provided for clients who don't wish to inherit
	 * InstallMgr and override method.
	 */
	void setUserDisclaimerConfirmed(bool val) { InstallMgr::userDisclaimerConfirmed = val; }


	/** override this and provide an input mechanism to allow your users
	 * to enter the decipher code for a module.
	 * return true you added the cipher code to the config.
	 * default to return 'aborted'
	 */
	virtual bool getCipherCode(const char *modName, SWConfig *config) {
		(void) modName; (void) config;	// to avoid "unused variable" warnings
		return false;

		/*
		A sample implementation, roughly taken from the windows installmgr:

		SectionMap::iterator section;
		ConfigEntMap::iterator entry;
		SWBuf tmpBuf;
		section = config->Sections.find(modName);
		if (section != config->Sections.end()) {
			entry = section->second.find("CipherKey");
			if (entry != section->second.end()) {
				entry->second = ASK_USER_FOR_CIPHER_CODE();
				config->Save();

				// LET'S SHOW THE USER SOME SAMPLE TEXT FROM THE MODULE
				SWMgr *mgr = new SWMgr();
				SWModule *mod = mgr->getModule(modName);
				mod->setKey("Ipet 2:12");
				tmpBuf = mod->StripText();
				mod->setKey("gen 1:10");
				tmpBuf += "\n\n";
				tmpBuf += mod->StripText();
				if (SOME_DIALOG_CONFIRMATION(SWBuf(
							"Using your provided cipher code,	\
							here is the data from the module.	\
							Does this look good?\n\n") + tmpBuf.c_str())) {

					// if USER CLICKS OK means we should return true
					return true;
				}
				delete mgr;
			}
		}
		return false;
		*/
	}



	/** whether or not to use passive mode when doing ftp transfers
	 */
	void setFTPPassive(bool passive) { this->passive = passive; }
	bool isFTPPassive() { return passive; }

	void setTimeoutMillis(long timeoutMillis) { this->timeoutMillis = timeoutMillis; }
	long getTimeoutMillis() { return timeoutMillis; }

	void setUnverifiedPeerAllowed(bool allowed) { this->unverifiedPeerAllowed = allowed; }
	bool isUnverifiedPeerAllowed() { return unverifiedPeerAllowed; }

	/** Request nicely to terminate an ongoing transfer.
	 * If threading is a concern, consider calling terminate() from your status reporters
	 * as they are typically the link between the transfer thread and your UI.
	 */
	void terminate();

	/************************************************************************
	 * getModuleStatus - compare the modules of two SWMgrs and return a
	 * 	vector describing the status of each.  See MODSTAT_*
	 * @param base The base SWMgr to compare-- usually represents what is currently installed
	 * @param other The other SWMgr to compare to base-- usually represents an install source's SWMgr
	 * @param utilModules whether to show user modules or utility modules; user modules is the default
	 */
	static std::map<SWModule *, int> getModuleStatus(const SWMgr &base, const SWMgr &other, bool utilModules = false);

	/************************************************************************
	 * isDefaultModule - allows an installation to provide a set of modules
	 *   in installMgr.conf like:
	 *     [General]
	 *     DefaultMod=KJV
	 *     DefaultMod=StrongsGreek
	 *     DefaultMod=Personal
	 *   This method allows a user interface to ask if a module is specified
	 *   as a default in the above way.  The logic is, if no modules are
	 *   installed then all default modules should be automatically selected for install
	 *   to help the user select a basic foundation of useful modules
	 */
	bool isDefaultModule(const char *modName);
};


SWORD_NAMESPACE_END

#endif
