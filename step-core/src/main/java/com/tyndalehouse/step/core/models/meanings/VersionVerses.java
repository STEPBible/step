package com.tyndalehouse.step.core.models.meanings;

import java.util.List;

/**
 * This repreents a set of verses for a particular verse.
 */
public class VersionVerses {
    private final String reference;
    private final List<VersionVersePhraseOption> options;

    /**
     * Instantiates a new version verses.
     * 
     * @param reference the reference
     * @param options the options
     */
    public VersionVerses(final String reference, final List<VersionVersePhraseOption> options) {
        this.reference = reference;
        this.options = options;
    }

    /**
     * Gets the reference.
     * 
     * @return the reference
     */
    public String getReference() {
        return this.reference;
    }

    /**
     * Gets the options.
     * 
     * @return the options
     */
    public List<VersionVersePhraseOption> getOptions() {
        return this.options;
    }

}
