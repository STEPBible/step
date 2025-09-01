/******************************************************************************
 *
 *  swinputmeth.cpp -	SWInputMethod: Input method base class
 *
 * $Id: swinputmeth.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <swinputmeth.h>

SWInputMethod::SWInputMethod() {
   state = 0;
}

void SWInputMethod::setState(int state) {
   this->state = state;
}

int SWInputMethod::getState() {
   return state;
}

void SWInputMethod::clearState() {
   state = 0;
}
