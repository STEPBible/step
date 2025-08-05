/******************************************************************************
 *
 *  tei2mod.cpp -	Utility to import documents encoded as TEI
 *
 * $Id: tei2mod.cpp 3416 2016-03-15 14:07:18Z dmsmith $
 *
 * Copyright 2008-2014 CrossWire Bible Society (http://www.crosswire.org)
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

/******************************************************************************
 * This program handles xml files of the form:
 * <TEI.2>
 *   <text>
 *     <body>
 *       <entry      key="xxx">...</entry>
 *       <entryFree  key="yyy">...</entryFree>
 *       <superentry key="zzz">...</superentry>
 *     </body>
 *   </text>
 * </TEI.2>
 * The document is assumed to be well-formed and valid.
 * Three kinds of entries are allowed,
 *    <entry> - a very restricted form of a dictionary entry.
 *    <entryFree> - a very unrestricted form of a dictionary entry.
 *    <superentry> - an entry which can have other entries.
 * The value of the key attribute is used as the key for the entry in the module.
 * Note, for a <superentry> only it's key becomes a SWORD key.
 * Keys of entries internal to it are not used.
 *
 * The entries must be sorted according to an ASCII collation of their bytes.
 * This should be the same for Latin-1 and for UTF-8
 *
 * Sword will allow for any tags, but only a few have any styling.
 *
 * author DM Smith
 */


#ifdef _MSC_VER
	#pragma warning( disable: 4251 )
#endif

#include <string>
#include <vector>
#include <fstream>
#include <iostream>
#include <swbuf.h>
#include <utilxml.h>
#include <rawld.h>
#include <rawld4.h>
#include <zld.h>
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
#include <stdio.h>
#include <cipherfil.h>

#ifdef _ICU_
#include <utf8nfc.h>
#include <latin1utf8.h>
#endif

#ifndef NO_SWORD_NAMESPACE
using namespace sword;
#endif

using namespace std;

#ifdef _ICU_
UTF8NFC *normalizer = 0;
int normalized = 0;

Latin1UTF8 converter;
int converted = 0;
#endif

#define DEBUG

SWLD  *module       = NULL;
SWKey *currentKey   = NULL;
bool   normalize    = true;
SWBuf keyStr;

unsigned long entryCount = 0;

/**
 * Determine whether the string contains a valid unicode sequence.
 * The following table give the pattern of a valid UTF-8 character.
 * Unicode Range               1st       2nd       3rd       4th
 * U-00000000 - U-0000007F  0nnnnnnn
 * U-00000080 - U-000007FF  110nnnnn  10nnnnnn
 * U-00000800 - U-0000FFFF  1110nnnn  10nnnnnn  10nnnnnn
 * U-00010000 - U-001FFFFF  11110nnn  10nnnnnn  10nnnnnn  10nnnnnn
 * Note:
 *   1.  The latest UTF-8 RFC allows for a max of 4 bytes.
 *       Earlier allowed 6.
 *   2.  The number of bits of the leading byte before the first 0
 *       is the total number of bytes.
 *   3.  The "n" are the bits of the unicode codepoint.
 * This routine does not check to see if the code point is in the range.
 * It could.
 *
 * param  txt the text to check
 * return   1 if all high order characters form a valid unicode sequence
 *         -1 if there are no high order characters.
 *            Note: this is also a valid unicode sequence
 *          0 if there are high order characters that do not form
 *            a valid unicode sequence
 * author DM Smith
 */
