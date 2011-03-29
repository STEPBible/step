package com.tyndalehouse.step.core.data.caches;

import java.sql.Timestamp;
import java.util.Calendar;

import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.entities.Session;

/**
 * provides simple implementation for expiring and updating session
 * 
 * @author Chris
 * 
 */
public class SessionCacheListener extends AbstractCacheListener {
    private final EbeanServer ebean;
    private final int expiryPeriod;

    /**
     * @param ebean ebean server
     * @param expiryPeriod time to let go by before we expire the session after no activity
     * 
     */
    @Inject
    public SessionCacheListener(final EbeanServer ebean,
            @Named("app.cache.session.timeToIdle") final int expiryPeriod) {
        this.ebean = ebean;
        this.expiryPeriod = expiryPeriod;
    }

    @Override
    public void notifyElementUpdated(final Ehcache cache, final Element element) {
        final Calendar expiryDate = Calendar.getInstance();
        expiryDate.add(Calendar.DAY_OF_YEAR, this.expiryPeriod);

        final Session session = getSessionFromElement(element);
        session.setExpiresOn(new Timestamp(expiryDate.getTimeInMillis()));
        this.ebean.update(session);
    }

    @Override
    public void notifyElementEvicted(final Ehcache cache, final Element element) {
        this.ebean.delete(getSessionFromElement(element));
    }

    /**
     * Retrieves the session by casting the object value
     * 
     * @param element the cache element
     * @return the value from the cache
     */
    private Session getSessionFromElement(final Element element) {
        return (Session) element.getObjectValue();
    }

    @Override
    public void notifyRemoveAll(final Ehcache cache) {
        this.ebean.delete(Session.class);
    }
}
