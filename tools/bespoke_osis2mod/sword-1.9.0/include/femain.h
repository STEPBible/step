/******************************************************************************
 *
 * femain.h -	class FEMain: a class which was meant to begin encapsulating
 * 		frontend frameworks, but never really took off. Mostly unused.
 *
 * $Id: femain.h 3786 2020-08-30 11:35:14Z scribe $
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

#ifndef FEMAIN_H
#define FEMAIN_H

class FEMain {
public:
	FEMain();
	virtual ~FEMain();
	list<SWDisplay *> displays;	// so we can delete each display we create
};

#endif
