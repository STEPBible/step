package com.tyndalehouse.step.core.models;

import static com.tyndalehouse.step.core.xsl.XslConversionType.DEFAULT;

import com.tyndalehouse.step.core.xsl.XslConversionType;

/**
 * Outlines a list of options available in lookup
 * 
 * @author Chris Burrell
 * 
 */
public enum LookupOption {
    // CHECKSTYLE:OFF TODO: change the values in the XSL file
    /**
     * Showing headings
     */
    HEADINGS("Headings", XslConversionType.DEFAULT, true),
    // CHECKSTYLE:ON
    /**
     * Showing verse numbers
     */
    VERSE_NUMBERS("VNum", XslConversionType.DEFAULT, true),
    /**
     * Showing cross references
     */
    NOTES("Notes", XslConversionType.DEFAULT, true),
    /** Strong numbers */
    STRONG_NUMBERS("StrongsNumbers", XslConversionType.INTERLINEAR),

    /** Morphology */
    MORPHOLOGY("Morph", XslConversionType.INTERLINEAR),
    // CHECKSTYLE:OFF
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR("Interlinear", XslConversionType.INTERLINEAR),
    // CHECKSTYLE:ON
    /**
     * Showing headings
     */
    TINY_VERSE_NUMBERS("TinyVNum", XslConversionType.DEFAULT);

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
