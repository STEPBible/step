package com.tyndalehouse.step.core.models;

/**
 * Represents a result that was a match to the original query
 * 
 * @author chrisburrell
 * 
 */
public class SearchEntry {
    private String key;
    private String preview;

    /**
     * for serialisation
     */
    public SearchEntry() {
        // for serialisation
    }

    /**
     * @param key meaninful key to the user
     * @param preview the preview text
     */
    public SearchEntry(final String key, final String preview) {
        this.key = key;
        this.preview = preview;
    }

    /**
     * @return the key
     */
    public String getKey() {
        return this.key;
    }

    /**
     * @param key the key to set
     */
    public void setKey(final String key) {
        this.key = key;
    }

    /**
     * @return the preview
     */
    public String getPreview() {
        return this.preview;
    }

    /**
     * @param preview the preview to set
     */
    public void setPreview(final String preview) {
        this.preview = preview;
    }
}
