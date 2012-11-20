//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.analysis;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class AnalyzedWord {
    String word;
    Set<String> verses = new HashSet<String>();
    int totalCount;
    int occurencesInDifferentVerses = 0;
    Map<String, List<Integer>> versesToPositions = new HashMap<String, List<Integer>>();
    Map<String, List<String>> versesToStrongNumbers = new HashMap<String, List<String>>();

    String markedStrongNumber;
    // words for this strong number
    List<Word> words = new ArrayList<Word>();

    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        return "AnalyzedWord [markedStrongNumber= " + this.markedStrongNumber + ", word=" + this.word
                + ", verses=" + this.verses.size() + ", totalCount=" + this.totalCount
                + ", occurencesInDifferentVerses=" + this.occurencesInDifferentVerses + "]";
    }

}
