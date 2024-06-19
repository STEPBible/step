package com.tyndalehouse.step.core.models.search;

import com.tyndalehouse.step.core.models.LexiconSuggestion;

import java.util.List;
import java.util.Map;

/**
 * A holder for counts of strongs in the bibles and the actual Strongs data
 */
public class StrongCountsAndSubjects {
    private Map<String, List<LexiconSuggestion>> strongData;
    private Map<String, BookAndBibleCount> counts;
    private boolean ot;
    private String verse;
    private boolean multipleVerses;
    private String allMorphsInVerse;
    private String translationTipsFN;

    /**
     * Sets the counts.
     * 
     * @param counts the counts
     */
    public void setCounts(final Map<String, BookAndBibleCount> counts) {
        this.counts = counts;
    }

    /**
     * Sets the strong data.
     * 
     * @param strongData the strong data
     */
    public void setStrongData(final Map<String, List<LexiconSuggestion>> strongData) {
        this.strongData = strongData;
    }

    public void setTranslationTipsFN(final String translationTipsFN) {
        this.translationTipsFN = translationTipsFN;
    }

    public String getTranslationTipsFN() {
        return this.translationTipsFN;
    }

    public void setAllMorphsInVerse(final String allMorphsInVerse) {
        this.allMorphsInVerse = allMorphsInVerse;
    }

    public String getAllMorphsInVerse() {
        return this.allMorphsInVerse;
    }

    /**
     * @return the strongData
     */
    public Map<String, List<LexiconSuggestion>> getStrongData() {
        return this.strongData;
    }

    /**
     * @return the counts
     */
    public Map<String, BookAndBibleCount> getCounts() {
        return this.counts;
    }

    /**
     * @return the ot
     */
    public boolean isOt() {
        return this.ot;
    }

    /**
     * @param otValue the ot to set
     */
    public void setOT(final boolean otValue) {
        this.ot = otValue;
    }

    public void setVerse(String verse) {
        this.verse = verse;
    }

    public String getVerse() {
        return verse;
    }

    public void setMultipleVerses(boolean multipleVerses) {
        this.multipleVerses = multipleVerses;
    }

    public boolean isMultipleVerses() {
        return multipleVerses;
    }
}
