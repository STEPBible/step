/******************************************************************************
 *
 * curlftpt.h -	CURL FTP implementation of RemoteTransport
 *
 * $Id: curlftpt.h 3786 2020-08-30 11:35:14Z scribe $
 *
 * Copyright 2004-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef CURLFTPT_H
#define CURLFTPT_H

#include <defs.h>
#include <remotetrans.h>

SWORD_NAMESPACE_START

class CURL;


class SWDLLEXPORT CURLFTPTransport : public RemoteTransport {
	CURL *session;

public:
	CURLFTPTransport(const char *host, StatusReporter *statusReporter = 0);
	~CURLFTPTransport();
	
	virtual char getURL(const char *destPath, const char *sourceURL, SWBuf *destBuf = 0);
};


SWORD_NAMESPACE_END

#endif
