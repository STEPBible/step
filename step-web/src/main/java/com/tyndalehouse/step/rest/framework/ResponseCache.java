package com.tyndalehouse.step.rest.framework;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.store.MemoryStoreEvictionPolicy;

import com.google.inject.Inject;
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
     */
    @Inject
    public ResponseCache(final CacheManager cacheManager) {
        super(cacheManager, new CacheConfiguration("httpResponseCache", 500)
                .memoryStoreEvictionPolicy(MemoryStoreEvictionPolicy.LFU).overflowToDisk(false)
                .eternal(false).timeToLiveSeconds(3600).timeToIdleSeconds(3600).diskPersistent(false)
                .diskExpiryThreadIntervalSeconds(0));
    }

}
