package com.tyndalehouse.step.core.service;

import java.sql.Timestamp;
import java.util.List;

import com.tyndalehouse.step.core.data.entities.Bookmark;
import com.tyndalehouse.step.core.data.entities.History;

/**
 * A service to add, remove bookmarks, history, etc.
 * 
 * @author Chris
 * 
 */
public interface FavouritesService {
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

    /**
     * gets a set of bookmarks associated with the current session
     * 
     * @param clientHistory the client history that we will merge in
     * 
     * @return a list of bookmarks
     */
    List<History> getHistory(List<History> clientHistory);

    /**
     * Adds a bookmark if not already there
     * 
     * @param reference the reference to add to the history item
     * @param date the date at which it was last updated
     * @return the id of the history item that was added
     */
    int addHistory(String reference, Timestamp date);

}
