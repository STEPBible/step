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
    GREEK("H%");

    private final String strongPattern;

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
