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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * @author chrisburrell
 */
public class PassageStat {
    private Map<String, Integer> stats = new HashMap<String, Integer>(128);

    /**
     * Adds the word to the current stats
     * 
     * @param word the word
     */
    public void addWord(final String word) {
        Integer counts = this.stats.get(word);
        if (counts == null) {
            counts = 0;
        }

        this.stats.put(word, counts + 1);
    }

    /**
     * Trims any result with just 1 occurrence out of the equation
     */
    public void trim() {
        final Iterator<Map.Entry<String, Integer>> iterator = this.stats.entrySet().iterator();
        while (iterator.hasNext()) {
            final Map.Entry<String, Integer> next = iterator.next();
            if (next.getValue() == 1) {
                iterator.remove();
            }
        }
    }

    /**
     * @return the stats
     */
    public Map<String, Integer> getStats() {
        return this.stats;
    }

    /**
     * @param stats the new stats
     */
    public void setStats(final Map<String, Integer> stats) {
        this.stats = stats;
    }

}
