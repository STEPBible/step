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

    /** for serialisation */
    public ExpandableSubjectHeadingEntry() {
        // no op
    }

    /**
     * @param root the root entry
     * @param heading the heading
     */
    public ExpandableSubjectHeadingEntry(final String root, final String heading) {
        this.root = root;
        this.heading = heading;
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
}
