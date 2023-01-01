package com.tyndalehouse.step.core.xsl;

/**
 * the Interface that a Mutli interlinear provider shall abide to
 * 
 * @author chrisburrell
 * 
 */
public interface MultiInterlinearProvider {
    /**
     * This is the more specific method
     * 
     * @param version the version requested
     * @param verseNumber helps locate the word by adding location awareness
     * @param strong identifies the word by its root in the original language
     * @param morph identifies the morphology of the word (i.e. the grammar)
     * @return the word in the original language (Greek, Hebrew, etc.)
     */
    String getWord(String version, String verseNumber, String strong, String morph);

    /**
     * Returns a boolean indicating whether the version is disabled
     */
    boolean isDisabled(String version);
}
