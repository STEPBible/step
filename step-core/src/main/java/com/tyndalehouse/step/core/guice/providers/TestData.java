package com.tyndalehouse.step.core.guice.providers;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.codec.digest.DigestUtils;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.Transaction;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.History;
import com.tyndalehouse.step.core.data.entities.User;

/**
 * Provides test data if necessary
 * 
 * @author Chris
 * 
 */
@Singleton
public class TestData {
    private final EbeanServer ebean;

    /**
     * @param ebean the ebean server to persist objects with
     */
    @Inject
    public TestData(final EbeanServer ebean) {
        this.ebean = ebean;
        final User u = getUser();
        createBookmarks(u);
        createHistory(u);
    }

    /**
     * creates a history item for the test user
     * 
     * @param u the user
     */
    private void createHistory(final User u) {
        final History h = new History();
        h.setHistoryReference("Rev 1");
        h.setUser(u);
        h.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        this.ebean.save(h);
    }

    /**
     * creates the bookmarks
     * 
     * @param u the user
     */
    private void createBookmarks(final User u) {

        final List<Bookmark> bookmarks = new ArrayList<Bookmark>();
        final Bookmark b1 = new Bookmark();
        b1.setBookmarkReference("Acts 2:7-20");
        b1.setUser(u);

        final Bookmark b2 = new Bookmark();
        b2.setBookmarkReference("Acts 7:1-20");
        b2.setUser(u);

        bookmarks.add(b1);
        bookmarks.add(b2);

        final Transaction tx = this.ebean.beginTransaction();
        tx.setBatchMode(true);
        this.ebean.save(bookmarks);
        tx.commit();
        this.ebean.endTransaction();
    }

    /**
     * creates a user
     * 
     * @return the user to be created
     */
    private User getUser() {
        final User u = new User();
        u.setEmailAddress("t@t.c");
        u.setName("Mr Test");
        u.setPassword(new String(DigestUtils.sha512("password")));
        return u;
    }
}
