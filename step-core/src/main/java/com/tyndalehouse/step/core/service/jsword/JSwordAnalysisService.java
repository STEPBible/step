package com.tyndalehouse.step.core.service.jsword;

import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import org.crosswire.jsword.passage.Key;

/**
 * Defines an interface for obtaining various stats on a passage.
 * 
 * @author chrisburrell
 * 
 */
public interface JSwordAnalysisService {
    /**
     * Strong stats, counts by strong number.
     *
     *
     * @param reference the reference
     * @param scopeType the scope, whether chapter, near by chapters, or whole book
     * @return the passage stat
     */
    PassageStat getWordStats(Key reference, final ScopeType scopeType, final String userLanguage);
    /**
     * Gets the text stats.
     *
     *
     * @param version the version
     * @param reference the reference
     * @param scopeType the scope, whether chapter, near by chapters, or whole book
     * @return the word stats
     */
    PassageStat getTextStats(String version, Key reference, final ScopeType scopeType);
}
