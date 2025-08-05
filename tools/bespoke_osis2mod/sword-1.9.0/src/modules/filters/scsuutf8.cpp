/******************************************************************************
 *
 *  scsuutf8.cpp -	SWFilter descendant to convert a SCSU character to
 *			UTF-8
 *
 * $Id: scsuutf8.cpp 3727 2020-04-29 02:33:23Z scribe $
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

/* This class is based on:
 * http://czyborra.com/scsu/scsu.c written by Roman Czyborra@dds.nl
 *
 * This is a deflator to UTF-8 output for input compressed in SCSU,
 * the (Reuters) Standard Compression Scheme for Unicode as described
 * in http://www.unicode.org/unicode/reports/tr6.html
 */

#include <scsuutf8.h>
#include <swbuf.h>
#ifdef _ICU_
#include <unicode/unistr.h>
#endif



SWORD_NAMESPACE_START


SCSUUTF8::SCSUUTF8()
#ifdef _ICU_
 : err()
#endif
{
#ifdef _ICU_
	
	// initialize SCSU converter
	scsuConv = ucnv_open("SCSU", &err);
	// initialize UTF-8 converter
	utf8Conv = ucnv_open("UTF-8", &err);	
#else
	active = 0;
	mode = 0;
#endif
}

SCSUUTF8::~SCSUUTF8() {
#ifdef _ICU_
	ucnv_close(scsuConv);
	ucnv_close(utf8Conv);
#endif
}

#ifndef _ICU_
unsigned short SCSUUTF8::start[] = {0x0000,0x0080,0x0100,0x0300,0x2000,0x2080,0x2100,0x3000};
unsigned short SCSUUTF8::slide[] = {0x0080,0x00C0,0x0400,0x0600,0x0900,0x3040,0x30A0,0xFF00};
unsigned short SCSUUTF8::win[] = {
	0x0000, 0x0080, 0x0100, 0x0180, 0x0200, 0x0280, 0x0300, 0x0380,
	0x0400, 0x0480, 0x0500, 0x0580, 0x0600, 0x0680, 0x0700, 0x0780,
	0x0800, 0x0880, 0x0900, 0x0980, 0x0A00, 0x0A80, 0x0B00, 0x0B80,
	0x0C00, 0x0C80, 0x0D00, 0x0D80, 0x0E00, 0x0E80, 0x0F00, 0x0F80,
	0x1000, 0x1080, 0x1100, 0x1180, 0x1200, 0x1280, 0x1300, 0x1380,
	0x1400, 0x1480, 0x1500, 0x1580, 0x1600, 0x1680, 0x1700, 0x1780,
	0x1800, 0x1880, 0x1900, 0x1980, 0x1A00, 0x1A80, 0x1B00, 0x1B80,
	0x1C00, 0x1C80, 0x1D00, 0x1D80, 0x1E00, 0x1E80, 0x1F00, 0x1F80,
	0x2000, 0x2080, 0x2100, 0x2180, 0x2200, 0x2280, 0x2300, 0x2380,
	0x2400, 0x2480, 0x2500, 0x2580, 0x2600, 0x2680, 0x2700, 0x2780,
	0x2800, 0x2880, 0x2900, 0x2980, 0x2A00, 0x2A80, 0x2B00, 0x2B80,
	0x2C00, 0x2C80, 0x2D00, 0x2D80, 0x2E00, 0x2E80, 0x2F00, 0x2F80,
	0x3000, 0x3080, 0x3100, 0x3180, 0x3200, 0x3280, 0x3300, 0x3800,
	0xE000, 0xE080, 0xE100, 0xE180, 0xE200, 0xE280, 0xE300, 0xE380,
	0xE400, 0xE480, 0xE500, 0xE580, 0xE600, 0xE680, 0xE700, 0xE780,
	0xE800, 0xE880, 0xE900, 0xE980, 0xEA00, 0xEA80, 0xEB00, 0xEB80,
	0xEC00, 0xEC80, 0xED00, 0xED80, 0xEE00, 0xEE80, 0xEF00, 0xEF80,
	0xF000, 0xF080, 0xF100, 0xF180, 0xF200, 0xF280, 0xF300, 0xF380,
	0xF400, 0xF480, 0xF500, 0xF580, 0xF600, 0xF680, 0xF700, 0xF780,
	0xF800, 0xF880, 0xF900, 0xF980, 0xFA00, 0xFA80, 0xFB00, 0xFB80,
	0xFC00, 0xFC80, 0xFD00, 0xFD80, 0xFE00, 0xFE80, 0xFF00, 0xFF80,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
	0x0000, 0x00C0, 0x0250, 0x0370, 0x0530, 0x3040, 0x30A0, 0xFF60,
};

