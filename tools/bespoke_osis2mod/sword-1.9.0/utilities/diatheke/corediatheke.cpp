/******************************************************************************
 *
 *  corediatheke.cpp -	
 *
 * $Id: corediatheke.cpp 3579 2018-03-27 22:39:16Z scribe $
 *
 * Copyright 2001-2014 CrossWire Bible Society (http://www.crosswire.org)
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

/******************************************************************************
 * Diatheke by Chris Little <chrislit@crosswire.org>
 * http://www.crosswire.org/sword/diatheke
 */

#include "corediatheke.h"
#include <regex.h>
#include <list>
#include <utilstr.h>
#include <versekey.h>
#include <swmodule.h>

using std::list;
using std::cout;
using std::endl;
using std::ostream;

void systemquery(const char * key, ostream* output){
	DiathekeMgr manager;
	ModMap::iterator it;

	SWModule *target;
	
	bool types = false, descriptions = false, names = false, bibliography = false;

	if (!::stricmp(key, "localelist")) {		
		LocaleMgr *lm = LocaleMgr::getSystemLocaleMgr();
		list<SWBuf> loclist =	lm->getAvailableLocales();
		for (list<SWBuf>::iterator li = loclist.begin(); li != loclist.end(); ++li) {
			*output << li->c_str() << endl;
		}
	}
	else if (!::stricmp(key, "modulelist")) {
		types = true;
		descriptions = true;
		names = true;
	}
	else if (!::stricmp(key, "modulelistnames")) {
		names = true;
	}
	else if (!::stricmp(key, "modulelistdescriptions")) {
		descriptions = true;
	}
	else if (!::stricmp(key, "bibliography")) {
		types = true;
		names = true;
		bibliography = true;
	}
	
	if (types || descriptions || names || bibliography) {
		const char *modTypes[] = {
			SWMgr::MODTYPE_BIBLES,
			SWMgr::MODTYPE_COMMENTARIES,
			SWMgr::MODTYPE_LEXDICTS,
			SWMgr::MODTYPE_DAILYDEVOS,
			SWMgr::MODTYPE_GENBOOKS,
			0
		};

		for (int i = 0; modTypes[i]; ++i) {
	
			if (types) *output << modTypes[i] << ":\n";
			for (it = manager.Modules.begin(); it != manager.Modules.end(); it++) {
				target = it->second;
				if (!strcmp(target->getType(), modTypes[i])) {
					if (names) *output << target->getName();
					if (names && (descriptions || bibliography)) *output << " : ";
					if (descriptions) *output << target->getDescription();
					if (bibliography) *output << target->getBibliography();
					*output << endl;
				}
			}
		}

	}
}


