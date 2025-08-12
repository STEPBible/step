/******************************************************************************
 *
 *  lookup.cpp -	Simple example of how to retrieve an entry from a
 *			SWORD module
 *
 * $Id: lookup.cpp 3820 2020-10-24 20:27:30Z scribe $
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

#include <stdio.h>
#include <iostream>
#include <stdlib.h>
#include <swmgr.h>
#include <swmodule.h>
#include <swfilter.h>
#include <markupfiltmgr.h>
#include <osiswordjs.h>
#include <versekey.h>
//#include "../../bindings/corba/orbitcpp/webmgr.hpp"


using sword::SWMgr;
using sword::MarkupFilterMgr;
using sword::SWModule;
using sword::FMT_WEBIF;
using sword::FMT_HTMLHREF;
using sword::FMT_XHTML;
using sword::FMT_OSIS;
using sword::FMT_RTF;
using sword::FMT_LATEX;
using sword::ModMap;
using sword::AttributeTypeList;
using sword::AttributeList;
using sword::AttributeValue;
using sword::VerseKey;
using sword::FilterList;
using sword::OSISWordJS;


int main(int argc, char **argv)
{
	
// for testing webmgr
//	WebMgr manager((const char *)0);
//	manager.setJavascript(true);
//
	SWMgr manager(new MarkupFilterMgr(FMT_XHTML));
//	SWMgr manager(new MarkupFilterMgr(FMT_WEBIF));

	SWModule *target;

	if (argc != 3) {
		fprintf(stderr, "\nusage: %s <modname> <\"lookup key\">\n"
							 "\tExample: lookup KJV \"James 1:19\"\n\n", argv[0]);
 
		exit(-1);
	}

	target = manager.getModule(argv[1]);
	if (!target) {
		fprintf(stderr, "Could not find module [%s].  Available modules:\n", argv[1]);
		ModMap::iterator it;
		for (it = manager.Modules.begin(); it != manager.Modules.end(); ++it) {
			fprintf(stderr, "[%s]\t - %s\n", (*it).second->getName(), (*it).second->getDescription());
		}
		exit(-1);
	}

	if (target->getMarkup() == FMT_OSIS) {
		OSISWordJS *osisWordJS = new OSISWordJS();
		osisWordJS->setMgr(&manager);
		target->addOptionFilter(osisWordJS);
		osisWordJS->setOptionValue("On");
	}
	// turn all filters to default values
	manager.setGlobalOption("Headings", "On");
	manager.setGlobalOption("Strong's Numbers", "Off");
	manager.setGlobalOption("Lemmas", "Off");
//	manager.setGlobalOption("Greek Accents", "Off");
	manager.setGlobalOption("Footnotes", "On");
	manager.setGlobalOption("Cross-references", "On");

	VerseKey *vk = dynamic_cast<VerseKey *>(target->getKey());

	if (vk) {
	//	vk->AutoNormalize(false);
		vk->setIntros(true);
		vk->setText(argv[2]);
	}
	else {
		target->setKey(argv[2]);
	}

	target->renderText();		// force an entry lookup to resolve key to something in the index

	std::cout << "==Raw=Entry===============\n";
	std::cout << target->getKeyText() << ":\n";
	std::cout << target->getRawEntry();
	std::cout << "\n";
	std::cout << "==Render=Entry============\n";
	std::cout << target->getRenderHeader();
	std::cout << "\n";
	std::cout << target->renderText();
	std::cout << "\n";
	std::cout << "==========================\n";
	std::cout << "Entry Attributes:\n\n";
	AttributeTypeList::iterator i1;
	AttributeList::iterator i2;
	AttributeValue::iterator i3;
	bool heading = false;
	bool preverse = false;
	for (i1 = target->getEntryAttributes().begin(); i1 != target->getEntryAttributes().end(); ++i1) {
		std::cout << "[ " << i1->first << " ]\n";
		heading = (i1->first == "Heading");
		for (i2 = i1->second.begin(); i2 != i1->second.end(); ++i2) {
			std::cout << "\t[ " << i2->first << " ]\n";
			preverse = (heading && i2->first == "Preverse");
			for (i3 = i2->second.begin(); i3 != i2->second.end(); ++i3) {
				std::cout << "\t\t" << i3->first << " = " << i3->second << "\n";
				if (preverse) {
					std::cout << "\t\tmodule->renderText(heading[" << i3->first << "]) = " << target->renderText(i3->second) << "\n";
				}
			}
		}
	}
	std::cout << std::endl;

	return 0;
}

