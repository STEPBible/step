package com.tyndalehouse.step.core.service;

import java.util.List;

import com.tyndalehouse.step.core.data.entities.Bookmark;

/**
 * A service to add, remove bookmarks
 * 
 * @author Chris
 * 
 */
public interface BookmarkService {
    /**
     * gets a set of bookmarks associated with the current session
     * 
     * @return a list of bookmarks
     */
    List<Bookmark> getBookmarks();

    /**
     * Removes a bookmark, using the current session-ed and logged on user
     * 
     * @param bookmarkId the bookmark id to use.
     */
    void removeBookmark(int bookmarkId);

    /**
     * Adds a bookmark if not already there
     * 
     * @param reference the reference to add to the bookmark
     * @return the id of the bookmark that was added
     */
    int addBookmark(String reference);

}
