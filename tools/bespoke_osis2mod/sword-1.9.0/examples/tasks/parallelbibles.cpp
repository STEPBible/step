/******************************************************************************
 *
 *  parallelbibles.cpp -	This examples demonstrates a strategy for
 *  				displaying Bibles in parallel
 *
 * $Id: parallelbibles.cpp 3030 2014-02-28 02:14:44Z scribe $
 *
 * Copyright 2013-2014 CrossWire Bible Society (http://www.crosswire.org)
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
#include <markupfiltmgr.h>
#include <swmodule.h>
#include <versekey.h>
#include <iostream>
#include <vector>
#include <stdio.h>


using namespace sword;
using namespace std;

const bool o = 1;

void parallelDisplay(vector<SWModule *>modules, const char *key) {

	//cout << "Start key:" << key;

	// We'll use the first module's key as our master key to position all other modules.
	VerseKey *master = (VerseKey *)modules[0]->createKey();

	master->setText(key);

	//cout << "\t key:" << master->getText();

	int curVerse   = master->getVerse();
	int curChapter = master->getChapter();
	int curBook    = master->getBook();

	for (master->setVerse(1);	   (master->getBook()    == curBook)
					&& (master->getChapter() == curChapter)
					&& !master->popError();
										(*master)++) {

		if(o) cout << "<tr class=\"" << (master->getVerse() == curVerse ? "currentverse":"verse") << "\">";

		for (vector<SWModule *>::iterator module = modules.begin(); module != modules.end(); ++module) {
			//cout << "\n\n====================\nfromKey" << master->getOSISRef();

			(*module)->setKey(master);
			VerseKey slave((*module)->getKey());

			//cout << "setKey" << (*module)->getName() << slave.getBookName() << slave.getRangeText() << slave.getShortText();

			if(o) cout << "<td>" << "<span class=\"versenum\">";

			//cout << "[" << (int)slave.getBook() << " " << (int)master->getBook() << " " << (int)slave.getTestament() << " " << (int)master->getTestament() << "]";


			if (!(*module)->popError()) {

				if(strcmp(slave.getBookName(), master->getBookName())) {
					if(o) cout << slave.getShortText();
				}
				else if(slave.getChapter() != master->getChapter()) {
					if(o) cout << slave.getChapter() << ":" << slave.getVerse();
				}
				else {
					if(o) cout << slave.getVerse();
				}

				if(slave.isBoundSet()) {
					if(o) cout << "-";
					if(slave.getUpperBound().getBook() != slave.getLowerBound().getBook()) {
						if(o) cout << slave.getUpperBound().getShortText();
					}
					else if(slave.getUpperBound().getChapter() != slave.getLowerBound().getChapter()) {
						if(o) cout << slave.getUpperBound().getChapter() << ":" << slave.getUpperBound().getVerse();
					}
					else {
						if(o) cout << slave.getUpperBound().getVerse();
					}
				}

				if(o) cout << "</span> ";


				if(slave.isBoundSet()) {
					VerseKey temp(slave);
					for(int i = slave.getLowerBound().getIndex(); i <= slave.getUpperBound().getIndex(); ++i) {
						if(i > 0) if(o) cout << " ";
						temp.setIndex(i);
						(*module)->setKey(temp);
						if(o) cout << (*module)->renderText();
					}
				}
				else {
					if(o) cout << (*module)->renderText();
				}

				if(o) cout << "</td>";
			}
		}
		if(o) cout << "</tr>";
	}
	delete master;
}


void outputHeader(vector<SWModule *>modules, const char *key) {

	modules[0]->setKey(key);
	
	// force a render so our key snaps to a module entry and we get nicely formatted keytext output later
	// otherwise we just get what the user typed
	modules[0]->renderText();

	cout
	<< "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
	<< "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">"
	<< "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:og=\"http://ogp.me/ns#\" xmlns:fb=\"https://www.facebook.com/2008/fbml\" xml:lang=\"en_US\" lang=\"en_US\">"
	<< "<head profile=\"http://www.w3.org/2000/08/w3c-synd/#\">"
	<< "<meta name=\"keywords\" content=\"Jesus, Christ, Church, Bible, Iran, Persian, Persia, Azeri, Azerbaijan, Armenian, God, Gospel, CrossWire, Java, Web, Software\" />"
	<< "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />"
	<< "<title>OSIS Web: " << modules[0]->getKeyText() << " - Parallel Bible study</title>"
	<< "<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" href=\"http://crosswire.org/study/common.css\"  />"
	<< "<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" title=\"Washed Out\" href=\"http://crosswire.org/study/wash.css\"  />"
	<< "<link rel=\"stylesheet\" type=\"text/css\" href=\"http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css\"/>"
	<< "<script type=\"text/javascript\" src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js\"></script>"
	<< "<script type=\"text/javascript\" src=\"http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js\"></script>"
	<< "<link rel=\"alternate stylesheet\" type=\"text/css\" media=\"all\" title=\"Washed Out\" href=\"http://crosswire.org/study/wash.css\" />"
	<< "<link rel=\"alternate stylesheet\" type=\"text/css\" media=\"all\" title=\"Parchment\" href=\"http://crosswire.org/study/parchment.css\" />"
	<< "<link rel=\"alternate stylesheet\" type=\"text/css\" media=\"all\" title=\"Sandy Creek\" href=\"http://crosswire.org/study/sandy.css\" />"
	<< "<!--For printing stuff -->"
	<< "<link rel=\"stylesheet\" type=\"text/css\" media=\"print\" href=\"http://crosswire.org/study/print.css\" />"
	<< "<script type=\"text/javascript\" src=\"http://crosswire.org/study/swordweb.js\"></script>"
	<< "</head>"
	<< "<body onload=\"onPageLoad();\" class=\"ltor\">"
 	<<   "<div id=\"pageBorderTop\"></div>"
  	<<   "<div id=\"header\">"
    	<<     "<h1>The Bible Tool</h1>"
  	<<   "</div>"
	<<   "<div id=\"content-main\">"
	<<     "<div id=\"paralleldisplay\">"
	<<       "<style>"
	<<         modules[0]->getRenderHeader()
	<<       "</style>"
	<<       "<h2>Parallel Viewing: " << modules[0]->getKeyText() << "</h2><br/>"
	<<       "<table><thead><tr>";

	for (vector<SWModule *>::iterator module = modules.begin(); module != modules.end(); ++module) {
		cout << "<th>" << (*module)->getDescription() << "</th>";
	}

	cout
	<<       "</tr></thead><tbody>";

	
}

void outputFooter(vector<SWModule *>modules) {

	cout
	<<       "</tbody><tfoot><tr>";

	for (vector<SWModule *>::iterator module = modules.begin(); module != modules.end(); ++module) {
		SWBuf copyLine = (*module)->getConfigEntry("ShortCopyright");
		SWBuf promoLine = (*module)->getConfigEntry("ShortPromo");
		cout
		<< "<th>"
		<< "<div class=\"copyLine\">" <<  copyLine << "</div>"
		<< "<div class=\"promoLine\">" << promoLine << "</div>"
		<< "</th>";
	}

	cout
	<<       "</tr></tfoot></table>"
	<<     "</div>"
	<<   "</div>"
	<<   "<div id=\"footer\">"
	<<     "<p>"
	<<       "<a href=\"http://www.americanbible.org/\" title=\"American Bible Society\"><img src=\"http://crosswire.org/study/images/logo_abs.gif\" width=\"105\" height=\"64\" alt=\"American Bible Society\" /></a>"
	<<       "<a href=\"http://crosswire.org/\" title=\"CrossWire Bible Society\"><img src=\"http://crosswire.org/study/images/logo_cwbs.gif\" width=\"161\" height=\"64\" alt=\"CrossWire Bible Society\" /></a>"
	<<       "<a href=\"http://sbl-site.org/\" title=\"Society of Biblical Literature\"><img src=\"http://crosswire.org/study/images/logo_fbl.gif\" width=\"86\" height=\"64\" alt=\"Society of Biblical Literature\" /></a>"
	<<     "</p>"
	<<     "<p>Copyright &copy; 2003-2011  <a href=\"http://www.crosswire.org/\">CrossWire Bible Society</a></p>"
	<<       "<div id=\"pageBorderBottom\"><br /></div>"
	<<   "</div>"
	<< "</body>"
	<< "</html>";
}


int main(int argc, char **argv) {

	SWMgr library(new MarkupFilterMgr(FMT_XHTML));

	if (argc < 3) {
		fprintf(stderr, "\nusage: %s <modname> [modname ...] <\"key\">\n"
							 "\tExample: %s KJV ESV \"James 1:19\"\n\n", argv[0], argv[0]);
		exit(-1);
	}

	vector<SWModule *> modules;
	for (int i = 1; i < argc-1; ++i) {
		SWModule *bible = library.getModule(argv[i]);
		if (!bible) {
			fprintf(stderr, "Could not find module [%s].  Available modules:\n", argv[i]);
			ModMap::iterator it;
			for (it = library.Modules.begin(); it != library.Modules.end(); ++it) {
				fprintf(stderr, "[%s]\t - %s\n", (*it).second->getName(), (*it).second->getDescription());
			}
			exit(-2);
		}
		modules.push_back(bible);
	}

	if(o) outputHeader(modules, argv[argc-1]);
	parallelDisplay(modules, argv[argc-1]);
	if(o) outputFooter(modules);

	return 0;
}

