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

    /** A search for related strongs */
    RELATED_STRONG,

    /** a search for exact strongs */
    EXACT_STRONG
}
