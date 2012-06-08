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

import java.sql.Timestamp;
import java.util.Calendar;

import javax.inject.Inject;
import javax.inject.Named;

import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.Session;

/**
 * provides simple implementation for expiring and updating session
 * 
 * @author chrisburrell
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
