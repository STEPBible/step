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
package com.tyndalehouse.step.core.service.impl;

/**
 * Indicates the type of search that is executed.
 * 
 * @author chrisburrell
 */
public enum SearchType {
    PASSAGE(""),
    /**
     * a text search that is delegated to JSword
     */
    TEXT("search_text"),
    /**
     * a subject search that is delegated to the JSword backend
     */
    SUBJECT_SIMPLE("search_subject"),
    /**
     * a subject search that uses the basic naves headings
     */
    SUBJECT_EXTENDED("search_subject"),
    /**
     * a subject search that uses the full naves module
     */
    SUBJECT_FULL("search_subject"),

    /**
     * A subject related search allows one to get all subjects relating to a particular verse/book.
     */
    SUBJECT_RELATED("subject_related"),

    /** A timeline description search */
    TIMELINE_DESCRIPTION("search_timeline"),

    /** A timeline reference search */
    TIMELINE_REFERENCE("search_timeline"),

    /**
     * original English word
     */
    ORIGINAL_MEANING("search_word"),
    /**
     * Exact Greek original word search
     */
    ORIGINAL_GREEK_EXACT("search_word", true),
    /**
     * Exact Greek original word and its forms
     */
    ORIGINAL_GREEK_FORMS("search_word", true),
    /**
     * Search for an original Greek word and its related Greek words
     */
    ORIGINAL_GREEK_RELATED("search_word", true),
    /**
     * Exact Hebrew original word search
     */
    ORIGINAL_HEBREW_EXACT("search_word", false),
    /**
     * Search for exact word and its related forms
     */
    ORIGINAL_HEBREW_FORMS("search_word", false),
    /**
     * Search for an original Hebrew word and its related Hebrew words
     */
    ORIGINAL_HEBREW_RELATED("search_word", false);

    private Boolean greek;

    private String languageKey;

    /**
     * sets the greek flag to null.
     * 
     * @param languageKey the language key
     */
    SearchType(final String languageKey) {
        this.languageKey = languageKey;
        // allow null greek flag
    }

    /**
     * Instantiates a new search type.
     * 
     * @param languageKey the language key
     * @param isGreek true for greek, false for hebrew, null otherwise
     */
    SearchType(final String languageKey, final boolean isGreek) {
        this.languageKey = languageKey;
        this.greek = isGreek;
    }

    /**
     * @return true if greek or hebrew search
     */
    public boolean isOriginalSearch() {
        return this.greek != null || this == ORIGINAL_MEANING;
    }
    
    /**
     * Checks if is greek.
     * 
     * @return true if greek
     */
    public Boolean isGreek() {
        return Boolean.TRUE.equals(this.greek);
    }

    /**
     * Checks if is hebrew.
     * 
     * @return true if hebrew
     */
    public Boolean isHebrew() {
        return Boolean.FALSE.equals(this.greek);
    }

    /**
     * Gets the language key.
     * 
     * @return the language key
     */
    public String getLanguageKey() {
        return this.languageKey;
    }
}
