package com.tyndalehouse.step.core.models;

import java.io.Serializable;

/**
 * Contains information about a bible version to be displayed on the screen in the UI
 * 
 * @author CJBurrell
 * 
 */
public class BibleVersion implements Serializable {
    private static final long serialVersionUID = 6598606392490334637L;
    private String initials;
    private String name;
    private String language;
    private boolean hasStrongs;

    public boolean isHasStrongs() {
        return this.hasStrongs;
    }

    public void setHasStrongs(final boolean hasStrongs) {
        this.hasStrongs = hasStrongs;
    }

    /**
     * @return the initials
     */
    public String getInitials() {
        return this.initials;
    }

    /**
     * @param initials the initials to set
     */
    public void setInitials(final String initials) {
        this.initials = initials;
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name the name to set
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * @return the language
     */
    public String getLanguage() {
        return this.language;
    }

    /**
     * @param language the language to set
     */
    public void setLanguage(final String language) {
        this.language = language;
    }

}
