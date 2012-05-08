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

import com.tyndalehouse.step.core.xsl.XslConversionType;

/**
 * Outlines a list of options available in lookup
 * 
 * @author chrisburrell 
 * 
 */
public enum LookupOption {
    /**
     * Showing headings
     */
    HEADINGS("Headings", XslConversionType.DEFAULT, true),
    /**
     * Showing verse numbers
     */
    VERSE_NUMBERS("VNum", XslConversionType.DEFAULT, true),
    /**
     * verses to be displayed on new line
     */
    VERSE_NEW_LINE("VLine", XslConversionType.DEFAULT),
    /**
     * enabling red letter for the Words of Jesus
     */
    RED_LETTER("RedLetterText", XslConversionType.DEFAULT),
    /**
     * Showing cross references
     */
    NOTES("Notes", XslConversionType.DEFAULT, true),
    /** Strong numbers */
    STRONG_NUMBERS("StrongsNumbers", XslConversionType.INTERLINEAR),

    /** Morphology */
    MORPHOLOGY("Morph", XslConversionType.INTERLINEAR),
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR("Interlinear", XslConversionType.INTERLINEAR),
    /**
     * Showing tiny verse numbers
     */
    TINY_VERSE_NUMBERS("TinyVNum", XslConversionType.DEFAULT),
    /**
     * 
     */
    COLOUR_CODE("ColorCoding", XslConversionType.DEFAULT),

    /** not available to the UI */
    CHAPTER_VERSE("CVNum", null);

    private final String xsltParameterName;
    private final XslConversionType stylesheet;
    private final boolean enabledByDefault;

    /**
     * sets up the the lookup option
     * 
     * @param xsltParameterName the corresponding parameter name in the XSLT stylesheet
     */
    private LookupOption(final String xsltParameterName) {
        this(xsltParameterName, DEFAULT, false);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet the stylesheet to use
     */
    private LookupOption(final String xsltParameterName, final XslConversionType stylesheet) {
        this(xsltParameterName, stylesheet, false);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet the stylesheet to use
     * @param enabledByDefault true to have the UI display the option by default
     */
    private LookupOption(final String xsltParameterName, final XslConversionType stylesheet,
            final boolean enabledByDefault) {
        this.xsltParameterName = xsltParameterName;
        this.stylesheet = stylesheet;
        this.enabledByDefault = enabledByDefault;
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
}
