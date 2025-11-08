/******************************************************************************
 *
 * swlog.h -	class SWLog: used for logging messages
 *
 * $Id: swlog.h 3822 2020-11-03 18:54:47Z scribe $
 *
 * Copyright 1997-2013 CrossWire Bible Society (http://www.crosswire.org)
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

//---------------------------------------------------------------------------
#ifndef swlogH
#define swlogH
//---------------------------------------------------------------------------

#include <defs.h>
#include <time.h>

SWORD_NAMESPACE_START


class SWDLLEXPORT SWLog {

protected:
	char logLevel;
	static SWLog *systemLog;

public:

	static const char LOG_ERROR;
	static const char LOG_WARN;
	static const char LOG_INFO;
	static const char LOG_TIMEDINFO;
	static const char LOG_DEBUG;

	static SWLog *getSystemLog();
	static void setSystemLog(SWLog *newLogger);

	SWLog() { logLevel = 1;	/*default to show only errors*/}
	virtual ~SWLog() {};

	void setLogLevel(char level) { logLevel = level; }
	char getLogLevel() const { return logLevel; }
	void logWarning(const char *fmt, ...) const;
	void logError(const char *fmt, ...) const;
	void logInformation(const char *fmt, ...) const;
	void logDebug(const char *fmt, ...) const;

	// Override this method if you want to have a custom logger
	virtual void logMessage(const char *message, int level) const;

	// Override if you need to use a special OS clock for timing
	virtual void logTimedInformation(const char *fmt, ...) const;
};

SWORD_NAMESPACE_END
#endif
