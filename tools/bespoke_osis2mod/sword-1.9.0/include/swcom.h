/******************************************************************************
 *
 * swcom.h -	class SWCom: the basis for all types of commentary modules.
 *		It is traditionally nearly the same as the SWText driver for
 *		Bible modules, but has defaults set which more
 *		closely represent how a commentary will be used and how
 *		the bulk of our commentaries expect to be used.  For example,
 *		most commentaries consist of entries for a range of text
 *		(Matt.1.1-6: "Matthew begins with by telling us...").  This
 *		same entry will be returned when any verse between Matt.1.1-6
 *		is requested from the engine.  This is done with verse linking.
 *		Since linking is used heavily in commentaries, the flag
 *		skipConsecutiveLinks is defaulted to true so when the
 *		commentary is incremented, it will go to the next ENTRY,
 *		not the next verse (likely Matt.1.7, from our example above).
 *
 * $Id: swcom.h 3821 2020-11-02 18:33:02Z scribe $
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

#ifndef SWCOM_H
#define SWCOM_H

#include <swmodule.h>

#include <defs.h>

SWORD_NAMESPACE_START

class VerseKey;
class SWKey;

/** The basis for all commentary modules
 */
class SWDLLEXPORT SWCom : public SWModule {

private:
	mutable VerseKey *tmpVK1;
	mutable VerseKey *tmpVK2;
	mutable bool tmpSecond;
	char *versification;

protected:
	VerseKey &getVerseKey(SWKey *key = 0);
	const VerseKey &getVerseKey(const SWKey *key = 0) const { return getVerseKeyConst(key); }
	const VerseKey &getVerseKeyConst(const SWKey *key = 0) const;


public:

	/** Initializes data for instance of SWCom
	*/
	SWCom(const char *imodname = 0, const char *imoddesc = 0,
			SWDisplay *idisp = 0, SWTextEncoding enc = ENC_UNKNOWN,
			SWTextDirection dir = DIRECTION_LTR,
			SWTextMarkup mark = FMT_UNKNOWN, const char *ilang = 0,
			const char *versification = "KJV");

	virtual ~SWCom();
	virtual SWKey *createKey() const;

	virtual long getIndex() const;
	virtual void setIndex(long iindex);



	// OPERATORS -----------------------------------------------------------------
	
	SWMODULE_OPERATORS

};

SWORD_NAMESPACE_END
#endif
