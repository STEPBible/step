package com.tyndalehouse.step.core.guice.providers;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.Transaction;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.History;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.service.UserDataService;

/**
 * Provides test data if necessary
 * 
 * @author Chris
 * 
 */
@Singleton
public class TestData {
    private static final Logger LOGGER = LoggerFactory.getLogger(TestData.class);
    private final EbeanServer ebean;
    private final UserDataService userService;
    private final int numCryptoIterations;
    private final JSwordService jsword;

    /**
     * @param ebean the ebean server to persist objects with
     * @param userService the user service to create a user
     * @param numCryptoIterations the number of iterations to perform - we need since we hook in to the user
     *            data service from a different viewpoint
     * @param loader the loader that should be called upon installation mainly
     * @param jsword jsword services
     */
    @Inject
    public TestData(final EbeanServer ebean, final UserDataService userService,
            @Named("app.security.numIterations") final int numCryptoIterations, final Loader loader,
            @Named("test.data.modules") final String coreModules, final JSwordService jsword) {
        this.ebean = ebean;
        this.userService = userService;
        this.numCryptoIterations = numCryptoIterations;
        this.jsword = jsword;
        final User u = getUser();
        createBookmarks(u);
        createHistory(u);
        loader.init();

        loadDefaultJSwordModules(coreModules);
    }

    /**
     * installs core jsword modules
     * 
     * @param coreModules a comma separated list of modules
     */
    private void loadDefaultJSwordModules(final String coreModules) {
        final String[] modules = StringUtils.split(coreModules, ",");
        for (final String m : modules) {
            if (!this.jsword.isInstalled(m)) {
                this.jsword.installBook(m);
                LOGGER.info("Installing {} module", m);
            } else {
                LOGGER.info("Book {} already installed", m);
            }
        }
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
     * @return a test user
     */
    private User getUser() {
        final User u = new User();
        u.setEmailAddress("t@t.c");
        u.setName("Mr Test");
        final byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 };
        u.setPassword(this.userService.getHash(this.numCryptoIterations, "password", salt));
        u.setSalt(salt);

        // this.ebean.save(u);
        return u;
    }
}
