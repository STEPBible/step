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

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.inject.Named;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.models.stats.StatType;
import com.tyndalehouse.step.core.models.search.ExpandableSubjectHeadingEntry;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.AnalysisService;
import com.tyndalehouse.step.core.service.LexiconDefinitionService;
import com.tyndalehouse.step.core.service.jsword.JSwordAnalysisService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordAnalysisServiceImpl;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.Verse;

/**
 * A service able to retrieve various kinds of statistics, delegates to {@link JSwordAnalysisServiceImpl} for
 * some operations.
 *
 * @author chrisburrell
 */
public class AnalysisServiceImpl implements AnalysisService {
    public static final String OSIS_CHAPTER_STARTS_WITH = ".* ";
    public static final Pattern CLEAN_UP_DIGITS = Pattern.compile("[0-9]+\\.?\\w?");
    private final Set<String> stopSubjects;
    private int maxWords;
    private final SubjectSearchService subjects;
    private final LexiconDefinitionService definitions;
    private JSwordPassageService jSwordPassageService;
    private final JSwordAnalysisService jswordAnalysis;

    /**
     * Creates a service able to retrieve various stats.
     *
     * @param jswordAnalysis the jsword analysis
     * @param subjects       the subjects
     * @param definitions    the definitions
     */
    @Inject
    public AnalysisServiceImpl(final JSwordAnalysisServiceImpl jswordAnalysis,
                               @Named("analysis.maxWords") int maxWords,
                               @Named("analysis.stopSubjects") String stopSubjects,
                               final SubjectSearchService subjects,
                               final LexiconDefinitionService definitions,
                               JSwordPassageService jSwordPassageService) {
        this.jswordAnalysis = jswordAnalysis;
        this.maxWords = maxWords;
        this.subjects = subjects;
        this.definitions = definitions;
        this.jSwordPassageService = jSwordPassageService;
        this.stopSubjects = StringUtils.createSet(stopSubjects);
    }

    @Override
    public CombinedPassageStats getStatsForPassage(
            final String version, final String reference,
            final StatType statType, final ScopeType scopeType, boolean nextChapter, final String userLanguage) {
        
        
        final String keyResolutionVersion = statType == StatType.TEXT ? version : JSwordPassageService.REFERENCE_BOOK;
        final KeyWrapper centralReference = nextChapter ? 
                jSwordPassageService.getSiblingChapter(reference, keyResolutionVersion , false): 
                jSwordPassageService.getKeyInfo(reference, keyResolutionVersion, keyResolutionVersion);
        
        final CombinedPassageStats statsForPassage = new CombinedPassageStats();
        PassageStat stat;
        switch (statType) {
            case WORD:
                stat = this.jswordAnalysis.getWordStats(centralReference.getKey(), scopeType);
                stat.trim(maxWords);
                statsForPassage.setLexiconWords(convertWordStatsToDefinitions(stat, userLanguage));
                break;
            case TEXT:
                stat = this.jswordAnalysis.getTextStats(version, centralReference.getKey(), scopeType);
                stat.trim(maxWords);
                break;
            case SUBJECT:
                stat = getSubjectStats(version, centralReference.getName(), scopeType);
                stat.trim(maxWords);
                break;
            default:
                throw new StepInternalException("Unsupported type of stat asked for.");
        }
        stat.setReference(centralReference);
        statsForPassage.setPassageStat(stat);
        return statsForPassage;
    }

    /**
     * Converts the stats from numbers to their equivalent definition
     *
     * @param passageStat the retrieved strongs
     * @return the set of lexical entries associated with these keys
     */
    private Map<String, LexiconSuggestion> convertWordStatsToDefinitions(final PassageStat passageStat, final String userLanguage) {
        final Map<String, LexiconSuggestion> lexiconEntries =
                this.definitions.lookup(passageStat.getStats().keySet(), userLanguage);
        return lexiconEntries;
    }

    /**
     * Subject stats.
     *
     * @param version   the version
     * @param reference the reference
     * @param scopeType
     * @return the passage stat
     */
    private PassageStat getSubjectStats(final String version, final String reference, final ScopeType scopeType) {
        final SearchResult subjectResults = this.subjects.searchByReference(getReferenceSyntax(reference, version, scopeType));
        final PassageStat stat = new PassageStat();
        
        //we duplicate the set here because we'd like to keep the casing...
        final List<SearchEntry> results = subjectResults.getResults();
        for (final SearchEntry entry : results) {
            if (entry instanceof ExpandableSubjectHeadingEntry) {
                final ExpandableSubjectHeadingEntry subjectEntry = (ExpandableSubjectHeadingEntry) entry;

                //we will first do the subheading because ideally we want that 'case' to be the master case,
                //i.e. David rather than DAVID
                final String subjectHeading = subjectEntry.getHeading();
                if (subjectHeading != null && !stopSubjects.contains(subjectHeading.toUpperCase())) {
                    stat.addWordTryCases(CLEAN_UP_DIGITS.matcher(subjectHeading).replaceAll(""));
                }
                
                final String root = subjectEntry.getRoot();
                if (root != null && !stopSubjects.contains(root.toUpperCase())) {
                    stat.addWordTryCases(CLEAN_UP_DIGITS.matcher(root).replaceAll(root));
                }
                
            }
        }
        return stat;
    }


    /**
     * Creates a lucene query to allow search for multiple chapters/entire books, without generating
     * thousands of boolean queries, because we're expanding a book into all its verses!
     *
     * @param version   the version in which look up the key
     * @param scopeType the scope type
     */

    private String getReferenceSyntax(final String reference, final String version, final ScopeType scopeType) {
        final KeyWrapper key = this.jSwordPassageService.getKeyInfo(reference, version, version);
        final Key total = key.getKey();

        StringBuilder sb = new StringBuilder(32);


        switch (scopeType) {
            case PASSAGE:
            case CHAPTER:
            case NEAR_BY_CHAPTER:
                //expand all the chapters....
                int minChapter = -1;
                int maxChapter = -1;
                Verse firstVerse = null;
                Verse lastVerse;

                //need to expand between chapters....
                final Iterator<Key> iterator = total.iterator();
                Verse v = null;
                while (iterator.hasNext()) {
                    final Key next = iterator.next();
                    if (next instanceof Verse) {
                        v = (Verse) next;
                        if (minChapter == -1) {
                            minChapter = v.getChapter();
                            firstVerse = v;
                        }

                        int currentChapter = v.getChapter();
                        if (currentChapter != maxChapter) {
                            sb.append(v.getBook().getOSIS());
                            sb.append('.');
                            sb.append(v.getChapter());
                            sb.append(".* ");
                        }
                        maxChapter = v.getChapter();
                    }
                }
                lastVerse = v;

                //need to add +1 and -1
                if (scopeType == ScopeType.NEAR_BY_CHAPTER) {
                    sb.append(firstVerse.getBook().getOSIS());
                    sb.append('.');
                    sb.append(minChapter - 1);
                    sb.append(".* ");

                    sb.append(lastVerse.getBook().getOSIS());
                    sb.append('.');
                    sb.append(minChapter - 1);
                    sb.append(".* ");
                }
                break;
            case BOOK:
                Key k = key.getKey().get(0);
                if (k instanceof Verse) {
                    sb.append(((Verse) k).getBook().getOSIS());
                    sb.append(OSIS_CHAPTER_STARTS_WITH);
                }
                break;
            default:
                throw new StepInternalException("Unsupported option.");
        }

        return sb.toString();
    }

}
