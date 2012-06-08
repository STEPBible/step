/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.data.caches;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.store.MemoryStoreEvictionPolicy;

import com.tyndalehouse.step.core.data.entities.Session;

/**
 * Session cache is configured to only contain elements for a certain while
 * 
 * The session cache automatically expires elements after a while and will clean up dead sessions on exit
 * 
 * @author chrisburrell
 * 
 */
@Singleton
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
