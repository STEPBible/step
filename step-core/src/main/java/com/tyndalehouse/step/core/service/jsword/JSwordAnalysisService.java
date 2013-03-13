package com.tyndalehouse.step.core.service.jsword;

import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;

/**
 * Defines an interface for obtaining various stats on a passage.
 * 
 * @author chrisburrell
 * 
 */
public interface JSwordAnalysisService {

    /**
     * Obtains stats for a particular versions, word stats, strong stats
     * 
     * @param version the version
     * @param reference the reference
     * @return the all stats
     */
    CombinedPassageStats getStatsForPassage(String version, String reference);
}
