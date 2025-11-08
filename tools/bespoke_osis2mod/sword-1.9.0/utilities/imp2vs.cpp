/******************************************************************************
 *
 *  imp2vs.cpp -	Utility to import IMP formatted VerseKey modules
 *
 * $Id: imp2vs.cpp 3741 2020-05-13 23:37:36Z scribe $
 *
 * Copyright 2002-2014 CrossWire Bible Society (http://www.crosswire.org)
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

#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
#endif

#include <stdio.h>
#include <iostream>

#include <swbuf.h>
#include <filemgr.h>
#include <versekey.h>
#include <rawtext.h>
#include <rawtext4.h>
#include <ztext.h>
#include <lzsscomprs.h>
#ifndef EXCLUDEZLIB
#include <zipcomprs.h>
#endif
#ifndef EXCLUDEBZIP2
#include <bz2comprs.h>
#endif
#ifndef EXCLUDEXZ
#include <xzcomprs.h>
#endif
#include <localemgr.h>
#include <cipherfil.h>

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

using namespace std;

void writeEntry(SWModule *module, const SWBuf &key, const SWBuf &entry, bool replace);

void usage(const char *progName, const char *error = 0) {
	if (error) fprintf(stderr, "\n%s: %s\n", progName, error);
	fprintf(stderr, "\n=== imp2vs (Revision $Rev: 3741 $) SWORD Bible/Commentary importer.\n");
	fprintf(stderr, "\nusage: %s <imp_file> [options]\n", progName);
	fprintf(stderr, "  -a\t\t\t augment module if exists (default is to create new)\n");
	fprintf(stderr, "  -r\t\t\t replace existing entries (default is to append)\n");
	fprintf(stderr, "  -z <l|z|b|x>\t\t use compression (default: none):\n");
	fprintf(stderr, "\t\t\t\t l - LZSS; z - ZIP; b - bzip2; x - xz\n");
	fprintf(stderr, "  -o <output_path>\t where to write data files.\n");
	fprintf(stderr, "  -4\t\t\t use 4 byte size entries (default is 2).\n");
	fprintf(stderr, "  -b <2|3|4>\t\t compression block size (default 4):\n");
	fprintf(stderr, "\t\t\t\t 2 - verse; 3 - chapter; 4 - book\n");
	fprintf(stderr, "  -v <v11n>\t\t specify a versification scheme to use (default is KJV)\n");
	fprintf(stderr, "\t\t\t\t Note: The following are valid values for v11n:\n");
	VersificationMgr *vmgr = VersificationMgr::getSystemVersificationMgr();
	StringList av11n = vmgr->getVersificationSystems();
	for (StringList::iterator loop = av11n.begin(); loop != av11n.end(); loop++) {
		fprintf(stderr, "\t\t\t\t\t%s\n", (*loop).c_str());
	}
	fprintf(stderr, "  -l <locale>\t\t specify a locale scheme to use (default is en)\n");
	fprintf(stderr, "  -c <cipher_key>\t encipher module using supplied key\n");
	fprintf(stderr, "\t\t\t\t (default no enciphering)\n");
	fprintf(stderr, "\n");
	fprintf(stderr, "'imp' format is a simple standard for importing data into SWORD modules.\n"
		"Required is a plain text file containing $$$key lines followed by content.\n\n"
		"$$$Gen.1.1\n"
		"In the beginning God created\n"
		"the heavens and the earth\n"
		"$$$Gen.1.2\n"
		"and the earth...\n\n"
		"Key lines can contain ranges, for example, a commentary entry which discusses\n"
		"John 1:1-4 might have a key, $$$Jn.1.1-4.  Special keys for intro entries use\n"
		"standard SWORD notation, e.g. $$$Rom.4.0 for intro of Romans chapter 4,\n"
		"$$$Rev.0.0 for intro of the Book of Revelation of John.  $$$[ Module Heading ]\n"
		"for entire module intro.  $$$[ Testament 2 Heading ] for NT intro.\n\n");
	exit(-1);
}


int main(int argc, char **argv) {


	// handle options
	if (argc < 2) usage(*argv);

	const char *progName   = argv[0];
	const char *inFileName = argv[1];
	SWBuf v11n	     = "KJV";
	SWBuf outPath	  = "./";
	SWBuf locale	       = "en";
	
	bool fourByteSize      = false;
	bool append	    = false;
	bool replace	    = false;
	int iType	      = 4;
	SWBuf cipherKey        = "";
	SWCompress *compressor = 0;
	SWBuf compType	 = "";

	for (int i = 2; i < argc; i++) {
		if (!strcmp(argv[i], "-a")) {
			append = true;
		}
		else if (!strcmp(argv[i], "-r")) {
			replace = true;
		}
		else if (!strcmp(argv[i], "-z")) {
			if (fourByteSize) usage(*argv, "Cannot specify both -z and -4");
			compType = "ZIP";
			if (i+1 < argc && argv[i+1][0] != '-') {
				switch (argv[++i][0]) {
				case 'l': compType = "LZSS"; break;
				case 'z': compType = "ZIP"; break;
				case 'b': compType = "BZIP2"; break;
				case 'x': compType = "XZ"; break;
				}
			}
		}
		else if (!strcmp(argv[i], "-Z")) {
			if (compType.size()) usage(*argv, "Cannot specify both -z and -Z");
			if (fourByteSize) usage(*argv, "Cannot specify both -Z and -4");
			compType = "LZSS";
		}
		else if (!strcmp(argv[i], "-4")) {
			fourByteSize = true;
		}
		else if (!strcmp(argv[i], "-b")) {
			if (i+1 < argc) {
				iType = atoi(argv[++i]);
				if ((iType >= 2) && (iType <= 4)) continue;
			}
			usage(*argv, "-b requires one of <2|3|4>");
		}
		else if (!strcmp(argv[i], "-o")) {
			if (i+1 < argc) outPath = argv[++i];
			else usage(progName, "-o requires <output_path>");
		}
		else if (!strcmp(argv[i], "-v")) {
			if (i+1 < argc) v11n = argv[++i];
			else usage(progName, "-v requires <v11n>");
		}
		else if (!strcmp(argv[i], "-l")) {
			if (i+1 < argc) locale = argv[++i];
			else usage(progName, "-l requires <locale>");
		}
		else if (!strcmp(argv[i], "-c")) {
			if (i+1 < argc) cipherKey = argv[++i];
			else usage(*argv, "-c requires <cipher_key>");
		}
		else usage(progName, (((SWBuf)"Unknown argument: ")+ argv[i]).c_str());
	}
	// -----------------------------------------------------
	const VersificationMgr::System *v = VersificationMgr::getSystemVersificationMgr()->getVersificationSystem(v11n);
	if (!v) std::cout << "Warning: Versification " << v11n << " not found. Using KJV versification...\n";

	if (compType == "LZSS") {
		compressor = new LZSSCompress();
	}
	else if (compType == "ZIP") {
#ifndef EXCLUDEZLIB
		compressor = new ZipCompress();
#else
		usage(*argv, "ERROR: SWORD library not compiled with ZIP compression support.\n\tBe sure libz is available when compiling SWORD library");
#endif
	}
	else if (compType == "BZIP2") {
#ifndef EXCLUDEBZIP2
		compressor = new Bzip2Compress();
#else
		usage(*argv, "ERROR: SWORD library not compiled with bzip2 compression support.\n\tBe sure libbz2 is available when compiling SWORD library");
#endif
	}
	else if (compType == "XZ") {
#ifndef EXCLUDEXZ
		compressor = new XzCompress();
#else
		usage(*argv, "ERROR: SWORD library not compiled with xz compression support.\n\tBe sure liblzma is available when compiling SWORD library");
#endif		
	}


	// setup module
	if (!append) {
		if (compressor) {
			if (zText::createModule(outPath, iType, v11n)) {
				fprintf(stderr, "ERROR: %s: couldn't create module at path: %s \n", *argv, outPath.c_str());
				exit(-1);
			}
		}
		else {
			if (!fourByteSize)
				RawText::createModule(outPath, v11n);
			else	RawText4::createModule(outPath, v11n);
		}
	}

	SWModule *module = 0;
	if (compressor) {
		// Create a compressed text module allowing very large entries
		// Taking defaults except for first, fourth, fifth and last argument
		module = new zText(
				outPath,		// ipath
				0,		// iname
				0,		// idesc
				iType,		// iblockType
				compressor,	// icomp
				0,		// idisp
				ENC_UNKNOWN,	// enc
				DIRECTION_LTR,	// dir
				FMT_UNKNOWN,	// markup
				0,		// lang
				v11n		// versification
		       );
	}
	else {
		module = (!fourByteSize)
			? (SWModule *)new RawText(outPath, 0, 0, 0, ENC_UNKNOWN, DIRECTION_LTR, FMT_UNKNOWN, 0, v11n)
			: (SWModule *)new RawText4(outPath, 0, 0, 0, ENC_UNKNOWN, DIRECTION_LTR, FMT_UNKNOWN, 0, v11n);
	}

	SWFilter *cipherFilter = 0;

	if (cipherKey.length()) {
		fprintf(stderr, "Adding cipher filter with phrase: %s\n", cipherKey.c_str() );
		cipherFilter = new CipherFilter(cipherKey.c_str());
		module->addRawFilter(cipherFilter);
	}
	// -----------------------------------------------------
	
	// setup locale manager
	
	LocaleMgr::getSystemLocaleMgr()->setDefaultLocaleName(locale);
			

	// setup module key to allow full range of possible values, and then some
	
	VerseKey *vkey = (VerseKey *)module->createKey();
	vkey->setIntros(true);
	vkey->setAutoNormalize(false);
	vkey->setPersist(true);
	module->setKey(*vkey);
	// -----------------------------------------------------


	// process input file
	FileDesc *fd = FileMgr::getSystemFileMgr()->open(inFileName, FileMgr::RDONLY);

	SWBuf lineBuffer;
	SWBuf keyBuffer;
	SWBuf entBuffer;

	bool more = true;
	do {
		more = FileMgr::getLine(fd, lineBuffer)!=0;
		if (lineBuffer.startsWith("$$$")) {
			if ((keyBuffer.size()) && (entBuffer.size())) {
				writeEntry(module, keyBuffer, entBuffer, replace);
			}
			keyBuffer = lineBuffer;
			keyBuffer << 3;
			keyBuffer.trim();
			entBuffer.size(0);
		}
		else {
			if (keyBuffer.size()) {
				entBuffer += lineBuffer;
				entBuffer += "\n";
			}
		}
	} while (more);
	if ((keyBuffer.size()) && (entBuffer.size())) {
		writeEntry(module, keyBuffer, entBuffer, replace);
	}

	delete module;
	if (cipherFilter)
		delete cipherFilter;
	delete vkey;

	FileMgr::getSystemFileMgr()->close(fd);

	return 0;
}



int page = 0;


void writeEntry(SWModule *module, const SWBuf &key, const SWBuf &entry, bool replace)
{
	if (key.size() && entry.size()) {
		std::cout << "from file: " << key << std::endl;
		VerseKey *vkey = (VerseKey *)module->getKey();
		VerseKey *linkMaster = (VerseKey *)module->createKey();

		ListKey listKey = vkey->parseVerseList(key.c_str(), "Gen1:1", true);

		bool first = true;
		for (listKey = TOP; !listKey.popError(); listKey++) {
			*vkey = listKey;
			if (first) {
				*linkMaster = *vkey;
				SWBuf text = (replace) ? "" : module->getRawEntry();
				if (text.length()) text += " ";
				text += entry;


				//------------------------------------------------------------
				//  Tregelles Page marking special stuff
				//------------------------------------------------------------
/*
				const char *pageMarker = "<seg type=\"page\" subtype=\"";
				int newPage = page;
				SWBuf pageData = strstr(text.c_str(), pageMarker);
				if (pageData.length()) {
					pageData << strlen(pageMarker);
					const char *pn = pageData.stripPrefix('"');
					if (pn) newPage = atoi(pn);
				}
				// add page stuff for treg
				if (text.startsWith(pageMarker)) {
					// don't add anything cuz we already start with one
				}
				else {
					SWBuf pm = pageMarker;
					pm.appendFormatted("%d\" />", page);
					text = pm + text;
				}

				page = newPage;	// when our line set a new page number

*/
				//------------------------------------------------------------




				std::cout << "adding entry: " << *vkey << " length " << entry.size() << "/" << (unsigned short)text.size() << std::endl;
				module->setEntry(text);
				first = false;
			}
			else {
				std::cout << "linking entry: " << *vkey << " to " << *linkMaster << std::endl;
				module->linkEntry(linkMaster);
			}
		}

		delete linkMaster;
	}
}

