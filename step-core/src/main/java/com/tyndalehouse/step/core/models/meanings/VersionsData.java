package com.tyndalehouse.step.core.models.meanings;

import java.util.List;

/**
 * The Class VersionsData.
 */
public class VersionsData {
    /** The version verses. */
    private final List<VersionVerses> versionVerses;

    /**
     * Instantiates a new versions data.
     * 
     * @param versionVerses the version verses
     */
    public VersionsData(final List<VersionVerses> versionVerses) {
        this.versionVerses = versionVerses;
    }

    /**
     * Gets the version verses.
     * 
     * @return the version verses
     */
    public List<VersionVerses> getVersionVerses() {
        return this.versionVerses;
    }

}
