/******************************************************************************
 *
 *  utf8norm.cpp -	
 *
 * $Id: utf8norm.cpp 3749 2020-07-06 23:51:56Z scribe $
 *
 * Copyright 2009-2013 CrossWire Bible Society (http://www.crosswire.org)
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
#include <utilstr.h>
#include <swbuf.h>
#if !defined(__GNUC__) && !defined(_WIN32_WCE)
#include <io.h>
#include <direct.h>
#else
#include <unistd.h>
#endif
#include <utf8greekaccents.h>

using namespace sword;
using namespace std;

int main(int argc, char **argv) {
	const char *buf = (argc > 1 && argv[1][0] != '-') ? argv[1] : 0; // "Description=German Unrevidierte Luther Übersetzung von 1545";

	if (buf) {
		SWBuf fixed = assureValidUTF8(buf);

		cout << "input / processed:\n" << buf << "\n" << fixed << endl;
	}
	else {
		SWOptionFilter *filter = 0;
		if (argc > 1 && !strcmp(argv[1], "-ga")) filter = new UTF8GreekAccents();
		if (filter && filter->isBoolean()) filter->setOptionValue("Off");
		int repeat = 1;
		if (argc > 2) repeat = atoi(argv[2]);
		SWBuf contents = "";
		char chunk[255];
		int count = 254;
		while (count > 0) {
			count = read(STDIN_FILENO, chunk, 254);
			if (count > 0) {
				chunk[count] = 0;
				contents.append(chunk);
			}
		}
		SWBuf filteredContents = contents;
		if (filter) {
			for (int i = 0; i < repeat; ++i) {
				filteredContents = contents;
				filter->processText(filteredContents);
			}
		}
		const unsigned char *c = (const unsigned char *)filteredContents.getRawData();
		// UTF-32 BOM
		SW_u32 ch = 0xfeff;
//		write(STDOUT_FILENO, &ch, 4);
		while (c && *c) {
			ch = getUniCharFromUTF8(&c);
//			ch = __swswap32(ch);
			if (!ch) ch = 0xFFFD;
			SWBuf c8;
		        getUTF8FromUniChar(ch, &c8);
			write(STDOUT_FILENO, c8.getRawData(), c8.length());
		}
		delete filter;
	}

	return 0;
}
