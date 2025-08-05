/******************************************************************************
 *
 *  diafiltmgr.cpp -	DiathekeFilterMgr
 *
 * $Id: diafiltmgr.cpp 3753 2020-07-10 09:32:46Z scribe $
 *
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <swmodule.h>

#include <thmlplain.h>
#include <thmlgbf.h>
#include <thmlosis.h>
#include <thmlhtml.h>
#include <thmlhtmlhref.h>
#include <thmlxhtml.h>
#include <thmllatex.h>
#include <thmlrtf.h>
#include <thmlwebif.h>

#include <gbfplain.h>
#include <gbfthml.h>
#include <gbfosis.h>
#include <gbfhtml.h>
#include <gbfhtmlhref.h>
#include <gbfxhtml.h>
#include <gbflatex.h>
#include <gbfrtf.h>
#include <gbfwebif.h>

#include <osisplain.h>
#include <osisosis.h>
#include <osisrtf.h>
#include <osishtmlhref.h>
#include <osisxhtml.h>
#include <osislatex.h>
#include <osiswebif.h>

#include <teiplain.h>
#include <teirtf.h>
#include <teihtmlhref.h>
#include <teixhtml.h>
#include <teilatex.h>

#include "diafiltmgr.h"
#include "thmlcgi.h"
#include "gbfcgi.h"
#include "osiscgi.h"

DiathekeFilterMgr::DiathekeFilterMgr (char mark, char enc)
		   : EncodingFilterMgr(enc) {

        markup = mark;

        CreateFilters(markup);
}

DiathekeFilterMgr::~DiathekeFilterMgr() {
        if (fromthml)
                delete (fromthml);
        if (fromgbf)
                delete (fromgbf);
        if (fromplain)
                delete (fromplain);
        if (fromosis)
                delete (fromosis);
        if (fromtei)
                delete (fromtei);
}

void DiathekeFilterMgr::addRenderFilters(SWModule *module, ConfigEntMap &section) {
        switch (module->getMarkup()) {
        case FMT_THML:
                if (fromthml)
                        module->addRenderFilter(fromthml);
                break;
        case FMT_GBF:
                if (fromgbf)
                        module->addRenderFilter(fromgbf);
                break;
        case FMT_PLAIN:
                if (fromplain)
                        module->addRenderFilter(fromplain);
                break;
        case FMT_OSIS:
                if (fromosis)
                        module->addRenderFilter(fromosis);
                break;
        case FMT_TEI:
                if (fromtei)
                        module->addRenderFilter(fromtei);
                break;
        }
	EncodingFilterMgr::addRenderFilters(module, section);
}


char DiathekeFilterMgr::Markup(char mark) {
        if (mark && mark != markup) {
                markup = mark;
                ModMap::const_iterator module;

                SWFilter * oldplain = fromplain;
                SWFilter * oldthml = fromthml;
                SWFilter * oldgbf = fromgbf;
                SWFilter * oldosis = fromosis;
                SWFilter * oldtei = fromtei;

                CreateFilters(markup);

                for (module = getParentMgr()->Modules.begin(); module != getParentMgr()->Modules.end(); module++)
                        switch (module->second->getMarkup()) {
                        case FMT_THML:
                                if (oldthml != fromthml) {
                                        if (oldthml) {
                                                if (!fromthml) {
                                                        module->second->removeRenderFilter(oldthml);
                                                }
                                                else {
                                                        module->second->replaceRenderFilter(oldthml, fromthml);
                                                }
                                        }
                                        else if (fromthml) {
                                                module->second->addRenderFilter(fromthml);
                                        }
                                }
                                break;
                        case FMT_GBF:
                                if (oldgbf != fromgbf) {
                                        if (oldgbf) {
                                                if (!fromgbf) {
                                                        module->second->removeRenderFilter(oldgbf);
                                                }
                                                else {
                                                        module->second->replaceRenderFilter(oldgbf, fromgbf);
                                                }
                                        }
                                        else if (fromgbf) {
                                                module->second->addRenderFilter(fromgbf);
                                        }
                                        break;
                                }
                        case FMT_PLAIN:
                                if (oldplain != fromplain) {
                                        if (oldplain) {
                                                if (!fromplain) {
                                                        module->second->removeRenderFilter(oldplain);
                                                }
                                                else {
                                                        module->second->replaceRenderFilter(oldplain, fromplain);
                                                }
                                        }
                                        else if (fromplain) {
                                                module->second->addRenderFilter(fromplain);
                                        }
                                        break;
                                }
                        case FMT_OSIS:
                                if (oldosis != fromosis) {
                                        if (oldosis) {
                                                if (!fromosis) {
                                                        module->second->removeRenderFilter(oldosis);
                                                }
                                                else {
                                                        module->second->replaceRenderFilter(oldosis, fromosis);
                                                }
                                        }
                                        else if (fromosis) {
                                                module->second->addRenderFilter(fromosis);
                                        }
                                        break;
                                }
                        case FMT_TEI:
                                if (oldtei != fromtei) {
                                        if (oldtei) {
                                                if (!fromtei) {
                                                        module->second->removeRenderFilter(oldtei);
                                                }
                                                else {
                                                        module->second->replaceRenderFilter(oldtei, fromtei);
                                                }
                                        }
                                        else if (fromtei) {
                                                module->second->addRenderFilter(fromtei);
                                        }
                                        break;
                                }
                        }

                if (oldthml)
                        delete oldthml;
                if (oldgbf)
                        delete oldgbf;
                if (oldplain)
                        delete oldplain;
                if (oldosis)
                        delete oldosis;
                if (oldtei)
                        delete oldtei;
        }
        return markup;
}

void DiathekeFilterMgr::CreateFilters(char markup) {

                switch (markup) {
		case FMT_INTERNAL:
			fromplain = NULL;
			fromthml = NULL;
			fromgbf = NULL;
			fromosis = NULL;
			fromtei = NULL;
			break;

		case FMT_CGI:
			fromplain = NULL;
			fromthml = new ThMLCGI();
			fromgbf = new GBFCGI();
			fromosis = new OSISCGI();
			fromtei = NULL; // TODO: write TEICGI()
			break;

		case FMT_PLAIN:
			fromplain = NULL;
			fromthml  = new ThMLPlain();
			fromgbf   = new GBFPlain();
			fromosis  = new OSISPlain();
			fromtei   = new TEIPlain();
			break;
			
		case FMT_THML:
			fromplain = NULL;
			fromthml  = NULL;
			fromgbf   = new GBFThML();
			fromosis  = NULL;
			fromtei   = NULL;
			break;
			
		case FMT_GBF:
			fromplain = NULL;
			fromthml  = new ThMLGBF();
			fromgbf   = NULL;
			fromosis  = NULL;
			fromtei   = NULL;
			break;
			
		case FMT_HTML:
			fromplain = NULL;
			fromthml  = new ThMLHTML();
			fromgbf   = new GBFHTML();
			fromosis  = NULL;
			fromtei   = NULL;
			break;
			
		case FMT_HTMLHREF:
			fromplain = NULL;
			fromthml  = new ThMLHTMLHREF();
			fromgbf   = new GBFHTMLHREF();
			fromosis  = new OSISHTMLHREF();
			fromtei   = new TEIHTMLHREF();
			break;
			
		case FMT_RTF:
			fromplain = NULL;
			fromthml  = new ThMLRTF();
			fromgbf   = new GBFRTF();
			fromosis  = new OSISRTF();
			fromtei   = new TEIRTF();
			break;
			
		case FMT_LATEX:
			fromplain = NULL;
			fromthml  = new ThMLLaTeX();
			fromgbf   = new GBFLaTeX();
			fromosis  = new OSISLaTeX();
			fromtei   = new TEILaTeX();
			break;
			
		case FMT_OSIS:
			fromplain = NULL;
			fromthml  = new ThMLOSIS();
			fromgbf   = new GBFOSIS();
			fromosis  = new OSISOSIS();
			fromtei   = NULL;
			break;
			
		case FMT_WEBIF:
			fromplain = NULL;
			fromthml  = new ThMLWEBIF();
			fromgbf   = new GBFWEBIF();
			fromosis  = new OSISWEBIF();
			fromtei   = NULL;
			break;
			
		case FMT_TEI:
			fromplain = NULL;
			fromthml  = NULL;
			fromgbf   = NULL;
			fromosis  = NULL;
			fromtei   = NULL;
			break;
			
		case FMT_XHTML:
			fromplain = NULL;
			fromthml  = new ThMLXHTML();
			fromgbf   = new GBFXHTML();
			fromosis  = new OSISXHTML();
			fromtei   = new TEIXHTML();
			break;
                }

}
