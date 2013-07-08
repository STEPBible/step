/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.jsword;

import com.tyndalehouse.step.core.models.KeyWrapper;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;

/**
 * Some generally useful methods for dealing with versification.
 * 
 * @author chrisburrell
 */
public interface JSwordVersificationService {

    /**
     * Uses the default versification to return the verse range name
     * 
     * @param startVerseId the starting verse ordinal
     * @param endVerseId the ending verse ordinal
     * @return the reference in human readable form
     */
    String getVerseRange(int startVerseId, int endVerseId);

    /**
     * Uses the version of the given book and calculates the verse range name
     * 
     * @param startVerseId the starting verse ordinal
     * @param endVerseId the ending verse ordinal
     * @param version the initials of the book
     * @return the reference in human readable form
     */
    String getVerseRange(int startVerseId, int endVerseId, String version);

    /**
     * Obtains a verse range for the provided verses
     * 
     * @param version the version to use for lookup purposes
     * @param numberedVersion the version of the Bible to use for the versification (i.e. verse ordinals)
     * @param versificationForNumberedVersion the actual versification object
     * @param s the start verse
     * @param e the end verse
     * @param lookupVersion the lookup version
     * @param roundReference whether to round up/down the reference
     * @param ignoreVerse0 whether to ignore verse 0 (i.e. the beginning of the chapter
     * @return the verse range in question
     */
    VerseRange getVerseRangeForSelectedVerses(String version, String numberedVersion,
            Versification versificationForNumberedVersion, Verse s, Verse e, Book lookupVersion,
            Boolean roundReference, boolean ignoreVerse0);

    /**
     * A helper method to get the versification from a book
     * 
     * @param version the version we are interested in.
     * @return the versification the versification of the book
     */
    Versification getVersificationForVersion(Book version);

    /**
     * A helper method to get the versification from a book
     * 
     * @param version the version we are interested in.
     * @return the versification the versification of the book
     */
    Versification getVersificationForVersion(String version);

    /**
     * Gets a book from version initials, throws an exception if the book cannot be found
     * 
     * @param version the version initials
     * @return the JSword book
     */
    Book getBookFromVersion(String version);

    /**
     * Gets the book silently, returning null if not found
     * 
     * @param version the version
     * @return the book returning null if not found
     */
    Book getBookSilently(String version);

    /**
     Converts from one av11n to another
     * @param reference the reference
     * @param sourceVersion source book
     * @param targetVersion target book
     * @return the converted reference
     */
    KeyWrapper convertReference(String reference, String sourceVersion, String targetVersion);
}
