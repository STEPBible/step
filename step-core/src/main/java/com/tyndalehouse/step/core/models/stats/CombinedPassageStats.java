package com.tyndalehouse.step.core.models.stats;


import com.tyndalehouse.step.core.models.LexiconSuggestion;

import java.util.Map;

/**
 * Combined passage stats has stats based on word occurrences, subjects as well as strong numbers.
 */
public class CombinedPassageStats {
    private PassageStat passageStat;
    private Map<String, LexiconSuggestion> lexiconWords;

    /**
     * @return the passageStat
     */
    public PassageStat getPassageStat() {
        return this.passageStat;
    }

    /**
     * @param passageStat the passageStat to set
     */
    public void setPassageStat(final PassageStat passageStat) {
        this.passageStat = passageStat;
    }

    /**
     * @param lexiconWords the words to be attached to this analysis
     */
    public void setLexiconWords(final Map<String, LexiconSuggestion> lexiconWords) {
        this.lexiconWords = lexiconWords;
    }

    /**
     * @return the words attached to this lexicon
     */
    public Map<String, LexiconSuggestion> getLexiconWords() {
        return lexiconWords;
    }
}
