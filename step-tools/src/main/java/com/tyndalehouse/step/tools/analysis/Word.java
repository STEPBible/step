package com.tyndalehouse.step.tools.analysis;

public class Word {
    String word;
    int position;
    String strongNumber;
    String verse;

    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        return "Word [word=" + this.word + ", position=" + this.position + ", strongNumber="
                + this.strongNumber + ", verse=" + this.verse + "]";
    }

}
