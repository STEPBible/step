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

import static com.tyndalehouse.step.core.utils.StringUtils.areAnyBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.util.HashMap;
import java.util.Map;

import com.tyndalehouse.step.core.xsl.InterlinearProvider;
import com.tyndalehouse.step.core.xsl.MultiInterlinearProvider;

/**
 * This implementation will support multiple versions, so each of the methods is keyed by version requested.
 * 
 * @author chrisburrell
 * 
 */
public class MultiInterlinearProviderImpl implements MultiInterlinearProvider {

    /** we separate by commas and spaces. */
    static final String VERSION_SEPARATOR = ", ?";

    /** The interlinear providers. */
    private final Map<String, InterlinearProvider> interlinearProviders = new HashMap<String, InterlinearProvider>();

    /**
     * sets up the interlinear provider with the correct version and text scope.
     * 
     * @param versions the versions to use to set up the interlinear
     * @param textScope the reference, or passage range that should be considered when setting up the
     *            interlinear provider
     */
    public MultiInterlinearProviderImpl(final String versions, final String textScope) {
        // first check whether the values passed in are correct
        if (areAnyBlank(versions, textScope)) {
            return;
        }

        final Map<String, String> hebrewDirectMapping = initHebrewDirectMapping();
        final Map<String, String> hebrewIndirectMappings = initHebrewIndirectMappings();
        final String[] differentVersions = split(versions, VERSION_SEPARATOR);
        if (differentVersions != null) {
            for (final String version : differentVersions) {
                if (isNotBlank(version)) {
                    final String normalisedVersion = version.trim();
                    this.interlinearProviders.put(normalisedVersion, new InterlinearProviderImpl(
                            normalisedVersion, textScope, hebrewDirectMapping, hebrewIndirectMappings));
                }
            }
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

    /*
     * (non-Javadoc)
     * 
     * @see com.tyndalehouse.step.core.xsl.MultiInterlinearProvider#getWord(java.lang.String,
     * java.lang.String, java.lang.String, java.lang.String)
     */
    @Override
    public String getWord(final String version, final String verseNumber, final String strong,
            final String morph) {
        return this.interlinearProviders.get(version).getWord(verseNumber, strong, morph);
    }
}