void doquery(unsigned long maxverses = -1, unsigned char outputformat = FMT_PLAIN, unsigned char outputencoding = ENC_UTF8, unsigned long optionfilters = 0, unsigned char searchtype = ST_NONE, const char *range = 0, const char *text = 0, const char *locale = 0, const char *ref = 0, ostream* output = &cout, const char *script = 0, signed char variants = 0) {

	static DiathekeMgr manager(NULL, NULL, false, outputencoding, outputformat, ((OP_BIDI & optionfilters) == OP_BIDI), ((OP_ARSHAPE & optionfilters) == OP_ARSHAPE));

	ListKey listkey;
	const char *DEFAULT_FONT = "Gentium";
	SWModule *target;
	
	const char *font = 0;
	SWBuf modlanguage;
	SWBuf modlocale;
	SWBuf syslanguage;
	SWBuf syslocale;
	SWBuf header;
	
	char inputformat = 0;
	char querytype = 0;

	if (!locale) { locale = "en";
	}


	syslocale = SWBuf(locale);
	syslocale.append(".en");
	LocaleMgr *lom = LocaleMgr::getSystemLocaleMgr();
	lom->setDefaultLocaleName(syslocale);
	syslanguage = lom->translate(syslocale, "locales");
	
	
	//deal with queries to "system"
	if (!::stricmp(text, "system")) {
		querytype = QT_SYSTEM;
		systemquery(ref, output);
	}
	if (!strnicmp(text, "info", 4)) {
	        querytype = QT_INFO;
		text = ref;
	}
	//otherwise, we have a real book
	target = manager.getModule(text);
	if (!target) return;

	if (target->getLanguage()) {
		modlocale = target->getLanguage();
		LocaleMgr *lm = LocaleMgr::getSystemLocaleMgr();
		modlanguage = lm->translate(modlocale.append(".en"), "locales");
		modlocale -= 3; 			
	}
	else {
		modlocale = "en";
		modlanguage = "English";
	} 


	SWBuf sourceType = target->getConfigEntry("SourceType");
	if      (sourceType == "GBF") 	inputformat = FMT_GBF;
	else if (sourceType == "ThML")	inputformat = FMT_THML;
	else if (sourceType == "OSIS")	inputformat = FMT_OSIS;
	else if (sourceType == "TEI")	inputformat = FMT_TEI;

	SWBuf encoding = target->getConfigEntry("Encoding");


	if (querytype == QT_INFO) {
		switch (inputformat) {
			case FMT_THML : *output << "ThML"; break;
			case FMT_GBF  : *output << "GBF" ; break;
			case FMT_OSIS : *output << "OSIS"; break;
			case FMT_TEI  : *output << "TEI" ; break;
			default:        *output << "Other";
		}
		*output << ";";
		*output << target->getType();
		*output << ";";
		return;
	}

	if (searchtype) querytype = QT_SEARCH;

	manager.setGlobalOption("Footnotes", (optionfilters & OP_FOOTNOTES) ? "On": "Off");
	manager.setGlobalOption("Headings", (optionfilters & OP_HEADINGS) ? "On": "Off");
	manager.setGlobalOption("Strong's Numbers", (optionfilters & OP_STRONGS) ? "On": "Off");
	manager.setGlobalOption("Morphological Tags", (optionfilters & OP_MORPH) ? "On": "Off");
	manager.setGlobalOption("Hebrew Cantillation", (optionfilters & OP_CANTILLATION) ? "On": "Off");
	manager.setGlobalOption("Hebrew Vowel Points", (optionfilters & OP_HEBREWPOINTS) ? "On": "Off");
	manager.setGlobalOption("Greek Accents", (optionfilters & OP_GREEKACCENTS) ? "On": "Off");
	manager.setGlobalOption("Lemmas", (optionfilters & OP_LEMMAS) ? "On": "Off");
	manager.setGlobalOption("Cross-references", (optionfilters & OP_SCRIPREF) ? "On": "Off");
	manager.setGlobalOption("Words of Christ in Red", (optionfilters & OP_REDLETTERWORDS) ? "On": "Off");
	manager.setGlobalOption("Arabic Vowel Points", (optionfilters & OP_ARABICPOINTS) ? "On": "Off");
	manager.setGlobalOption("Glosses", (optionfilters & OP_GLOSSES) ? "On": "Off");
	manager.setGlobalOption("Transliterated Forms", (optionfilters & OP_XLIT) ? "On": "Off");
	manager.setGlobalOption("Enumerations", (optionfilters & OP_ENUM) ? "On": "Off");
	manager.setGlobalOption("Morpheme Segmentation", (optionfilters & OP_MORPHSEG) ? "On": "Off");
	manager.setGlobalOption("Transliteration", (optionfilters & OP_TRANSLITERATOR && script) ? script : "Off");

        VerseKey *parser = (SWDYNAMIC_CAST(VerseKey, target->getKey())) ? (VerseKey *)target->createKey() : 0;
	if (parser && (optionfilters & OP_INTROS)) { parser->setIntros(true); ((VerseKey *)target->getKey())->setIntros(true); }
	

	if ((optionfilters & OP_VARIANTS) && variants) {
		if (variants == -1)
			manager.setGlobalOption("Textual Variants", "All Readings");
		else if (variants == 1)
			manager.setGlobalOption("Textual Variants", "Secondary Reading");
	}
	else	manager.setGlobalOption("Textual Variants", "Primary Reading");


	if (querytype == QT_SEARCH) {
		//do search stuff
		char st = 1 - searchtype;
		if (querytype == QT_BIBLE) {
			*output << "Verses containing \"";
		}
		else	*output << "Entries containing \"";
	        *output << ref;
		*output << "\"-- ";

 		if (range && parser) {
 			ListKey scope = parser->parseVerseList(range, "Gen 1:1", true);
 			listkey = target->search(ref, st, REG_ICASE, &scope);
 		}
 		else listkey = target->search(ref, st, REG_ICASE);

		bool first = true;
		if (listkey.getCount()) {
			for (listkey = TOP; !listkey.popError(); listkey++) {
				if (!listkey.popError()) {
					if (outputformat == FMT_CGI) *output << "<entry>";
					*output << listkey.getText();
					if (outputformat == FMT_CGI) *output << "</entry>";
				}
				if (first) first = false;
				else *output << " ; ";
			}
			*output << " -- ";

			*output << listkey.getCount() << " matches total (";
		}
		else {
			*output << "none (";
		}
		*output << target->getName();
		*output << ")\n";
	}
	else {

		if (parser) {
			listkey = parser->parseVerseList(ref, "Gen1:1", true);
		}
		else listkey << ref;
		
		font = target->getConfigEntry("Font");
		if (!font) font = DEFAULT_FONT;

		if (outputformat == FMT_RTF) {
			*output << "{\\rtf1\\ansi{\\fonttbl{\\f0\\froman\\fcharset0\\fprq2 Times New Roman;}{\\f1\\fdecor\\fprq2 ";
			*output << font;
			*output << ";}{\\f7\\froman\\fcharset2\\fprq2 Symbol;}}";
		}

		else if (outputformat == FMT_LATEX) {
			*output << "\\documentclass{bibletext}\n"
				   "\\usepackage{sword}\n"
			           "\\title{" << target->getDescription() << " \\\\\\small " << ref << "}\n";

			if (syslanguage.size()) {
				syslanguage[0] = tolower(syslanguage[0]);
				*output << "\\setmainlanguage{" << syslanguage << "}\n";
			}
			
			if (modlanguage.size()) {
				modlanguage[0] = tolower(modlanguage[0]);
			}
			else {	
				modlanguage = "english";
			}
							
			if (!(modlanguage == syslanguage)) {		
				*output << "\\setotherlanguage{" << modlanguage << "}\n";
			}
			 	
			 
			*output << "\\date{}\n"
				   "\\begin{document}\n"
				   "\\maketitle\n";
				   
			if (!(modlanguage == syslanguage))      {
				*output << "\\begin{" << modlanguage << "}\n";
			}
		}


		else if (outputformat == FMT_HTML || outputformat == FMT_HTMLHREF || outputformat == FMT_XHTML) {
			*output << "<html><head><meta http-equiv=\"content-type\" content=\"text/html\" charset=\"UTF-8\""
				   " lang=\"" <<  locale << "\" xml:lang=\"" <<   locale << "\"/>\n"
				   "<style type=\"text/css\">" << target->getRenderHeader() << "</style></head><body>";
				   
		}

		for (listkey = TOP; !listkey.popError() && maxverses; listkey++) {
			target->setKey(listkey);
			VerseKey *vk = SWDYNAMIC_CAST(VerseKey, target->getKey());
			// Call this before all the pre-verse handling, as it needs to be
			// executed before the preverse headers are populated
			SWBuf text = target->renderText();
			
			// if we've got a VerseKey (Bible or Commentary)
			if (vk) {
				// let's do some special processing if we're at verse 1
				if (vk->getVerse() == 1) {
					if (vk->getChapter() == 1) {
						if (vk->getBook() == 1) {
							if (vk->getTestament() == 1) {								
								// MODULE START SPECIAL PROCESSING								
								if (outputformat == FMT_LATEX)
									 { *output << "\\swordmodule\n";
									// put your latex module start stuff here
								}
							}
							// TESTAMENT START SPECIAL PROCESSING
							if (outputformat == FMT_LATEX) {
								// put your latex testament start stuff here
								*output << "\\swordtestament\n";
							}
						}
						// BOOK START SPECIAL PROCESSING
						if (outputformat == FMT_LATEX) {
							// put your latex book start stuff here
							*output << "\\swordbook\n";
						}
					}
					// CHAPTER START SPECIAL PROCESSING
					if (outputformat == FMT_LATEX) {
						*output << "\n\\swordchapter{" 
							<< vk->getOSISRef() << "}{"
							<< vk->getText() << "}{" 
							<< vk->getChapter() << "}";
					}
				}

				// PREVERSE MATTER
				header = target->getEntryAttributes()["Heading"]["Preverse"]["0"];
				*output << target->renderText(header);

				// VERSE PROCESSING
				if (outputformat == FMT_LATEX) {
					*output << "\\swordverse{"
						<< vk->getOSISRef() << "}{"
						<< vk->getText() << "}{" 
						<< vk->getVerse() << "} ";
				}
				// no special format processing default: just show the key
				else {
					*output << target->getKeyText();
				}
			}
			// if we're not a VerseKey, then simply output the key
			else { 						
				*output << target->getKeyText();
			}

			// OUTPUT RENDER ENTRY
			if (outputformat == FMT_HTML || outputformat == FMT_HTMLHREF || outputformat == FMT_XHTML || outputformat == FMT_THML || outputformat == FMT_CGI) {
				*output << ": <span ";
				*output << "style=\"font:"  << font << ";\" ";
				if (strcmp(modlocale,locale) !=0 ) { *output << "lang=\"" << modlocale << "\"";}
				*output << ">";
			}
			else if (outputformat == FMT_RTF) {
				*output << ": {\\f1 ";
			}
			else if (outputformat == FMT_LATEX) {
				*output << " ";
			}
			else {
				*output << ": ";
			}
					
			*output << text;
			
	
			if (outputformat == FMT_HTML || outputformat == FMT_HTMLHREF || outputformat == FMT_XHTML || outputformat == FMT_THML || outputformat == FMT_CGI) {
				*output << "</span>";
			}
			else if (outputformat == FMT_RTF) {
				*output << "}";
			}

			if (inputformat != FMT_THML && (outputformat == FMT_HTML || outputformat == FMT_HTMLHREF || outputformat == FMT_XHTML || outputformat == FMT_THML || outputformat == FMT_CGI))
				*output << "<br />";
			else if (outputformat == FMT_OSIS)
				*output << "<milestone type=\"line\"/>";
			else if (outputformat == FMT_RTF)
				*output << "\\par ";
			else if (outputformat == FMT_GBF)
				*output << "<CM>";

			*output << "\n";

			maxverses--;
		}

		if ((outputformat == FMT_LATEX) && (!(modlanguage == syslanguage))) {
			*output << "\\end{" << modlanguage << "}\n";
		}
		
		
		*output << "(";
		*output << target->getName();
		
		if (outputformat == FMT_LATEX) {
			*output << ", ";
			*output << target->getConfigEntry("DistributionLicense");
			
		}

		*output << ")\n";

		if (outputformat == FMT_RTF) {
			*output << "}";
		}
		else if (outputformat == FMT_LATEX) {
			*output << "\\end{document}\n";			
		}
		else if (outputformat == FMT_HTML || outputformat == FMT_HTMLHREF || outputformat == FMT_XHTML || outputformat == FMT_THML || outputformat == FMT_CGI) {
			*output << "</body></html>\n";
		}
	}
	delete parser;
}

