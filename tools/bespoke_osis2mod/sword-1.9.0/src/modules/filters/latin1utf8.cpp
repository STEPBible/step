/******************************************************************************
 *
 *  latin1utf8.cpp -	SWFilter descendant Latin1UTF8 to convert a Latin-1
 *			character to UTF-8
 *
 * $Id: latin1utf8.cpp 2980 2013-09-14 21:51:47Z scribe $
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

#include <stdlib.h>
#include <stdio.h>
#include <latin1utf8.h>
#include <swmodule.h>


SWORD_NAMESPACE_START


Latin1UTF8::Latin1UTF8() {
}


char Latin1UTF8::processText(SWBuf &text, const SWKey *key, const SWModule *module)
{
    const unsigned char *from;

	if ((unsigned long)key < 2)	// hack, we're en(1)/de(0)ciphering
		return (char)-1;

	SWBuf orig = text;
	from = (const unsigned char *)orig.c_str();

	for (text = ""; *from; from++) {
	  if (*from < 0x80) {
	    text += *from;
	  }
	  else if (*from < 0xc0) {
                switch(*from) {
        	case 0x80: // '�'
	        	text += 0xe2; // '�'
		        text += 0x82; // '�'
        		text += 0xac; // '�'
	        	break;
        	case 0x82: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0x9a; // '�'
	        	break;
        	case 0x83: // '�'
	        	text += 0xc6; // '�'
		        text += 0x92; // '�'
        		break;
	        case 0x84: // '�'
		        text += 0xe2; // '�'
        		text += 0x80; // '�'
	        	text += 0x9e; // '�'
		        break;
        	case 0x85: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0xa6; // '�'
	        	break;
        	case 0x86: // '�'
        		text += 0xe2; // '�'
	        	text += 0x80; // '�'
		        text += 0xa0; // '�'
        		break;
	        case 0x87: // '�'
		        text += 0xe2; // '�'
        		text += 0x80; // '�'
	        	text += 0xa1; // '�'
		        break;
        	case 0x88: // '�'
	        	text += 0xcb; // '�'
		        text += 0x86; // '�'
        		break;
	        case 0x89: // '�'
		        text += 0xe2; // '�'
        		text += 0x80; // '�'
	        	text += 0xb0; // '�'
		        break;
        	case 0x8A: // '�'
	        	text += 0xc5; // '�'
		        text += 0xa0; // '�'
        		break;
	        case 0x8B: // '�'
		        text += 0xe2; // '�'
        		text += 0x80; // '�'
	        	text += 0xb9; // '�'
		        break;
        	case 0x8C: // '�'
	        	text += 0xc5; // '�'
		        text += 0x92; // '�'
        		break;
	        case 0x8E: // '�'
		        text += 0xc5; // '�'
        		text += 0xbd; // '�'
	        	break;
        	case 0x91: // '�'
        		text += 0xe2; // '�'
	        	text += 0x80; // '�'
		        text += 0x98; // '�'
        		break;
	        case 0x92: // '�'
		        text += 0xe2; // '�'
        		text += 0x80; // '�'
	        	text += 0x99; // '�'
		        break;
        	case 0x93: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0x9c; // '�'
	        	break;
        	case 0x94: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0x9d; // '�'
	        	break;
        	case 0x95: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0xa2; // '�'
	        	break;
        	case 0x96: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0x93; // '�'
	        	break;
        	case 0x97: // '�'
	        	text += 0xe2; // '�'
		        text += 0x80; // '�'
        		text += 0x94; // '�'
	        	break;
        	case 0x98: // '�'
	        	text += 0xcb; // '�'
		        text += 0x9c; // '�'
        		break;
	        case 0x99: // '�'
		        text += 0xe2; // '�'
        		text += 0x84; // '�'
	        	text += 0xa2; // '�'
		        break;
        	case 0x9A: // '�'
	        	text += 0xc5; // '�'
		        text += 0xa1; // '�'
        		break;
	        case 0x9B: // '�'
		        text += 0xe2; // '�'
        		text += 0x80; // '�'
	        	text += 0xba; // '�'
		        break;
        	case 0x9C: // '�'
	        	text += 0xc5; // '�'
		        text += 0x93; // '�'
        		break;
	        case 0x9E: // '�'
		        text += 0xc5; // '�'
        		text += 0xbe; // '�'
	        	break;
        	case 0x9F: // '�'
	        	text += 0xc5; // '�'
		        text += 0xb8; // '�'
        		break;
                default:
                        text += 0xC2;
                        text += *from;
                }
	  }
	  else {
	    text += 0xC3;
	    text += (*from - 0x40);
	  }
	}
	return 0;
}


SWORD_NAMESPACE_END
