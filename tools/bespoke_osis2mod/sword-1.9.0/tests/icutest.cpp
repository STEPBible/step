/******************************************************************************
 *
 *   icutest.cpp -	
 *
 * $Id: icutest.cpp 2833 2013-06-29 06:40:28Z chrislit $
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
#include <string.h>

#include "unicode/utypes.h"   /* Basic ICU data types */
#include "unicode/ucnv.h"     /* C   Converter API    */
#include "unicode/ustring.h"  /* some more string fcns*/

#include "unicode/translit.h"

using namespace std;

int main() {

  UChar * uBuf;
  UChar * target;
  UConverter *conv;
  UErrorCode status = U_ZERO_ERROR;
  int32_t uBufSize = 0, uLength = 0;
  
  const char * samplestring = "If this compiles and runs without errors, apparently ICU is working.";

  uLength = strlen(samplestring);
  conv = ucnv_open("utf-8", &status);		
  uBufSize = (uLength/ucnv_getMinCharSize(conv));
  uBuf = new UChar[uBufSize];
  
  target = uBuf;
  
  ucnv_toUChars(conv, target, uLength, 
		samplestring, uLength, &status);

  cout << samplestring << endl;

  delete [] uBuf;

  return 0;
}
