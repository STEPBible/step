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
package com.tyndalehouse.step.core.data.entities.impl;

import java.util.List;

import com.tyndalehouse.step.core.models.*;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;

import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * This is a mock class and as a result has very few implemented methods
 */
public class MockJSwordPassageServiceImpl implements JSwordPassageService {

    /**
     * Gets the osis text.
     * 
     * @param version the version
     * @param reference the reference
     * @param options the options
     * @param interlinearVersion the interlinear version
     * @param displayMode the display mode
     * @return the osis text
     */
    @Override
    public OsisWrapper getOsisText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion,
            final InterlinearMode displayMode) {

        return null;
    }

    /**
     * Gets the osis text.
     * 
     * @param version the version
     * @param reference the reference
     * @return the osis text
     */
    @Override
    public OsisWrapper getOsisText(final String version, final String reference) {

        return null;
    }

    /**
     * Gets the sibling chapter.
     * 
     * @param reference the reference
     * @param version the version
     * @param previousChapter the previous chapter
     * @return the sibling chapter
     */
    @Override
    public KeyWrapper getSiblingChapter(final String reference, final String version,
            final boolean previousChapter) {

        return null;
    }

    @Override
    public OsisWrapper peakOsisText(final String[] versions, final Key lookupKey, final List<LookupOption> options, final String interlinearMode) {
        return null;
    }

    /**
     * Gets the osis text by verse numbers.
     * 
     * @param version the version
     * @param numberedVersion the numbered version
     * @param startVerseId the start verse id
     * @param endVerseId the end verse id
     * @param options the options
     * @param interlinearVersion the interlinear version
     * @param roundReference the round reference
     * @param ignoreVerse0 the ignore verse0
     * @return the osis text by verse numbers
     */
    @Override
    public OsisWrapper getOsisTextByVerseNumbers(final String version, final String numberedVersion,
            final int startVerseId, final int endVerseId, final List<LookupOption> options,
            final String interlinearVersion, final Boolean roundReference, final boolean ignoreVerse0) {

        return null;
    }

    /**
     * Peak osis text.
     * 
     * @param bible the bible
     * @param range the range
     * @param options the options
     * @return the osis wrapper
     */
    @Override
    public OsisWrapper peakOsisText(final Book bible, final Key range, final List<LookupOption> options) {

        return null;
    }

    /**
     * Gets the key info.
     * 
     * @param reference the reference
     * @param version the version
     * @return the key info
     */
    @Override
    public KeyWrapper getKeyInfo(final String reference, final String sourceVersion, final String version) {
        final KeyWrapper keyWrapper = new KeyWrapper();
        keyWrapper.setOsisKeyId("Gen.1.1");
        return keyWrapper;
    }

    /**
     * Expand to chapter.
     * 
     * @param version the version
     * @param reference the reference
     * @return the key wrapper
     */
    @Override
    public KeyWrapper expandToChapter(final String version, final String reference) {

        return null;
    }

    /**
     * Gets the interleaved versions.
     * 
     * @param versions the versions
     * @param reference the reference
     * @param options the options
     * @param displayMode the display mode
     * @return the interleaved versions
     */
    @Override
    public OsisWrapper getInterleavedVersions(final String[] versions, final String reference,
            final List<LookupOption> options, final InterlinearMode displayMode, final String userLanguage) {

        return null;
    }

    /**
     * Gets the plain text.
     * 
     * @param version the version
     * @param reference the reference
     * @param firstVerse the first verse
     * @return the plain text
     */
    @Override
    public String getPlainText(final String version, final String reference, final boolean firstVerse) {

        return null;
    }

    /**
     * Gets the all references.
     * 
     * @param references the references
     * @param version the version
     * @return the all references
     */
    @Override
    public String getAllReferences(final String references, final String version) {
        return "a ref";
    }

    @Override
    public StringAndCount getAllReferencesAndCounts(String references, String version) {
        return null;
    }

     /**
     * Gets the first verse excluding zero.
     * 
     * @param key the key
     * @param book the book
     * @return the first verse excluding zero
     */
    @Override
    public Key getFirstVerseExcludingZero(final Key key, final Book book) {

        return null;
    }

    /**
     * Gets the first verse from range.
     * 
     * @param range the range
     * @param context
     * @return the first verse from range
     */
    @Override
    public Key getFirstVersesFromRange(final Key range, final int context) {

        return null;
    }

}
