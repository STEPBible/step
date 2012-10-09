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
     * only greek should be returned
     */
    GREEK,
    /**
     * meaning searches
     */
    MEANING;
}
