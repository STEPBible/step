package com.tyndalehouse.step.core.models.stats;

import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.utils.StringUtils;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class PassageStat {
    private Map<String, Integer[]> stats = new HashMap<String, Integer[]>(128);
    private KeyWrapper reference;

    /**
     * Adds the word to the current stats
     * 
     * @param word the word
     */
    public void addWord(final String word) {
        Integer[] counts = this.stats.get(word);
        if (counts == null) {
            counts = new Integer[]{0, 0, 0};
        }
        counts[0] ++;
        this.stats.put(word, counts);
    }

    /**
     * Tries various cases before adding a word
     * @param word the root word that we want to add
     */
    public void addWordTryCases(final String word) {
        String key = word;
        Integer[] counts = this.stats.get(word);
        if(counts == null) {
            //try upper case
            key = word.toUpperCase();
            counts = this.stats.get(key);
            if(counts == null) {
                //try lower case
                key = word.toLowerCase();
                counts = this.stats.get(key);
                if(counts == null) {
                    //try all title case
                    key = StringUtils.toTitleCase(word, true);
                    counts = this.stats.get(key);
                    if(counts == null) {
                        key = StringUtils.toTitleCase(word, false);
                        counts = this.stats.get(key);
                    }
                }
            }
        }
        
        if(counts == null) {
            //didn't find it anywhere in the list, so if the word is all upper case, we'll favour the title case version
            counts = new Integer[]{0, 0, 0};
        }
        //key ends up being one of the chain of ifs above in priority order. 
        counts[0] ++;
        this.stats.put(key, counts);
    }

    /**
     * Trims from the bottom up, leaving the more frequent words there until we have < maxWords
     */
    public void trim(int maxWords, boolean mostOccurrences) {
        int startOccurrences = 1;
        if (!mostOccurrences) {
            final Iterator<Map.Entry<String, Integer[]>> iterator = this.stats.entrySet().iterator();
            while (iterator.hasNext()) {
                final Map.Entry<String, Integer[]> next = iterator.next();
                if (next.getValue()[0] > startOccurrences) startOccurrences = next.getValue()[0];
            }
        }
        trimWords(maxWords, startOccurrences, mostOccurrences);
    }

    /**
     * @param maxWords the number of words to keep
     * @param trimOutOccurrences the number for which we won't keep
     */
    private void trimWords(final int maxWords, int trimOutOccurrences, final boolean mostOccurrences) {
        while (this.stats.size() > maxWords) {
            if (this.stats.size() <= maxWords) {
                return;
            }
            if ((!mostOccurrences) && (trimOutOccurrences == 1)) return;

            final Iterator<Map.Entry<String, Integer[]>> iterator = this.stats.entrySet().iterator();
            while (iterator.hasNext()) {
                final Map.Entry<String, Integer[]> next = iterator.next();
                if (next.getValue()[0] == trimOutOccurrences) {
                    iterator.remove();
                }
            }
            trimOutOccurrences = (mostOccurrences) ? trimOutOccurrences + 1 : trimOutOccurrences - 1;
        }
    }

    /**
     * @return the stats
     */
    public Map<String, Integer[]> getStats() {
        return this.stats;
    }

    /**
     * @param stats the new stats
     */
    public void setStats(final Map<String, Integer[]> stats) {
        this.stats = stats;
    }

    /**
     * @return the reference for this particular stat
     */
    public KeyWrapper getReference() {
        return reference;
    }

    /**
     * @param reference the reference for this particular stat
     */
    public void setReference(final KeyWrapper reference) {
        this.reference = reference;
    }
}
