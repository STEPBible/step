package com.tyndalehouse.step.rest.framework;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * This indicates that the REST-like call can be cached by the server
 * 
 * @author Chris
 * 
 */
@Target(METHOD)
@Retention(RUNTIME)
public @interface Cached {
    /** true to indicate that the results from the method can be cached */
    // CHECKSTYLE:OFF
    boolean value = false;
    // CHECKSTYLE:ON
}
