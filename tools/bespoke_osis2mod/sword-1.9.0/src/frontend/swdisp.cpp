/******************************************************************************
 *
 *  swdisp.cpp -	code for base class 'SWDisplay'.  SWDisplay is the
 *			basis for all types of displays (e.g. raw textout,
 *			curses, xwindow, etc.)
 *
 * $Id: swdisp.cpp 3808 2020-10-02 13:23:34Z scribe $
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


#include <swmodule.h>
#include <swdisp.h>

SWORD_NAMESPACE_START

static const char *classes[] = {"SWDisplay", "SWObject", 0};
static const SWClass classdef(classes);

SWDisplay::SWDisplay() : SWObject(classdef){ };

/******************************************************************************
 * SWDisplay::Display - casts a module to a character pointer and displays it to
 *			raw output (overriden for different display types and
 *			module types if necessary)
 *
 * ENT:	imodule - module to display
 *
 * RET:	error status
 */


SWORD_NAMESPACE_END
