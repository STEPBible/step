package com.tyndalehouse.step.core.data.entities;

/**
 * An interface allowing the entity to be keyed by something other than just id
 * 
 * @author Chris
 * 
 */
public interface KeyedEntity {
    /**
     * A code that can be used as a key to a Map
     * 
     * @return the code
     */
    String getCode();
}
