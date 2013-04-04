package com.tyndalehouse.step.core.xsl.impl;

/**
 * An interlinear word can be partial if tagged with an H00, which then causes two words to be looked up...
 * 
 * @author chrisburrell
 * 
 */
public class Word {
    private final String text;
    private boolean partial;

    /**
     * @param word the word to be used
     */
    public Word(final String word) {
        this(word, false);
    }

    /**
     * @param text the word
     * @param partial true if should be used in conjunction with the next strong
     */
    public Word(final String text, final boolean partial) {
        this.text = text;
        this.partial = partial;
    }

    /**
     * @return the text
     */
    public String getText() {
        return this.text;
    }

    /**
     * @return the partial
     */
    public boolean isPartial() {
        return this.partial;
    }

    /**
     * @param partial the partial to set
     */
    public void setPartial(final boolean partial) {
        this.partial = partial;
    }
}
