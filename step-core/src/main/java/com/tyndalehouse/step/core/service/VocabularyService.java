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
package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.models.VocabResponse;

/**
 * The service providing morphology information
 * 
 * @author chrisburrell
 * 
 */
public interface VocabularyService {
    /**
     *
     * @param version
     * @param vocabIdentifiers the identifier of the vocab entry (e.g. strong:G0001)
     * @return the lexicon definitions
     */
    VocabResponse getDefinitions(final String version, String reference, String vocabIdentifiers, String userLanguage);

    /**
     * Gets the default transliteration as a string
     * 
     *
     * @param version
     * @param vocabIdentifiers the vocab identifiers
     * @param reference the reference in which the strongs can be found
     * @return the string to be displayed
     */
    String getDefaultTransliteration(final String version, String vocabIdentifiers, final String reference);

    /**
     * For a given version, we transliterate the top line
     * @param originalText the original text
     * @return the transliterated text
     */
    String getTransliteration(String originalText);

    /**
     * gets the English vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String getEnglishVocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * gets the Spanish vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String get_es_Vocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * gets the traditional Chinese vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String get_zh_tw_Vocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * gets the simplified Chinese vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String get_zh_Vocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * Gets the Greek vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String getGreekVocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * Gets quick information about the particular identifiers
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the identifier
     * @return the quick information
     */
    VocabResponse getQuickDefinitions(final String version, final String reference, String vocabIdentifiers, String userLanguage);

    /**
     * returns the lexicon definitions
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the identifier
     * @return the lexicon definitions that were found
     */
    EntityDoc[] getLexiconDefinitions(String vocabIdentifiers, String version, String reference);
}
