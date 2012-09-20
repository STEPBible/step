package com.tyndalehouse.step.core.service.impl;

/**
 * Indicates the type of search that is executed
 * 
 * @author chrisburrell
 * 
 */
public enum SearchType {
    /**
     * a text search that is delegated to JSword
     */
    TEXT,
    /**
     * a subject search that is delegated to the JSword backend
     */
    SUBJECT,

    /** A timeline description search */
    TIMELINE_DESCRIPTION,

    /** A timeline reference search */
    TIMELINE_REFERENCE,

    /**
     * original English word
     */
    ORIGINAL_MEANING,
    /**
     * Exact Greek original word search
     */
    ORIGINAL_GREEK_EXACT,
    /**
     * Exact Greek original word and its forms
     */
    ORIGINAL_GREEK_FORMS,
    /**
     * Search for an original Greek word and its related Greek words
     */
    ORIGINAL_GREEK_RELATED,
    /**
     * Exact Hebrew original word search
     */
    ORIGINAL_HEBREW_EXACT,
    /**
     * Search for exact word and its related forms
     */
    ORIGINAL_HEBREW_FORMS,
    /**
     * Search for an original Hebrew word and its related Hebrew words
     */
    ORIGINAL_HEBREW_RELATED,

}
