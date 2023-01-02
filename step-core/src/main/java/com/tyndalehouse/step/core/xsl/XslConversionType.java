package com.tyndalehouse.step.core.xsl;

/**
 * Defines which types of XSL stylesheets are available
 * 
 * @author chrisburrell
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
    INTERLINEAR("interlinear.xsl"),

    /**
     * Only outputs the headings that happen to be in the XML
     */
    HEADINGS_ONLY("headers-only.xsl"),

    /** commentaries contain verses, free text and references */
    COMMENTARY("commentary.xsl");

    /**
     * indicates the xsl conversion file to use for this work
     */
    private final String file;

    /**
     * giving a default XSL file to this Conversion type
     */
    private XslConversionType() {
        this("default.xsl");
    }

    /**
     * constructing a type associated with a specific file
     * 
     * @param file the XSL transformation file
     */
    private XslConversionType(final String file) {
        this.file = file;
    }

    /**
     * @return the file associated with this type
     */
    public String getFile() {
        return this.file;
    }
}
