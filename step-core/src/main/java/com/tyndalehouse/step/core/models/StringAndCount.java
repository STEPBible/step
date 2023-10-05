package com.tyndalehouse.step.core.models;

/**
 * Wraps a string and a count
 * Created by cjburrell on 23/04/2014.
 */
public class StringAndCount {
    private String value;
    private int count;

    /**
     * @param value the value
     * @param count the count
     */
    public StringAndCount(String value, int count) {
        this.value = value;
        this.count = count;
    }

    /**
     * @return a count
     */
    public int getCount() {
        return count;
    }

    /**
     * @return a value
     */
    public String getValue() {
        return value;
    }
}
