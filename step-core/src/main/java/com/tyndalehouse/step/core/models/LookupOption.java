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
    /** Strong numbers */
    STRONG_NUMBERS("StrongsNumbers", "Strongs", XslConversionType.INTERLINEAR),

    /** Morphology */
    MORPHOLOGY("Morph", "Morphology", XslConversionType.INTERLINEAR),
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR("Interlinear", XslConversionType.INTERLINEAR);

    private final String xsltParameterName;
    private final String displayName;
    private XslConversionType stylesheet;

    private LookupOption(final String xsltParameterName) {
        this(xsltParameterName, xsltParameterName, DEFAULT);
    }

    private LookupOption(final String xsltParameterName, final XslConversionType stylesheet) {
        this(xsltParameterName, xsltParameterName, stylesheet);
    }

    private LookupOption(final String xsltParameterName, final String displayName, final XslConversionType stylesheet) {
        this.xsltParameterName = xsltParameterName;
        this.displayName = displayName;
        this.stylesheet = stylesheet;
    }

    /**
     * @return the value used in the xslt transformations to set up the parameter
     */
    public String getXsltParameterName() {
        return this.xsltParameterName;
    }

    public String getDisplayName() {
        return this.displayName;
    }

    public XslConversionType getStylesheet() {
        return this.stylesheet;
    }
}
