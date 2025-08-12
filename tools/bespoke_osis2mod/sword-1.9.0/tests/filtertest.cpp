/******************************************************************************
 *
 *  filtertest.cpp -	
 *
 * $Id: filtertest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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

#include <iostream>
#include <swbuf.h>
#include <filemgr.h>
#include <papyriplain.h>
#include <utf8utf16.h>
#include <rtfhtml.h>
#include <sysdata.h>
//#include <swmgr.h>
#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif
using namespace std;


int main(int argc, char **argv) {
//	UTF8UTF16 filter;
	RTFHTML filter;
//	PapyriPlain filter;
//
	FileDesc *fd = (argc > 1) ? FileMgr::getSystemFileMgr()->open(argv[1], FileMgr::RDONLY) : 0;

	SWBuf lineBuffer = "T\\u12345?his is t<e>xt which has papy-\nri markings in it.\n  L[et's be] sure it gets--\n cleaned up well for s(earching)";

	if (argc > 1 && !strcmp(argv[1], "-v")) {
		std::cout << "Original:\n\n";

		while (!fd || FileMgr::getLine(fd, lineBuffer)) {
			cout << lineBuffer << "\n";
			if (!fd) break;
		}

		cout << "\n\n-------\n\n";
	}

	if (fd) {
		FileMgr::getSystemFileMgr()->close(fd);
		fd = FileMgr::getSystemFileMgr()->open(argv[1], FileMgr::RDONLY);
	}

//	cout << "\xff\xfe";	// UTF16LE file signature

	while (!fd || FileMgr::getLine(fd, lineBuffer)) {
		lineBuffer += "\n";
		filter.processText(lineBuffer);

//	Simply way to output byte stream
		for (unsigned int i = 0; i < lineBuffer.size(); ++i) {
			std::cout << lineBuffer[i];
		}
/*
//	Example showing safe to cast to u16 stream
		unsigned int size = lineBuffer.size() / 2;
		__u16 *wcharBuf = (__u16 *)lineBuffer.getRawData();
		for (unsigned int i = 0; i < size; ++i) {
			std::wcout << (wchar_t)wcharBuf[i];	// must cast for correct output and because wchar_t is different size on linux we couldn't declare out wcharBuf a wchar_t *
		}
*/
		if (!fd) break;
	}

	if (fd) {
		FileMgr::getSystemFileMgr()->close(fd);
	}

	return 0;
}