int detectUTF8(const char *txt) {
    unsigned int  countUTF8 = 0;
    int count = 0;

    // Cast it to make masking and shifting easier
    const unsigned char *p = (const unsigned char*) txt;
    while (*p) {
        // Is the high order bit set?
        if (*p & 0x80) {
            // Then count the number of high order bits that are set.
            // This determines the number of following bytes
            // that are a part of the unicode character
            unsigned char i = *p;
            for (count = 0; i & 0x80; count++) {
                i <<= 1;
            }

            // Validate count:
            // Count 0: bug in code that would cause core walking
            // Count 1: is a pattern of 10nnnnnn,
            //          which does not signal the start of a unicode character
            // Count 5 to 8: 111110nn, 1111110n and 11111110 and 11111111
            //          are not legal starts, either
            if (count < 2 || count > 4) return 0;

            // At this point we expect (count - 1) following characters
            // of the pattern 10nnnnnn
            while (--count && *++p) {
                // The pattern of each following character must be: 10nnnnnn
                // So, compare the top 2 bits.
                if ((0xc0 & *p) != 0x80) return  0;
            }

            // Oops, we've run out of bytes too soon: Cannot be UTF-8
            if (count) return 0;

            // We have a valid UTF-8 character, so count it
            countUTF8++;
        }

        // Advance to the next character to examine.
        p++;
    }

    // At this point it is either UTF-8 or 7-bit ascii
    return countUTF8 ? 1 : -1;
}

void normalizeInput(SWKey &key, SWBuf &text) {
#ifdef _ICU_
	int utf8State = detectUTF8(text.c_str());
	if (normalize) {
		// Don't need to normalize text that is ASCII
		// But assume other non-UTF-8 text is Latin1 (cp1252) and convert it to UTF-8
		if (!utf8State) {
			cout << "Warning: " << key << ": Converting to UTF-8 (" << text << ")" << endl;
			converter.processText(text, (SWKey *)2);  // note the hack of 2 to mimic a real key. TODO: remove all hacks
			converted++;

			// Prepare for double check. This probably can be removed.
			// But for now we are running the check again.
			// This is to determine whether we need to normalize output of the conversion.
			utf8State = detectUTF8(text.c_str());
		}

		// Double check. This probably can be removed.
		if (!utf8State) {
			cout << "Error: " << key << ": Converting to UTF-8 (" << text << ")" << endl;
		}

		if (utf8State > 0) {
			SWBuf before = text;
			normalizer->processText(text, (SWKey *)2);  // note the hack of 2 to mimic a real key. TODO: remove all hacks
			if (before != text) {
				normalized++;
			}
		}
	}
#endif
}

void writeEntry(SWKey &key, SWBuf &text) {
#ifdef DEBUG
	cout << "(" << entryCount << ") " << key << endl;
#endif

	module->setKey(key);

	normalizeInput(key, text);

	module->setEntry(text);
}

void linkToEntry(const SWBuf &keyBuf, const SWBuf &linkBuf) {
       	SWKey tmpkey = linkBuf.c_str();
	module->linkEntry(&tmpkey);
#ifdef DEBUG
	cout << "(" << entryCount << ") " << "Linking: " << linkBuf << endl;
#endif
}

