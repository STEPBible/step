package com.tyndalehouse.step.core.models.search;

/**
 * Carries timeline events
 */
public class TimelineEventSearchEntry implements SearchEntry {
    private static final long serialVersionUID = -1271009882198165554L;
    private String id;
    private String description;
    private java.util.List<VerseSearchEntry> verses;

    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }

    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * @return the verses
     */
    public java.util.List<VerseSearchEntry> getVerses() {
        return this.verses;
    }

    /**
     * @param verses the verses to set
     */
    public void setVerses(final java.util.List<VerseSearchEntry> verses) {
        this.verses = verses;
    }
}
