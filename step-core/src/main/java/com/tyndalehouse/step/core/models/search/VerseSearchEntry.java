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
    private String osisId;
    private String preview;
    private String stepGloss;
    private String stepTransliteration;
    private String accentedUnicode;

    /**
     * for serialisation
     */
    public VerseSearchEntry() {
        // for serialisation
    }

    /**
     * @param key meaninful key to the user
     * @param preview the preview text
     * @param osisId TODO
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

    /**
     * @param stepGloss the stepGloss to set
     */
    public void setStepGloss(final String stepGloss) {
        this.stepGloss = stepGloss;
    }

    /**
     * @return the stepGloss
     */
    public String getStepGloss() {
        return this.stepGloss;
    }

    /**
     * @return the stepTransliteration
     */
    public String getStepTransliteration() {
        return this.stepTransliteration;
    }

    /**
     * @param stepTransliteration the stepTransliteration to set
     */
    public void setStepTransliteration(final String stepTransliteration) {
        this.stepTransliteration = stepTransliteration;
    }

    /**
     * @return the accentedUnicode
     */
    public String getAccentedUnicode() {
        return this.accentedUnicode;
    }

    /**
     * @param accentedUnicode the accentedUnicode to set
     */
    public void setAccentedUnicode(final String accentedUnicode) {
        this.accentedUnicode = accentedUnicode;
    }
}
