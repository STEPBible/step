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
package com.tyndalehouse.step.core.models;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.xsl.XslConversionType;
import org.codehaus.jackson.annotate.JsonValue;
import org.crosswire.jsword.book.FeatureType;

import java.util.HashMap;
import java.util.Map;

/**
 * Outlines a list of options available in lookup
 * <p/>
 * Used letters at last update: ACDEHLMNPRTVU_
 *
 * @author chrisburrell
 */
public enum LookupOption {
    /**
     * Showing headings
     */
    HEADINGS('H', "Headings", XslConversionType.DEFAULT, true, FeatureType.HEADINGS),
    /**
     * Showing verse numbers
     */
    VERSE_NUMBERS('V', "VNum", XslConversionType.DEFAULT, true),
    /**
     * Full verse numbers including book and verse numbers
     */
    CHAPTER_BOOK_VERSE_NUMBER(BibleInformationService.UNAVAILABLE_TO_UI, "BCVNum", XslConversionType.DEFAULT, true),
    /**
     * verses to be displayed on new line
     */
    VERSE_NEW_LINE('L', "VLine", XslConversionType.DEFAULT),
    /**
     * enabling red letter for the Words of Jesus
     */
    RED_LETTER('R', "RedLetterText", XslConversionType.DEFAULT, FeatureType.WORDS_OF_CHRIST),
    /**
     * Showing cross references
     */
    NOTES('N', "Notes", XslConversionType.DEFAULT, true, FeatureType.FOOTNOTES),

    /**
     * The cross refs.
     */
    EXTENDED_XREFS(BibleInformationService.UNAVAILABLE_TO_UI, "ExtendsXRefs", XslConversionType.DEFAULT, true),

    /**
     * English vocabulary interlinear
     */
    ENGLISH_VOCAB('E', "EnglishVocab", XslConversionType.INTERLINEAR, FeatureType.STRONGS_NUMBERS),
    /**
     * Spanish vocabulary interlinear
     */
    ES_VOCAB('B', "es_Vocab", XslConversionType.INTERLINEAR, FeatureType.STRONGS_NUMBERS),
    /**
     * Chinese vocabulary interlinear
     */
    ZH_TW_VOCAB('Z', "zh_tw_Vocab", XslConversionType.INTERLINEAR, FeatureType.STRONGS_NUMBERS),
    /**
     * Chinese vocabulary interlinear
     */
    ZH_VOCAB('S', "zh_Vocab", XslConversionType.INTERLINEAR, FeatureType.STRONGS_NUMBERS),
    /**
     * Transliteration interlinear
     */
    TRANSLITERATION('T', "Transliteration", XslConversionType.INTERLINEAR),
    /**
     * Greek vocabulary
     */
    GREEK_VOCAB('A', "GreekVocab", XslConversionType.INTERLINEAR, FeatureType.STRONGS_NUMBERS),

    /**
     * Helps the division of the Hebrew words
     */
    DIVIDE_HEBREW('D', "DivideHebrew", XslConversionType.DEFAULT),

    /**
     * Adds Greek accents
     */
    GREEK_ACCENTS('G', "GreekAccents", XslConversionType.DEFAULT),
    /**
     * Adds all Hebrew accents
     */
    HEBREW_ACCENTS('P', "HebrewAccents", XslConversionType.DEFAULT),

    /**
     * Adds Hebrew vowels from the underlying source text
     */
    HEBREW_VOWELS('U', "HebrewVowels", XslConversionType.DEFAULT),
    /**
     * Transliteration of the original master version text
     */
    TRANSLITERATE_ORIGINAL('O', "OriginalTransliteration", XslConversionType.INTERLINEAR),

    /**
     * Morphology
     */
    MORPHOLOGY('M', "Morph", XslConversionType.INTERLINEAR, FeatureType.MORPHOLOGY),
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR(BibleInformationService.UNAVAILABLE_TO_UI, "Interlinear", XslConversionType.INTERLINEAR, FeatureType.STRONGS_NUMBERS),
    /**
     * Showing tiny verse numbers
     */
    TINY_VERSE_NUMBERS(BibleInformationService.UNAVAILABLE_TO_UI, "TinyVNum", XslConversionType.DEFAULT),
    /**
     * colour codes the grammar
     */
    COLOUR_CODE('C', "ColorCoding", XslConversionType.DEFAULT),

