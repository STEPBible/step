/******************************************************************************
 *
 *  swcom.cpp -	code for base class 'SWCom'- The basis for all commentary
 *		modules
 *
 * $Id: swcom.cpp 3821 2020-11-02 18:33:02Z scribe $
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


#include <utilstr.h>
#include <swcom.h>
#include <localemgr.h>
#include <versekey.h>


SWORD_NAMESPACE_START


/******************************************************************************
 * SWCom Constructor - Initializes data for instance of SWCom
 *
 * ENT:	imodname - Internal name for module
 *	imoddesc - Name to display to user for module
 *	idisp	 - Display object to use for displaying
 */

SWCom::SWCom(const char *imodname, const char *imoddesc, SWDisplay *idisp, SWTextEncoding enc, SWTextDirection dir, SWTextMarkup mark, const char *ilang, const char *versification): SWModule(imodname, imoddesc, idisp, "Commentaries", enc, dir, mark, ilang) {
	this->versification = 0;
	stdstr(&(this->versification), versification);
	delete key;
	key = (VerseKey *)createKey();
	tmpVK1 = (VerseKey *)createKey();
	tmpVK2 = (VerseKey *)createKey();
        tmpSecond = false;
}


/******************************************************************************
 * SWCom Destructor - Cleans up instance of SWCom
 */

SWCom::~SWCom() {
	delete tmpVK1;
	delete tmpVK2;
	delete [] versification;
}


SWKey *SWCom::createKey() const {
	VerseKey *vk = new VerseKey();

	vk->setVersificationSystem(versification);

	return vk;
}


long SWCom::getIndex() const {
	const VerseKey *key = &getVerseKey();
	entryIndex = key->getIndex();
	return entryIndex;
}

void SWCom::setIndex(long iindex) {
	VerseKey *key = &getVerseKey();
	key->setTestament(1);
	key->setIndex(iindex);

	if (key != this->key) {
		this->key->copyFrom(*key);
	}
}


const VerseKey &SWCom::getVerseKeyConst(const SWKey *keyToConvert) const {
	const SWKey *thisKey = keyToConvert ? keyToConvert : this->key;

	const VerseKey *key = 0;
	// see if we have a VerseKey * or decendant
	SWTRY {
		key = SWDYNAMIC_CAST(const VerseKey, thisKey);
	}
	SWCATCH ( ... ) {	}
	if (!key) {
		const ListKey *lkTest = 0;
		SWTRY {
			lkTest = SWDYNAMIC_CAST(const ListKey, thisKey);
		}
		SWCATCH ( ... ) {	}
		if (lkTest) {
			SWTRY {
				key = SWDYNAMIC_CAST(const VerseKey, lkTest->getElement());
			}
			SWCATCH ( ... ) {	}
		}
	}
	if (!key) {
                VerseKey *retKey = (tmpSecond) ? tmpVK1 : tmpVK2;
                tmpSecond = !tmpSecond;
		retKey->setLocale(LocaleMgr::getSystemLocaleMgr()->getDefaultLocaleName());
		(*retKey) = *(thisKey);
		return (*retKey);
	}
	else	return *key;
}


VerseKey &SWCom::getVerseKey(SWKey *keyToConvert) {
	SWKey *thisKey = keyToConvert ? keyToConvert : this->key;

	VerseKey *key = 0;
	// see if we have a VerseKey * or decendant
	SWTRY {
		key = SWDYNAMIC_CAST(VerseKey, thisKey);
	}
	SWCATCH ( ... ) {	}
	if (!key) {
		ListKey *lkTest = 0;
		SWTRY {
			lkTest = SWDYNAMIC_CAST(ListKey, thisKey);
		}
		SWCATCH ( ... ) {	}
		if (lkTest) {
			SWTRY {
				key = SWDYNAMIC_CAST(VerseKey, lkTest->getElement());
			}
			SWCATCH ( ... ) {	}
		}
	}
	if (!key) {
                VerseKey *retKey = (tmpSecond) ? tmpVK1 : tmpVK2;
                tmpSecond = !tmpSecond;
		retKey->setLocale(LocaleMgr::getSystemLocaleMgr()->getDefaultLocaleName());
		(*retKey) = *(thisKey);
		return (*retKey);
	}
	else	return *key;
}


SWORD_NAMESPACE_END
