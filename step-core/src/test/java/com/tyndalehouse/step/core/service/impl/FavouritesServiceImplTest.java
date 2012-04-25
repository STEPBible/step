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

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Provider;
import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.History;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;

/**
 * tests that we can create and retrieve bookmarks
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
@SuppressWarnings("PMD.TooManyMethods")
public class FavouritesServiceImplTest extends DataDrivenTestExtension {
    private static final Logger LOG = LoggerFactory.getLogger(FavouritesServiceImplTest.class);

    @Mock
    private Provider<Session> serverSession;
    private FavouritesServiceImpl favouritesService;
    private User u;

    /**
     * sets up the service under test
     */
    @Before
    public void setUp() {
        this.favouritesService = new FavouritesServiceImpl(getEbean(), this.serverSession);
        this.u = new User();
        this.u.setEmailAddress("b@b.com");
        this.u.setSalt(new byte[0]);
        this.u.setPassword(new byte[0]);
        final Session s = new Session();
        s.setUser(this.u);

        // when the server session is requested, we give the user back
        when(this.serverSession.get()).thenReturn(s);
    }

    /**
     * ensures that with no bookmarks, this still works
     */
    @Test
    public void readNoBookmarks() {
        assertEquals(0, this.favouritesService.getBookmarks().size());
    }

    /**
     * ensures that with no bookmarks, this still works
     */
    @Test
    public void testReadOneBookmarks() {
        final String testReference = "Genesis 1:1";
        saveNewBookmarkDirectly(testReference);
        assertEquals(this.favouritesService.getBookmarks().get(0).getBookmarkReference(), testReference);
    }

    /**
     * ensures that we can add bookmarks
     */
    @Test
    public void testAddBookmark() {
        final String testReference = "Genesis 1:1";
        final int bookmarkId = this.favouritesService.addBookmark(testReference);

        final Bookmark persistedBookmark = getEbean().find(Bookmark.class).where().idEq(bookmarkId)
                .findUnique();
        assertEquals(testReference, persistedBookmark.getBookmarkReference());
    }

    /**
     * This should return the original bookmark, but not create a new one
     */
    @Test
    public void testAddDuplicateBookmark() {
        final String testReference = "Genesis 1:1";

        final int bookmarkId = this.favouritesService.addBookmark(testReference);
        final int duplicateBookmarkId = this.favouritesService.addBookmark(testReference);

        assertEquals(bookmarkId, duplicateBookmarkId);
        assertEquals(1, getEbean().find(Bookmark.class).where().eq("bookmarkReference", testReference)
                .findRowCount());
    }

    /**
     * tests removing a bookmark
     */
    @Test
    public void testRemoveBookmark() {
        // create a bookmark
        final Bookmark b = saveNewBookmarkDirectly("blah");

        final Integer bookmarkId = b.getId();
        this.favouritesService.removeBookmark(bookmarkId);

        assertEquals(0, getEbean().find(Bookmark.class).where().idEq(bookmarkId).findRowCount());
    }

    /**
     * helpers to save a bookmark
     * 
     * @param testReference the pasage reference
     * @return the bookmark that was created
     */
    private Bookmark saveNewBookmarkDirectly(final String testReference) {
        final Bookmark b = new Bookmark();
        b.setBookmarkReference(testReference);
        b.setUser(this.u);
        getEbean().save(b);
        return b;
    }

    /**
     * tests that merging history work alright
     */
    @Test
    public void testGetHistoryMerge() {
        final long currentDate = System.currentTimeMillis();
        final List<History> client = new ArrayList<History>();

        // add client history
        addHistoryToList(client, "A", currentDate + 10000);
        addHistoryToList(client, "C", currentDate + 30000);

        // save server history
        final History s1 = new History();
        s1.setHistoryReference("B");
        s1.setLastUpdated(new Timestamp(currentDate + 20000));
        s1.setUser(this.serverSession.get().getUser());
        getEbean().save(s1);

        final History s2 = new History();
        s2.setHistoryReference("D");
        s2.setLastUpdated(new Timestamp(currentDate + 40000));
        s2.setUser(this.serverSession.get().getUser());
        getEbean().save(s2);

        final List<History> history = this.favouritesService.getHistory(client);
        assertEquals(4, history.size());
        assertEquals(s2.getHistoryReference(), history.get(0).getHistoryReference());
        assertEquals(client.get(1).getHistoryReference(), history.get(1).getHistoryReference());
        assertEquals(s1.getHistoryReference(), history.get(2).getHistoryReference());
        assertEquals(client.get(0).getHistoryReference(), history.get(3).getHistoryReference());
    }

    /**
     * tests pruning
     */
    @Test
    public void testPruning() {
        final long currentDate = System.currentTimeMillis();
        final List<History> client = new ArrayList<History>();

        // create 7 items in client history - naming A,B,C ... G, latest is G
        for (int ii = 0; ii < 7; ii++) {
            addHistoryToList(client, new String(new char[] { (char) (65 + ii) }), currentDate + (1 + ii)
                    * 10000);
        }

        // create server items too, 7 of them, Z ... T, latest is Z
        for (int ii = 0; ii < 7; ii++) {
            // save server history
            final History s1 = new History();
            s1.setHistoryReference(new String(new char[] { (char) (90 - ii) }));
            s1.setLastUpdated(new Timestamp(currentDate - (1 + ii) * 10000));
            s1.setUser(this.serverSession.get().getUser());
            getEbean().save(s1);
            LOG.debug("Created item [{}], [{}]", s1.getHistoryReference(), s1.getLastUpdated().getTime());
        }

        final List<History> history = this.favouritesService.getHistory(client);

        for (final History h : history) {
            LOG.debug("Item ref: [{}]", h.getHistoryReference());
        }

        assertEquals(10, history.size());
        assertEquals("G", history.get(0).getHistoryReference());
        assertEquals("F", history.get(1).getHistoryReference());
        assertEquals("E", history.get(2).getHistoryReference());
        assertEquals("D", history.get(3).getHistoryReference());
        assertEquals("C", history.get(4).getHistoryReference());
        assertEquals("B", history.get(5).getHistoryReference());
        assertEquals("A", history.get(6).getHistoryReference());
        assertEquals("Z", history.get(7).getHistoryReference());
        assertEquals("Y", history.get(8).getHistoryReference());
        assertEquals("X", history.get(9).getHistoryReference());
    }

    /**
     * Test that the de-duplication works
     */
    @Test
    public void testCombineHistories() {
        final List<History> clientHistory = new ArrayList<History>();
        final List<History> serverHistory = new ArrayList<History>();

        // make some client history
        addHistoryToList(clientHistory, "A", 1);
        addHistoryToList(clientHistory, "B", 1);
        addHistoryToList(clientHistory, "C", 2);

        // make some server history
        addHistoryToList(serverHistory, "B", 2);
        addHistoryToList(serverHistory, "C", 1);

        final List<History> history = this.favouritesService.combineHistories(clientHistory, serverHistory);
        Collections.sort(history, new Comparator<History>() {
            @Override
            public int compare(final History o1, final History o2) {
                return o1.getHistoryReference().compareTo(o2.getHistoryReference());
            }
        });

        assertEquals(3, history.size());
        assertEquals("A", history.get(0).getHistoryReference());
        assertEquals(1, history.get(0).getLastUpdated().getTime());
        assertEquals("B", history.get(1).getHistoryReference());
        assertEquals(2, history.get(1).getLastUpdated().getTime());
        assertEquals("C", history.get(2).getHistoryReference());
        assertEquals(2, history.get(2).getLastUpdated().getTime());
    }

    /**
     * helper method that adds a history item to a list
     * 
     * @param historyList the list to which to add the item
     * @param historyReference the reference
     * @param lastUpdated the date last updated
     */
    private void addHistoryToList(final List<History> historyList, final String historyReference,
            final long lastUpdated) {
        final History c1 = new History();
        c1.setHistoryReference(historyReference);
        c1.setLastUpdated(new Timestamp(lastUpdated));
        LOG.debug("Created item [{}], [{}]", c1.getHistoryReference(), c1.getLastUpdated().getTime());
        historyList.add(c1);
    }
}
