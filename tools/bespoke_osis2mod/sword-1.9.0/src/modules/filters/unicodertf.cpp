/******************************************************************************
 *
 *  unicodertf.cpp -	SWFilter descendant to convert UTF-8 to RTF tags
 *
 * $Id: unicodertf.cpp 3081 2014-03-05 19:52:08Z chrislit $
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

#include <stdio.h>
#include <unicodertf.h>
#include <swbuf.h>

SWORD_NAMESPACE_START

UnicodeRTF::UnicodeRTF() {
}


char UnicodeRTF::processText(SWBuf &text, const SWKey *key, const SWModule *module)
{
	const unsigned char *from;
	char digit[10];
	unsigned long ch;
        signed short utf16;
	unsigned char from2[7];

	SWBuf orig = text;

	from = (const unsigned char *)orig.c_str();

	// -------------------------------
	for (text = ""; *from; from++) {
		ch = 0;
                //case: ANSI
		if ((*from & 128) != 128) {
			text += *from;
			continue;
		}
                //case: Invalid UTF-8 (illegal continuing byte in initial position)
		if ((*from & 128) && ((*from & 64) != 64)) {
			continue;
		}
                //case: 2+ byte codepoint
		from2[0] = *from;
		from2[0] <<= 1;
		int subsequent;
		for (subsequent = 1; (from2[0] & 128) && (subsequent < 7); subsequent++) {
			from2[0] <<= 1;
			from2[subsequent] = from[subsequent];
			from2[subsequent] &= 63;
			ch <<= 6;
			ch |= from2[subsequent];
		}
		subsequent--;
		from2[0] <<= 1;
		char significantFirstBits = 8 - (2+subsequent);
		
		ch |= (((short)from2[0]) << (((6*subsequent)+significantFirstBits)-8));
		from += subsequent;
                if (ch < 0x10000) {
				utf16 = (signed short)ch;
				text += '\\';
				text += 'u';
				sprintf(digit, "%d", utf16);
				text += digit;
				text += '?';
			 }
			else {
				utf16 = (signed short)((ch - 0x10000) / 0x400 + 0xD800);
				text += '\\';
				text += 'u';
				sprintf(digit, "%d", utf16);
				text += digit;
				text += '?';
				utf16 = (signed short)((ch - 0x10000) % 0x400 + 0xDC00);
				text += '\\';
				text += 'u';
				sprintf(digit, "%d", utf16);
				text += digit;
				text += '?';
			}
	}
	   
	return 0;
}

SWORD_NAMESPACE_END
