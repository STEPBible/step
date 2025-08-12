/******************************************************************************
 *
 *  utf8greekaccents.cpp -	SWFilter descendant to remove UTF-8 Greek
 *				accents
 *
 * $Id: utf8greekaccents.cpp 3749 2020-07-06 23:51:56Z scribe $
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

#include <stdlib.h>
#include <map>
#include <stdio.h>
#include <utf8greekaccents.h>
#include <utilstr.h>

using std::map;

SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Greek Accents";
	static const char oTip[]  = "Toggles Greek Accents";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"On", "Off", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}

	std::map<SW_u32, SWBuf> converters;
	class converters_init {
	public:
		converters_init() {
			SWBuf myBuf = "";
			//first just remove combining characters
			converters[0x2019] = "";	// RIGHT SINGLE QUOTATION MARK
			converters[0x1FBF] = "";	// GREEK PSILI
			converters[0x2CFF] = "";	// COPTIC MORPHOLOGICAL DIVIDER
			converters[0xFE24] = "";	// COMBINING MACRON LEFT HALF
			converters[0xFE25] = "";	// COMBINING MACRON RIGHT HALF
			converters[0xFE26] = "";	// COMBINING CONJOINING MACRON
			converters[0x0300] = "";	// COMBINING GRAVE ACCENT
			converters[0x0301] = "";	// COMBINING ACUTE ACCENT
			converters[0x0302] = "";	// COMBINING CIRCUMFLEX ACCENT
			converters[0x0308] = "";	// COMBINING DIAERESIS
			converters[0x0313] = "";	// COMBINING COMMA ABOVE
			converters[0x0314] = "";	// COMBINING REVERSED COMMA ABOVE
			converters[0x037A] = "";	// GREEK YPOGEGRAMMENI
			converters[0x0342] = "";	// COMBINING GREEK PERISPOMENI
			converters[0x1FBD] = "";	// GREEK KORONIS
			converters[0x0343] = "";	// COMBINING GREEK KORONIS
			// Now converted pre-composed characters to their alphabetic bases, discarding the accents
			// Greek
			// UPPER case
			converters[0x0386] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH TONOS
			converters[0x0388] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH TONOS
			converters[0x0389] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH TONOS
			converters[0x038A] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH TONOS
			converters[0x03AA] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH DIALYTIKA
			converters[0x038C] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH TONOS
			converters[0x038E] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH TONOS
			converters[0x03AB] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH DIALYTIKA
			converters[0x038F] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH TONOS

			// lower case
			converters[0x03AC] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH TONOS
			converters[0x03AD] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH TONOS
			converters[0x03AE] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH TONOS
			converters[0x03AF] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH TONOS
			converters[0x03CA] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DIALYTIKA
			converters[0x03CC] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH TONOS
			converters[0x03CD] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH TONOS
			converters[0x03CB] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DIALYTIKA
			converters[0x03CE] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH TONOS

			// Extended Greek
			// UPPER case
			converters[0x1F08] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI
			converters[0x1F09] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA
			converters[0x1F0A] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND VARIA
			converters[0x1F0B] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND VARIA
			converters[0x1F0C] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND OXIA
			converters[0x1F0D] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND OXIA
			converters[0x1F0E] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND PERISPOMENI
			converters[0x1F0F] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND PERISPOMENI
			converters[0x1F88] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND PROSGEGRAMMENI
			converters[0x1F89] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND PROSGEGRAMMENI
			converters[0x1F8A] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND VARIA AND PROSGEGRAMMENI
			converters[0x1F8B] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND VARIA AND PROSGEGRAMMENI
			converters[0x1F8C] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND OXIA AND PROSGEGRAMMENI
			converters[0x1F8D] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND OXIA AND PROSGEGRAMMENI
			converters[0x1F8E] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PSILI AND PERISPOMENI AND PROSGEGRAMMENI
			converters[0x1F8F] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH DASIA AND PERISPOMENI AND PROSGEGRAMMENI
			converters[0x1FB8] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH VRACHY
			converters[0x1FB9] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH MACRON
			converters[0x1FBA] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH VARIA
			converters[0x1FBB] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH OXIA
			converters[0x1FBC] = *getUTF8FromUniChar(0x0391, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ALPHA WITH PROSGEGRAMMENI
			
			converters[0x1F18] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH PSILI
			converters[0x1F19] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH DASIA
			converters[0x1F1A] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH PSILI AND VARIA
			converters[0x1F1B] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH DASIA AND VARIA
			converters[0x1F1C] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH PSILI AND OXIA
			converters[0x1F1D] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH DASIA AND OXIA
			converters[0x1FC8] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH VARIA
			converters[0x1FC9] = *getUTF8FromUniChar(0x0395, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER EPSILON WITH OXIA

			converters[0x1F28] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI
			converters[0x1F29] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA
			converters[0x1F2A] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND VARIA
			converters[0x1F2B] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND VARIA
			converters[0x1F2C] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND OXIA
			converters[0x1F2D] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND OXIA
			converters[0x1F2E] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND PERISPOMENI
			converters[0x1F2F] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND PERISPOMENI
			converters[0x1F98] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND PROSGEGRAMMENI
			converters[0x1F99] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND PROSGEGRAMMENI
			converters[0x1F9A] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND VARIA AND PROSGEGRAMMENI
			converters[0x1F9B] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND VARIA AND PROSGEGRAMMENI
			converters[0x1F9C] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND OXIA AND PROSGEGRAMMENI
			converters[0x1F9D] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND OXIA AND PROSGEGRAMMENI
			converters[0x1F9E] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PSILI AND PERISPOMENI AND PROSGEGRAMMENI
			converters[0x1F9F] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH DASIA AND PERISPOMENI AND PROSGEGRAMMENI
			converters[0x1FCA] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH VARIA
			converters[0x1FCB] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH OXIA
			converters[0x1FCC] = *getUTF8FromUniChar(0x0397, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER ETA WITH PROSGEGRAMMENI

			converters[0x1F38] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH PSILI
			converters[0x1F39] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH DASIA
			converters[0x1F3A] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH PSILI AND VARIA
			converters[0x1F3B] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH DASIA AND VARIA
			converters[0x1F3C] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH PSILI AND OXIA
			converters[0x1F3D] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH DASIA AND OXIA
			converters[0x1F3E] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH PSILI AND PERISPOMENI
			converters[0x1F3F] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH DASIA AND PERISPOMENI
			converters[0x1FD8] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH VRACHY
			converters[0x1FD9] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH MACRON
			converters[0x1FDA] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH VARIA
			converters[0x1FDB] = *getUTF8FromUniChar(0x0399, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER IOTA WITH OXIA

			converters[0x1F48] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH PSILI
			converters[0x1F49] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH DASIA
			converters[0x1F4A] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH PSILI AND VARIA
			converters[0x1F4B] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH DASIA AND VARIA
			converters[0x1F4C] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH PSILI AND OXIA
			converters[0x1F4D] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH DASIA AND OXIA
			converters[0x1FF8] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH VARIA
			converters[0x1FF9] = *getUTF8FromUniChar(0x039F, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMICRON WITH OXIA

			converters[0x1F59] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH DASIA
			converters[0x1F5A] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH PSILI AND VARIA
			converters[0x1F5B] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH DASIA AND VARIA
			converters[0x1F5C] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH PSILI AND OXIA
			converters[0x1F5D] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH DASIA AND OXIA
			converters[0x1F5E] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH PSILI AND PERISPOMENI
			converters[0x1F5F] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH DASIA AND PERISPOMENI
			converters[0x1FE8] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH VRACHY
			converters[0x1FE9] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH MACRON
			converters[0x1FEA] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH VARIA
			converters[0x1FEB] = *getUTF8FromUniChar(0x03A5, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER UPSILON WITH OXIA

			converters[0x1F68] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI
			converters[0x1F69] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA
			converters[0x1F6A] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND VARIA
			converters[0x1F6B] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND VARIA
			converters[0x1F6C] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND OXIA
			converters[0x1F6D] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND OXIA
			converters[0x1F6E] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND PERISPOMENI
			converters[0x1F6F] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND PERISPOMENI
			converters[0x1FA8] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND PROSGEGRAMMENI
			converters[0x1FA9] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND PROSGEGRAMMENI
			converters[0x1FAA] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND VARIA AND PROSGEGRAMMENI
			converters[0x1FAB] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND VARIA AND PROSGEGRAMMENI
			converters[0x1FAC] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND OXIA AND PROSGEGRAMMENI
			converters[0x1FAD] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND OXIA AND PROSGEGRAMMENI
			converters[0x1FAE] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PSILI AND PERISPOMENI AND PROSGEGRAMMENI
			converters[0x1FAF] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH DASIA AND PERISPOMENI AND PROSGEGRAMMENI
			converters[0x1FFA] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH VARIA
			converters[0x1FFB] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH OXIA
			converters[0x1FFC] = *getUTF8FromUniChar(0x03A9, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER OMEGA WITH PROSGEGRAMMENI

			converters[0x1FEC] = *getUTF8FromUniChar(0x03A1, &myBuf); myBuf.setSize(0);	// GREEK CAPITAL LETTER RHO WITH DASIA

			// lower case
			//alpha
			converters[0x1F00] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI
			converters[0x1F01] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA
			converters[0x1F02] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND VARIA
			converters[0x1F03] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND VARIA
			converters[0x1F04] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND OXIA
			converters[0x1F05] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND OXIA
			converters[0x1F06] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND PERISPOMENI
			converters[0x1F07] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND PERISPOMENI
			converters[0x1F80] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND YPOGEGRAMMENI
			converters[0x1F81] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND YPOGEGRAMMENI
			converters[0x1F82] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND VARIA AND YPOGEGRAMMENI
			converters[0x1F83] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND VARIA AND YPOGEGRAMMENI
			converters[0x1F84] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND OXIA AND YPOGEGRAMMENI
			converters[0x1F85] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND OXIA AND YPOGEGRAMMENI
			converters[0x1F86] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PSILI AND PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1F87] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH DASIA AND PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1F70] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH VARIA
			converters[0x1F71] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH OXIA
			converters[0x1FB0] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH VRACHY
			converters[0x1FB1] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH MACRON
			converters[0x1FB2] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH VARIA AND YPOGEGRAMMENI
			converters[0x1FB3] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH YPOGEGRAMMENI
			converters[0x1FB4] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH OXIA AND YPOGEGRAMMENI
			converters[0x1FB5] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// unused?
			converters[0x1FB6] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PERISPOMENI
			converters[0x1FB7] = *getUTF8FromUniChar(0x03B1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ALPHA WITH PERISPOMENI AND YPOGEGRAMMENI

			converters[0x1F10] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH PSILI
			converters[0x1F11] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH DASIA
			converters[0x1F12] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH PSILI AND VARIA
			converters[0x1F13] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH DASIA AND VARIA
			converters[0x1F14] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH PSILI AND OXIA
			converters[0x1F15] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH DASIA AND OXIA
			converters[0x1F72] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH VARIA
			converters[0x1F73] = *getUTF8FromUniChar(0x03B5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER EPSILON WITH OXIA

			converters[0x1F90] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND YPOGEGRAMMENI
			converters[0x1F91] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND YPOGEGRAMMENI
			converters[0x1F92] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND VARIA AND YPOGEGRAMMENI
			converters[0x1F93] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND VARIA AND YPOGEGRAMMENI
			converters[0x1F94] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND OXIA AND YPOGEGRAMMENI
			converters[0x1F95] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND OXIA AND YPOGEGRAMMENI
			converters[0x1F96] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1F97] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1F20] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI
			converters[0x1F21] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA
			converters[0x1F22] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND VARIA
			converters[0x1F23] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND VARIA
			converters[0x1F24] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND OXIA
			converters[0x1F25] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND OXIA
			converters[0x1F26] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PSILI AND PERISPOMENI
			converters[0x1F27] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH DASIA AND PERISPOMENI
			converters[0x1FC2] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH VARIA AND YPOGEGRAMMENI
			converters[0x1FC3] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH YPOGEGRAMMENI
			converters[0x1FC4] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH OXIA AND YPOGEGRAMMENI
			converters[0x1FC5] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// unused?
			converters[0x1FC6] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PERISPOMENI
			converters[0x1FC7] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1F74] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH VARIA
			converters[0x1F75] = *getUTF8FromUniChar(0x03B7, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER ETA WITH OXIA

			converters[0x1F30] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH PSILI
			converters[0x1F31] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DASIA
			converters[0x1F32] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH PSILI AND VARIA
			converters[0x1F33] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DASIA AND VARIA
			converters[0x1F34] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH PSILI AND OXIA
			converters[0x1F35] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DASIA AND OXIA
			converters[0x1F36] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH PSILI AND PERISPOMENI
			converters[0x1F37] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DASIA AND PERISPOMENI
			converters[0x1F76] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH VARIA
			converters[0x1F77] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH OXIA
			converters[0x1FD0] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH VRACHY
			converters[0x1FD1] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH MACRON
			converters[0x1FD2] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DIALYTIKA AND VARIA
			converters[0x1FD3] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DIALYTIKA AND OXIA
			converters[0x1FD4] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// unused?
			converters[0x1FD5] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// unused?
			converters[0x1FD6] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH PERISPOMENI
			converters[0x1FD7] = *getUTF8FromUniChar(0x03B9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER IOTA WITH DIALYTIKA AND PERISPOMENI

			converters[0x1F40] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH PSILI
			converters[0x1F41] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH DASIA
			converters[0x1F42] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH PSILI AND VARIA
			converters[0x1F43] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH DASIA AND VARIA
			converters[0x1F44] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH PSILI AND OXIA
			converters[0x1F45] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH DASIA AND OXIA
			converters[0x1F78] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH VARIA
			converters[0x1F79] = *getUTF8FromUniChar(0x03BF, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMICRON WITH OXIA

			converters[0x1F50] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH PSILI
			converters[0x1F51] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DASIA
			converters[0x1F52] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH PSILI AND VARIA
			converters[0x1F53] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DASIA AND VARIA
			converters[0x1F54] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH PSILI AND OXIA
			converters[0x1F55] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DASIA AND OXIA
			converters[0x1F56] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH PSILI AND PERISPOMENI
			converters[0x1F57] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DASIA AND PERISPOMENI
			converters[0x1F7A] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH VARIA
			converters[0x1F7B] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH OXIA
			converters[0x1FE0] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH VRACHY
			converters[0x1FE1] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH MACRON
			converters[0x1FE2] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DIALYTIKA AND VARIA
			converters[0x1FE3] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DIALYTIKA AND OXIA
			converters[0x1FE6] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH PERISPOMENI
			converters[0x1FE7] = *getUTF8FromUniChar(0x03C5, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER UPSILON WITH DIALYTIKA AND PERISPOMENI

			converters[0x1F60] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI
			converters[0x1F61] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA
			converters[0x1F62] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND VARIA
			converters[0x1F63] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND VARIA
			converters[0x1F64] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND OXIA
			converters[0x1F65] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND OXIA
			converters[0x1F66] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND PERISPOMENI
			converters[0x1F67] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND PERISPOMENI
			converters[0x1F7C] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH VARIA
			converters[0x1F7D] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH OXIA
			converters[0x1FA0] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND YPOGEGRAMMENI
			converters[0x1FA1] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND YPOGEGRAMMENI
			converters[0x1FA2] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND VARIA AND YPOGEGRAMMENI
			converters[0x1FA3] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND VARIA AND YPOGEGRAMMENI
			converters[0x1FA4] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND OXIA AND YPOGEGRAMMENI
			converters[0x1FA5] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND OXIA AND YPOGEGRAMMENI
			converters[0x1FA6] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PSILI AND PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1FA7] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH DASIA AND PERISPOMENI AND YPOGEGRAMMENI
			converters[0x1FF2] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH VARIA AND YPOGEGRAMMENI
			converters[0x1FF3] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH YPOGEGRAMMENI
			converters[0x1FF4] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH OXIA AND YPOGEGRAMMENI
			converters[0x1FF5] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// unused?
			converters[0x1FF6] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PERISPOMENI
			converters[0x1FF7] = *getUTF8FromUniChar(0x03C9, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER OMEGA WITH PERISPOMENI AND YPOGEGRAMMENI

			converters[0x1FE4] = *getUTF8FromUniChar(0x03C1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER RHO WITH PSILI
			converters[0x1FE5] = *getUTF8FromUniChar(0x03C1, &myBuf); myBuf.setSize(0);	// GREEK SMALL LETTER RHO WITH DASIA
		}
	} __converters_init;
}


UTF8GreekAccents::UTF8GreekAccents() : SWOptionFilter(oName, oTip, oValues()) {
}


UTF8GreekAccents::~UTF8GreekAccents() {};


char UTF8GreekAccents::processText(SWBuf &text, const SWKey *key, const SWModule *module) {

	if (!option) { //we don't want greek accents
		SWBuf orig = text;
		const unsigned char* from = (unsigned char*)orig.c_str();
		text = "";
		map<SW_u32, SWBuf>::const_iterator it = converters.end();
		while (*from) {		
			SW_u32 ch = getUniCharFromUTF8(&from, true);
			// if ch is bad, then convert to replacement char
			if (!ch) ch = 0xFFFD;

			it = converters.find(ch);
			if (it == converters.end()) {
				getUTF8FromUniChar(ch, &text);
			}
			else text.append((const char *)it->second, it->second.size());	// save a strlen, since we know our size
		}
	}
	return 0;
}


SWORD_NAMESPACE_END
