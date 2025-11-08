/******************************************************************************
 *
 *  utf8arabicpoints.cpp -	SWFilter descendant to remove UTF-8
 *				Arabic vowel points
 *
 * $Id: utf8arabicpoints.cpp 3439 2016-10-23 08:32:02Z scribe $
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


#include <stdlib.h>
#include <stdio.h>
#include <utf8arabicpoints.h>


SWORD_NAMESPACE_START

namespace {

	static const char oName[] = "Arabic Vowel Points";
	static const char oTip[]  = "Toggles Arabic Vowel Points";

	static const StringList *oValues() {
		static const SWBuf choices[3] = {"On", "Off", ""};
		static const StringList oVals(&choices[0], &choices[2]);
		return &oVals;
	}


	static char *nextMark(const char* from, int* mark_size) {
		// Arabic vowel points currently targeted for elimination:
		// Table entries excerpted from
		// http://www.utf8-chartable.de/unicode-utf8-table.pl.
		// Code   UTF-8     Description
		// point
		// -----  --------- -----------
		// U+064B d9 8b     ARABIC FATHATAN
		// U+064C d9 8c     ARABIC DAMMATAN
		// U+064D d9 8d     ARABIC KASRATAN
		// U+064E d9 8e     ARABIC FATHA
		// U+064F d9 8f     ARABIC DAMMA
		// U+0650 d9 90     ARABIC KASRA
		// U+0651 d9 91     ARABIC SHADDA
		// U+0652 d9 92     ARABIC SUKUN
		// U+0653 d9 93     ARABIC MADDAH ABOVE
		// U+0654 d9 94     ARABIC HAMZA ABOVE
		// U+0655 d9 95     ARABIC HAMZA BELOW
		//
		// U+FC5E ef b1 9e  ARABIC LIGATURE SHADDA WITH DAMMATAN ISOLATED FORM
		// U+FC5F ef b1 9f  ARABIC LIGATURE SHADDA WITH KASRATAN ISOLATED FORM
		// U+FC60 ef b1 a0  ARABIC LIGATURE SHADDA WITH FATHA ISOLATED FORM
		// U+FC61 ef b1 a1  ARABIC LIGATURE SHADDA WITH DAMMA ISOLATED FORM
		// U+FC62 ef b1 a2  ARABIC LIGATURE SHADDA WITH KASRA ISOLATED FORM
		// U+FC63 ef b1 a3  ARABIC LIGATURE SHADDA WITH SUPERSCRIPT ALEF ISOLATED FORM
		//
		// U+FE70 ef b9 b0  ARABIC FATHATAN ISOLATED FORM
		// U+FE71 ef b9 b1  ARABIC TATWEEL WITH FATHATAN ABOVE
		// U+FE72 ef b9 b2  ARABIC DAMMATAN ISOLATED FORM
		// U+FE73 ef b9 b3  ARABIC TAIL FRAGMENT
		// U+FE74 ef b9 b4  ARABIC KASRATAN ISOLATED FORM
		// U+FE75 ef b9 b5	 ???
		// U+FE76 ef b9 b6  ARABIC FATHA ISOLATED FORM
		// U+FE77 ef b9 b7  ARABIC FATHA MEDIAL FORM
		// U+FE78 ef b9 b8  ARABIC DAMMA ISOLATED FORM
		// U+FE79 ef b9 b9  ARABIC DAMMA MEDIAL FORM
		// U+FE7A ef b9 ba  ARABIC KASRA ISOLATED FORM
		// U+FE7B ef b9 bb  ARABIC KASRA MEDIAL FORM
		// U+FE7C ef b9 bc  ARABIC SHADDA ISOLATED FORM
		// U+FE7D ef b9 bd  ARABIC SHADDA MEDIAL FORM
		// U+FE7E ef b9 be  ARABIC SUKUN ISOLATED FORM
		// U+FE7F ef b9 bf  ARABIC SUKUN MEDIAL FORM

		unsigned char* byte = (unsigned char*) from;
		for (; *byte; ++byte) {
			if (byte[0] == 0xD9) {
				if (byte[1] >= 0x8B && byte[1] <= 0x95) {
				  *mark_size = 2;
				  break;
				}
			  continue;
			}
			if (byte[0] == 0xEF) {
				if (byte[1] == 0xB1) {
				 if (byte[2] >= 0x9E && byte[2] <= 0xA3) {
					*mark_size = 3;
					break;
				 }
				 continue;
			  }
				if (byte[1] == 0xB9) {
				 if (byte[2] >= 0xB0 && byte[2] <= 0xBF) {
					*mark_size = 3;
					break;
				 }
				 continue;
			  }
			}
		}
		return (char*)byte;
	}
}


UTF8ArabicPoints::UTF8ArabicPoints() : SWOptionFilter(oName, oTip, oValues()) {
}


UTF8ArabicPoints::~UTF8ArabicPoints(){};



char UTF8ArabicPoints::processText(SWBuf &text, const SWKey *, const SWModule *) {
    // A non-zero/true option setting means that setOptionValue("On")
    // was called which apparently means that Arabic Vowel Marks are ENABLED,
	// so the filter's actions are DISABLED.
	if (option)
		return 0;

	// Eliminate Arabic vowel marks from the text.
	// The recognized marks are determined by the "nextMark" function.

	// If nextMark were polymorphic (a virtual function or a function
	// pointer), this function could be generically used in any filter that
	// only removed (vs. replaced) areas of text based on the arbitrary
	// match criteria encapsulated in the specific nextMark
	// implementation.
	int mark_size = 0;
	char* mark_pos = nextMark(text.c_str(), &mark_size);

	// Here and at the end of the loop,
	// test BOTH mark_pos AND *mark_pos for safety and to give nextMark
	// the option of returning either NULL or a pointer to the null
	// terminator when done.
	if (!mark_pos || !*mark_pos)
		return 0; // no marks found.
	
	// Purposely granting write access into SWBuf internal buffer via
	// "end_of_output" avoids a needless temporary SWBuf copy.
	// Everything before the first mark is already in its final position
	// and can be safely ignored. So start appending at the current mark.
	char* end_of_output = mark_pos;

	// For consistency, input starts at (vs. after) the first mark as well
	// -- not a problem since the mark itself gets skipped, anyway.
	const char* start_of_input = mark_pos;
	do {
		// At this point, "mark_pos" and "mark_pos+mark_size" delimit
		// the text to drop.
		// "start_of_input" is either mark_pos or any text between the
        	// end of any previous mark and the current mark_pos.
		// This text is now ready to be moved into the output.
		int ready_size = (int)(mark_pos - start_of_input);
		if (ready_size > 0) {
			// Append the input text before the current mark to the
			// output.
			// Must use bcopy vs. strncpy because the final
			// end_of_output may overtake the original
			// start_of_input.
			memmove(end_of_output, start_of_input, ready_size);
			// Keep appending to end_of_output.
			end_of_output += ready_size;
		}
		// Ensure the mark never gets copied.
		start_of_input = mark_pos + mark_size;
		// Find the next mark.
		mark_pos = nextMark(start_of_input, &mark_size);

	} while (mark_pos && *mark_pos); // No more marks.

	// Copy any trailing input text AND always the terminating null.
	memmove(end_of_output, start_of_input, strlen(start_of_input)+1);
	return 0;
}

SWORD_NAMESPACE_END
