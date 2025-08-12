/******************************************************************************
 *
 *  swgenbook.cpp -	Implementation of SWGenBook class
 *
 * $Id: swgenbook.cpp 3808 2020-10-02 13:23:34Z scribe $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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


#include <swgenbook.h>
#include <versetreekey.h>

SWORD_NAMESPACE_START

/******************************************************************************
 * SWGenBook Constructor - Initializes data for instance of SWGenBook
 *
 * ENT:	imodname - Internal name for module
 *	imoddesc - Name to display to user for module
 *	idisp	 - Display object to use for displaying
 */

SWGenBook::SWGenBook(const char *imodname, const char *imoddesc, SWDisplay *idisp, SWTextEncoding enc, SWTextDirection dir, SWTextMarkup mark, const char* ilang) : SWModule(imodname, imoddesc, idisp, (char *)"Generic Books", enc, dir, mark, ilang) {
	tmpTreeKey = 0;
}


/******************************************************************************
 * SWGenBook Destructor - Cleans up instance of SWGenBook
 */

SWGenBook::~SWGenBook() {
	delete tmpTreeKey;
}


const TreeKey &SWGenBook::getTreeKey(const SWKey *k) const {
	const SWKey* thiskey = k?k:this->key;

	const TreeKey *key = 0;

	SWTRY {
		key = SWDYNAMIC_CAST(const TreeKey, (thiskey));
	}
	SWCATCH ( ... ) {}

	if (!key) {
		const ListKey *lkTest = 0;
		SWTRY {
			lkTest = SWDYNAMIC_CAST(const ListKey, thiskey);
		}
		SWCATCH ( ... ) {	}
		if (lkTest) {
			SWTRY {
				key = SWDYNAMIC_CAST(const TreeKey, lkTest->getElement());
				if (!key) {
					const VerseTreeKey *tkey = 0;
					SWTRY {
						tkey = SWDYNAMIC_CAST(const VerseTreeKey, lkTest->getElement());
					}
					SWCATCH ( ... ) {}
					if (tkey) key = tkey->getTreeKey();
				}
			}
			SWCATCH ( ... ) {	}
		}
	}
	if (!key) {
		const VerseTreeKey *tkey = 0;
		SWTRY {
			tkey = SWDYNAMIC_CAST(const VerseTreeKey, (thiskey));
		}
		SWCATCH ( ... ) {}
		if (tkey) key = tkey->getTreeKey();
	}

	if (!key) {
		delete tmpTreeKey;
		tmpTreeKey = (TreeKey *)createKey();
		(*tmpTreeKey) = *(thiskey);
		return (*tmpTreeKey);
	}
	else	return *key;
}

SWORD_NAMESPACE_END
