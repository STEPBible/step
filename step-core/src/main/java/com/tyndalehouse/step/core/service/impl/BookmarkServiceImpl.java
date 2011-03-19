package com.tyndalehouse.step.core.service.impl;

import static com.avaje.ebean.Expr.eq;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.exceptions.RequiresLoginException;
import com.tyndalehouse.step.core.service.BookmarkService;

/**
 * An implementation of the bookmark
 * 
 * @author Chris
 * 
 */
@Singleton
public class BookmarkServiceImpl implements BookmarkService {
    private static final String USER_FIELD = "user";
    private static final Logger LOG = LoggerFactory.getLogger(BookmarkServiceImpl.class);
    private final Provider<Session> serverSession;
    private final EbeanServer ebean;

    /**
     * 
     * @param ebean the ebean server for retrieving and persisting
     * @param serverSession the server session provider
     */
    @Inject
    public BookmarkServiceImpl(final EbeanServer ebean, final Provider<Session> serverSession) {
        this.ebean = ebean;
        this.serverSession = serverSession;

    }

    @Override
    public List<Bookmark> getBookmarks() {
        // perhaps this could be made more efficient
        // TODO we need to add some ordering on this somewhere!
        // TODO push to a library for reuse elsewhere as some validation utils
        final User user = this.serverSession.get().getUser();
        if (user == null) {
            // the user is not logged in
            throw new RequiresLoginException("You will need to login to access this functionality");
        }

        return this.ebean.find(Bookmark.class).select("id, bookmarkReference").where().eq(USER_FIELD, user)
                .findList();
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
        if (bookmarks.size() == 0) {
            final Bookmark b = new Bookmark();
            b.setUser(currentUser);
            b.setBookmarkReference(reference);
            this.ebean.save(b);
            return b.getId();
        }

        // bookmark already exists, just return the bookmark id and warn
        LOG.warn("This is already a bookmark in the list");
        return bookmarks.get(0).getId();
    }
}
