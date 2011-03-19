package com.tyndalehouse.step.rest.controllers;

import java.util.List;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.service.BookmarkService;

/**
 * This helps manage bookmarks. This implementation simply wraps around the Bookmark Service (the project
 * step-web provides a WebSessionProvider which can be used therefore to get cookie information).
 * 
 * In this case, we just simply proxy through
 * 
 * @author Chris
 * 
 */
@Singleton
public class BookmarkController {
    private final BookmarkService bookmarkService;

    /**
     * We simply inject the bookmark service and proxy requests through
     * 
     * @param bookmarkService the bookmark service used to get our data
     */
    @Inject
    public BookmarkController(final BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    /**
     * gets a set of bookmarks associated with the current session
     * 
     * @return a list of bookmarks
     */
    public List<Bookmark> getBookmarks() {
        return this.bookmarkService.getBookmarks();
    }

    /**
     * Removes a bookmark, using the current session-ed and logged on user
     * 
     * @param bookmarkId the bookmark id to use.
     */
    public void removeBookmark(final int bookmarkId) {
        this.bookmarkService.removeBookmark(bookmarkId);
    }

    /**
     * Adds a bookmark if not already there
     * 
     * @param reference the reference to add to the bookmark
     * @return the id of the bookmark that was added
     */
    public int addBookmark(final String reference) {
        return this.bookmarkService.addBookmark(reference);
    }
}
