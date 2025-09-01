/******************************************************************************
 *
 *  corediatheke.h -	
 *
 * $Id: corediatheke.h 3359 2015-03-22 23:31:43Z refdoc $
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

/******************************************************************************
 * Diatheke 4.5 by Chris Little <chrislit@crosswire.org>
 * http://www.crosswire.org/sword/diatheke
 */

#include <stdio.h>
#include <iostream>

#include "diathekemgr.h"
#include <localemgr.h>
#include <swlocale.h>

#define QT_BIBLE 1
#define QT_COMM 2
#define QT_LD 3
#define QT_SEARCH 4
#define QT_SYSTEM 5
#define QT_INFO 6

#define OP_NONE 0
#define OP_STRONGS 1
#define OP_FOOTNOTES (1<<1)
#define OP_HEADINGS (1<<2)
#define OP_MORPH (1<<3)
#define OP_CANTILLATION (1<<4)
#define OP_HEBREWPOINTS (1<<5)
#define OP_GREEKACCENTS (1<<6)
#define OP_TRANSLITERATOR (1<<7)
#define OP_LEMMAS (1<<8)
#define OP_SCRIPREF (1<<9)
#define OP_ARSHAPE (1<<10)
#define OP_BIDI (1<<11)
#define OP_VARIANTS (1<<12)
#define OP_REDLETTERWORDS (1<<13)
#define OP_ARABICPOINTS (1<<14)
#define OP_GLOSSES (1<<15)
#define OP_XLIT (1<<16)
#define OP_ENUM (1<<17)
#define OP_MORPHSEG (1<<18)
#define OP_INTROS (1<<19)

#define ST_NONE 0
#define ST_REGEX 1     //  0
#define ST_PHRASE 2    // -1
#define ST_MULTIWORD 3 // -2
#define ST_ENTRYATTRIB 4 // -3
#define ST_CLUCENE 5 // -4
#define ST_MULTILEMMA 6 // -5



using namespace std;

int hasalpha (char * string);
void doquery(unsigned long maxverses, unsigned char outputformat, unsigned char outputencoding, unsigned long optionfilters, unsigned char searchtype, const char *range, const char *text, const char *locale, const char *ref, ostream* output, const char* script, signed char variants); 
