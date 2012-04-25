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
