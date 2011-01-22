package com.tyndalehouse.step.core.data.common;

/**
 * Precision type indicating how trustworthy a date is when passed through the system
 * 
 * @author Chris
 * 
 */
public enum PrecisionType {
    /**
     * This means the associated date is only meaningful until the year
     */
    YEAR,

    /**
     * This means the month and year are to be taken as accurate
     */
    MONTH,

    /**
     * The day, month and year are accurate
     */
    DAY,

    /**
     * No date available so, we'll set to none.
     */
    NONE;
}
