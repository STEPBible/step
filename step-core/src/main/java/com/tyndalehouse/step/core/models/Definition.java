package com.tyndalehouse.step.core.models;

/**
 * Represents a definition, has a key and a value
 * 
 * @author Chris
 */
public class Definition {
    private final String key;
    private final String explanation;

    public Definition(final String key, final String explanation) {
        this.key = key;
        this.explanation = explanation;
    }

    /**
     * @return the key
     */
    public String getKey() {
        return this.key;
    }

    /**
     * @return the explanation
     */
    public String getExplanation() {
        return this.explanation;
    }
}
