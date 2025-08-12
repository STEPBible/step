/******************************************************************************
 *
 * thmlwebif.h -	class ThMLWEBIF: a RenderFilter to render WEBIF markup
 * 			from modules marked up in ThML
 *
 * $Id: thmlwebif.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2003-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef _ThMLWEBIF_H
#define _ThMLWEBIF_H

#include <thmlxhtml.h>

SWORD_NAMESPACE_START

/** this filter converts ThML text to HTML text with hrefs
 */
class SWDLLEXPORT ThMLWEBIF : public ThMLXHTML {

private:
	const SWBuf baseURL;
	const SWBuf passageStudyURL;

protected:
	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);

public:
	ThMLWEBIF();
};

SWORD_NAMESPACE_END

#endif