// Return true if the content was handled or is to be ignored.
//	  false if the what has been seen is to be accumulated and considered later.
bool handleToken(SWBuf &text, XMLTag *token) {
        // The start token for the current entry;
	static XMLTag startTag;

        // Flags to indicate whether we are in a entry, entryFree or superentry
        static bool inEntry      = false;
        static bool inEntryFree  = false;
        static bool inSuperEntry = false;

	const char *tokenName = token->getName();

        static const char *splitPtr, *splitPtr2 = NULL;
        static char *splitBuffer	= new char[4096];
	static SWKey tmpKey;
//-- START TAG -------------------------------------------------------------------------
	if (!token->isEndTag()) {

		// If we are not in an "entry" and we see one, then enter it.
		if (!inEntry && !inEntryFree && !inSuperEntry) {
			inEntry      = !strcmp(tokenName, "entry");
			inEntryFree  = !strcmp(tokenName, "entryFree");
			inSuperEntry = !strcmp(tokenName, "superentry");
                        if (inEntry || inEntryFree || inSuperEntry) {
#ifdef DEBUG
				cout << "Entering " << tokenName << endl;
#endif
				startTag    = *token;
				text        = "";

                                keyStr = token->getAttribute("n"); // P5 with linking and/or non-URI chars
                                if (!strlen(keyStr)) {
	                                keyStr = token->getAttribute("sortKey"); // P5 otherwise
	                                if (!strlen(keyStr)) {
        					keyStr = token->getAttribute("key"); // P4
                                        }
                                }

				return false; // make tag be part of the output
			}
		}
	}

//-- EMPTY and END TAG ---------------------------------------------------------------------------------------------
	else {

		// ENTRY end
		// If we see the end of an entry that we are in, then leave it
		if ((inEntry      && !strcmp(tokenName, "entry"     )) ||
		    (inEntryFree  && !strcmp(tokenName, "entryFree" )) ||
		    (inSuperEntry && !strcmp(tokenName, "superentry"))) {
#ifdef DEBUG
			cout << "Leaving " << tokenName << endl;
#endif
			// Only one is false coming into here,
			// but all must be on leaving.
			inEntry       = false;
			inEntryFree   = false;
			inSuperEntry  = false;
			text         += token->toString();

                        entryCount++;
#ifdef DEBUG
			cout << "keyStr: " << keyStr << endl;
#endif
                        splitPtr = strstr(keyStr, "|");
                        if (splitPtr) {
                                strncpy (splitBuffer, keyStr.c_str(), splitPtr - keyStr.c_str());
                                splitBuffer[splitPtr - keyStr.c_str()] = 0;
				*currentKey = splitBuffer;
#ifdef DEBUG
				cout << "splitBuffer: " << splitBuffer << endl;
				cout << "currentKey: " << *currentKey << endl;
#endif
				writeEntry(*currentKey, text);
#if 1
                                while (splitPtr) {
                                	splitPtr += 1;
                                	splitPtr2 = strstr(splitPtr, "|");
                                        entryCount++;
                                        if (splitPtr2) {
						strncpy (splitBuffer, splitPtr, splitPtr2 - splitPtr);
                                                splitBuffer[splitPtr2 - splitPtr] = 0;
#ifdef DEBUG
						cout << "splitBuffer: " << splitBuffer << endl;
						cout << "currentKey: " << *currentKey << endl;
#endif
						linkToEntry(currentKey->getText(), splitBuffer);
                        	                splitPtr = splitPtr2;
                                        }
                                        else {
						strcpy (splitBuffer, splitPtr);
#ifdef DEBUG
       	       					cout << "splitBuffer: " << splitBuffer << endl;
						cout << "currentKey: " << *currentKey << endl;
#endif
						linkToEntry(currentKey->getText(), splitBuffer);
                                                splitPtr = 0;
                                        }
                                }
#endif
                        }
                        else {
				*currentKey = keyStr;
				writeEntry(*currentKey, text);
                        }

			// Since we consumed the text, clear it
			// and tell the caller that the tag was consumed.
			text = "";
			return true;
		}
	}
	return false;
}

void usage(const char *app, const char *error = 0) {
			
	if (error) fprintf(stderr, "\n%s: %s\n", app, error);
		
	fprintf(stderr, "TEI Lexicon/Dictionary/Daily Devotional/Glossary module creation tool for\n\tThe SWORD Project\n");
	fprintf(stderr, "\nusage: %s <output/path> <teiDoc> [OPTIONS]\n", app);
	fprintf(stderr, "  -z <l|z|b|x>\t\t use compression (default: none)\n");
	fprintf(stderr, "\t\t\t\t l - LZSS; z - ZIP; b - bzip2; x - xz\n");
	fprintf(stderr, "  -s <2|4>\t\t max text size per entry (default: 4)\n");
	fprintf(stderr, "  -c <cipher_key>\t encipher module using supplied key\n");
	fprintf(stderr, "\t\t\t\t (default: none)\n");
        fprintf(stderr, "  -N\t\t\t Do not convert UTF-8 or normalize UTF-8 to NFC\n");
        fprintf(stderr, "\t\t\t\t (default is to convert to UTF-8, if needed,\n");
        fprintf(stderr, "\t\t\t\t  and then normalize to NFC. Note: all UTF-8\n");
	fprintf(stderr, "\t\t\t\t  texts should be normalized to NFC.)\n");
	fprintf(stderr, "\n\tThe options -z and -s are mutually exclusive.\n");
	exit(-1);
}

