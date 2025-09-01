/*****************************************************************************
 *
 *  ftplibftpt.cpp -	FTPLibFTPTransport
 *
 * $Id: ftplibftpt.cpp 3822 2020-11-03 18:54:47Z scribe $
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

#include <stdio.h>
#include <fcntl.h>

#include <ftplib.h>

#include <ftplibftpt.h>
#include <swlog.h>
#include <filemgr.h>


SWORD_NAMESPACE_START

namespace {

	struct MyProgressData {
		StatusReporter *sr;
		long totalSize;
		bool *term;
	};

	static int my_swbufwriter(netbuf *nControl, void *buffer, size_t size, void *swbuf) {
		SWBuf &output = *(SWBuf *)swbuf;
		int s = (int)output.size();
		output.size(s+size);
		memcpy(output.getRawData()+s, buffer, size);
		return (int)size;
	}

	static int my_filewriter(netbuf *nControl, void *buffer, size_t size, void *fd) {
		int output = *((int *)fd);
		FileMgr::write(output, buffer, size);
		return (int)size;
	}

#if defined(__GNUC__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
#endif

	static int my_fprogress(netbuf *nControl, int xfered, void *arg) {
		if (arg) {
			MyProgressData *pd = (MyProgressData *)arg;
//SWLOGD("FTPLibFTPTransport report progress: totalSize: %ld; xfered: %d\n", pd->totalSize, xfered);
			if (pd->sr) {
				pd->sr->update(pd->totalSize, xfered);
			}
			if (*(pd->term)) return 0;
		}
		return 1;
	}

#if defined(__GNUC__)
#pragma GCC diagnostic pop
#endif


	// initialize/cleanup SYSTEMWIDE library with life of this static.
	static class FTPLibFTPTransport_init {
	public:
		FTPLibFTPTransport_init() {
			FtpInit();
		}

		~FTPLibFTPTransport_init() {
		}

	} _ftpLibFTPTransport_init;

}


FTPLibFTPTransport::FTPLibFTPTransport(const char *host, StatusReporter *sr) : RemoteTransport(host, sr) {

	ftpConnection = 0;
}


FTPLibFTPTransport::~FTPLibFTPTransport() {
	if (ftpConnection)
		FtpQuit(ftpConnection);
}


char FTPLibFTPTransport::assureLoggedIn() {
	char retVal = 0;
	if (ftpConnection == 0) {
SWLOGD("connecting to host: %s...\n", host.c_str());
		if (FtpConnect(host, &ftpConnection)) {
			FtpOptions(FTPLIB_CONNMODE, (passive) ? FTPLIB_PASSIVE : FTPLIB_PORT, ftpConnection);
			FtpOptions(FTPLIB_IDLETIME, timeoutMillis, ftpConnection);

SWLOGD("connected. logging in...\n");
			if (FtpLogin(u.c_str(), p.c_str(), ftpConnection)) {
SWLOGD("logged in.\n");
				retVal = 0;
			}
			else {
				SWLog::getSystemLog()->logError("Failed to login to %s\n", host.c_str());
				retVal = -2;
			}
		}
		else {
			SWLog::getSystemLog()->logError("Failed to connect to %s\n", host.c_str());
			retVal = -2;
		}
	}
	return retVal;
}


char FTPLibFTPTransport::getURL(const char *destPath, const char *sourceURL, SWBuf *destBuf) {

	char retVal = 0;

SWLOGD("FTPLibFTPTransport::getURL(%s, %s, ...);\n", (destPath)?destPath:"(null)", sourceURL);
	// assert we can login
	retVal = assureLoggedIn();
	if (retVal) return retVal;
SWLOGD("FTPLibFTPTransport - logged in.\n");

	SWBuf sourcePath = sourceURL;

	SWBuf outFile;
	if (!destBuf) {
		outFile = destPath;
	}

	sourcePath << (6 + host.length()); // shift << "ftp://hostname";
SWLOGD("getting file %s to %s\n", sourcePath.c_str(), destBuf ? "*internal buffer*" : outFile.c_str());
	struct MyProgressData pd;
	pd.sr = statusReporter;
	pd.term = &term;
	pd.totalSize = 0;
	int fd = 0;
	if (destBuf) {
		FtpOptions(FTPLIB_CALLBACK_WRITER, (long)&my_swbufwriter, ftpConnection);
		FtpOptions(FTPLIB_CALLBACK_WRITERARG, (long)destBuf, ftpConnection);
	}
	else {
		fd = FileMgr::createPathAndFile(outFile);
		FtpOptions(FTPLIB_CALLBACK_WRITER, (long)&my_filewriter, ftpConnection);
		FtpOptions(FTPLIB_CALLBACK_WRITERARG, (long)&fd, ftpConnection);
	}

	FtpOptions(FTPLIB_CALLBACK, (long)&my_fprogress, ftpConnection);
	FtpOptions(FTPLIB_CALLBACKARG, (long)&pd, ftpConnection);
	FtpOptions(FTPLIB_CALLBACKBYTES, (long)2048, ftpConnection);

	if (sourcePath.endsWith("/") || sourcePath.endsWith("\\")) {
//SWLOGD("getting test directory %s\n", sourcePath.c_str());
//		FtpDir(NULL, sourcePath, ftpConnection);
SWLOGD("getting real directory %s\n", sourcePath.c_str());
		retVal = FtpDir(0, sourcePath, ftpConnection) - 1;
SWLOGD("got real directory %s to %s\n", sourcePath.c_str(), destBuf ? "*internal buffer*" : outFile.c_str());
	}
	else {
SWLOGD("getting file %s\n", sourcePath.c_str());
		int size;
		FtpSize(sourcePath, &size, FTPLIB_IMAGE, ftpConnection);
		pd.totalSize = size;
		retVal = FtpGet(0, sourcePath, FTPLIB_IMAGE, ftpConnection) - 1;
	}
	if (fd > 0) FileMgr::closeFile(fd);
SWLOGD("FTPLibFTPTransport - returning: %d\n", retVal);
	return retVal;
}


SWORD_NAMESPACE_END

