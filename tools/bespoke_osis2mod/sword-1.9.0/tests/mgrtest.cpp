/******************************************************************************
 *
 *  mgrtest.cpp -	
 *
 * $Id: mgrtest.cpp 3822 2020-11-03 18:54:47Z scribe $
 *
 * Copyright 1997-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <swmgr.h>
#include <swlog.h>
#include <iostream>
#include <versekey.h>
#include <swmodule.h>
#include <swconfig.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

int main(int argc, char **argv) {

	std::cerr << "\n";
	std::cout << "\n";

	SWLog::getSystemLog()->setLogLevel(SWLog::LOG_TIMEDINFO);
	SWConfig *sysConf = 0;
	if (argc > 1) {
		sysConf = new SWConfig(argv[1]);
	}

	SWMgr myMgr(0, sysConf);

	SWLog::getSystemLog()->logTimedInformation("prefixPath: %s", myMgr.prefixPath);
	SWLog::getSystemLog()->logTimedInformation("configPath: %s\n\n", myMgr.configPath);

	for (ModMap::iterator it = myMgr.getModules().begin(); it != myMgr.getModules().end(); ++it) {
		SWLog::getSystemLog()->logTimedInformation("[%s] Writable: %s) [%s]\n", it->second->getName(), (it->second->isWritable()?"Yes":"No"), it->second->getDescription());
		SWLog::getSystemLog()->logTimedInformation("AbsoluteDataPath = %s\n", it->second->getConfigEntry("AbsoluteDataPath"));
		SWLog::getSystemLog()->logTimedInformation("Has Feature HebrewDef = %s\n", (it->second->getConfig().has("Feature", "HebrewDef")?"Yes":"No"));
		if ((!strcmp(it->second->getType(), SWMgr::MODTYPE_BIBLES)) || (!strcmp(it->second->getType(), SWMgr::MODTYPE_COMMENTARIES))) {
			it->second->setKey("James 1:19");
			SWLog::getSystemLog()->logTimedInformation("%s\n\n", it->second->renderText().c_str());
		}
	}

	SWModule *mhc = myMgr.Modules["MHC"];

	if (mhc) {
		SWLog::getSystemLog()->logTimedInformation("MHC, Lang = %s\n\n", mhc->getLanguage());
		for (mhc->setKey("Gen 1:1"); *mhc->getKey() < (VerseKey) "Gen 1:10"; (*mhc)++)
			SWLog::getSystemLog()->logTimedInformation("%s\n", mhc->renderText().c_str());
	}

	if (sysConf)
		delete sysConf;

	SWLog::getSystemLog()->logTimedInformation("%s finished.", *argv);
	return 0;
}