    /**
     * not available to the UI
     */
    CHAPTER_VERSE(BibleInformationService.UNAVAILABLE_TO_UI, "CVNum", null),
    /**
     * displays the headings only for a selected XML fragment, e.g. first level subject search
     */
    HEADINGS_ONLY(BibleInformationService.UNAVAILABLE_TO_UI, "HeadingsOnly", XslConversionType.HEADINGS_ONLY),

    /**
     * Whether to hide the XGen OSIS elements
     */
    HIDE_XGEN(BibleInformationService.UNAVAILABLE_TO_UI, "HideXGen", XslConversionType.DEFAULT),

    HIDE_COMPARE_HEADERS(BibleInformationService.UNAVAILABLE_TO_UI, "HideCompareHeaders", XslConversionType.DEFAULT);


    private static final Map<Character, LookupOption> uiToOptions = new HashMap<Character, LookupOption>(16);
    private final char uiName;
    private final String xsltParameterName;
    private final XslConversionType stylesheet;
    private final boolean enabledByDefault;
    private final FeatureType feature;

    static {
        //cache the lookups for each option letter
        for (LookupOption option : values()) {
            uiToOptions.put(Character.toUpperCase(option.getUiName()), option);
        }
    }


    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet        the stylesheet to use
     */
    private LookupOption(final char uiName, final String xsltParameterName, final XslConversionType stylesheet) {
        this(uiName, xsltParameterName, stylesheet, null);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet        the stylesheet to use
     * @param feature           the JSword feature associated with this display option
     */
    private LookupOption(final char uiName, final String xsltParameterName, final XslConversionType stylesheet, final FeatureType feature) {
        this(uiName, xsltParameterName, stylesheet, false, feature);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet        the stylesheet to use
     * @param enabledByDefault  true to have the UI display the option by default
     */
    private LookupOption(final char uiName, final String xsltParameterName, final XslConversionType stylesheet,
                         final boolean enabledByDefault) {
        this(uiName, xsltParameterName, stylesheet, enabledByDefault, null);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet        the stylesheet to use
     * @param enabledByDefault  true to have the UI display the option by default
     *                          @param feature the JSword feature associated with this display option
     */
    private LookupOption(final char uiName, final String xsltParameterName, final XslConversionType stylesheet,
                         final boolean enabledByDefault, final FeatureType feature) {
        this.uiName = uiName;
        this.xsltParameterName = xsltParameterName;
        this.stylesheet = stylesheet;
        this.enabledByDefault = enabledByDefault;
        this.feature = feature;
    }

    /**
     * Returns the Lookup option associated with a particular character
     *
     * @param c the character
     * @return
     */
    public static LookupOption fromUiOption(char c) {
        if (c == BibleInformationService.UNAVAILABLE_TO_UI) {
            throw new StepInternalException("Underscore option is being looked up.");
        }

        final LookupOption lookupOption = uiToOptions.get(Character.toUpperCase(c));
        if (lookupOption == null) {
            throw new StepInternalException("Unable to ascertain option: " + c);
        }
        return lookupOption;
    }

    /**
     * @return the value used in the xslt transformations to set up the parameter
     */
    public String getXsltParameterName() {
        return this.xsltParameterName;
    }

    /**
     * @return the stylesheet that should be used
     */
    public XslConversionType getStylesheet() {
        return this.stylesheet;
    }

    /**
     * @return the enabledByDefault
     */
    public boolean isEnabledByDefault() {
        return this.enabledByDefault;
    }

    /**
     * @return the char to which this option is mapped
     */
    @JsonValue
    public char getUiName() {
        return uiName;
    }

    public FeatureType getFeature() {
        return feature;
    }
}
