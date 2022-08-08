package com.tyndalehouse.step.core.models;

import com.tyndalehouse.step.core.models.search.PopularSuggestion;

import java.io.Serializable;

/**
 * @author chrisburrell
 */
public class LexiconSuggestion implements Serializable, PopularSuggestion {
    private static final long serialVersionUID = 2330563074130087347L;
    private String strongNumber;
    private String matchingForm;
    private String stepTransliteration;
    private String gloss;
    private String es_Gloss;
    private String zh_tw_Gloss;
    private String zh_Gloss;
    private String searchResultRange;
	private String type;
	private String detailLexicalTag;
    private String popularity;

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
     * @return the gloss
     */
    public String getGloss() {
        return this.gloss;
    }

    /**
     * @return the Spanish gloss
     */

    public String get_es_Gloss() {
        return this.es_Gloss;
    }

    /**
     * @return the traditional Chinese gloss
     */

    public String get_zh_tw_Gloss() {
        return this.zh_tw_Gloss;
    }

    /**
     * @return the simplified Chinese gloss
     */

    public String get_zh_Gloss() {
        return this.zh_Gloss;
    }
	
    /**
     * @return the STEP_Type
     */

    public String getType() {
        return this.type;
    }

    /**
     * @return the SearchResultRange
     */

    public String get_searchResultRange() {
        return this.searchResultRange;
    }

    /**
     * @return the STEP_detailLexicalTag
     */

    public String get_detailLexicalTag() {
        return this.detailLexicalTag;
    }

    public String getPopularity() {
        return this.popularity;
    }

    /**
     * @param gloss the gloss to set
     */
    public void setGloss(final String gloss) {
        this.gloss = gloss;
    }

    public void set_es_Gloss(final String spanishGloss) {
        this.es_Gloss = spanishGloss;
    }

    /**
     * @param chineseGloss the gloss to set
     */
    public void set_zh_tw_Gloss(final String chineseGloss) {
        this.zh_tw_Gloss = chineseGloss;
    }

    public void set_zh_Gloss(final String chineseGloss) {
        this.zh_Gloss = chineseGloss;
    }

    public void set_searchResultRange(final String searchResultRange) {
        this.searchResultRange = searchResultRange;
    }

    public void setType(final String stepType) {
        this.type = stepType;
    }

    public void setDetailLexicalTag(final String stepDetailLexicalTag) {
        this.detailLexicalTag = stepDetailLexicalTag;
    }

    public void setPopularity(final String stepPopularity) {
        this.popularity = stepPopularity;
    }

    /**
     * @return the matchingForm
     */
    public String getMatchingForm() {
        return this.matchingForm;
    }

    /**
     * @param matchingForm the matchingForm to set
     */
    public void setMatchingForm(final String matchingForm) {
        this.matchingForm = matchingForm;
    }

    /**
     * @return the strongNumber
     */
    public String getStrongNumber() {
        return this.strongNumber;
    }

    /**
     * @param strongNumber the strongNumber to set
     */
    public void setStrongNumber(final String strongNumber) {
        this.strongNumber = strongNumber;
    }
}
