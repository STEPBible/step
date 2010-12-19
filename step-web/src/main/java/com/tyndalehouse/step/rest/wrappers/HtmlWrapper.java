package com.tyndalehouse.step.rest.wrappers;

/**
 * A simple wrapper around a string for returning as a JSON-mapped object
 * 
 * @author Chris
 * 
 */
public class HtmlWrapper {
    private final String value;

    /**
     * the value to be wrapped
     * 
     * @param value the value to be wrapped around
     */
    public HtmlWrapper(final String value) {
        this.value = value;
    }

    /**
     * @return the value to be returned
     */
    public String getValue() {
        return this.value;
    }
}
