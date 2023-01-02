package com.tyndalehouse.step.core.models;

/**
 * The Class Language.
 */
public class Language {
    private String code;
    private String originalLanguageName;
    private String userLocaleLanguageName;
    private boolean isComplete;
    private boolean isPartial;

    /**
     * @return the code
     */
    public String getCode() {
        return this.code;
    }

    /**
     * @param code the code to set
     */
    public void setCode(final String code) {
        this.code = code;
    }

    /**
     * @return the originalLanguageName
     */
    public String getOriginalLanguageName() {
        return this.originalLanguageName;
    }

    /**
     * @param originalLanguageName the originalLanguageName to set
     */
    public void setOriginalLanguageName(final String originalLanguageName) {
        this.originalLanguageName = originalLanguageName;
    }

    /**
     * @return the userLocaleLanguageName
     */
    public String getUserLocaleLanguageName() {
        return this.userLocaleLanguageName;
    }

    /**
     * @param userLocaleLanguageName the userLocaleLanguageName to set
     */
    public void setUserLocaleLanguageName(final String userLocaleLanguageName) {
        this.userLocaleLanguageName = userLocaleLanguageName;
    }

    public boolean isComplete() {
        return isComplete;
    }

    public void setComplete(final boolean isComplete) {
        this.isComplete = isComplete;
    }

    public boolean isPartial() {
        return isPartial;
    }

    public void setPartial(final boolean isPartial) {
        this.isPartial = isPartial;
    }

}
