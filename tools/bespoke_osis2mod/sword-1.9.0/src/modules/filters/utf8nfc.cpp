/******************************************************************************
 *
 *  utf8nfc.cpp -	SWFilter descendant to perform NFC (canonical
 *			composition normalization) on UTF-8 text
 *
 * $Id: utf8nfc.cpp 3618 2019-04-14 22:30:32Z scribe $
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

#ifdef _ICU_

#include <unicode/unistr.h>
#include <unicode/normlzr.h>
#include <unicode/unorm.h>

#include <utf8nfc.h>
#include <swbuf.h>

SWORD_NAMESPACE_START

UTF8NFC::UTF8NFC() {
        conv = ucnv_open("UTF-8", &err);
}

UTF8NFC::~UTF8NFC() {
         ucnv_close(conv);
}

char UTF8NFC::processText(SWBuf &text, const SWKey *key, const SWModule *module)
{
	if ((unsigned long)key < 2)	// hack, we're en(1)/de(0)ciphering
		return -1;
        
	err = U_ZERO_ERROR;
	icu::UnicodeString source(text.getRawData(), text.length(), conv, err);
	icu::UnicodeString target;

	err = U_ZERO_ERROR;
	icu::Normalizer::normalize(source, UNORM_NFC, 0, target, err);

	err = U_ZERO_ERROR;
	text.setSize(text.size()*2); // potentially, it can grow to 2x the original size
	int32_t len = target.extract(text.getRawData(), text.size(), conv, err);
	text.setSize(len);

	return 0;
}

SWORD_NAMESPACE_END
#endif
