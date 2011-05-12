package com.tyndalehouse.step.core.data.common;

/**
 * indicates how accurate a location is
 * 
 * @author cjburrell
 * 
 */
public enum GeoPrecision {
    /** an exact location */
    EXACT,
    /** an approximate location */
    APPROXIMATE,
    /** an unknown location */
    UNKNOWN,
}
