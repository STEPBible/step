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

import static com.tyndalehouse.step.core.xsl.XslConversionType.DEFAULT;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.xsl.XslConversionType;
import org.codehaus.jackson.annotate.JsonValue;
import org.codehaus.jackson.map.annotate.JsonSerialize;

import java.util.HashMap;
import java.util.Map;

/**
 * Outlines a list of options available in lookup
 *
 * @author chrisburrell
 */
public enum LookupOption {
    /**
     * Showing headings
     */
    HEADINGS('H', "Headings", XslConversionType.DEFAULT, true),
    /**
     * Showing verse numbers
     */
    VERSE_NUMBERS('V', "VNum", XslConversionType.DEFAULT, true),
    /**
     * verses to be displayed on new line
     */
    VERSE_NEW_LINE('L', "VLine", XslConversionType.DEFAULT),
    /**
     * enabling red letter for the Words of Jesus
     */
    RED_LETTER('R', "RedLetterText", XslConversionType.DEFAULT),
    /**
     * Showing cross references
     */
    NOTES('N', "Notes", XslConversionType.DEFAULT, true),

    /**
     * The cross refs.
     */
    EXTENDED_XREFS('_', "ExtendsXRefs", XslConversionType.DEFAULT, true),

    /**
     * English vocabulary interlinear
     */
    ENGLISH_VOCAB('E', "EnglishVocab", XslConversionType.INTERLINEAR),
    /**
     * Transliteration interlinear
     */
    TRANSLITERATION('T', "Transliteration", XslConversionType.INTERLINEAR),
    /**
     * Greek vocabulary
     */
    GREEK_VOCAB('A', "GreekVocab", XslConversionType.INTERLINEAR),

    /**
     * Morphology
     */
    MORPHOLOGY('M', "Morph", XslConversionType.INTERLINEAR),
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR('_', "Interlinear", XslConversionType.INTERLINEAR),
    /**
     * Showing tiny verse numbers
     */
    TINY_VERSE_NUMBERS('_', "TinyVNum", XslConversionType.DEFAULT),
    /**
     * colour codes the grammar
     */
    COLOUR_CODE('C', "ColorCoding", XslConversionType.DEFAULT),

    /**
     * not available to the UI
     */
    CHAPTER_VERSE('_', "CVNum", null),
    /**
     * displays the headings only for a selected XML fragment, e.g. first level subject search
     */
    HEADINGS_ONLY('_', "HeadingsOnly", XslConversionType.HEADINGS_ONLY),

    /**
     * Whether to hide the XGen OSIS elements
     */
    HIDE_XGEN('_', "HideXGen", XslConversionType.DEFAULT);

    private static final Map<Character, LookupOption> uiToOptions = new HashMap<Character, LookupOption>(16);
    private final char uiName;
    private final String xsltParameterName;
    private final XslConversionType stylesheet;
    private final boolean enabledByDefault;

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
        this(uiName, xsltParameterName, stylesheet, false);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet        the stylesheet to use
     * @param enabledByDefault  true to have the UI display the option by default
     */
    private LookupOption(final char uiName, final String xsltParameterName, final XslConversionType stylesheet,
                         final boolean enabledByDefault) {
        this.uiName = uiName;
        this.xsltParameterName = xsltParameterName;
        this.stylesheet = stylesheet;
        this.enabledByDefault = enabledByDefault;
    }

    /**
     * Returns the Lookup option associated with a particular character
     *
     * @param c the character
     * @return
     */
    public static LookupOption fromUiOption(char c) {
        if(c == '_') {
            throw new StepInternalException("Underscore options is being looked up.");
        }

        final LookupOption lookupOption = uiToOptions.get(Character.toUpperCase(c));
        if(lookupOption == null) {
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
}
