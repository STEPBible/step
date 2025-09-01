/******************************************************************************
 *
 * rtranspgdrive.h  -	class RTransportGDrive: Google Drive impl of Remote Transport
 *
 * $Id$
 *
 * Copyright 2004-2017 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef RTRANSPGDRIVE_H
#define RTRANSPGDRIVE_H

#include <defs.h>
#include <remotetrans.h>

SWORD_NAMESPACE_START


class SWDLLEXPORT RTransportGDrive : public RemoteTransport {

public:
	RTransportGDrive(const char *host, StatusReporter *statusReporter = 0);
	~RTransportGDrive();
	
	virtual char getURL(const char *destPath, const char *sourceURL, SWBuf *destBuf = 0);
	virtual char putURL(const char *destURL, const char *sourcePath, SWBuf *sourceBuf = 0);
};


SWORD_NAMESPACE_END

#endif
