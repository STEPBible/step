package com.tyndalehouse.step.core.utils.cache;


/**
 * a simple cache interface
 * 
 * @param <T> the key class
 * @param <S> the item class
 * @author Chris
 * 
 */
public interface SimpleCache<T, S> {
    /**
     * puts an object in the cache
     * 
     * @param key the key of the object
     * @param obj the object to be cached
     */
    void put(T key, S obj);

    /**
     * retrieves an object from the cache
     * 
     * @param key the key to the cache
     * @return the object that was keyed
     */
    S get(T key);
}
