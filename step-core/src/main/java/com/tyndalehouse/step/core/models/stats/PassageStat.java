/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.models.stats;

import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.utils.StringUtils;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * @author chrisburrell
 */
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
//        mostOccurrences = false; // Temporary set to true.  Waiting for David's response PT 09/14/2020
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
