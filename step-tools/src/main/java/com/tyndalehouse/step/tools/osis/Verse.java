package com.tyndalehouse.step.tools.osis;

/**
 * Verse image info
 */
public class Verse {
    private final String ref;
    private final int starts;

    /**
     * @param ref
     * @param starts
     */
    public Verse(final String ref, final int starts) {
        this.ref = ref;
        this.starts = starts;
    }

    /**
     * @return the ref
     */
    public String getRef() {
        return this.ref;
    }

    /**
     * @return the starts
     */
    public int getStarts() {
        return this.starts;
    }
}
