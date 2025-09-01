/******************************************************************************
 *
 *  xml2gbs.cpp -	Importer for GenBooks formatted as OSIS, ThML, or TEI
 *
 * $Id: xml2gbs.cpp 3063 2014-03-04 13:04:11Z chrislit $
 *
 * Copyright 2003-2012 CrossWire Bible Society (http://www.crosswire.org)
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

#include <entriesblk.h>
#include <iostream>
#include <string>
#include <fstream>
#include <treekeyidx.h>
#include <rawgenbook.h>


#ifndef NO_SWORD_NAMESPACE
using sword::TreeKeyIdx;
using sword::RawGenBook;
using sword::SWKey;
#endif

//#define DEBUG


enum XML_FORMATS { F_AUTODETECT, F_OSIS, F_THML, F_TEI };

#define HELPTEXT "xml2gbs 1.0 OSIS/ThML/TEI General Book module creation tool for the SWORD Project\n  usage:\n   xml2gbs [-l] [-i] [-fT|-fO|-fE] <filename> [modname]\n  -l uses long div names in ThML files\n  -i exports to IMP format instead of creating a module\n  -fO, -fT, and -fE will set the importer to expect OSIS, ThML, or TEI format respectively\n    (otherwise it attempts to autodetect)\n"

unsigned char detectFormat(char* filename) {

  unsigned char format = F_AUTODETECT;

  std::ifstream infile(filename);
  std::string entbuffer;
  
  if (!infile.is_open()) {
        std::cerr << HELPTEXT;
        std::cerr << std::endl << std::endl << "Could not open file \"" << filename << "\"" << std::endl;
  }
  else {
	while (std::getline(infile, entbuffer) && format == F_AUTODETECT) {
                if (strstr(entbuffer.c_str(), "<osis")) {
                        format = F_OSIS;
                }
                else if (strstr(entbuffer.c_str(), "<ThML")) {
                        format = F_THML;
                }
		else if (strstr(entbuffer.c_str(), "<TEI")) {
                        format = F_TEI;
		}
        }
        infile.close();
  }

  return format;
}

int processXML(const char* filename, char* modname, bool longnames, bool exportfile, unsigned char format) {
  signed long i = 0;
  char* strtmp;
  std::string entbuffer;

#ifdef DEBUG
  printf ("%s :%s :%d :%d :%d\n\n", filename, modname, longnames, exportfile, format);
#endif

  std::ifstream infile(filename);
  if (!infile.is_open()) {
        std::cerr << HELPTEXT;
        std::cerr << std::endl << std::endl << "Could not open file \"" << filename << "\"" << std::endl;
        return -1;
  }
  std::ofstream outfile;
  if (exportfile) {
    strcat (modname, ".imp");
    outfile.open(modname);
  }

  TreeKeyIdx * treeKey;
  RawGenBook * book = NULL;

  std::string divs[32];

  int level = 0;
  std::string keybuffer = "";
  std::string keybuffer2;
  std::string n;
  std::string type;
  std::string title;
  unsigned long entrysize = 0;
  unsigned long keysize = 0;
  bool closer = false;

  if (!exportfile) {
    // Do some initialization stuff
    TreeKeyIdx::create(modname);
    treeKey = new TreeKeyIdx(modname);
    RawGenBook::createModule(modname);
    delete treeKey;
    book = new RawGenBook(modname);
  }

#ifdef DEBUG
//  TreeKeyIdx root = *((TreeKeyIdx *)((SWKey *)(*book)));
#endif

  int c;
  while ((c = infile.get()) != EOF) {
    if (c == '<') {
	    {
		    keybuffer = "";
		    while ((c = infile.get()) != '>')
			    keybuffer += c;
		    keybuffer += c;
	    }

      if (keybuffer.length()) {
	if (((format == F_OSIS) && ((!strncmp(keybuffer.c_str(), "/div>", 5)) || (!strncmp(keybuffer.c_str(), "/verse>", 7)) || (!strncmp(keybuffer.c_str(), "/chapter>", 9)))) ||
           ((format == F_THML) && ((!strncmp(keybuffer.c_str(), "/div", 4)) && (keybuffer[4] > '0' && keybuffer[4] < '7')))) {
	  if (!closer) {
       	    keysize = 0;
            keybuffer2 = "";
       	    for (i = 0; i < level; i++) {
              keybuffer2 += '/';
       	      keysize++;
       	      keybuffer2 += divs[i];
              keysize += divs[i].length();
	      std::cout << keybuffer2 << std::endl;
       	    }

	    if (level) {
	      std::cout << keybuffer2 << std::endl;
	      if (exportfile) {
		outfile << "$$$" << keybuffer2 << std::endl << entbuffer << std::endl;
	      }
	      else {
		book->setKey(keybuffer2.c_str());
		book->setEntry(entbuffer.c_str(), entrysize); // save text to module at current position
	      }
	    }
	  }
	  level--;
	  entbuffer = "";
	  entrysize = 0;

	  closer = true;
	}
	else if (((format == F_OSIS) && !((!strncmp(keybuffer.c_str(), "div>", 4) || !strncmp(keybuffer.c_str(), "div ", 4)) || (!strncmp(keybuffer.c_str(), "verse>", 6) || !strncmp(keybuffer.c_str(), "verse ", 6)) || (!strncmp(keybuffer.c_str(), "chapter>", 8) || !strncmp(keybuffer.c_str(), "chapter ", 8)))) ||
                ((format == F_THML) && !((!strncmp(keybuffer.c_str(), "div", 3)) && (keybuffer[3] > '0' && keybuffer[3] < '7')))) {
	  entbuffer += '<';
	  entrysize++;
	  entrysize += keybuffer.length();
	  entbuffer += keybuffer;
	}
	else {
	  //we have a divN...
       	  if (!closer) {
            keysize = 0;
       	    keybuffer2= "";
       	    for (i = 0; i < level; i++) {
              keybuffer2 += '/';
       	      keysize++;
       	      keybuffer2 += divs[i];
              keysize += divs[i].length();
	      std::cout << keybuffer2 << std::endl;
       	    }

	    if (level) {
	      std::cout << keybuffer2 << std::endl;
	      if (exportfile) {
		outfile << "$$$" << keybuffer2 << std::endl << entbuffer << std::endl;
	      }
	      else {
		book->setKey(keybuffer2.c_str());
		book->setEntry(entbuffer.c_str(), entrysize); // save text to module at current position
	      }
	    }
	  }

	  entbuffer= "";
	  entrysize = 0;

	  level++;
          keysize = keybuffer.length()-1;

          type = "";
      	  n = "";
       	  title = "";

          if (format == F_OSIS && longnames == false) {
               	  strtmp = (char*)strstr(keybuffer.c_str(), "osisID=\"");
               	  if (strtmp) {
               	    strtmp += 8;
               	    for (;*strtmp != '\"'; strtmp++) {
               	      if (*strtmp == 10) {
               		title += ' ';
               	      }
               	      else if (*strtmp == '.') {
                        title = "";
               	      }
               	      else if (*strtmp != 13) {
               		title += *strtmp;
               	      }
               	    }
               	  }
                  keybuffer = title;
          }
          else {
               	  strtmp = (char*)strstr(keybuffer.c_str(), "type=\"");
               	  if (strtmp) {
               	    strtmp += 6;
               	    for (;*strtmp != '\"'; strtmp++) {
               	      if (*strtmp == 10) {
               		type+= ' ';
               	      }
               	      else if (*strtmp != 13) {
               		type+= *strtmp;
               	      }
               	    }
               	  }

               	  strtmp = (char*)strstr(keybuffer.c_str(), "n=\"");
               	  if (strtmp) {
               	    strtmp += 3;
               	    for (;*strtmp != '\"'; strtmp++) {
               	      if (*strtmp == 10) {
               		n += ' ';
               	      }
               	      else if (*strtmp != 13) {
               		n += *strtmp;
               	      }
               	    }
               	  }

                  if (format == F_OSIS) {
                       	  strtmp = (char*)strstr(keybuffer.c_str(), "title=\"");
                	  if (strtmp) {
                	    strtmp += 7;
                	    for (;*strtmp != '\"'; strtmp++) {
                	      if (*strtmp == 10) {
                		title += ' ';
                	      }
                	      else if (*strtmp != 13) {
                		title += *strtmp;
                	      }
                	    }
                	  }
                  }
                  else if (format == F_THML) {
                	  strtmp = (char*)strstr(keybuffer.c_str(), "title=\"");
                	  if (strtmp) {
                	    strtmp += 7;
                	    for (;*strtmp != '\"'; strtmp++) {
                	      if (*strtmp == 10) {
                		title += ' ';
                	      }
                	      else if (*strtmp != 13) {
                		title += *strtmp;
                	      }
                	    }
                	  }
                  }

        	  keybuffer = type;
        	  if (keybuffer.length() && n.length())
        	    keybuffer += " ";
        	  keybuffer += n;

        	  if (longnames && keybuffer.length())
        	    keybuffer += ": ";
        	  if (longnames || !keybuffer.length())
        	    keybuffer += title;
          }
          divs[level-1] = keybuffer;

	  closer = false;
	}
      }
    }
    else if (c != 13) {
      entbuffer += c;
      entrysize++;
    }
  }

#ifdef DEBUG
//  printTree(root, treeKey);
#endif

//  delete book;  //causes nasty-bad errors upon execution
	return 0;
}

int main(int argc, char **argv) {
  int i = 0;

  char modname[256];
  *modname = 0;
  char filename[256];
  *filename = 0;

  bool longnames = false;
  bool exportfile = false;
  unsigned char format = F_AUTODETECT;

  if (argc > 2) {
        for (i = 1; i < argc; i++) {
                if (argv[i][0] == '-') {
                        switch (argv[i][1]) {
                                case 'l':
                                        longnames = true;
                                        continue;
                                case 'i':
                                        exportfile = true;
                                        continue;
                                case 'f':
                                        if (argv[i][2] == 'O') {
                                                format = F_OSIS;
                                        }
                                        else if (argv[i][2] == 'T') {
                                                format = F_OSIS;
                                        }
                                        else {
                                                format = F_AUTODETECT;
                                        }
                                        continue;
                        }
                }
                else if (*filename == 0) {
                        strncpy (filename, argv[i], 200);
                }
                else if (*modname == 0) {
                        strncpy (modname, argv[i], 200);
                }
        }
  }
  else if (argc > 1) {
    strncpy (filename, argv[1], 200);
  }

  if (!*filename) {
    std::cerr << HELPTEXT << std::endl;
    return -1;
  }
  else {
        if (!*modname) {
                for (i = 0; (i < 256) && (filename[i]) && (filename[i] != '.'); i++) {
                        modname[i] = filename[i];
                }
                modname[i] = 0;
        }

        format = (format == F_AUTODETECT) ? detectFormat(filename) : format;
        if (format == F_AUTODETECT) {
                fprintf(stderr, HELPTEXT);
                fprintf(stderr, "\n\nCould not detect file format for file \"%s\", please specify.\n", filename);
                return -1;
        }

        int retCode =  processXML (filename, modname, longnames, exportfile, format);

        return retCode;
  }
}



