package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;
import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.models.stats.StatType;
import com.tyndalehouse.step.core.service.AnalysisService;
import com.yammer.metrics.annotation.Timed;

import javax.inject.Inject;
import java.util.concurrent.TimeUnit;

/**
 * Exposes various analytical tools
 */
public class AnalysisController {
    private final AnalysisService analysis;

    /**
     * Instantiates a new analysis controller.
     *
     * @param analysis the analysis
     */
    @Inject
    public AnalysisController(final AnalysisService analysis) {
        this.analysis = analysis;
    }

    /**
     * Analyse stats for a given passage in a given book, obtaining the word, subject and strong stats from
     * them.
     *
     * @param version             the version
     * @param reference           the reference
     * @param statType            WORD, SUBJECT or TEXT
     * @param scope               the scope of the passage, or a particular reference to override the passage that is viewed
     * @param considerNextChapter true to indicate we're interested in the next chapter
     * @return the combined passage stats
     */
    @Timed(name = "word-cloud", group = "analysis", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public CombinedPassageStats analyseStats(final String version, final String reference, final String statType, final String scope, final String considerNextChapter, final String userLanguage, final String mostOccurrences) {
        return this.analysis.getStatsForPassage(version, reference, StatType.valueOf(statType), ScopeType.valueOf(scope), Boolean.parseBoolean(considerNextChapter), userLanguage, Boolean.parseBoolean(mostOccurrences));
    }
}
