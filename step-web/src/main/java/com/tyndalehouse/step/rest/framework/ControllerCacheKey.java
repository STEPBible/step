package com.tyndalehouse.step.rest.framework;

/**
 * This is a holder object for multiple variants of a cache key
 * 
 * @author chrisburrell
 */
public class ControllerCacheKey {
    private final String methodKey;
    private final String resultsKey;

    /**
     * This contructs a cache key
     * 
     * @param methodKey the key to retrieve a particular method
     * @param resultsKey the key to retrieve the results that we had previously
     */
    public ControllerCacheKey(final String methodKey, final String resultsKey) {
        this.methodKey = methodKey;
        this.resultsKey = resultsKey;
    }

    /**
     * @return the methodKey
     */
    public String getMethodKey() {
        return this.methodKey;
    }

    /**
     * @return the resultsKey
     */
    public String getResultsKey() {
        return this.resultsKey;
    }
}
