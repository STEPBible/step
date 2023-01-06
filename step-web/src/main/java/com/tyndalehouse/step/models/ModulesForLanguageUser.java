package com.tyndalehouse.step.models;

import com.tyndalehouse.step.core.models.BibleVersion;

import java.util.List;

/**
 * A list of modules returned to the user, with internationalized information
 */
public class ModulesForLanguageUser {
    private List<BibleVersion> versions;
    private String languageCode;
    private String languageName;

    /**
     * @return the versions
     */
    public List<BibleVersion> getVersions() {
        return this.versions;
    }

    /**
     * @param versions the versions to set
     */
    public void setVersions(final List<BibleVersion> versions) {
        this.versions = versions;
    }

    /**
     * @return the languageCode
     */
    public String getLanguageCode() {
        return this.languageCode;
    }

    /**
     * @param languageCode the languageCode to set
     */
    public void setLanguageCode(final String languageCode) {
        this.languageCode = languageCode;
    }

    /**
     * @return the languageName
     */
    public String getLanguageName() {
        return this.languageName;
    }

    /**
     * @param languageName the languageName to set
     */
    public void setLanguageName(final String languageName) {
        this.languageName = languageName;
    }

}
