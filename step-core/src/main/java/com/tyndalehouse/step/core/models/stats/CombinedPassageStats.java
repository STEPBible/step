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

import java.util.Iterator;
import java.util.Map;

/**
 * Combined passage stats has stats based on word occurrences, subjects as well as strong numbers.
 */
public class CombinedPassageStats {
    private PassageStat wordStat;
    private PassageStat strongsStat;
    private PassageStat subjectStat;

    /**
     * @return the wordStat
     */
    public PassageStat getWordStat() {
        return this.wordStat;
    }

    /**
     * @param wordStat the wordStat to set
     */
    public void setWordStat(final PassageStat wordStat) {
        this.wordStat = wordStat;
    }

    /**
     * @return the strongsStat
     */
    public PassageStat getStrongsStat() {
        return this.strongsStat;
    }

    /**
     * @param strongsStat the strongsStat to set
     */
    public void setStrongsStat(final PassageStat strongsStat) {
        this.strongsStat = strongsStat;
    }

    /**
     * @return the subjectStat
     */
    public PassageStat getSubjectStat() {
        return this.subjectStat;
    }

    /**
     * @param subjectStat the subjectStat to set
     */
    public void setSubjectStat(final PassageStat subjectStat) {
        this.subjectStat = subjectStat;
    }

    public void trim() {
        trim(this.wordStat);
        trim(this.strongsStat);
        trim(this.subjectStat);
    }

    /**
     * Trims any result with just 1 occurence out of the equation
     * @param wordStat
     */
    private void trim(final PassageStat wordStat) {
        final Map<String,Integer> stats = wordStat.getStats();

        final Iterator<Map.Entry<String,Integer>> iterator = stats.entrySet().iterator();
        while(iterator.hasNext()) {
            final Map.Entry<String, Integer> next = iterator.next();
            if(next.getValue() == 1) {
                iterator.remove();
            }
        }
    }
}
