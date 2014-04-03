package com.tyndalehouse.step.core.models.search;

/**
 * A type of lexical suggestion
 * 
 * @author chrisburrell
 * 
 */
public enum SuggestionType {
    /**
     * only hebrew should be returned
     */
    HEBREW,
    /**
     * A search against hebrew exact forms
     */
    HEBREW_EXACT(HEBREW),
    /**
     * a search against hebrew transliterations
     */
    HEBREW_TRANSTLITERATION(HEBREW),
    /**
     * Hebrew meaning searches
     */
    HEBREW_MEANING,
    /**
     * only greek should be returned
     */
    GREEK,
    /**
     * indicates an exact search against the unicode
     */
    GREEK_EXACT(GREEK),
    /**
     * indicates an exact search against the transliterations
     */
    GREEK_TRANSLITERATION(GREEK),
    /**
     * Greek meaning searches
     */
    GREEK_MEANING,
    /**
     * meaning searches
     */
    MEANING,
    /**
     * A search directly from the strong number
     */
    STRONG, SUBJECT_SIMPLE, SUBJECT_EXTENDED, SUBJECT_FULL;
    
    SuggestionType parent;
    
    SuggestionType() {
        this.parent = this;
    }

    /**
     * Allows a suggestion type to be mapped to a common denominator. e.g, GREEK_EXACT and GREEK_TRANSLITERATIONS 
     * are both forms of 'GREEK'
     * @param parent
     */
    SuggestionType(final SuggestionType parent) {
        this.parent = parent;
    }
}
