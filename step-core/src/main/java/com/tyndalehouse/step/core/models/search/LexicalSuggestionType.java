package com.tyndalehouse.step.core.models.search;

/**
 * A type of lexical suggestion
 * 
 * @author chrisburrell
 * 
 */
public enum LexicalSuggestionType {
    /**
     * only hebrew should be returned
     */
    HEBREW,
    /**
     * Hebrew meaning searches
     */
    HEBREW_MEANING,
    /**
     * only greek should be returned
     */
    GREEK,
    /**
     * Greek meaning searches
     */
    GREEK_MEANING,
    /**
     * meaning searches
     */
    MEANING;
}
