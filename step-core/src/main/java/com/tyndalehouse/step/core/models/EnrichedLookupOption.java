package com.tyndalehouse.step.core.models;

/**
 * Outlines a list of options available in lookup
 * 
 * @author Chris Burrell
 * 
 */
public class EnrichedLookupOption {
    private final String displayName;
    private final String key;

    /**
     * constructs an enriched version of the lookup option
     * 
     * @param displayName name to be displayed on the client
     * @param key the key to be used for communicating with the server
     */
    public EnrichedLookupOption(final String displayName, final String key) {
        this.displayName = displayName;
        this.key = key;
    }

    public String getDisplayName() {
        return this.displayName;
    }

    public String getKey() {
        return this.key;
    }
}
