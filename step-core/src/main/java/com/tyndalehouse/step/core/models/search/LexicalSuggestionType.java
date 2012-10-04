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
    HEBREW("H%"),
    /**
     * only greek should be returned
     */
    GREEK("G%");

    private final String strongPattern;

    /**
     * @param strongPattern the pattern to use in the query
     */
    LexicalSuggestionType(final String strongPattern) {
        this.strongPattern = strongPattern;
    }

    /**
     * @return the strongPattern
     */
    public String getStrongPattern() {
        return this.strongPattern;
    }
}
