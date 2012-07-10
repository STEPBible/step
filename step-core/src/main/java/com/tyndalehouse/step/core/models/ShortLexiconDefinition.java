package com.tyndalehouse.step.core.models;

/**
 * A very short lexicon definition
 * 
 * @author chrisburrell
 * 
 */
public class ShortLexiconDefinition {
    private String code;
    private String word;

    /**
     * for serialisation
     */
    public ShortLexiconDefinition() {
        // no op
    }

    /**
     * @param code the code of the word
     * @param word the word itself
     */
    public ShortLexiconDefinition(final String code, final String word) {
        this.code = code;
        this.word = word;
    }

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
     * @return the word
     */
    public String getWord() {
        return this.word;
    }

    /**
     * @param word the word to set
     */
    public void setWord(final String word) {
        this.word = word;
    }

}
