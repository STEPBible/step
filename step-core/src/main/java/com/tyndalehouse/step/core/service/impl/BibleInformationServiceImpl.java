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

import static com.tyndalehouse.step.core.models.LookupOption.INTERLINEAR;
import static com.tyndalehouse.step.core.models.LookupOption.STRONG_NUMBERS;
import static com.tyndalehouse.step.core.utils.JSwordUtils.getSortedSerialisableList;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Command handler returning all available bible versions
 * 
 * @author CJBurrell
 */
@Singleton
public class BibleInformationServiceImpl implements BibleInformationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleInformationServiceImpl.class);
    private final List<String> defaultVersions;
    private final JSwordPassageService jswordPassage;
    private final JSwordModuleService jswordModule;
    private final JSwordMetadataService jswordMetadata;

    /**
     * The bible information service, retrieving content and meta data
     * 
     * @param defaultVersions a list of the default versions that should be installed
     * @param jswordPassage the jsword service
     * @param jswordModule provides information and handles information relating to module installation, etc.
     * @param jswordMetadata provides metadata on jsword modules
     * 
     */
    @Inject
    public BibleInformationServiceImpl(@Named("defaultVersions") final List<String> defaultVersions,
            final JSwordPassageService jswordPassage, final JSwordModuleService jswordModule,
            final JSwordMetadataService jswordMetadata) {
        this.jswordPassage = jswordPassage;
        this.defaultVersions = defaultVersions;
        this.jswordModule = jswordModule;
        this.jswordMetadata = jswordMetadata;
    }

    @Override
    public List<BibleVersion> getAvailableBibleVersions(final boolean allVersions, final String locale) {
        LOGGER.info("Getting bible versions with locale [{}] and allVersions=[{}]", locale, allVersions);
        return getSortedSerialisableList(this.jswordModule.getInstalledModules(allVersions, locale,
                BookCategory.BIBLE));
    }

    @Override
    public OsisWrapper getPassageText(final String version, final int startVerseId, final int endVerseId,
            final List<LookupOption> options, final String interlinearVersion, final Boolean roundUp) {
        return this.jswordPassage.getOsisTextByVerseNumbers(version, version, startVerseId, endVerseId,
                options, interlinearVersion, roundUp, false);
    }

    @Override
    public OsisWrapper getPassageText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion) {
        return this.jswordPassage.getOsisText(version, reference, options, interlinearVersion);
    }

    @Override
    public List<EnrichedLookupOption> getAllFeatures() {
        final LookupOption[] lo = LookupOption.values();
        final List<EnrichedLookupOption> elo = new ArrayList<EnrichedLookupOption>(lo.length + 1);

        for (int ii = 0; ii < lo.length; ii++) {
            final String displayName = lo[ii].name();
            if (isNotBlank(displayName)) {
                elo.add(new EnrichedLookupOption(displayName, lo[ii].toString(), lo[ii].isEnabledByDefault()));
            }
        }

        return elo;
    }

    @Override
    public List<LookupOption> getFeaturesForVersion(final String version) {
        final List<LookupOption> features = this.jswordMetadata.getFeatures(version);
        if (features.contains(STRONG_NUMBERS)) {
            features.add(INTERLINEAR);
        }

        if (features.contains(LookupOption.MORPHOLOGY)) {
            features.add(LookupOption.COLOUR_CODE);
        }

        return features;
    }

    @Override
    public boolean hasCoreModules() {
        for (final String version : this.defaultVersions) {
            if (!this.jswordModule.isInstalled(version)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void installDefaultModules() {
        // we install the module for every core module in the list
        for (final String book : this.defaultVersions) {
            this.jswordModule.installBook(book);
        }
    }

    @Override
    public void installModules(final String reference) {
        this.jswordModule.installBook(reference);
    }

    @Override
    public List<String> getBibleBookNames(final String bookStart, final String version) {
        return this.jswordMetadata.getBibleBookNames(bookStart, version);
    }

    @Override
    public String getSiblingChapter(final String reference, final String version,
            final boolean previousChapter) {
        return this.jswordPassage.getSiblingChapter(reference, version, previousChapter);
    }
}
