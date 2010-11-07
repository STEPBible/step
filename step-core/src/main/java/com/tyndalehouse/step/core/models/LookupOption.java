package com.tyndalehouse.step.core.models;

/**
 * Outlines a list of options available in lookup
 * 
 * @author Chris Burrell
 * 
 */
public enum LookupOption {
    /** Strong numbers */
    STRONG_NUMBERS("StrongsNumbers", "Strongs"),

    /** Morphology */
    MORPHOLOGY("Morph", "Morphology"),
    /**
     * Interlinears are available when Strongs are available.
     */
    INTERLINEAR("Interlinear");

    private final String xsltParameterName;
    private final String displayName;

    private LookupOption(final String xsltParameterName) {
        this(xsltParameterName, xsltParameterName);
    }

    private LookupOption(final String xsltParameterName, final String displayName) {
        this.xsltParameterName = xsltParameterName;
        this.displayName = displayName;
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
}
