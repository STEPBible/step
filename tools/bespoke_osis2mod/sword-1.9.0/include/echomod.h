/******************************************************************************
 *
 * echomod.h -	class 'EchoMod' - a test module driver that will just echo back
 *		text of key.
 *
 * $Id: echomod.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 1996-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef ECHOMOD_H
#define ECHOMOD_H

#include <swtext.h>
#include <defs.h>


SWORD_NAMESPACE_START

class SWDLLEXPORT EchoMod : public SWText {
public:
	EchoMod();
	virtual ~EchoMod();
	virtual SWBuf &getRawEntryBuf() const;
};

SWORD_NAMESPACE_END
#endif
