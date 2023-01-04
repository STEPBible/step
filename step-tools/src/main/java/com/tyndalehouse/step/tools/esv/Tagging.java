package com.tyndalehouse.step.tools.esv;

public class Tagging {
    private String ref;
    private String originalTaggedText;
    private String nonTaggedText;
    private String taggedText;
    private String rawStrongs;
    private String strongs;
    private String grammar;

    /**
     * @return the rawStrongs
     */
    public String getRawStrongs() {
        return this.rawStrongs;
    }

    /**
     * @param rawStrongs the rawStrongs to set
     */
    public void setRawStrongs(final String rawStrongs) {
        this.rawStrongs = rawStrongs;
    }

    /**
     * @return the grammar
     */
    public String getGrammar() {
        return this.grammar;
    }

    /**
     * @param grammar the grammar to set
     */
    public void setGrammar(final String grammar) {
        this.grammar = grammar;
    }

    /**
     * @return the ref
     */
    public String getRef() {
        return this.ref;
    }

    /**
     * @param ref the ref to set
     */
    public void setRef(final String ref) {
        this.ref = ref;
    }

    /**
     * @return the nonTaggedText
     */
    public String getNonTaggedText() {
        return this.nonTaggedText;
    }

    /**
     * @param nonTaggedText the nonTaggedText to set
     */
    public void setNonTaggedText(final String nonTaggedText) {
        this.nonTaggedText = nonTaggedText;
    }

    /**
     * @return the taggedText
     */
    public String getTaggedText() {
        return this.taggedText;
    }

    /**
     * @param taggedText the taggedText to set
     */
    public void setTaggedText(final String taggedText) {
        this.taggedText = taggedText;
    }

    /**
     * @return the strongs
     */
    public String getStrongs() {
        return this.strongs;
    }

    /**
     * @param strongs the strongs to set
     */
    public void setStrongs(final String strongs) {
        this.strongs = strongs;
    }

    /**
     * @return the originalTaggedText
     */
    public String getOriginalTaggedText() {
        return this.originalTaggedText;
    }

    /**
     * @param originalTaggedText the originalTaggedText to set
     */
    public void setOriginalTaggedText(final String originalTaggedText) {
        this.originalTaggedText = originalTaggedText;
    }

    @Override
    public String toString() {
        return "Tagging [ref=" + this.ref + ", nonTaggedText=" + this.nonTaggedText + ", taggedText="
                + this.taggedText + ", strongs=" + this.strongs + ", grammar=" + this.grammar + "]";
    }
}