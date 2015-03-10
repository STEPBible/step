package com.tyndalehouse.step.tools.esv.deprecated;

class Word {
    private final String w;
    private final String s;

    public Word(final String w, final String s) {
        this.w = w;
        this.s = s;
    }

    public Word(final String w) {
        this(w, null);
    }

    public String getW() {
        return this.w;
    }

    public String getS() {
        return this.s;
    }
}