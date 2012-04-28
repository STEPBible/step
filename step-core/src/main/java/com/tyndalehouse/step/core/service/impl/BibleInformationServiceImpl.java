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
import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Command handler returning all available bible versions
 * 
 * @author CJBurrell
 */
@Singleton
public class BibleInformationServiceImpl implements BibleInformationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleInformationServiceImpl.class);
    private final List<String> defaultVersions;
    private final JSwordService jsword;

    /**
     * The bible information service, retrieving content and meta data
     * 
     * @param defaultVersions a list of the default versions that should be installed
     * @param jsword the jsword service
     */
    @Inject
    public BibleInformationServiceImpl(@Named("defaultVersions") final List<String> defaultVersions,
            final JSwordService jsword) {
        this.jsword = jsword;
        this.defaultVersions = defaultVersions;
    }

    @Override
    public List<BibleVersion> getAvailableBibleVersions(final boolean allVersions, final String locale) {
        LOGGER.info("Getting bible versions with locale [{}] and allVersions=[{}]", locale, allVersions);
        return getSortedSerialisableList(this.jsword.getInstalledModules(allVersions, locale,
                BookCategory.BIBLE));
    }

    @Override
    public OsisWrapper getPassageText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion) {
        return this.jsword.getOsisText(version, reference, options, interlinearVersion);
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
        final List<LookupOption> features = this.jsword.getFeatures(version);
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
            if (!this.jsword.isInstalled(version)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void installDefaultModules() {
        // we install the module for every core module in the list
        for (final String book : this.defaultVersions) {
            this.jsword.installBook(book);
        }
    }

    @Override
    public void installModules(final String reference) {
        this.jsword.installBook(reference);
    }

    @Override
    public List<String> getBibleBookNames(final String bookStart, final String version) {
        return this.jsword.getBibleBookNames(bookStart, version);
    }

}
