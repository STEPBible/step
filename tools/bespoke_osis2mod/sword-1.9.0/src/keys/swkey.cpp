/******************************************************************************
 *
 *  swkey.cpp -	code for base class 'SWKey'.  SWKey is the basis for all
 *		types of keys for indexing into modules (e.g. verse, word,
 *		place, etc.)
 *
 * $Id: swkey.cpp 3808 2020-10-02 13:23:34Z scribe $
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


#include <swkey.h>
#include <utilstr.h>
#include <string.h>
#include <localemgr.h>

SWORD_NAMESPACE_START

static const char *classes[] = {"SWKey", "SWObject", 0};
static const SWClass classdef(classes);
SWKey::LocaleCache   SWKey::localeCache;

/******************************************************************************
 * SWKey Constructor - initializes instance of SWKey
 *
 * ENT:	ikey - text key
 */

SWKey::SWKey(const char *ikey) : SWObject(classdef)
{
	init();
	index     = 0;
	persist   = 0;
	keytext   = 0;
	rangeText = 0;
	error     = 0;
	userData  = 0;
	stdstr(&keytext, ikey);
}

SWKey::SWKey(SWKey const &k) : SWObject(classdef)
{
	init();
	stdstr(&localeName, k.localeName);
	index     = k.index;
	persist   = k.persist;
	userData  = k.userData;
	keytext   = 0;
	rangeText = 0;
	error     = k.error;
	setText(k.getText());
}

void SWKey::init() {
	boundSet = false;
	locale = 0;
	localeName = 0;
	setLocale(LocaleMgr::getSystemLocaleMgr()->getDefaultLocaleName());
}

SWKey *SWKey::clone() const
{
	return new SWKey(*this);
}

/******************************************************************************
 * SWKey Destructor - cleans up instance of SWKey
 */

SWKey::~SWKey() {
	delete [] keytext;
	delete [] rangeText;
	delete [] localeName;
}


/******************************************************************************
 * SWKey::Persist - Gets whether this object itself persists within a
 *			module that it was used to setKey or just a copy.
 *			(1 - persists in module; 0 - a copy is attempted
 *
 * RET:	value of persist
 */

bool SWKey::isPersist() const
{
	return persist;
}


/******************************************************************************
 * SWKey::getPrivateLocale - Gets a real locale object from our name
 *
 * RET:	locale object associated with our name
 */

SWLocale *SWKey::getPrivateLocale() const {
	if (!locale) {
		if ((!localeCache.name) || (strcmp(localeCache.name, localeName))) {
			stdstr(&(localeCache.name), localeName);
			// this line is the entire bit of work we're trying to avoid with the cache
			// worth it?  compare time examples/cmdline/search KJV "God love world" to
			// same with this method reduced to:
			// if (!local) local = ... (call below); return locale;
			localeCache.locale = LocaleMgr::getSystemLocaleMgr()->getLocale(localeName);
		}
		locale = localeCache.locale;
	}
	return locale;
}


/******************************************************************************
 * SWKey::Persist - Set/gets whether this object itself persists within a
 *			module that it was used to setKey or just a copy.
 *			(true - persists in module; false - a copy is attempted
 *
 * ENT:	ipersist - value which to set persist
 */

void SWKey::setPersist(bool ipersist)
{
	persist = ipersist;
}


/******************************************************************************
 * SWKey::Error - Gets and clears error status
 *
 * RET:	error status
 */

char SWKey::popError()
{
	char retval = error;

	error = 0;
	return retval;
}


/******************************************************************************
 * SWKey::setText Equates this SWKey to a character string
 *
 * ENT:	ikey - other swkey object
 */

void SWKey::setText(const char *ikey) {
	stdstr(&keytext, ikey);
}


/******************************************************************************
 * SWKey::copyFrom Equates this SWKey to another SWKey object
 *
 * ENT:	ikey - other swkey object
 */

void SWKey::copyFrom(const SWKey &ikey) {
// not desirable	Persist(ikey.Persist());
	setLocale(ikey.getLocale());
	setText((const char *)ikey);
}


/******************************************************************************
 * SWKey::getText - returns text key if (const char *) cast is requested
 */

const char *SWKey::getText() const {
	return keytext;
}


/******************************************************************************
 * SWKey::getRangeText - returns parsable range text for this key
 */

const char *SWKey::getRangeText() const {
	stdstr(&rangeText, keytext);
	return rangeText;
}


/******************************************************************************
 * SWKey::getOSISRefRangeText - returns parsable range text for this key
 */

const char *SWKey::getOSISRefRangeText() const {
	return getRangeText();
}


/******************************************************************************
 * SWKey::compare	- Compares another VerseKey object
 *
 * ENT:	ikey - key to compare with this one
 *
 * RET:	> 0 if this key is greater than compare key
 *	< 0
 *	  0
 */

int SWKey::compare(const SWKey &ikey)
{
	return strcmp((const char *)*this, (const char *)ikey);
}


/******************************************************************************
 * SWKey::setPosition(SW_POSITION)	- Positions this key if applicable
 */

void SWKey::setPosition(SW_POSITION p) {
	switch (p) {
	case POS_TOP:
//		*this = "";
		break;
	case POS_BOTTOM:
//		*this = "zzzzzzzzz";
		break;
	} 
}


/******************************************************************************
 * SWKey::increment	- Increments key a number of entries
 *
 * ENT:	increment	- Number of entries to jump forward
 *
 * RET: *this
 */

void SWKey::increment(int) {
	error = KEYERR_OUTOFBOUNDS;
}


/******************************************************************************
 * SWKey::decrement	- Decrements key a number of entries
 *
 * ENT:	decrement	- Number of entries to jump backward
 *
 * RET: *this
 */

void SWKey::decrement(int) {
	error = KEYERR_OUTOFBOUNDS;
}

SWORD_NAMESPACE_END
