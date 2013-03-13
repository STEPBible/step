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
package com.tyndalehouse.step.core.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.ExpandableSubjectHeadingEntry;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.AnalysisService;
import com.tyndalehouse.step.core.service.LexiconDefinitionService;
import com.tyndalehouse.step.core.service.jsword.JSwordAnalysisService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordAnalysisServiceImpl;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;

/**
 * A service able to retrieve various kinds of statistics, delegates to {@link JSwordAnalysisServiceImpl} for
 * some operations.
 * 
 * @author chrisburrell
 * 
 */
public class AnalysisServiceImpl implements AnalysisService {
    private final SubjectSearchService subjects;
    private LexiconDefinitionService definitions;
    private final JSwordAnalysisService jswordAnalysis;

    /**
     * Creates a service able to retrieve various stats.
     * 
     * @param jswordAnalysis the jsword analysis
     * @param subjects the subjects
     */
    @Inject
    public AnalysisServiceImpl(final JSwordAnalysisServiceImpl jswordAnalysis,
            final SubjectSearchService subjects, LexiconDefinitionService definitions) {
        this.jswordAnalysis = jswordAnalysis;
        this.subjects = subjects;
        this.definitions = definitions;
    }

    @Override
    public CombinedPassageStats getStatsForPassage(final String version, final String reference) {
        final CombinedPassageStats statsForPassage = this.jswordAnalysis.getStatsForPassage(version,
                reference);
        statsForPassage.setSubjectStat(getSubjectStats(version, reference));

        statsForPassage.trim();

        convertWordStatsToDefinitions(statsForPassage);

        return statsForPassage;
    }

    /**
     * Converts the stats from numbers to their equivalent definition
     * @param statsForPassage the stats currently held for a particular passage.
     */
    private void convertWordStatsToDefinitions(final CombinedPassageStats statsForPassage) {
        final PassageStat strongsStat = statsForPassage.getStrongsStat();
        final Map<String,Integer> stats = strongsStat.getStats();
        final Map<String, Integer> newStats = new HashMap<String, Integer>();

        Map<String, LexiconSuggestion> lexiconEntries = definitions.lookup(stats.keySet());
        for (Map.Entry<String, Integer> entry : stats.entrySet()) {
            final LexiconSuggestion lexiconSuggestion = lexiconEntries.get(entry.getKey());
            newStats.put(String.format("%s (%s)", lexiconSuggestion.getGloss(), lexiconSuggestion.getMatchingForm()), entry.getValue());
        }

        strongsStat.setStats(newStats);

    }

    /**
     * Subject stats.
     * 
     * @param version the version
     * @param reference the reference
     * @return the passage stat
     */
    private PassageStat getSubjectStats(final String version, final String reference) {
        final SearchResult subjectResults = this.subjects.searchByMultipleReferences(version, reference);

        final PassageStat stat = new PassageStat();
        final List<SearchEntry> results = subjectResults.getResults();
        for (final SearchEntry entry : results) {
            if (entry instanceof ExpandableSubjectHeadingEntry) {
                final ExpandableSubjectHeadingEntry subjectEntry = (ExpandableSubjectHeadingEntry) entry;

                stat.addWord(subjectEntry.getRoot());
                stat.addWord(subjectEntry.getHeading());
            }
        }
        return stat;
    }

}
