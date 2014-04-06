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
     * @param gloss the gloss to set
     */
    public void setGloss(final String gloss) {
        this.gloss = gloss;
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
