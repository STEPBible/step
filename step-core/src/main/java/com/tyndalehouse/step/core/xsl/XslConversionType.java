package com.tyndalehouse.step.core.xsl;

/**
 * Defines which types of XSL stylesheets are available
 * 
 * @author Chris
 * 
 */
public enum XslConversionType {
    /**
     * a standard text, where only one line of text will be displayed, (i.e. normal style)
     */
    DEFAULT,
    /**
     * identifies a text that requires outputs on multiple lines
     */
    INTERLINEAR("interlinear.xsl");

    /**
     * indicates the xsl conversion file to use for this work
     */
    private final String file;

    private XslConversionType() {
        this("default.xsl");
    }

    private XslConversionType(final String file) {
        this.file = file;
    }

    public String getFile() {
        return this.file;
    }
}
