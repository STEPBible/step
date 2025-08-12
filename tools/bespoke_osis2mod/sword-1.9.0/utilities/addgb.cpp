/******************************************************************************
 *
 *  addgb.cpp -	Utility to create/modify a GenBook module by adding a single
 *		entry
 *
 * $Id: addgb.cpp 3063 2014-03-04 13:04:11Z chrislit $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <entriesblk.h>
#include <iostream>
#include <string>
#include <stdio.h>
#include <treekeyidx.h>
#include <rawgenbook.h>

#ifndef NO_SWORD_NAMESPACE
using sword::TreeKeyIdx;
using sword::RawGenBook;
using sword::SWKey;
#endif


void printTree(TreeKeyIdx treeKey, TreeKeyIdx *target = 0, int level = 1) {
	if (!target)
		target = &treeKey;
	
	unsigned long currentOffset = target->getOffset();
       	std::cout << ((currentOffset == treeKey.getOffset()) ? "==>" : "");
	for (int i = 0; i < level; i++) std::cout << "\t";
	std::cout << treeKey.getLocalName() << "/\n";
	if (treeKey.firstChild()) {
		printTree(treeKey, target, level+1);
		treeKey.parent();
	}
	if (treeKey.nextSibling())
		printTree(treeKey, target, level);

}


int main(int argc, char **argv) {
  
  const char * helptext ="addgb 1.0 General Book module creation tool for the SWORD Project\nUse -a to add a new leaf entry from standard input or a file\n  usage:\n   %s -a <filename> <key> [</path/to/file/with/entry>]\n";

  //  const char * helptext ="addgb 1.0 General Book module creation tool for the SWORD Project\nUse -a to add a new leaf entry from standard input or a file, -d to delete an\nentry, -l to link two leaf entries.\n  usage:\n   %s -a <filename> <key> [</path/to/file/with/entry>]\n   %s -d <filename> <key>\n   %s -l <filename> <first key (already assigned)> <second key>\n";

  char mode;
  unsigned long entrysize;
    
  if (argc < 3) {
    fprintf(stderr, helptext, argv[0]);
    exit(-1);
  }
 
  mode = argv[1][1];

  // Do some initialization stuff
  TreeKeyIdx *treeKey = new TreeKeyIdx(argv[2]);
  if (treeKey->popError()) {
    treeKey->create(argv[2]);
    delete treeKey;
    treeKey = new TreeKeyIdx(argv[2]);
    RawGenBook::createModule(argv[2]);
  }
  delete treeKey;
  RawGenBook *book = new RawGenBook(argv[2]);

  if ((mode == 'a') && (argc == 4 || argc == 5)) {	
    char buffer[1048576];  //this is the max size of any entry

    
    FILE *infile;
    // case: add from text file
    //Open our data file and read its contents into the buffer
    if (argc == 5) infile = fopen(argv[4], "r");
    // case: add from stdin
    else infile = stdin;
    
    entrysize = fread(buffer, sizeof(char), sizeof(buffer), infile);
    book->setKey(argv[3]);
    book->setEntry(buffer, entrysize); // save text to module at current position
  }
  
  /*
    // let's pretend these don't exist for the time being

    // Link 2 verses
    else if ((mode == 'l') && argc == 5) {
    *key = argv[3];
    mod.setKey(*key);
    
    SWKey tmpkey = argv[4];
    mod << &(tmpkey);
    }
    
    // Delete an entry
    else if ((mode == 'd') && argc == 4) {
    mod.setKey(argv[3]);
    mod.deleteEntry();
    }
  */
  // Bad arguments, print usage
  else {
    fprintf(stderr, helptext, argv[0]);
    exit(-1);
  }
  
  //DEBUG  printTree(root, treeKey);
  
  delete treeKey;
  delete book;
  return 0;
}
