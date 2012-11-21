package com.tyndalehouse.step.core.models.search;

/**
 * An expandable header
 * 
 * @author chrisburrell
 * 
 */
public class ExpandableSubjectHeadingEntry implements SearchEntry {
    private static final long serialVersionUID = -7042352819214882916L;
    private String root;
    private String heading;
    private String seeAlso;

    /** for serialisation */
    public ExpandableSubjectHeadingEntry() {
        // no op
    }

    /**
     * @param root the root entry
     * @param heading the heading
     * @param seeAlso the field containing internal references to other entries
     */
    public ExpandableSubjectHeadingEntry(final String root, final String heading, final String seeAlso) {
        this.root = root;
        this.heading = heading;
        this.seeAlso = seeAlso;
    }

    /**
     * @return the root
     */
    public String getRoot() {
        return this.root;
    }

    /**
     * @return the heading
     */
    public String getHeading() {
        return this.heading;
    }

    /**
     * @return the seeAlso
     */
    public String getSeeAlso() {
        return this.seeAlso;
    }

    /**
     * @param seeAlso the seeAlso to set
     */
    public void setSeeAlso(final String seeAlso) {
        this.seeAlso = seeAlso;
    }
}
