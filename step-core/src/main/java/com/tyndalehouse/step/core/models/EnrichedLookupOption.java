package com.tyndalehouse.step.core.models;

/**
 * Outlines a list of options available in lookup
 */
public class EnrichedLookupOption {
    private final String displayName;
    private final String key;
    private final boolean enabledByDefault;

    /**
     * constructs an enriched version of the lookup option
     * 
     * @param displayName name to be displayed on the client
     * @param key the key to be used for communicating with the server
     * @param enabledByDefault true to signify the UI should enable the button by default
     */
    public EnrichedLookupOption(final String displayName, final String key, final boolean enabledByDefault) {
        this.displayName = displayName;
        this.key = key;
        this.enabledByDefault = enabledByDefault;
    }

    /**
     * @return the display name as should be shown on the screen
     */
    public String getDisplayName() {
        return this.displayName;
    }

    /**
     * @return The key to use to reference this item when sending it back to the server
     */
    public String getKey() {
        return this.key;
    }

    /**
     * @return the enabledByDefault
     */
    public boolean isEnabledByDefault() {
        return this.enabledByDefault;
    }
}
