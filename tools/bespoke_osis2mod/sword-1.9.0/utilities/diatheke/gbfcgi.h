/***************************************************************************
 *
 *  gbfcgi.h -	GBF to Diatheke/CGI format
 *
 * $Id: gbfcgi.h 2833 2013-06-29 06:40:28Z chrislit $
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

#ifndef GBFCGI_H
#define GBFCGI_H

#include <swbasicfilter.h>
#include <defs.h>

SWORD_NAMESPACE_START

/** this filter converts GBF text to Diatheke/CGI format
 */
class GBFCGI : public SWBasicFilter {
protected:
	virtual BasicFilterUserData *createUserData(const SWModule *module, const SWKey *key);
	virtual bool handleToken(SWBuf &buf, const char *token, BasicFilterUserData *userData);
public:
  GBFCGI ();
};

SWORD_NAMESPACE_END
#endif
