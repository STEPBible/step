/******************************************************************************
 *
 *  encfiltmgr.cpp -	implementaion of class EncodingFilterMgr, subclass of
 *			SWFilterMgr, used to transcode all module text to a
 *			requested encoding
 *
 * $Id: encfiltmgr.cpp 3781 2020-08-23 10:25:31Z scribe $
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

#include <encfiltmgr.h>
#include <utilstr.h>

#include <scsuutf8.h>
#include <latin1utf8.h>
#include <utf16utf8.h>

#include <unicodertf.h>
#include <utf8latin1.h>
#include <utf8utf16.h>
#include <utf8html.h>

#ifdef _ICU_
#include <utf8scsu.h>
#endif 

#include <swmodule.h>

#include <swmgr.h>


SWORD_NAMESPACE_START


/******************************************************************************
 * EncodingFilterMgr Constructor - initializes instance of EncodingFilterMgr
 *
 * ENT:
 *      enc - Encoding format to emit
 */
EncodingFilterMgr::EncodingFilterMgr(char enc)
		: SWFilterMgr() {

	scsuutf8   = new SCSUUTF8();
	latin1utf8 = new Latin1UTF8();
	utf16utf8  = new UTF16UTF8();

	encoding = enc;

	switch (encoding) {
		case ENC_LATIN1: targetenc = new UTF8Latin1(); break;
		case ENC_UTF16:  targetenc = new UTF8UTF16();  break;
		case ENC_RTF:    targetenc = new UnicodeRTF(); break;
		case ENC_HTML:   targetenc = new UTF8HTML();   break;
#ifdef _ICU_
		case ENC_SCSU:   targetenc = new UTF8SCSU();   break;
#endif
		default: // i.e. case ENC_UTF8
			targetenc = NULL;
	}
}


/******************************************************************************
 * EncodingFilterMgr Destructor - Cleans up instance of EncodingFilterMgr
 */
EncodingFilterMgr::~EncodingFilterMgr() {
	delete scsuutf8;
	delete latin1utf8;
	delete utf16utf8;
	delete targetenc;
}


void EncodingFilterMgr::addRawFilters(SWModule *module, ConfigEntMap &section) {

	ConfigEntMap::iterator entry;

	SWBuf encoding = ((entry = section.find("Encoding")) != section.end()) ? (*entry).second : (SWBuf)"";
	if (!encoding.length() || !stricmp(encoding.c_str(), "Latin-1")) {
		module->addRawFilter(latin1utf8);
	}
	else if (!stricmp(encoding.c_str(), "SCSU")) {
		module->addRawFilter(scsuutf8);
	}
	else if (!stricmp(encoding.c_str(), "UTF-16")) {
		module->addRawFilter(utf16utf8);
	}
}


void EncodingFilterMgr::addEncodingFilters(SWModule *module, ConfigEntMap &section) {
	if (targetenc)
		module->addEncodingFilter(targetenc);
}


/******************************************************************************
 * EncodingFilterMgr::Encoding	- sets/gets encoding
 *
 * ENT:	enc	- new encoding or 0 to simply get the current encoding
 *
 * RET: encoding
 */
void EncodingFilterMgr::setEncoding(char enc) {
	if (enc && enc != encoding) {
		encoding = enc;
		SWFilter *oldfilter = targetenc;

		switch (encoding) {
			case ENC_LATIN1: targetenc = new UTF8Latin1(); break;
			case ENC_UTF16:  targetenc = new UTF8UTF16();  break;
			case ENC_RTF:    targetenc = new UnicodeRTF(); break;
			case ENC_HTML:   targetenc = new UTF8HTML();   break;
#ifdef _ICU_
			case ENC_SCSU:   targetenc = new UTF8SCSU();   break;
#endif
			default: // i.e. case ENC_UTF8
				targetenc = NULL;
		}

		ModMap::const_iterator module;

		if (oldfilter != targetenc) {
			if (oldfilter) {
				if (!targetenc) {
					for (module = getParentMgr()->Modules.begin(); module != getParentMgr()->Modules.end(); module++)
						module->second->removeRenderFilter(oldfilter);
					}
				else {
					for (module = getParentMgr()->Modules.begin(); module != getParentMgr()->Modules.end(); module++)
						module->second->replaceRenderFilter(oldfilter, targetenc);
				}
				delete oldfilter;
			}
			else if (targetenc) {
				for (module = getParentMgr()->Modules.begin(); module != getParentMgr()->Modules.end(); module++)
					module->second->addRenderFilter(targetenc);
			}
		}
	}
}


SWORD_NAMESPACE_END
