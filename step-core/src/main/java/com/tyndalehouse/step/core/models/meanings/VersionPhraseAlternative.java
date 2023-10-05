package com.tyndalehouse.step.core.models.meanings;

/**
 * Represents a particular alternative.
 */
public class VersionPhraseAlternative {
    private final String alternative;
    private final String type;
    private final String specifier;

    /**
     * Instantiates a new version phrase alternative.
     * 
     * @param alternative the alternative
     * @param type the type
     * @param specifier the specifier
     */
    public VersionPhraseAlternative(final String alternative, final String type, final String specifier) {
        this.alternative = alternative;
        this.type = type;
        this.specifier = specifier;
    }

    /**
     * Gets the alternative.
     * 
     * @return the alternative
     */
    public String getAlternative() {
        return this.alternative;
    }

    /**
     * Gets the type.
     * 
     * @return the type
     */
    public String getType() {
        return this.type;
    }

    /**
     * Gets the specifier.
     * 
     * @return the specifier
     */
    public String getSpecifier() {
        return this.specifier;
    }

}
