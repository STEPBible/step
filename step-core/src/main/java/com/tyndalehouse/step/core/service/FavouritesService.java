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
