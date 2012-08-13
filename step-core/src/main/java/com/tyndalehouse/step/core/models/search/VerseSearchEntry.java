package com.tyndalehouse.step.core.models.search;

/**
 * Represents a result that was a match to the original query
 * 
 * @author chrisburrell
 * 
 */
public class VerseSearchEntry implements SearchEntry {
    private static final long serialVersionUID = 5620645768146160462L;
    private String key;
    private String preview;

    /**
     * for serialisation
     */
    public VerseSearchEntry() {
        // for serialisation
    }

    /**
     * @param key meaninful key to the user
     * @param preview the preview text
     */
    public VerseSearchEntry(final String key, final String preview) {
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
