package com.tyndalehouse.step.rest.framework;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * An annotation that indicates the results of a particular method can be cached
 * 
 * @author Chris
 * 
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Cacheable {
    /**
     * true to indicate the results of a method can be cached
     */
    boolean value() default false;
}
