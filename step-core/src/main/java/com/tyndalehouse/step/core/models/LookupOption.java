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
    // CHECKSTYLE:OFF TODO change the values in the XSL file
    /**
     * Showing headings
     */
    HEADINGS("Headings", "Headings", XslConversionType.DEFAULT, true),
    // CHECKSTYLE:ON
    /**
     * Showing headings
     */
    VERSE_NUMBERS("VNum", "Verse Nums.", XslConversionType.DEFAULT, true),
    /** Strong numbers */
    STRONG_NUMBERS("StrongsNumbers", "Strongs", XslConversionType.INTERLINEAR),

    /** Morphology */
    MORPHOLOGY("Morph", "Morphology", XslConversionType.INTERLINEAR),
    // CHECKSTYLE:OFF
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR("Interlinear", "Interlinear", XslConversionType.INTERLINEAR),
    // CHECKSTYLE:ON
    /**
     * Showing headings
     */
    TINY_VERSE_NUMBERS("TinyVNum", XslConversionType.DEFAULT);

    private final String xsltParameterName;
    private final String displayName;
    private final XslConversionType stylesheet;
    private final boolean enabledByDefault;

    /**
     * sets up the the lookup option
     * 
     * @param xsltParameterName the corresponding parameter name in the XSLT stylesheet
     */
    private LookupOption(final String xsltParameterName) {
        this(xsltParameterName, xsltParameterName, DEFAULT);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet the stylesheet to use
     */
    private LookupOption(final String xsltParameterName, final XslConversionType stylesheet) {
        this(xsltParameterName, null, stylesheet);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet the stylesheet to use
     * @param displayName the name to display on the user interface
     */
    private LookupOption(final String xsltParameterName, final String displayName,
            final XslConversionType stylesheet) {
        this(xsltParameterName, displayName, stylesheet, false);
    }

    /**
     * @param xsltParameterName the name of the parameter in the stylesheet
     * @param stylesheet the stylesheet to use
     * @param displayName the name to display on the user interface
     * @param enabledByDefault true to have the UI display the option by default
     */
    private LookupOption(final String xsltParameterName, final String displayName,
            final XslConversionType stylesheet, final boolean enabledByDefault) {
        this.xsltParameterName = xsltParameterName;
        this.displayName = displayName;
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
     * @return the display name of the lookup option
     */
    public String getDisplayName() {
        return this.displayName;
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