int SCSUUTF8::UTF8Output(unsigned long uchar, SWBuf* utf8Buf)
{
	// join UTF-16 surrogates without any pairing sanity checks
	if (uchar >= 0xd800 && uchar <= 0xdbff) {
		d = uchar & 0x3ff;
		return 0;
	}
	if (uchar >= 0xdc00 && uchar <= 0xdfff) {
		uchar = uchar + 0x2400 + d * 0x400;
	}
	
	// output one character as UTF-8 multibyte sequence
	
	if (uchar < 0x80) {
		utf8Buf += uchar;
	}
	else if (uchar < 0x800) {
		utf8Buf += (0xc0 | (uchar>>6));
		utf8Buf += (0x80 | (uchar & 0x3f));
	}
	else if (uchar < 0x10000) {
		utf8Buf += (0xe0 | (uchar>>12));
		utf8Buf += (0x80 | (uchar>>6 & 0x3f));
		utf8Buf += (0x80 | (uchar & 0x3f));
	}
	else if (uchar < 0x200000) {
		utf8Buf += (0xf0 | (uchar>>18));
		utf8Buf += (0x80 | (uchar>>12 & 0x3f));
		utf8Buf += (0x80 | (uchar>>6 & 0x3f));
		utf8Buf += (0x80 | (uchar & 0x3f));
	}
	
	return 0;
}
#endif

char SCSUUTF8::processText(SWBuf &text, const SWKey *key, const SWModule *module) {
	if ((unsigned long)key < 2)	// hack, we're en(1)/de(0)ciphering
		return -1;
	
#ifdef _ICU_
	// Try decoding with ICU if possible
	err = U_ZERO_ERROR;
	icu::UnicodeString utf16Text(text.getRawData(), text.length(), scsuConv, err);
	err = U_ZERO_ERROR;
	int32_t len = utf16Text.extract(text.getRawData(), text.size(), utf8Conv, err);
	if (len > (int32_t)text.size()+1) {
		text.setSize(len+1);
		utf16Text.extract(text.getRawData(), text.size(), utf8Conv, err);
	}
#else
	// If ICU is unavailable, decode using Czyborra's decoder
	SWBuf utf8Buf = "";
	int len = text.length();
	const char* scsuString = text.c_str();

	for (int i = 0; i < len;) {
		
		if (i >= len) break;
		c = scsuString[i++];
		
		if (c >= 0x80)
		{
			UTF8Output(c - 0x80 + slide[active], &utf8Buf);
		}
		else if (c >= 0x20 && c <= 0x7F)
		{
			UTF8Output(c, &utf8Buf);
		}
		else if (c == 0x0 || c == 0x9 || c == 0xA || c == 0xC || c == 0xD)
		{
			UTF8Output(c, &utf8Buf);
		}
		else if (c >= 0x1 && c <= 0x8) // SQn
		{
			if (i >= len) break;
			d = scsuString[i++]; // single quote
			
			UTF8Output(d < 0x80 ? d + start[c - 0x1] :
				    d - 0x80 + slide[c - 0x1], &utf8Buf);
		}
		else if (c >= 0x10 && c <= 0x17) // SCn
		{
			active = c - 0x10; // change window
		}
		else if (c >= 0x18 && c <= 0x1F) // SDn
		{
			active = c - 0x18;  // define window
			if (i >= len) break;
			slide[active] = win[(unsigned char)scsuString[i++]];
		}
		else if (c == 0xB) // SDX
		{
			if (i >= len) break;
			c = scsuString[i++];
			
			if (i >= len) break;
			d = scsuString[i++];
			
			slide[active = c>>5] = 0x10000 + (((c & 0x1F) << 8 | d) << 7);
		}
		else if (c == 0xE) // SQU
		{
			if (i >= len) break;
			c = scsuString[i++]; // SQU
			
			if (i >= len) break;
			UTF8Output(c << 8 | scsuString[i++], &utf8Buf);
		}
		else if (c == 0xF) // SCU
		{
			mode = 1; // change to Unicode mode
			
			while (mode)
			{
				if (i >= len) break;
				c = scsuString[i++];
				
				if (c <= 0xDF || c >= 0xF3)
				{
					if (i >= len) break;
					UTF8Output(c << 8 | scsuString[i++], &utf8Buf);
				}
				else if (c == 0xF0) // UQU
				{
					if (i >= len) break;
					c = scsuString[i++];
					
					if (i >= len) break;
					UTF8Output(c << 8 | scsuString[i++], &utf8Buf);
				}
				else if (c >= 0xE0 && c <= 0xE7) // UCn
				{
					active = c - 0xE0;
					mode = 0;
				}
				else if (c >= 0xE8 && c <= 0xEF) // UDn
				{
					if (i >= len) break;
					slide[active=c-0xE8] = win[(unsigned char)scsuString[i++]];
					mode = 0;
				}
				else if (c == 0xF1) // UDX
				{
					if (i >= len) break;
					c = scsuString[i++];
					
					if (i >= len) break;
					d = scsuString[i++];
					
					slide[active = c>>5] =
						0x10000 + (((c & 0x1F) << 8 | d) << 7);
					mode = 0;
				}
			}
		}
	}
#endif
	
	return 0;
}


SWORD_NAMESPACE_END
