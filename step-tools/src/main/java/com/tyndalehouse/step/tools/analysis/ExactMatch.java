//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.analysis;

/**
 * when the word in question is found in exactly the same number of verses and exactly the same verses as in
 * the original greek word
 */
public class ExactMatch {
    int numVersesForStrong;
    int numberVersesMatch;
    int numExtraVerses;

    AnalyzedWord word;
    String explanation;
    String strongNumber;
    String sourceWord;
}
