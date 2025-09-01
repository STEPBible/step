/******************************************************************************
 *
 * swdisp.h -	class SWDisplay: the basis for all
 *		types of displays (e.g. raw textout, curses, xwindow, etc.)
 *
 * $Id: swdisp.h 3820 2020-10-24 20:27:30Z scribe $
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

#ifndef SWDISP_H
#define SWDISP_H

#include <swobject.h>
#include <defs.h>

SWORD_NAMESPACE_START

class SWModule;

/** SWDisplay is the basis for all types of displays
 * (e.g. raw textout, curses, xwindow, etc.)
 */
class SWDLLEXPORT SWDisplay : public SWObject {

public:
	SWDisplay();
	virtual ~SWDisplay() { };

	/** casts a module to a character pointer and displays it to
	 * raw output (overriden for different display types and
	 * module types if necessary)
	 *
	 * @param imodule module to display
	 * @return error status
	 */
	virtual char display(SWModule &imodule) = 0;
	/**
	 * @deprecated Use display
	 */
	SWDEPRECATED char Display(SWModule &imodule) { return display(imodule); }
};

SWORD_NAMESPACE_END
#endif
