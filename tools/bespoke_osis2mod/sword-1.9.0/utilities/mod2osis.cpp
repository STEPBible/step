/******************************************************************************
 *
 *  mod2osis.cpp -	Exports a module as an OSIS doc
 *
 * $Id: mod2osis.cpp 3491 2017-09-02 09:47:05Z scribe $
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

#include <fcntl.h>
#include <iostream>
#include <fstream>
#include <string>

#include <swbuf.h>
#include <ztext.h>
#include <zld.h>
#include <zcom.h>
#include <swmgr.h>
#include <lzsscomprs.h>
#include <zipcomprs.h>
#include <versekey.h>
#include <thmlosis.h>
#include <stdio.h>
#include <markupfiltmgr.h>
#include <algorithm>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif
using std::endl;
using std::cerr;
using std::cout;

void errorOutHelp(char *appName) {
	cerr << appName << " - a tool to output a SWORD module in OSIS format\n";
	cerr << "usage: "<< appName << " <modname> \n";
	cerr << "\n\n";
	exit(-1);
}


int main(int argc, char **argv)
{
	SWModule *inModule = 0;
	ThMLOSIS filter;

	cerr << "\n\n*** Don't use this utility *** \n\n";
	cerr << "Its purpose is to prove the engine can do\n";
	cerr << "lossless import / export, but we are not there yet. \n\n";
	cerr << "This utility is done, in fact it is already too complex.\n";
	cerr << "The ENGINE needs more work to assure export as OSIS works\n";
	cerr << "This utility only gives us occasion to improve the engine.\n";
	cerr << "Our goal is not to produce an export tool.\n\n";
	cerr << "In fact, you should never export SWORD modules.\n";
	cerr << "Many CrossWire modules are licensed for use from publishers\n";
	cerr << "and you will need to obtain your own permissions.\n";
	cerr << "We also do not encourage propagating encoding errors\n";
	cerr << "which you will avoid by obtaining text data from the source.\n\n";
	cerr << "Please see the TextSource entry in the module's .conf file\n";
	cerr << "for information where to obtain module data from our source.\n\n";
	cerr << "If you still must export SWORD module data, use mod2imp.\n";
	cerr << "It is more lossless; or less lossful, and easier to read.\n\n";
	
	if ((argc != 2)) {
		errorOutHelp(argv[0]);
	}

	if ((!strcmp(argv[1], "-h")) || (!strcmp(argv[1], "--help")) || (!strcmp(argv[1], "/?")) || (!strcmp(argv[1], "-?")) || (!strcmp(argv[1], "-help"))) {
		errorOutHelp(argv[0]);
	}

	SWMgr mgr(new MarkupFilterMgr(FMT_OSIS));
	StringList options = mgr.getGlobalOptions();
	for (StringList::iterator it = options.begin(); it != options.end(); it++) {
		StringList values = mgr.getGlobalOptionValues(it->c_str());
		if (find(values.begin(), values.end(), "On") != values.end()) {
			mgr.setGlobalOption(it->c_str(), "On");
		}
		if (find(values.begin(), values.end(), "All Readings") != values.end()) {
			mgr.setGlobalOption(it->c_str(), "All Readings");
		}
	}

//	mgr.setGlobalOption("Strong's Numbers", "Off");
//	mgr.setGlobalOption("Morphological Tags", "Off");

	ModMap::iterator it = mgr.Modules.find(argv[1]);
	if (it == mgr.Modules.end()) {
		fprintf(stderr, "error: %s: couldn't find module: %s \n", argv[0], argv[1]);
		exit(-2);
	}

	inModule = it->second;
//	inModule->AddRenderFilter(&filter);

	SWKey *key = (SWKey *)*inModule;
	VerseKey *vkey = SWDYNAMIC_CAST(VerseKey, key);

	char buf[1024];
	bool opentest = false;
	bool openbook = false;
	bool openchap = false;
	int lastTest = 5;
	int lastBook = 9999;
	int lastChap = 9999;
	if (!vkey) {
		cerr << "Currently mod2osis only works with verse keyed modules\n\n";
		exit(-1);
	}

	vkey->setIntros(false);

	cout << "<?xml version=\"1.0\" ";
		if (inModule->getConfigEntry("Encoding")) {
			if (*(inModule->getConfigEntry("Encoding")))
				cout << "encoding=\"" << inModule->getConfigEntry("Encoding") << "\" ";
			else cout << "encoding=\"UTF-8\" ";
		}
		else cout << "encoding=\"UTF-8\" ";
		cout << "?>\n\n";


	cout << "<osis";
		cout << " xmlns=\"http://www.bibletechnologies.net/2003/OSIS/namespace\"";
		cout << " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
		cout << " xsi:schemaLocation=\"http://www.bibletechnologies.net/2003/OSIS/namespace http://www.bibletechnologies.net/osisCore.2.1.1.xsd\">\n\n";
	cout << "<osisText";
		cout << " osisIDWork=\"";
		cout << inModule->getName() << "\"";
		cout << " osisRefWork=\"defaultReferenceScheme\"";
		if (inModule->getLanguage()) {
			if (strlen(inModule->getLanguage()))
				cout << " xml:lang=\"" << inModule->getLanguage() << "\"";
		}
		cout << ">\n\n";

	cout << "\t<header>\n";
	cout << "\t\t<work osisWork=\"";
	cout << inModule->getName() << "\">\n";
	cout << "\t\t\t<title>" << inModule->getDescription() << "</title>\n";
	cout << "\t\t\t<identifier type=\"OSIS\">Bible." << inModule->getName() << "</identifier>\n";
	cout << "\t\t\t<refSystem>Bible.KJV</refSystem>\n";
	cout << "\t\t</work>\n";
	cout << "\t\t<work osisWork=\"defaultReferenceScheme\">\n";
	cout << "\t\t\t<refSystem>Bible.KJV</refSystem>\n";
	cout << "\t\t</work>\n";
	cout << "\t</header>\n\n";


	(*inModule) = TOP;

	SWKey *p = inModule->createKey();
        VerseKey *tmpKey = SWDYNAMIC_CAST(VerseKey, p);
	if (!tmpKey) {
        	delete p;
	        tmpKey = new VerseKey();
	}
	*tmpKey = inModule->getKeyText();

	tmpKey->setIntros(true);
	tmpKey->setAutoNormalize(false);

	for ((*inModule) = TOP; !inModule->popError(); (*inModule)++) {
		bool newTest = false;
		bool newBook = false;

		if (!strlen(inModule->renderText())) {
			continue;
		}

		if ((vkey->getTestament() != lastTest)) {
			if (openchap)
				cout << "\t</chapter>\n";
			if (openbook)
				cout << "\t</div>\n";
			if (opentest)
				cout << "\t</div>\n";
			cout << "\t<div type=\"x-testament\">\n";
			opentest = true;
			newTest = true;
		}
		if ((vkey->getBook() != lastBook) || newTest) {
			if (!newTest) {
				if (openchap)
					cout << "\t</chapter>\n";
				if (openbook)
					cout << "\t</div>\n";
			}
			*buf = 0;
			*tmpKey = *vkey;
			tmpKey->setChapter(0);
			tmpKey->setVerse(0);
			sprintf(buf, "\t<div type=\"book\" osisID=\"%s\">\n", tmpKey->getOSISRef());
//			filter.ProcessText(buf, 200 - 3, &lastHeading, inModule);
			cout << "" << buf << endl;
			openbook = true;
			newBook = true;
		}
		if ((vkey->getChapter() != lastChap) || newBook) {
			if (!newBook) {
				if (openchap)
					cout << "\t</chapter>\n";
			}
			*buf = 0;
			*tmpKey = *vkey;
			tmpKey->setVerse(0);
			sprintf(buf, "\t<chapter osisID=\"%s\">\n", tmpKey->getOSISRef());
//			filter.ProcessText(buf, 200 - 3, &lastHeading, inModule);
			cout << "" << buf;
			openchap = true;
		}
		SWBuf verseText = inModule->getRawEntry();
		sprintf(buf, "\t\t<verse osisID=\"%s\">", vkey->getOSISRef());
		cout << buf << verseText.c_str() << "</verse>\n" << endl;
		lastChap = vkey->getChapter();
		lastBook = vkey->getBook();
		lastTest = vkey->getTestament();
	}
	if (openchap)
		cout << "\t</chapter>\n";
	if (openbook)
		cout << "\t</div>\n";
	if (opentest)
		cout << "\t</div>\n";
	cout << "\t</osisText>\n";
	cout << "</osis>\n";
	return 0;
}


