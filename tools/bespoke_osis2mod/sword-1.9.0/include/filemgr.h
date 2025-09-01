/******************************************************************************
 *
 * filemgr.h -	class FileMgr: encapsulates all file IO and
 * 		platform-specific eccentricities.
 *
 * $Id: filemgr.h 3812 2020-10-15 17:32:41Z scribe $
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

#ifndef FILEMGR_H
#define FILEMGR_H

#include <sys/stat.h>
#include <fcntl.h>

#include <defs.h>
#include <swcacher.h>
#include <swbuf.h>
#include <vector>

SWORD_NAMESPACE_START

class SWDLLEXPORT FileDesc;

struct SWDLLEXPORT DirEntry {
public:
	SWBuf name;
	unsigned long size;
	bool isDirectory;
};

/**
 * This class isolates all file io for SWORD, making OS
 * level quirks easier to fix.  This class is typically
 * copied and replaced if necessary to get SWORD to run on
 * a specific platform (e.g., Windows Mobile), but in
 * the future, statics should be removed to make possible to
 * instead simply subclass and override necessary methods.
 *
 * This class also provides many convenience methods which
 * make working with data storage easier.
 *
 * Conceptually, this factory exposes an interface which
 * allows SWORD to 'open' every file it wants, without
 * worrying about OS limits, and takes care of opening and
 * closing the actual file descriptors when necessary.
 */
class SWDLLEXPORT FileMgr : public SWCacher {

	friend class FileDesc;
	friend class __staticsystemFileMgr;

	FileDesc *files;
	int sysOpen(FileDesc * file);
protected:
	static FileMgr *systemFileMgr;
public:
	static unsigned int CREAT;
	static unsigned int APPEND;
	static unsigned int TRUNC;
	static unsigned int RDONLY;
	static unsigned int RDWR;
	static unsigned int WRONLY;
	static unsigned int IREAD;
	static unsigned int IWRITE;

	/** Maximum number of open files set in the constructor.
	* determines the max number of real system files that
	* filemgr will open.  Adjust for tuning.
	*/
	int maxFiles;

	static FileMgr *getSystemFileMgr();
	static void setSystemFileMgr(FileMgr *newFileMgr);

	/** Constructor.
	* @param maxFiles The number of files that this FileMgr may open in parallel, if necessary.
	*/
	FileMgr(int maxFiles = 35);

	/**
	* Destructor. Clean things up. Will close all files opened by this FileMgr object.
	*/
	~FileMgr();

	/** Open a file and return a FileDesc for it.
	* The file itself will only be opened when FileDesc::getFd() is called.
	* @param path Filename.
	* @param mode File access mode.
	* @param tryDowngrade if we can't open the file for permissions requested, try to open the file with less permissions
	* @return FileDesc object for the requested file.
	*/
	FileDesc *open(const char *path, int mode, bool tryDowngrade);
	FileDesc *open(const char *path, unsigned int mode, bool tryDowngrade) { return this->open(path, (int)mode, tryDowngrade); }

	/** Open a file and return a FileDesc for it.
	* The file itself will only be opened when FileDesc::getFd() is called.
	* @param path Filename.
	* @param mode File access mode.
	* @param perms Permissions.
	* @param tryDowngrade
	* @return FileDesc object for the requested file.
	*/
	FileDesc *open(const char *path, unsigned int mode, unsigned int perms = IREAD | IWRITE, bool tryDowngrade = false) { return this->open(path, (int)mode, (int)perms, tryDowngrade); }
	FileDesc *open(const char *path, int mode, int perms = IREAD | IWRITE, bool tryDowngrade = false);

	/** Close a given file and delete its FileDesc object.
	* Will only close the file if it was created by this FileMgr object.
	* @param file The file to close.
	*/
	void close(FileDesc *file);

	/** Cacher methods overridden
	 */
	virtual void flush();
	virtual long resourceConsumption();

	/** Get an environment variable from the OS
	* @param variableName the name of the env variable to retrieve
	*
	* @return variable value from the OS
	*/
	static SWBuf getEnvValue(const char *variableName);

	/** Check if a path can be access with supplied permissions
	* @param path Path to the resource
	* @param mode Desired access mode
	*
	* @return whether or not the resource can be accessed with the requested
	*	mode
	*/
	static bool hasAccess(const char *path, int mode);

	/** Checks for the existence and readability of a file.
	* @param ipath Path to file.
	* @param ifileName Name of file to check for.
	*/
	static signed char existsFile(const char *ipath, const char *ifileName = 0);

	/** Checks for the existence and readability of a directory.
	* @param ipath Path to directory.
	* @param idirName Name of directory to check for.
	*/
	static signed char existsDir(const char *ipath, const char *idirName = 0);

	/** Given a directory path, returns contents of directory
	* @param dirPath Path to directory
	* @param includeSize Optimization flag to allow passing false
	*	to skip file size lookup (true forces both size and directory lookup)
	* @param includeIsDirectory Optimization flag to allow passing false
	*	to skip isDirectory lookup
	*
	* @return a container of DirEntry records describing contents
	*/
	static std::vector<struct DirEntry> getDirList(const char *dirPath, bool includeSize = false, bool includeIsDirectory = true);


	/** Truncate a file at its current position
	* leaving byte at current possition intact deleting everything afterward.
	* @param file The file to operate on.
	*/
	signed char trunc(FileDesc *file);

	static char isDirectory(const char *path);
	static long getFileSize(const char *path);
	static int createParent(const char *pName);
	static int createPathAndFile(const char *fName);

	/** attempts to open a file readonly
	 * @param fName filename to open
	 * @return fd; < 0 = error
	 */
	static int openFile(const char *fName, int mode, int perms);
	static int openFileReadOnly(const char *fName);
	static void closeFile(int fd);
	static long write(int fd, const void *buf, long count);

	static int copyFile(const char *srcFile, const char *destFile);
	static int copyDir(const char *srcDir, const char *destDir);
	static int removeDir(const char *targetDir);
	static int removeFile(const char *fName);
	static char getLine(FileDesc *fDesc, SWBuf &line);

	/**
	 * Determines where SWORD looks for the user's home folder.  This is
	 * typically used as a place to find any additional personal SWORD
	 * modules which a user might wish to be added to a system-wide
	 * library (e.g., added from ~/.sword/mods.d/ or ~/sword/mods.d/)
	 *
	 * or if a user or UI wishes to override SWORD system configuration
	 * settings (e.g., /etc/sword.conf) with a custom configuration
	 * (e.g., ~/.sword/sword.conf)
	 */
	SWBuf getHomeDir();

};

/**
* This class represents one file. It works with the FileMgr object.
*/
class SWDLLEXPORT FileDesc {

	friend class FileMgr;

	long offset;
	int fd;			// -77 closed;
	FileMgr *parent;
	FileDesc *next;

	FileDesc(FileMgr * parent, const char *path, int mode, int perms, bool tryDowngrade);
	virtual ~FileDesc();

public:
	/** @return File handle.
	 * NOTE: magic file descriptor -77 = closed to avoid os limits
	*/
	inline int getFd() {
		if (fd == -77)
			fd = parent->sysOpen(this);
//		if ((fd < -1) && (fd != -77))  // kludge to handle ce
//			return 777;
		return fd;
	}

	long seek(long offset, int whence);
	long read(void *buf, long count);
	long write(const void *buf, long count);

	/** Path to file.
	*/
	char *path;
	/** File access mode.
	*/
	int mode;
	/** File permissions.
	*/
	int perms;
	/**
	*/
	bool tryDowngrade;
};


SWORD_NAMESPACE_END
#endif
