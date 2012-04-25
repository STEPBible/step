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

import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Element;
import net.sf.ehcache.config.CacheConfiguration;

import com.tyndalehouse.step.core.utils.cache.SimpleCache;

/**
 * An abstract implementation of the cache
 * 
 * @author Chris
 * @param <T> the type of element that will be stored in the cache
 */
public abstract class AbstractDefaultCache<T> implements SimpleCache<String, T> {
    private final Cache cache;

    /**
     * creates a default cache
     * 
     * @param cacheManager the cache manager
     * @param config the config to create it with
     */
    public AbstractDefaultCache(final CacheManager cacheManager, final CacheConfiguration config) {
        this.cache = new Cache(config);
        cacheManager.addCache(this.cache);
    }

    @Override
    public void put(final String key, final T obj) {
        final Element e = new Element(key, obj);
        this.cache.put(e);
    }

    @SuppressWarnings("unchecked")
    @Override
    public T get(final String key) {
        if (key == null) {
            return null;
        }

        final Element element = this.cache.get(key);
        if (element == null) {
            return null;
        }

        return (T) element.getObjectValue();
    }

    /**
     * @return the cache
     */
    public Cache getCache() {
        return this.cache;
    }
}
