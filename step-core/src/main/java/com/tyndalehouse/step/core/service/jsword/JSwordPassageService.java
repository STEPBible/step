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

import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;

import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;

/**
 * The service providing access to JSword. All JSword calls should preferably be placed in this service
 * 
 * @author chrisburrell
 * 
 */
public interface JSwordPassageService {
    /**
     * returns the Osis Text as a String
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @return the OSIS text in an HTML form
     */
    OsisWrapper getOsisText(String version, String reference, List<LookupOption> options,
            String interlinearVersion);

    /**
     * returns the biblical text as xml dom
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @return the OSIS text in an HTML form
     */
    OsisWrapper getOsisText(String version, String reference);

    /**
     * 
     * @param references a list of references
     * @param version the version name is used to select the correct versification
     * @return the list of references strongly-typed
     */
    List<ScriptureReference> resolveReferences(final String references, String version);

    /**
     * Returns the previous or next chapter
     * 
     * @param reference the reference
     * @param version the version of the book we are interested in
     * @param previousChapter true for previous chapter, false for next chapter
     * @return the new reference to display on the user screen
     */
    String getSiblingChapter(String reference, String version, boolean previousChapter);

    /**
     * Given a verse number, we lookup the verse in question and return it. The numberedVersion is assumed to
     * be KJV (i.e. KJV is used for the number lookup)
     * 
     * @param version the version to use for the passage lookup
     * @param numberedVersion the version to be used to lookup the ordinal verse numbers
     * @param startVerseId the start of the verse number to look up
     * @param endVerseId the end of the verse
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @param roundReference true to indicate to include everything to the next chapter.
     * @param ignoreVerse0 whether to ignore verse 0
     * @return the OsisWrapper containing the text
     */
    OsisWrapper getOsisTextByVerseNumbers(String version, String numberedVersion, int startVerseId,
            int endVerseId, List<LookupOption> options, final String interlinearVersion,
            Boolean roundReference, boolean ignoreVerse0);

    /**
     * Looks up a very short starter for ten
     * 
     * @param version the version to lookup the text from
     * @param keyedVersion the version with which the passage is keyed
     * @param r the reference
     * @return an osis wrapper
     */
    OsisWrapper peakOsisText(String version, String keyedVersion, ScriptureReference r);

    /**
     * Looks up a very short starter for ten
     * 
     * @param bible the version to lookup the text from
     * @param range the key to the passage
     * @param options a set of lookup options
     * @return an osis wrapper
     */
    OsisWrapper peakOsisText(Book bible, Key range, LookupOption... options);

}
