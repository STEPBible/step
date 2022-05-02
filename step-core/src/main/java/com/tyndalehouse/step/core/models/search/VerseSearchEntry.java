package com.tyndalehouse.step.core.models.search;

/**
 * Represents a result that was a match to the original query
 *
 * @author chrisburrell
 */
public class VerseSearchEntry extends LexicalSearchEntry {
    private static final long serialVersionUID = 5620645768146160462L;
    private String key;
    private String osisId;
    private String preview;

    /**
     * for serialisation
     */
    public VerseSearchEntry() {
        // for serialisation
    }

    /**
     * @param key     meaningful key to the user
     * @param preview the preview text
     * @param osisId  TODO
     */
    public VerseSearchEntry(final String key, final String preview, final String osisId) {
        this.key = key;
        this.preview = preview;
        this.osisId = osisId;
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

    /**
     * @return the osisId
     */
    public String getOsisId() {
        return this.osisId;
    }

    /**
     * @param osisId the osisId to set
     */
    public void setOsisId(final String osisId) {
        this.osisId = osisId;
    }

}
