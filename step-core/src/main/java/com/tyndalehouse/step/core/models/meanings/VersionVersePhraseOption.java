package com.tyndalehouse.step.core.models.meanings;

import java.util.List;

/**
 * Represents a portion of text that has alternatives.
 */
public class VersionVersePhraseOption {
    private final String matchingText;
    private final String context;
    private final List<VersionPhraseAlternative> phraseAlternatives;

    /**
     * Instantiates a new version verse phrase option.
     * 
     * @param matchingText the matching text
     * @param context the context to find the text within, usually preceding
     * @param phraseAlternatives the phrase alternatives
     */
    public VersionVersePhraseOption(final String matchingText, final String context,
            final List<VersionPhraseAlternative> phraseAlternatives) {
        this.matchingText = matchingText;
        this.context = context;
        this.phraseAlternatives = phraseAlternatives;
    }

    /**
     * Gets the matching text.
     * 
     * @return the matching text
     */
    public String getMatchingText() {
        return this.matchingText;
    }

    /**
     * Gets the phrase alternatives.
     * 
     * @return the phrase alternatives
     */
    public List<VersionPhraseAlternative> getPhraseAlternatives() {
        return this.phraseAlternatives;
    }

    /**
     * @return the context
     */
    public String getContext() {
        return this.context;
    }
}
