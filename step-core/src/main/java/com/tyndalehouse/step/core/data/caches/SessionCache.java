package com.tyndalehouse.step.core.data.caches;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.store.MemoryStoreEvictionPolicy;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.entities.Session;

/**
 * Session cache is configured to only contain elements for a certain while
 * 
 * The session cache automatically expires elements after a while and will clean up dead sessions on exit
 * 
 * @author Chris
 * 
 */
public class SessionCache extends AbstractDefaultCache<Session> {

    /**
     * creates the session cache
     * 
     * @param cacheManager the cache manager
     * @param cacheListener the listener that will expire or update elements in the database
     * @param maxElementsInMemory the number of alive sessions
     * @param timeToLiveSeconds the time in seconds for each element to live
     * @param timeToIdleSeconds the number of seconds that after an element has been accessed for the last
     *            time.
     */
    @Inject
    public SessionCache(final CacheManager cacheManager, final SessionCacheListener cacheListener,
            @Named("app.cache.session.maxElements") final int maxElementsInMemory,
            @Named("app.cache.session.timeToLive") final int timeToLiveSeconds,
            @Named("app.cache.session.timeToIdle") final int timeToIdleSeconds) {
        super(cacheManager, new CacheConfiguration("sessionCache", maxElementsInMemory)
                .memoryStoreEvictionPolicy(MemoryStoreEvictionPolicy.LFU).overflowToDisk(false)
                .eternal(false).timeToLiveSeconds(timeToLiveSeconds).timeToIdleSeconds(timeToIdleSeconds)
                .diskPersistent(false).diskExpiryThreadIntervalSeconds(0));

        // add two listeners, one to expire sessions, one to maintain sessions:
        getCache().getCacheEventNotificationService().registerListener(cacheListener);
    }
}
