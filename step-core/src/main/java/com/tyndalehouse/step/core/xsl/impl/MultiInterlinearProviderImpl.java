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
package com.tyndalehouse.step.core.xsl.impl;

import java.util.HashMap;
import java.util.Map;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.xsl.InterlinearProvider;
import com.tyndalehouse.step.core.xsl.MultiInterlinearProvider;

import static com.tyndalehouse.step.core.utils.StringUtils.*;

/**
 * This implementation will support multiple versions, so each of the methods is keyed by version requested.
 *
 * @author chrisburrell
 */
public class MultiInterlinearProviderImpl implements MultiInterlinearProvider {
    private static final Logger LOGGER = LoggerFactory.getLogger(MultiInterlinearProviderImpl.class);

    /**
     * The interlinear providers.
     */
    private final Map<String, InterlinearProvider> interlinearProviders = new HashMap<String, InterlinearProvider>();

    /**
     * we separate by commas and spaces.
     */
    static final String VERSION_SEPARATOR = ", ?";

    private final JSwordVersificationService versificationService;
    private String lastSeenOsisId;

    /**
     * sets up the interlinear provider with the correct version and text scope.
     *
     * @param versions             the versions to use to set up the interlinear
     * @param textScope            the reference, or passage range that should be considered when setting up the
     *                             interlinear provider
     * @param versificationService the service for working with a book
     * @param vocabProvider        the provider of vocabulary
     */
    public MultiInterlinearProviderImpl(final Versification masterVersification, String versions, final String textScope,
                                        final JSwordVersificationService versificationService, final VocabularyService vocabProvider) {
        this.versificationService = versificationService;

        // first check whether the values passed in are correct
        if (areAnyBlank(versions, textScope)) {
            return;
        }


        try {
            final Map<String, String> hebrewDirectMapping = initHebrewDirectMapping();
            final Map<String, String> hebrewIndirectMappings = initHebrewIndirectMappings();
            final String[] differentVersions = split(versions, VERSION_SEPARATOR);

            Key versifiedKey = PassageKeyFactory.instance().getKey(masterVersification, textScope);

            for (final String version : differentVersions) {
                if (isNotBlank(version)) {
                    final String normalisedVersion = version.trim();
                    this.interlinearProviders.put(normalisedVersion, new InterlinearProviderImpl(masterVersification,
                            versificationService, normalisedVersion, versifiedKey, hebrewDirectMapping,
                            hebrewIndirectMappings, vocabProvider));
                }
            }
            // CHECKSTYLE:OFF
            // called by an XSLT so need to trap error and log, then throw up perhaps
        } catch (final Exception ex) {
            // CHECKSTYLE:ON
            LOGGER.error(ex.getMessage(), ex);
            throw new StepInternalException(ex.getMessage(), ex);
        }

    }

    /**
     * Inits the hebrew indirect mappings. These are used if no link is found.
     *
     * @return the mapping between the strong numbers and their corresponding English.
     */
    private Map<String, String> initHebrewIndirectMappings() {
        final Map<String, String> hebrewLexicon = new HashMap<String, String>(9);
        hebrewLexicon.put("1961", "#to be");
        hebrewLexicon.put("3588", "#that");
        hebrewLexicon.put("996", "#between");
        hebrewLexicon.put("413", "#to");
        hebrewLexicon.put("834", "#that");
        hebrewLexicon.put("3605", "#all");
        hebrewLexicon.put("3606", "#all");
        hebrewLexicon.put("5921", "#on");
        hebrewLexicon.put("4480", "#from");
        hebrewLexicon.put("3651", "#thus");
        return hebrewLexicon;
    }

    /**
     * Inits the hebrew direct mapping. The override, regardless of whether the interlineared text contains a
     * mapping
     *
     * @return the mappings between strong numbers and the words that should appear
     */
    private Map<String, String> initHebrewDirectMapping() {
        final Map<String, String> blackList = new HashMap<String, String>(2);
        blackList.put("853", "#the");
        blackList.put("854", "#the");
        return blackList;
    }

    @Override
    public String getWord(final String version, final String verseNumber, final String strong,
                          final String morph) {
        return this.interlinearProviders.get(version).getWord(isBlank(verseNumber) ? lastSeenOsisId : verseNumber, strong, morph);
    }

    /**
     * @param lastSeenOsisId the last seen osis ID, mainly used for out of verse elements
     */
    public void setLastSeenOsisId(String lastSeenOsisId) {
        this.lastSeenOsisId = lastSeenOsisId;
    }
}