int main(int argc, char **argv) {
#ifdef _ICU_
	UTF8NFC normalizr;
	normalizer = &normalizr;
#endif

	SWBuf program = argv[0];
	fprintf(stderr, "You are running %s: $Rev: 3416 $\n", argv[0]);

	// Let's test our command line arguments
	if (argc < 3) {
		usage(*argv);
	}

	// variables for arguments, holding defaults
	SWBuf path             = argv[1];
	SWBuf teiDoc           = argv[2];
	SWBuf compType	       = "";
	SWBuf modDrv           = "";
	SWBuf recommendedPath  = "./modules/lexdict/";
	SWBuf cipherKey        = "";
	SWCompress *compressor = 0;

	for (int i = 3; i < argc; i++) {
		if (!strcmp(argv[i], "-z")) {
			if (modDrv.size()) usage(*argv, "Cannot specify both -z and -s");
			compType = "ZIP";
			if (i+1 < argc && argv[i+1][0] != '-') {
				switch (argv[++i][0]) {
				case 'l': compType = "LZSS"; break;
				case 'z': compType = "ZIP"; break;
				case 'b': compType = "BZIP2"; break;
				case 'x': compType = "XZ"; break;
				}
			}
			modDrv = "zLD";
			recommendedPath += "zld/";
		}
		else if (!strcmp(argv[i], "-Z")) {
			if (compType.size()) usage(*argv, "Cannot specify both -z and -Z");
			if (modDrv.size()) usage(*argv, "Cannot specify both -Z and -s");
			compType = "LZSS";
			modDrv = "zLD";
			recommendedPath += "zld/";
		}
		else if (!strcmp(argv[i], "-s")) {
			if (compType.size()) usage(*argv, "Cannot specify both -s and -z");
			if (i+1 < argc) {
				int size = atoi(argv[++i]);
				if (size == 2) {
					modDrv           = "RawLD";
					recommendedPath += "rawld/";
					continue;
				}
				if (size == 4) {
					modDrv           = "RawLD4";
					recommendedPath += "rawld4/";
					continue;
				}
			}
			usage(*argv, "-s requires one of <2|4>");
		}
		else if (!strcmp(argv[i], "-N")) {
			normalize = false;
		}
		else if (!strcmp(argv[i], "-c")) {
			if (i+1 < argc) cipherKey = argv[++i];
			else usage(*argv, "-c requires <cipher_key>");
		}
		else usage(*argv, (((SWBuf)"Unknown argument: ")+ argv[i]).c_str());
	}
	if (!modDrv.size()) {
		modDrv           = "RawLD4";
		recommendedPath += "rawld4/";
	}

#ifndef _ICU_
	if (normalize) {
		normalize = false;
		cout << program << " is not compiled with support for ICU. Setting -N flag." << endl;
	}
#endif

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

#ifdef DEBUG
	// cout << "path: " << path << " teiDoc: " << teiDoc << " compressType: " << compType << " ldType: " << modDrv << " cipherKey: " << cipherKey.c_str() << " normalize: " << normalize << "\n";
	cout << "path: " << path << " teiDoc: " << teiDoc << " compressType: " << compType << " ldType: " << modDrv << " normalize: " << normalize << "\n";
	cout << "";
//      exit(-3);
#endif

	SWBuf modName = path;
	int pathlen   = path.length();
	char lastChar = path[pathlen - 1];
	if (lastChar != '/' && lastChar != '\\') {
		modName += "/";
	}
	modName += "dict";

	SWBuf keyBuf;
	SWBuf entBuf;
	SWBuf lineBuf;
	vector<string> linkBuf;

	if (modDrv == "zLD") {
		if (zLD::createModule(modName)) {
			fprintf(stderr, "error: %s: couldn't create module at path: %s \n", program.c_str(), modName.c_str()); 
			exit(-3);
		}
		module = new zLD(modName, 0, 0, 30, compressor);
	}
	else if (modDrv == "RawLD") {
		if (RawLD::createModule(modName)) {
			fprintf(stderr, "error: %s: couldn't create module at path: %s \n", program.c_str(), modName.c_str()); 
			exit(-3);
		}
		module = new RawLD(modName);
	}
	else {
		if (RawLD4::createModule(modName)) {
			fprintf(stderr, "error: %s: couldn't create module at path: %s \n", program.c_str(), modName.c_str()); 
			exit(-3);
		}
		module = new RawLD4(modName);
	}

	SWFilter *cipherFilter = 0;

	if (cipherKey.size()) {
		fprintf(stderr, "Adding cipher filter with phrase: %s\n", cipherKey.c_str() );
		cipherFilter = new CipherFilter(cipherKey.c_str());
		module->addRawFilter(cipherFilter);
	}

        if (!module->isWritable()) {
                fprintf(stderr, "The module is not writable. Writing text to it will not work.\nExiting.\n" );
                exit(-1);
        }

	// Let's see if we can open our input file
	ifstream infile(teiDoc);
	if (infile.fail()) {
		fprintf(stderr, "error: %s: couldn't open input file: %s \n", program.c_str(), teiDoc.c_str());
		exit(-2);
	}

	currentKey = module->createKey();
	currentKey->setPersist(true);
	module->setKey(*currentKey);

	(*module) = TOP;

	SWBuf token;
	SWBuf text;
	bool intoken = false;
	char curChar = '\0';

	while (infile.good()) {

		curChar = infile.get();

		// skip the character if it is bad. infile.good() will catch the problem
		if (curChar == -1) {
			continue;
		}

		if (!intoken && curChar == '<') {
			intoken = true;
			token = "<";
			continue;
		}

		if (intoken && curChar == '>') {
			intoken = false;
			token.append('>');

			XMLTag *t = new XMLTag(token.c_str());
			if (!handleToken(text, t)) {
				text.append(*t);
			}
                        delete t;
			continue;
		}

		if (intoken)
			token.append(curChar);
		else
			switch (curChar) {
				case '>' : text.append("&gt;"); break;
				case '<' : text.append("&lt;"); break;
				default  : text.append(curChar); break;
			}
	}

	// Force the last entry from the text buffer.
	//text = "";
	//writeEntry(*currentKey, text);

	delete module;
	delete currentKey;
	if (cipherFilter)
		delete cipherFilter;
	infile.close();

#ifdef _ICU_
	if (converted)  fprintf(stderr, "tei2mod converted %d verses to UTF-8\n", converted);
	if (normalized) fprintf(stderr, "tei2mod normalized %d verses to NFC\n", normalized);
#endif

	/*
	 * Suggested module name detection.
	 * Only used for suggesting a conf.
	 *
	 * Various forms of path.
	 * . and .. - no module name given, use "dict".
	 * Or one of the following where z is the module name
	 * and x may be . or ..
	 * z 
	 * x/y/z
	 * x/y/z/
	 * x/y/z/z
	 */
	SWBuf suggestedModuleName = path;
	if (lastChar == '/' || lastChar == '\\') {
		suggestedModuleName.setSize(--pathlen);
	}

	lastChar = suggestedModuleName[pathlen - 1];
	if (lastChar == '.') {
		suggestedModuleName = "???";
	}
	else {
		/* At this point the suggestion is either
		 * what follows the last / or \
		 * or the entire string
		 */
		const char *m = strrchr(suggestedModuleName.c_str(), '/');
		if (!m) {
			m = strrchr(suggestedModuleName.c_str(), '\\');
		}
		if (m) {
			suggestedModuleName = m+1;
		}
	}

	recommendedPath += suggestedModuleName;
	recommendedPath += "/dict";

	fprintf(stderr, "\nSuggested conf (replace ??? with appropriate values)\n\n");
	fprintf(stderr, "[%s]\n", suggestedModuleName.c_str());
	fprintf(stderr, "DataPath=%s\n", recommendedPath.c_str());
	fprintf(stderr, "Description=???\n");
	fprintf(stderr, "SourceType=TEI\n");
	fprintf(stderr, "Encoding=%s\n", (normalize ? "UTF-8" : "???"));
	fprintf(stderr, "ModDrv=%s\n", modDrv.c_str());
	if (compressor) {
		fprintf(stderr, "CompressType=%s\n", compType.c_str());
	}
	if (cipherKey.size()) {
		fprintf(stderr, "CipherKey=%s\n", cipherKey.c_str());
	}
}
