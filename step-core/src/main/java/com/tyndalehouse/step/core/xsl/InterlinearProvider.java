package com.tyndalehouse.step.core.xsl;

/**
 * An individual interlinear provider that cross-references text passed in using verse, strong, and morphology
 * information
 * 
 * @author Chris
 * 
 */
public interface InterlinearProvider {
    /**
     * This is the more specific method
     * 
     * @param verseNumber helps locate the word by adding location awareness
     * @param strong identifies the word by its root in the original language
     * @param morph identifies the morphology of the word (i.e. the grammar)
     * @return the word in the original language (Greek, Hebrew, etc.)
     */
    String getWord(String verseNumber, String strong, String morph);
}
