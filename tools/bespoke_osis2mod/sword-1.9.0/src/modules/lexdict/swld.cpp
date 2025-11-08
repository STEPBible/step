/******************************************************************************
 *
 *  swld.cpp -	code for base class 'SWLD'.  SWLD is the basis for all
 *		types of Lexicon and Dictionary modules (hence the 'LD').
 *
 * $Id: swld.cpp 3439 2016-10-23 08:32:02Z scribe $
 *
 * Copyright 1997-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <ctype.h>
#include <stdio.h>
#include <swld.h>
#include <strkey.h>
#include <swkey.h>


SWORD_NAMESPACE_START


/******************************************************************************
 * SWLD Constructor - Initializes data for instance of SWLD
 *
 * ENT:	imodname - Internal name for module
 *	imoddesc - Name to display to user for module
 *	idisp	 - Display object to use for displaying
 */

SWLD::SWLD(const char *imodname, const char *imoddesc, SWDisplay *idisp, SWTextEncoding enc, SWTextDirection dir, SWTextMarkup mark, const char* ilang, bool strongsPadding) : SWModule(imodname, imoddesc, idisp, (char *)"Lexicons / Dictionaries", enc, dir, mark, ilang), strongsPadding(strongsPadding)
{
	delete key;
	key = createKey();
	entkeytxt = new char [1];
	*entkeytxt = 0;
}


/******************************************************************************
 * SWLD Destructor - Cleans up instance of SWLD
 */

SWLD::~SWLD()
{
	if (entkeytxt)
		delete [] entkeytxt;
}


SWKey *SWLD::createKey() const { return new StrKey(); }


/******************************************************************************
 * SWLD::KeyText - Sets/gets module KeyText, getting from saved text if key is
 *				persistent
 *
 * ENT:	ikeytext - value which to set keytext
 *		[0] - only get
 *
 * RET:	pointer to keytext
 */

const char *SWLD::getKeyText() const {
	if (key->isPersist()) {
		getRawEntryBuf();	// force module key to snap to entry
	}
	return entkeytxt;
}


/******************************************************************************
 * SWLD::setPosition(SW_POSITION)	- Positions this key if applicable
 */

void SWLD::setPosition(SW_POSITION p) {
	if (!key->isTraversable()) {
		switch (p) {
		case POS_TOP:
			*key = "";
			break;
		case POS_BOTTOM:
			*key = "zzzzzzzzz";
			break;
		} 
	}
	else	*key = p;
	getRawEntryBuf();
}


bool SWLD::hasEntry(const SWKey *key) const {
	const char *key_str = *key;
	char *buf = new char [ strlen(key_str) + 6 ];
	strcpy(buf, key_str);

	if (strongsPadding) strongsPad(buf);
	
	bool retVal = !strcmp(buf, getKeyForEntry(getEntryForKey(buf)));
	delete [] buf;

	return retVal;
}


/******************************************************************************
 * SWLD::strongsPad	- Pads a key if (it-1) is 100% digits to 5 places
 *						allows for final to be alpha, e.g. '123B'
 *
 * ENT: buf -	buffer to check and pad
 */

void SWLD::strongsPad(char *buf)
{
	char *check;
	int size = 0;
	int len = (int)strlen(buf);
	char subLet = 0;
	bool bang = false, prefix=false;
	if ((len < 9) && (len > 0)) {
		// Handle initial G or H
		if (*buf == 'G' || *buf == 'H' || *buf == 'g' || *buf == 'h') {
			buf += 1;
			len -= 1;
			prefix = true;
		}

		for (check = buf; *(check); check++) {
			if (!isdigit(*check))
				break;
			else size++;
		}

		if (size && ((size == len) || (size == len - 1) || (size == (len-2)))) {
			if (*check == '!') {
				bang = true;
				check++;
			}
			if (isalpha(*check)) {
				subLet = toupper(*check);
				*(check-(bang?1:0)) = 0;
			}
			sprintf(buf, prefix?"%.4d":"%.5d", atoi(buf));
			if (subLet) {
				check = buf+(strlen(buf));
				if (bang) {
					*check++ = '!';
				}
				*check++ = subLet;
				*check = 0;
			}
		}
	}
}


SWORD_NAMESPACE_END

