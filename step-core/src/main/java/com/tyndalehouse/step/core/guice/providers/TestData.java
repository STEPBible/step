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
 * @author chrisburrell
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
     * @param coreModules a comma-separated list of core modules
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

        loadDefaultJSwordModules(coreModules);

        loader.init();
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
