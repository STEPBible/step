/******************************************************************************
 *
 *  mod2imp.cpp -	Utility to export a module in IMP format
 *
 * $Id: mod2imp.cpp 3088 2014-03-09 13:09:00Z refdoc $
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

#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
#endif

#include <iostream>
#include <map>
#include <stdio.h>

#include <markupfiltmgr.h>
#include <swmgr.h>
#include <swmodule.h>
#include <versekey.h>

using std::map;
using std::cout;
using std::endl;

#ifndef NO_SWORD_NAMESPACE

using namespace sword;

#endif


void usage(const char *progName, const char *error = 0) {
	if (error) fprintf(stderr, "\n%s: %s\n", progName, error);
	fprintf(stderr, "\n=== mod2imp (Revision $Rev: 3088 $) SWORD module exporter.\n");
	fprintf(stderr, "\nusage: %s <module_name> [options]\n"
		"\t -r [output_format]  - render content instead of outputting raw native\n"
		"\t\tdata.  output_format can be: OSIS, XHTML, LATEX, HTMLHREF, RTF.\n"
		"\t -s - strip markup instead of outputting raw native data.\n"
		"\t -f <option_name> <option_value> - when rendering (-r, above), option\n"
		"\t\tfilter values can be set with this option.\n\n"
		, progName);
	exit(-1);
}


int main(int argc, char **argv)
{
	// handle options
	if (argc < 2) usage(*argv);

	const char *progName   = argv[0];
	const char *modName    = argv[1];
	bool render            = false;
	bool strip             = false;
	SWBuf renderForm;
	SWBuf optionName;
	map<SWBuf, SWBuf> options; // optionName, optionValue;

	for (int i = 2; i < argc; i++) {
		if (!strcmp(argv[i], "-r")) {
			if (strip) usage(progName, "-r can't be supplied when using -s");
			if (i+1 < argc) renderForm = argv[++i];
			render = true;
		}
		else if (!strcmp(argv[i], "-s")) {
			if (render) usage(progName, "-s can't be supplied when using -r");
			strip = true;
		}
		else if (!strcmp(argv[i], "-f")) {
			if (i+1 < argc) optionName          = argv[++i];
			if (i+1 < argc) options[optionName] = argv[++i];
			else usage(progName, "-f requires <option_name> <option_value>");
		}
		else usage(progName, (((SWBuf)"Unknown argument: ")+ argv[i]).c_str());
	}
	// -----------------------------------------------------

	MarkupFilterMgr *markupMgr = 0;
	if       (renderForm == "HTMLHREF") markupMgr = new MarkupFilterMgr(sword::FMT_HTMLHREF);
	else if  (renderForm == "OSIS")     markupMgr = new MarkupFilterMgr(sword::FMT_OSIS);
	else if  (renderForm == "RTF")      markupMgr = new MarkupFilterMgr(sword::FMT_RTF);
	else if  (renderForm == "LATEX")    markupMgr = new MarkupFilterMgr(sword::FMT_LATEX);
	else if  (renderForm == "XHTML")    markupMgr = new MarkupFilterMgr(sword::FMT_XHTML);
	
	else if  (renderForm.length())      usage(progName, (((SWBuf) "Unknown output_format for -r (")+renderForm+")").c_str());

	SWMgr *mgr = (markupMgr) ? new SWMgr(markupMgr) : new SWMgr();

	// set any options filters passed with -f
	for (map<SWBuf, SWBuf>::iterator it = options.begin(); it != options.end(); it++) {
		mgr->setGlobalOption(it->first, it->second);
	}

	SWModule *module = mgr->getModule(modName);

	if (!module) usage(progName, (((SWBuf) "Couldn't find module: ") + modName).c_str());


	SWKey *key = module->getKey();
	VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);

	if (vkey)
		vkey->setIntros(true);

	for ((*module) = TOP; !module->popError(); (*module)++) {
		std::cout << "$$$" << module->getKeyText() << std::endl;
		std::cout << ((render) ? module->renderText().c_str() : (strip) ? module->stripText() : module->getRawEntry()) << "\n";
	}

	cout << endl;

	return 0;
}

