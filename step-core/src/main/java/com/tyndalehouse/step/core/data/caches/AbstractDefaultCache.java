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
