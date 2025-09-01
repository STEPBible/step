/******************************************************************************
 *
 *  testclient.cpp -	
 *
 * $Id: testclient.cpp 3598 2018-11-04 23:55:38Z scribe $
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


#include "swordorb.h"
#include <iostream>
#include <swbuf.h>
	
int main (int argc, char *argv[])
{
	if (argc != 2)
	{
		std::cerr << "Usage:" << std::endl
				  << "  " << argv[0] << " IOR" << std::endl
				  << std::endl;
		return -1;
	}
	
	try {


		const char* options[][2] = {
			{ "nativeCharCodeSet", "UTF-8" }
		   , { 0, 0 }
		};


	     // Initialise the ORB.
	     CORBA::ORB_var orb = CORBA::ORB_init(argc, argv, "omniORB4", options);
//	     CORBA::ORB_var orb = CORBA::ORB_init(argc, argv, "omniORB4");

		// Get a reference to the server from the IOR passed on the
		// command line
		CORBA::Object_var obj = orb->string_to_object(argv[1]);
		swordorb::SWMgr_var mgr = swordorb::SWMgr::_narrow(obj);

		swordorb::SWModule_ptr module;
		swordorb::ModInfoList *modInfoList;

		std::cout << "Connected: "  << mgr->testConnection() << "\n";
		std::cout << "PrefixPath: " << mgr->getPrefixPath() << "\n";
		std::cout << "ConfigPath: " << mgr->getConfigPath() << "\n";
		modInfoList = mgr->getModInfoList();
		std::cout << "sequence length: " << modInfoList->length() << "\n";
		for (int i = 0; i < modInfoList->length(); i++) {
			std::cout << (*modInfoList)[i].name << ": " << (*modInfoList)[i].category << ": " << (*modInfoList)[i].language << "\n";
/*
			if (!strncmp((*modInfoList)[i].category, "Bibl", 4)) {
				module = mgr->getModuleByName((*modInfoList)[i].name);
				module->setKeyText("jas1:19");
				std::cout << module->getRenderText() << "\n";
			}
			std::cout << "\n";
*/
		}
/*
		swordorb::StringList *localeNames = mgr->getAvailableLocales();
		for (int i = 0; i < localeNames->length(); i++) {
			std::cout << (*localeNames)[i] << "\n";
		}
*/
		std::cout << "filterText: " << mgr->filterText("OSISPlain", "this should be <abbr type=\"nomSac\"><hi rend=\"ol\">overlined</hi></abbr>") << "\n";
		mgr->setDefaultLocale("de");
		mgr->setJavascript(true);
		mgr->setGlobalOption("Textual Variants", "Secondary Reading");
		mgr->setGlobalOption("Footnotes", "On");
		module = mgr->getModuleByName("NASB");
/*
		module->setKeyText("jas.1.19");
		swordorb::StringList *attr = module->getEntryAttribute("Footnote", "", "body", true);
		std::cout << "length: " << attr->length() << "\n";
		for (int i = 0; i < attr->length(); i++) {
			std::cout << (*attr)[i] << "\n";
		}
*/
		int i = 0;
		for (module->setKeyText("gen.2.8"); !module->error() && i < 3; module->next(), i++) {
			std::cout << "KeyText: " << module->getKeyText() << "\n";
			std::cout << "Text: " << module->getRenderText() << "\n";
		}
		std::cout << "RenderHeader:\n" << module->getRenderHeader() << "\n";
/*
		swordorb::SearchHitList *searchResults;
		bool lucene = module->hasSearchFramework();
		searchResults = module->search("David", (lucene)?swordorb::LUCENE:swordorb::MULTIWORD, 0, "");
		for (int i = 0; i < searchResults->length(); i++) {
			std::cout << (*searchResults)[i].key << "\n";
		}

		mgr->setGlobalOption("Greek Accents", "Off");
		std::cout << "\nFiltered text: " << mgr->filterText("Greek Accents", "ὁ θεὸς") << "\n";
*/

		std::cout << "Terminating ORB...\n";

		mgr->terminate();

		
	} catch(const CORBA::Exception& ex) {
		std::cout << "exception: " << ex._name() << std::endl;
	}
	
	return 0;
}
