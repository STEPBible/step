/******************************************************************************
 *
 *  addld.cpp -	Utility to build/modify an LD module by adding a single entry
 *
 * $Id: addld.cpp 3063 2014-03-04 13:04:11Z chrislit $
 *
 * Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <ctype.h>
#include <stdio.h>
#include <fcntl.h>
#include <errno.h>
#include <stdlib.h>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#include <swmgr.h>
#include <rawld.h>
#include <rawld4.h>
#include <zld.h>
#ifndef EXCLUDEZLIB
#include <zipcomprs.h>
#endif

#ifndef NO_SWORD_NAMESPACE
using sword::SWMgr;
#ifndef EXCLUDEZLIB
using sword::ZipCompress;
#endif
using sword::RawLD4;
using sword::SWKey;
using sword::zLD;
using sword::RawLD;
#endif


int main(int argc, char **argv) {
  
  const char * helptext ="addld 1.0 Lexicon & Dictionary module creation tool for the SWORD Project\nUse -a to add a new LD entry from standard input or a file, -d to delete an\nentry, -l to link two LD entries, -c to create a new module.\n  usage:\n   %s -a <filename> <key> [</path/to/file/with/entry>]\n   %s -d <filename> <key>\n   %s -l <filename> <first key (already assigned)> <second key>\n   %s -c <filename>\nTo use 4-byte LD instead of 2-byte, insert a 4 immediately after the '-'.\nTo use zLD instead of 2-byte, insert a z immediately after the '-'.\n";
  long entrysize;
  
  bool fourbyte = false;
  bool compress = false;
  char mode;
  
  if (argc < 3) {
    fprintf(stderr, helptext, argv[0], argv[0], argv[0], argv[0]);
    exit(-1);
  }
  
  if (argv[1][1] == '4') {
    fourbyte = false;
    mode = argv[1][2];
  }
  else if (argv[1][1] == 'z') {
    compress = true;
    mode = argv[1][2];
  }
  else {
    mode = argv[1][1];
  }
  
  if ((mode == 'a') && (argc == 4 || argc == 5)) {	
    
    // Do some initialization stuff
    if (fourbyte) {
      char buffer[1048576];  //this is the max size of any entry
      RawLD4 mod(argv[2]);	// open our datapath with our RawText driver.
      SWKey* key = mod.createKey();
      key->setPersist(true);      // the magical setting
      
      // Set our VerseKey
      *key = argv[3];
	 mod.setKey(*key);
      FILE *infile;
      // case: add from text file
      //Open our data file and read its contents into the buffer
      if (argc == 5) infile = fopen(argv[4], "r");
      // case: add from stdin
      else infile = stdin;
      
      entrysize = fread(buffer, sizeof(char), sizeof(buffer), infile);
      mod.setEntry(buffer, entrysize);	// save text to module at current position
    }
    else if (compress) {
#ifndef EXCLUDEZLIB
      char buffer[1048576];  //this is the max size of any entry
      zLD mod(argv[2], 0, 0, 200, new ZipCompress());	// open our datapath with our RawText driver.
      SWKey* key = mod.createKey();
      key->setPersist(true);      // the magical setting
      
      // Set our VerseKey
      *key = argv[3];
	 mod.setKey(*key);
      FILE *infile;
      // case: add from text file
      //Open our data file and read its contents into the buffer
      if (argc == 5) infile = fopen(argv[4], "r");
      // case: add from stdin
      else infile = stdin;
      
      entrysize = fread(buffer, sizeof(char), sizeof(buffer), infile);
      mod.setEntry(buffer, entrysize);	// save text to module at current position
#else
      fprintf(stderr, "error: %s: SWORD library not built with ZIP compression support.\n", argv[0]);
      exit(-3);
#endif
    }
    else {
      char buffer[65536];  //this is the max size of any entry
      RawLD mod(argv[2]);	// open our datapath with our RawText driver.
      SWKey* key = mod.createKey();
      key->setPersist(true);      // the magical setting
      
      // Set our VerseKey
      *key = argv[3];
	 mod.setKey(*key);
      FILE *infile;
      // case: add from text file
      //Open our data file and read its contents into the buffer
      if (argc == 5) infile = fopen(argv[4], "r");
      // case: add from stdin
      else infile = stdin;
      
      entrysize = fread(buffer, sizeof(char), sizeof(buffer), infile);
      mod.setEntry(buffer, entrysize);	// save text to module at current position
    }
    
  }
  // Link 2 verses
  else if ((mode == 'l') && argc == 5) {
    // Do some initialization stuff
    if (fourbyte) {
      RawLD4 mod(argv[2]);	// open our datapath with our RawText driver.
      SWKey* key = mod.createKey();
      key->setPersist(true);      // the magical setting
      
      *key = argv[3];
	 mod.setKey(*key);
      SWKey tmpkey = argv[4];
      mod << &(tmpkey);
    }
    else if (compress) {
      zLD mod(argv[2]);	// open our datapath with our RawText driver.
      SWKey* key = mod.createKey();
      key->setPersist(true);      // the magical setting
      
      *key = argv[3];
	 mod.setKey(*key);
      
      SWKey tmpkey = argv[4];
      mod << &(tmpkey);
    }
    else {
      RawLD mod(argv[2]);	// open our datapath with our RawText driver.
      SWKey* key = mod.createKey();
      key->setPersist(true);      // the magical setting
      
      *key = argv[3];
	 mod.setKey(*key);
      
      SWKey tmpkey = argv[4];
      mod << &(tmpkey);
    }
  }
  else if ((mode == 'd') && argc == 4) {
    if (fourbyte) {
      RawLD4 mod(argv[2]);	// open our datapath with our RawText driver.
	 mod.setKey(argv[3]);
      mod.deleteEntry();
    }
    if (compress) {
      zLD mod(argv[2]);	// open our datapath with our RawText driver.
	 mod.setKey(argv[3]);
      mod.deleteEntry();
    }
    else {
      RawLD mod(argv[2]);	// open our datapath with our RawText driver.
      mod.setKey(argv[3]);
      mod.deleteEntry();
    }
    
  }
  // Make a new module
  else if ((mode == 'c') && argc == 3) {
    // Try to initialize a default set of datafiles and indicies at our
    // datapath location passed to us from the user.
    if (fourbyte) {
      if (RawLD4::createModule(argv[2])) {
	fprintf(stderr, "error: %s: couldn't create module at path: %s \n", argv[0], argv[2]);
	exit(-2);
      }
    }
    if (compress) {
      if (zLD::createModule(argv[2])) {
	fprintf(stderr, "error: %s: couldn't create module at path: %s \n", argv[0], argv[2]);
	exit(-2);
      }
    }
    else {
      if (RawLD::createModule(argv[2])) {
	fprintf(stderr, "error: %s: couldn't create module at path: %s \n", argv[0], argv[2]);
	exit(-2);
      }
    }
  }   
  
  // Bad arguments, print usage
  else {
    fprintf(stderr, helptext, argv[0], argv[0], argv[0], argv[0]);
    exit(-1);
  }
}
