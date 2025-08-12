/******************************************************************************
 *
 *  echomod.cpp -	code for class 'EchoMod'- a dummy test text module
 *			that just echos back the key
 *
 * $Id: echomod.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <echomod.h>


SWORD_NAMESPACE_START

EchoMod::EchoMod() : SWText("echomod", "Echos back key")
{
}


EchoMod::~EchoMod() {
}


SWBuf &EchoMod::getRawEntryBuf() const
{
	static SWBuf retVal;
	retVal = *key;
	return retVal;
}

SWORD_NAMESPACE_END
