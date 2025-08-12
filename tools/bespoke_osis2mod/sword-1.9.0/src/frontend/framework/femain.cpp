/******************************************************************************
 *
 *  femain.cpp -	FEMain class definition
 *
 * $Id: femain.cpp 2833 2013-06-29 06:40:28Z chrislit $
 *
 * Copyright 1998-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <femain.h>

FEMain::FEMain() {
}

FEMain::~FEMain() {
	list <SWDisplay *>::iterator it;

	for (it = displays.begin(); it != displays.end(); ++it)
		delete *it;

}
