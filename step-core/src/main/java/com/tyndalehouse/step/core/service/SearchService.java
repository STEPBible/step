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

import com.tyndalehouse.step.core.models.search.SearchResult;

/**
 * Runs various searches across the underlying database
 * 
 * @author chrisburrell
 * 
 */
public interface SearchService {
    // /**
    // * Searches for all entities matching a reference
    // *
    // * @param reference the reference to search for
    // * @return a list of all entities
    // */
    // List<ScriptureReference> searchAllByReference(String reference);

    /**
     * @param version the initials of the book to search through
     * @param searchQuery the raw search query
     * @param ranked whether to order by ranking or bible
     * @param context the amount of context given to each search result
     * @return the list of search results
     */
    SearchResult search(String version, String searchQuery, boolean ranked, int context);

    /**
     * @param version the initials of the book to search through
     * @param searchStrong 1 or more strong numbers
     * @return the search results
     */
    SearchResult searchStrong(String version, String searchStrong);

    /**
     * @param version the initials of the book to search through
     * @param searchStrong 1 or more strong numbers
     * @return the search results
     */
    SearchResult searchRelatedStrong(String version, String searchStrong);

    /**
     * Searches the timeline by description
     * 
     * @param version the version to use for any passage references found
     * @param description the description of the event that is sought after
     * @return the result
     */
    SearchResult searchTimelineDescription(String version, String description);

    /**
     * Searches the timeline by description
     * 
     * @param version the version to use for any passage references found
     * @param reference the scripture reference of the event that is sought after
     * @return the result
     */
    SearchResult searchTimelineReference(String version, String reference);

    /**
     * Searches for the subject
     * 
     * @param subject the subject that we are looking for
     * @param version the version to use to lookup the headings
     * @return a search result
     */
    SearchResult searchSubject(final String version, String subject);
}
