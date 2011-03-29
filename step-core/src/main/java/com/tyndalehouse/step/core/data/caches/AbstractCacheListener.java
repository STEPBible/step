package com.tyndalehouse.step.core.data.caches;

import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;
import net.sf.ehcache.event.CacheEventListener;

/**
 * This is a simple implementation where the listener does nothing. It is meant to be inherited to provide
 * overiddes for just what is required.
 * 
 * @author Chris
 * 
 */
@SuppressWarnings("PMD.EmptyMethodInAbstractClassShouldBeAbstract")
public abstract class AbstractCacheListener implements CacheEventListener {

    @Override
    public void notifyElementRemoved(final Ehcache cache, final Element element) {
        // No implementation
    }

    @Override
    public void notifyElementPut(final Ehcache cache, final Element element) {
        // No implementation
    }

    @Override
    public void notifyElementUpdated(final Ehcache cache, final Element element) {
        // No implementation
    }

    @Override
    public void notifyElementExpired(final Ehcache cache, final Element element) {
        // No implementation
    }

    @Override
    public void notifyElementEvicted(final Ehcache cache, final Element element) {
        // No implementation
    }

    @Override
    public void notifyRemoveAll(final Ehcache cache) {
        // No implementation
    }

    @Override
    public void dispose() {
        // No implementation
    }

    // CHECKSTYLE:OFF We are forced to override here sadly
    @Override
    public Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException();
    }
    // CHECKSTYLE:ON
}
