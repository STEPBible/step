package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.inject.Provider;
import com.tyndalehouse.step.core.data.AbstractDataTest;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;

/**
 * tests that we can create and retrieve bookmarks
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class BookmarkServiceImplTest extends AbstractDataTest {
    @Mock
    private Provider<Session> serverSession;
    private BookmarkServiceImpl bookmarkService;
    private User u;

    /**
     * sets up the service under test
     */
    @Before
    public void setUp() {
        this.bookmarkService = new BookmarkServiceImpl(getEbean(), this.serverSession);
        this.u = new User();
        this.u.setEmailAddress("b@b.com");
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
        assertEquals(0, this.bookmarkService.getBookmarks().size());
    }

    /**
     * ensures that with no bookmarks, this still works
     */
    @Test
    public void testReadOneBookmarks() {
        final String testReference = "Genesis 1:1";
        saveNewBookmarkDirectly(testReference);
        assertEquals(this.bookmarkService.getBookmarks().get(0).getBookmarkReference(), testReference);
    }

    /**
     * ensures that we can add bookmarks
     */
    @Test
    public void testAddBookmark() {
        final String testReference = "Genesis 1:1";
        final int bookmarkId = this.bookmarkService.addBookmark(testReference);

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

        final int bookmarkId = this.bookmarkService.addBookmark(testReference);
        final int duplicateBookmarkId = this.bookmarkService.addBookmark(testReference);

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
        this.bookmarkService.removeBookmark(bookmarkId);

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

}
