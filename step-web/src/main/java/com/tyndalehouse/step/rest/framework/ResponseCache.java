package com.tyndalehouse.step.rest.framework;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.store.MemoryStoreEvictionPolicy;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.caches.AbstractDefaultCache;

/**
 * This caches responses - should be varied for Android and mobiles since there would be less memory
 * 
 * @author Chris
 * 
 */
public class ResponseCache extends AbstractDefaultCache<byte[]> {
    /**
     * A simple cache for the responses to be sent to the client..
     * 
     * @param cacheManager the cache manager with which to register the cache
     * @param maxElements the maximum number of elements to store in the cache
     * @param timeBeforeExpiration the amount of time before the cache expires
     */
    @Inject
    public ResponseCache(final CacheManager cacheManager,
            @Named("app.cache.responses.maxElements") final int maxElements,
            @Named("app.cache.timeBeforeExpiration") final int timeBeforeExpiration) {
        super(cacheManager, new CacheConfiguration("httpResponseCache", maxElements)
                .memoryStoreEvictionPolicy(MemoryStoreEvictionPolicy.LFU).overflowToDisk(false)
                .eternal(false).timeToLiveSeconds(timeBeforeExpiration)
                .timeToIdleSeconds(timeBeforeExpiration).diskPersistent(false)
                .diskExpiryThreadIntervalSeconds(0));
    }

}
