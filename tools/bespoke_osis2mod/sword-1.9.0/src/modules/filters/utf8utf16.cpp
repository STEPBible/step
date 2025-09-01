/******************************************************************************
 *
 *  utf8utf16.cpp -	SWFilter descendant to convert UTF-8 to UTF-16
 *
 * $Id: utf8utf16.cpp 3749 2020-07-06 23:51:56Z scribe $
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


#include <utf8utf16.h>
#include <utilstr.h>
#include <swbuf.h>


SWORD_NAMESPACE_START


UTF8UTF16::UTF8UTF16() {
}


char UTF8UTF16::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	const unsigned char *from;
	SWBuf orig = text;

	from = (const unsigned char *)orig.c_str();

	// -------------------------------
	text = "";
	while (*from) {

		SW_u32 ch = getUniCharFromUTF8(&from);

		if (!ch) continue;	// invalid char

		if (ch < 0x10000) {
			text.setSize(text.size()+2);
			*((SW_u16 *)(text.getRawData() + (text.size() - 2))) = (SW_u16)ch;
		}
		else {
			SW_u16 utf16;
			utf16 = (SW_s16)((ch - 0x10000) / 0x400 + 0xD800);
			text.setSize(text.size()+4);
			*((SW_u16 *)(text.getRawData() + (text.size() - 4))) = utf16;
			utf16 = (SW_s16)((ch - 0x10000) % 0x400 + 0xDC00);
			*((SW_u16 *)(text.getRawData() + (text.size() - 2))) = utf16;
		}
	}
	text.setSize(text.size()+2);
	*((SW_u16 *)(text.getRawData() + (text.size() - 2))) = (SW_u16)0;
	text.setSize(text.size()-2);
	   
	return 0;
}

SWORD_NAMESPACE_END
