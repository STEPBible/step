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
package com.tyndalehouse.step.core.service.impl;

import static com.avaje.ebean.Expr.eq;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.BeanState;
import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.ExpressionList;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.History;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.exceptions.RequiresLoginException;
import com.tyndalehouse.step.core.service.FavouritesService;

/**
 * An implementation of the bookmark
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class FavouritesServiceImpl implements FavouritesService {
    private static final String HISTORY_ORDER_BY = "lastUpdated";
    private static final String HISTORY_FETCH_FIELDS = "id, historyReference, lastUpdated";
    private static final int MAX_HISTORY_ITEMS = 10;
    private static final String USER_FIELD = "user";
    private static final Logger LOG = LoggerFactory.getLogger(FavouritesServiceImpl.class);
    private final Provider<Session> serverSession;
    private final EbeanServer ebean;

    /**
     * 
     * @param ebean the ebean server for retrieving and persisting
     * @param serverSession the server session provider
     */
    @Inject
    public FavouritesServiceImpl(final EbeanServer ebean, final Provider<Session> serverSession) {
        this.ebean = ebean;
        this.serverSession = serverSession;

    }

    @Override
    public List<Bookmark> getBookmarks() {
        return getFavourites("id, bookmarkReference", Bookmark.class, "id", true);
    }

    @Override
    public List<History> getHistory(final List<History> clientHistory) {
        final List<History> combinedHistories = combineHistories(clientHistory,
                getFavourites(HISTORY_FETCH_FIELDS, History.class, HISTORY_ORDER_BY, false));

        // now we have de-duplicated lists, we can sort by dates!
        Collections.sort(combinedHistories, new Comparator<History>() {
            @Override
            public int compare(final History o1, final History o2) {
                // we want the most recent elements at the beginning of the set
                return o2.getLastUpdated().compareTo(o1.getLastUpdated());
            }
        });

        if (LOG.isTraceEnabled()) {
            LOG.trace("After sorting & de-duping:");
            for (final History h : combinedHistories) {
                LOG.trace("Item ref: [{}]", h.getHistoryReference());
            }
        }

        // now we prune to a maximum number of items
        pruneCombinedHistory(combinedHistories);

        // finally, we can unfortunately not return these beans as they contain the "User" object
        // so want to return just the history...
        return getFavourites(HISTORY_FETCH_FIELDS, History.class, HISTORY_ORDER_BY, false);
    }

    /**
     * Ensures the top of the list is saved to the database, and the bottom part is chopped off and removed
     * 
     * @param combinedHistories the history that contains too many elements
     */
    private void pruneCombinedHistory(final List<History> combinedHistories) {
        History lastItem = null;
        for (int ii = 0; ii < MAX_HISTORY_ITEMS && ii < combinedHistories.size(); ii++) {
            lastItem = combinedHistories.get(ii);
            // if we ve not persisted this yet, then set user and save
            if (lastItem.getUser() == null) {
                lastItem.setUser(this.serverSession.get().getUser());
                this.ebean.save(lastItem);
            }
        }

        // we remove the remaining ones at the end of the list
        while (combinedHistories.size() > MAX_HISTORY_ITEMS) {
            final History overflowHistoryItem = combinedHistories.get(combinedHistories.size() - 1);
            final BeanState beanState = this.ebean.getBeanState(overflowHistoryItem);
            if (!beanState.isNew()) {
                this.ebean.delete(overflowHistoryItem);
            }
            combinedHistories.remove(combinedHistories.size() - 1);
        }
    }

    /**
     * combines the client and server history by de-duplication and checking the latest dates
     * 
     * @param clientHistory the client history
     * @param serverHistory the server history
     * @return the histories, combined
     */
    List<History> combineHistories(final List<History> clientHistory, final List<History> serverHistory) {
        final Map<String, History> combinedHistory = new HashMap<String, History>();

        // first put all the items from the server history
        for (final History h : serverHistory) {
            combinedHistory.put(h.getHistoryReference(), h);
        }

        // then put all the items from the client history, being careful to overwrite
        // only if date is more recent
        for (final History h : clientHistory) {
            final History existingItem = combinedHistory.get(h.getHistoryReference());

            // if no item exists already OR if the item ante-dates the one we have
            if (existingItem == null || existingItem.getLastUpdated().before(h.getLastUpdated())) {
                combinedHistory.put(h.getHistoryReference(), h);
            }
        }
        return new ArrayList<History>(combinedHistory.values());
    }

    /**
     * a simple helper method for retrieving favourite items, for a particular user
     * 
     * @param <T> the type of favourite (history, bookmark)
     * @param fetchProperties the fields to select out
     * @param favouriteClass the class that matches T
     * @param orderByClause the order specified to retrieve the data
     * @param ascending true to mark ascending order
     * @return a list of Ts (bookmarks or favourites, ordered correctly, by user logged on)
     */
    private <T> List<T> getFavourites(final String fetchProperties, final Class<T> favouriteClass,
            final String orderByClause, final boolean ascending) {
        final User user = this.serverSession.get().getUser();
        if (user == null) {
            // the user is not logged in
            throw new RequiresLoginException("You will need to login to access this functionality");
        }

        final ExpressionList<T> query = this.ebean.find(favouriteClass).select(fetchProperties).where()
                .eq(USER_FIELD, user);
        if (ascending) {
            return query.order().asc(orderByClause).findList();
        } else {
            return query.order().desc(orderByClause).findList();
        }
    }

    @Override
    public void removeBookmark(final int bookmarkId) {
        this.ebean.delete(Bookmark.class, Integer.valueOf(bookmarkId));
    }

    @Override
    public int addBookmark(final String reference) {
        // first we check that the bookmark doesn't exist, then we insert it
        final User currentUser = this.serverSession.get().getUser();

        final List<Bookmark> bookmarks = this.ebean.find(Bookmark.class).where()
                .and(eq("bookmarkReference", reference), eq(USER_FIELD, currentUser)).findList();

        // no bookmark? then create!
        if (bookmarks.isEmpty()) {
            LOG.debug("Creating bookmark [{}]", reference);
            final Bookmark b = new Bookmark();
            b.setUser(currentUser);
            b.setBookmarkReference(reference);
            this.ebean.save(b);
            return b.getId();
        }

        // bookmark already exists, just return the bookmark id and warn
        LOG.warn("This is already a bookmark in the list [{}]", reference);
        return bookmarks.get(0).getId();
    }

    @Override
    public int addHistory(final String reference, final Timestamp lastUpdated) {
        // we first check if the history item is already there
        final History persistedHistoryItem = this.ebean.find(History.class).select("*").where()
                .eq("historyReference", reference).findUnique();

        final Timestamp lastUpdatedTime = lastUpdated != null ? lastUpdated : new Timestamp(
                System.currentTimeMillis());
        if (persistedHistoryItem == null) {
            final History h = new History();
            h.setHistoryReference(reference);
            h.setLastUpdated(lastUpdatedTime);
            h.setUser(this.serverSession.get().getUser());
            this.ebean.save(h);
            return h.getId();
        }

        // else just update the timestamp
        persistedHistoryItem.setLastUpdated(lastUpdatedTime);
        this.ebean.save(persistedHistoryItem);
        return persistedHistoryItem.getId();
    }
}
