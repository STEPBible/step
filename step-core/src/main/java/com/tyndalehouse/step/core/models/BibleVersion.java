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
    private boolean hasStrongs;
    private boolean hasMorphology;
    private boolean hasRedLetter;
    private char hasAllNTOTorBoth;
    private boolean hasNotes;
    private boolean hasHeadings;
    private boolean questionable;
    private String originalLanguage;
    private String languageCode;
    private String category;
    private String languageName;
    private String shortInitials;
    private boolean hasSeptuagintTagging;

    // SM V11N
    private String versification;

    /**
     * @return true if the version contains strong-tagged information
     */
    public boolean isHasStrongs() {
        return this.hasStrongs;
    }

    /**
     * @return the hasMorphology
     */
    public boolean isHasMorphology() {
        return this.hasMorphology;
    }

    /**
     * @param hasMorphology the hasMorphology to set
     */
    public void setHasMorphology(final boolean hasMorphology) {
        this.hasMorphology = hasMorphology;
    }

    /**
     * @param hasStrongs true if the version contains strong information
     */
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
     * @return the questionable
     */
    public boolean isQuestionable() {
        return this.questionable;
    }

    /**
     * @param questionable the questionable to set
     */
    public void setQuestionable(final boolean questionable) {
        this.questionable = questionable;
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return this.category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(final String category) {
        this.category = category;
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

    /**
     * @return the hasRedLetter
     */
    public boolean isHasRedLetter() {
        return this.hasRedLetter;
    }

    /**
     * @param hasRedLetter the hasRedLetter to set
     */
    public void setHasRedLetter(final boolean hasRedLetter) {
        this.hasRedLetter = hasRedLetter;
    }

    public void setHasAllNTOTorBoth(final char hasAllNTOTorBoth) {
        this.hasAllNTOTorBoth = hasAllNTOTorBoth;
    }

    public char getHasAllNTOTorBoth() {
        return this.hasAllNTOTorBoth;
    }
    /**
     * @return the shortInitials
     */
    public String getShortInitials() {
        return this.shortInitials;
    }

    /**
     * @param shortInitials the shortInitials to set
     */
    public void setShortInitials(final String shortInitials) {
        this.shortInitials = shortInitials;
    }

    /**
     * @param hasNotes true to indicate notes
     */
    public void setHasNotes(final boolean hasNotes) {
        this.hasNotes = hasNotes;
    }

    /**
     * @return has notes
     */
    public boolean isHasNotes() {
        return hasNotes;
    }

    /**
     * @return true to indicate whether a Bible has headings
     */
    public boolean isHasHeadings() {
        return hasHeadings;
    }

    /**
     * @param hasHeadings true to indicate whether a Bible has headings
     */
    public void setHasHeadings(final boolean hasHeadings) {
        this.hasHeadings = hasHeadings;
    }

    public String getOriginalLanguage() {
        return originalLanguage;
    }

    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }

    public void setHasSeptuagintTagging(final boolean hasSeptuagintTagging) {
        this.hasSeptuagintTagging = hasSeptuagintTagging;
    }

    public boolean isHasSeptuagintTagging() {
        return hasSeptuagintTagging;
    }

    // SM ===V11n===========>>> versification
    /**
     * @return the versification
     */
    public String getVersification() {
        return this.versification;
    }

    /**
     * @param versification the versification string
     */
    public void setVersification(final String versification) {
        this.versification = versification;
    }
    // SM <<<==================
}
