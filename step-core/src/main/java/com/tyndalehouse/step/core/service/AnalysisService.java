package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.models.stats.StatType;
import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;

/**
 * Defines an interface for obtaining various stats on a passage.
 *
 * @author chrisburrell
 */
public interface AnalysisService {

    /**
     * Obtains stats for a particular versions, word stats, strong stats and subject stats
     *
     * @param version     the version
     * @param reference   the reference
     * @param statType    the type of analysis that we will do
     * @param scopeType   restricts to a particular chapter/1 chapter either side/book
     * @param nextChapter perform analysis on next chapter, not this one
     * @return the all stats
     */
    CombinedPassageStats getStatsForPassage(String version, String reference, final StatType statType, final ScopeType scopeType, boolean nextChapter, final String userLanguage, boolean mostOccurrences);

}
