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
package com.tyndalehouse.step.rest.controllers;

import javax.inject.Inject;

import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.models.stats.StatType;
import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;
import com.tyndalehouse.step.core.service.AnalysisService;
import com.yammer.metrics.annotation.Timed;

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
    public CombinedPassageStats analyseStats(final String version, final String reference, final String statType, final String scope, String considerNextChapter, String userLanguage) {
        return this.analysis.getStatsForPassage(version, reference, StatType.valueOf(statType), ScopeType.valueOf(scope), Boolean.parseBoolean(considerNextChapter), userLanguage);
    }
}
