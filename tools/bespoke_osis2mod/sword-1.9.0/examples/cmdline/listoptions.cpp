/******************************************************************************
 *
 *  listoptions.cpp -	Simple example to show how to see which 'options' are
 *			available from the installed set of modules and their
 *			possible settings.
 *			Options in SWORD refer to things like "Strong's
 *			Numbers", "Morphology", etc.
 * 
 * $Id: listoptions.cpp 3621 2019-05-05 18:14:09Z scribe $
 *
 * Copyright 2006-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <swmgr.h>
#include <swmodule.h>
#include <swoptfilter.h>


using sword::SWMgr;
using sword::SWModule;
using sword::StringList;
using sword::OptionFilterList;
using std::cout;
using std::cerr;


int main(int argc, char **argv)
{
	SWMgr library;

	// specific module features
	if (argc == 2) {
		SWModule *module = library.getModule(argv[1]);
		if (!module) { cerr << "\nUnable to find module: " << argv[1] << "\n"; return 1; }
		cout << "\nOption Features available for module: " << module->getName() << "\n\n";
		for (OptionFilterList::const_iterator it = module->getOptionFilters().begin(); it != module->getOptionFilters().end(); ++it) {
			cout << (*it)->getOptionName() << " (" << (*it)->getOptionTip() << ")\n";
			StringList optionValues = (*it)->getOptionValues();
			for (StringList::const_iterator it2 = optionValues.begin(); it2 != optionValues.end(); ++it2) {
				cout << "\t" << *it2 << "\n";
			}
		}
		return 0;
	}
	StringList options = library.getGlobalOptions();
	for (StringList::const_iterator it = options.begin(); it != options.end(); ++it) {
		cout << *it << " (" << library.getGlobalOptionTip(*it) << ")\n";
		StringList optionValues = library.getGlobalOptionValues(*it);
		for (StringList::const_iterator it2 = optionValues.begin(); it2 != optionValues.end(); ++it2) {
			cout << "\t" << *it2 << "\n";
		}
	}

	return 0;

}

