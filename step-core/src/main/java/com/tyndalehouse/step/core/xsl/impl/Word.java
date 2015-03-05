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
    private final String untaggedText;

    /**
     * @param word the word to be used
     */
    public Word(final String word, final String untaggedText) {
        this(word, false, untaggedText);
    }

    /**
     * @param text the word
     * @param partial true if should be used in conjunction with the next strong
     */
    public Word(final String text, final boolean partial, final String untaggedText) {
        this.text = text;
        this.partial = partial;
        this.untaggedText = untaggedText;
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

    public String getUntaggedText() {
        return untaggedText;
    }
}
