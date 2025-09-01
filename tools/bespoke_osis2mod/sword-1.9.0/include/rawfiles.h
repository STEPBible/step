/******************************************************************************
 *
 * rawfiles.h -		class RawFiles: a module driver that reads and writes
 *			entries each to separate files on the filesystem
 *
 * $Id: rawfiles.h 3805 2020-09-19 12:19:28Z scribe $
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

#ifndef RAWFILES_H
#define RAWFILES_H

#include <rawverse.h>
#include <swcom.h>

#include <defs.h>

SWORD_NAMESPACE_START

class SWDLLEXPORT RawFiles : public RawVerse, public SWCom {

private:
	const char *getNextFilename();

public:
	RawFiles(const char *ipath, const char *iname = 0, const char *idesc = 0,
			SWDisplay *idisp = 0, SWTextEncoding encoding = ENC_UNKNOWN,
			SWTextDirection dir = DIRECTION_LTR, SWTextMarkup markup = FMT_UNKNOWN,
			const char *ilang = 0);
	virtual ~RawFiles();
	virtual SWBuf &getRawEntryBuf() const;

	// write interface ----------------------------
	/** Is the module writable? :)
	* @return yes or no
	*/
	virtual bool isWritable() const;

	/** Creates a new module
	* @param path The first parameter is path of the new module
	* @return error
	*/
	static char createModule(const char *path);

	/** Modify the current module entry text
	* - only if module @ref isWritable
	* @param inbuf the text of the entry to set
	* @param len optional len to set the modules entry.  If not passed, strlen will be performed on @ref inbuf
	*/
	virtual void setEntry(const char *inbuf, long len = -1);	// Modify current module entry

	/** Link the current module entry to another module entry
	* - only if module @ref isWritable
	* @param linkKey the entry key to which this current entry should be linked.
	*/
	virtual void linkEntry(const SWKey *linkKey);	// Link current module entry to other module entry

	/** Delete current module entry - only if module @ref isWritable
	*
	*/
	virtual void deleteEntry();
	// end write interface ------------------------


	// OPERATORS -----------------------------------------------------------------
	
	SWMODULE_OPERATORS

};

SWORD_NAMESPACE_END
#endif
