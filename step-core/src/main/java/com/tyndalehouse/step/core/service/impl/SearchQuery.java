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

import java.util.ArrayList;
import java.util.List;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * Search query object. Defines all parameters required to execute a search
 * 
 * @author chrisburrell
 * 
 */
public class SearchQuery {
    private static final String JOINING_SEARCH = "=>";
    private final IndividualSearch[] searches;
    private final int pageSize;
    private final int pageNumber;
    private final int context;
    private final boolean ranked;
    private String originalQuery;

    private int currentSearch = 0;
    private boolean allKeys = false;
    private final String sortOrder;
    private List<EntityDoc> definitions;

    /**
     * @param searchQuery the query to be run
     * @param sortOrder "true" to indicate the search results should be ranked, also can used text to be used
     *            in special sorts
     * @param context how many verses either side to include
     * @param pageNumber the page number required
     * @param pageSize the size of the page to be returned
     */
    public SearchQuery(final String searchQuery, final String sortOrder, final int context,
            final int pageNumber, final int pageSize) {

        this.originalQuery = searchQuery;

        // parse the searches
        final String[] individualSearches = searchQuery.split(JOINING_SEARCH);
        this.searches = new IndividualSearch[individualSearches.length];
        for (int ii = 0; ii < individualSearches.length; ii++) {
            this.searches[ii] = new IndividualSearch(individualSearches[ii]);

        }

        // by default we set all Keys to true if we have several searches to run
        if (this.searches.length > 1 || SearchServiceImpl.VOCABULARY_SORT.equals(sortOrder)
                || SearchServiceImpl.ORIGINAL_SPELLING_SORT.equals(sortOrder)) {
            this.allKeys = true;
        }

        // set the other variables
        this.ranked = Boolean.parseBoolean(sortOrder);
        this.sortOrder = sortOrder;

        this.context = context;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
    }

    /**
     * Constructs a query from a single search.
     * 
     * @param search the search that should be carried out
     */
    public SearchQuery(final IndividualSearch search) {
        this.searches = new IndividualSearch[] { search };
        this.pageSize = 0;
        this.pageNumber = 0;
        this.context = 1;
        this.ranked = false;
        this.sortOrder = "false";
        this.originalQuery = search.getQuery();
    }

    /**
     * @return true to indicate we are not refining searches
     */
    public boolean isIndividualSearch() {
        return this.searches.length == 1;
    }

    /**
     * @return the current search
     */
    public IndividualSearch getCurrentSearch() {
        return this.searches[this.currentSearch];
    }

    /**
     * @return the searches
     */
    public IndividualSearch[] getSearches() {
        return this.searches;
    }

    /**
     * @return the pageSize
     */
    public int getPageSize() {
        return this.pageSize;
    }

    /**
     * @return the pageNumber
     */
    public int getPageNumber() {
        return this.pageNumber;
    }

    /**
     * @return the context
     */
    public int getContext() {
        return this.context;
    }

    /**
     * @return the ranked
     */
    public boolean isRanked() {
        return this.ranked;
    }

    /**
     * @return the originalQuery
     */
    public String getOriginalQuery() {
        return this.originalQuery;
    }

    /**
     * Allow overrides to the original query, when, for example, some searches don't return any results
     * @param originalQuery the original query
     */
    public void setOriginalQuery(final String originalQuery) {
        this.originalQuery = originalQuery;
    }

    /**
     * Increments and moves on if we have more searches
     * 
     * @return true if the current search is not null
     */
    public boolean hasMoreSearches() {
        final boolean moreSearches = this.currentSearch < this.searches.length - 1;

        if (moreSearches) {
            this.currentSearch++;
        }

        return moreSearches;
    }

    /**
     * increments the pointer to the next search
     */
    public void nextSearch() {
        this.currentSearch++;
    }

    /**
     * @return the last search to be executed
     */
    public IndividualSearch getLastSearch() {
        return this.searches[this.searches.length - 1];
    }

    /**
     * @return the allKeys
     */
    public boolean isAllKeys() {
        return this.allKeys;
    }

    /**
     * @param allKeys the allKeys to set
     */
    public void setAllKeys(final boolean allKeys) {
        this.allKeys = allKeys;
    }

    /**
     * @return the sortOrder
     */
    public String getSortOrder() {
        return this.sortOrder;
    }

    /**
     * @param strongNumbers the strongNumbers to set
     */
    public void setDefinitions(final List<EntityDoc> strongNumbers) {
        this.definitions = strongNumbers;
    }

    /**
     * @return the strongNumbers
     */
    public List<EntityDoc> getDefinitions() {
        return this.definitions;
    }

    /**
     * Gives the search query a bunch of definitions that have been found, using it in a "session" fashion.
     * 
     * @param definitions the list of definitions.
     */
    public void setDefinitions(final EntityDoc[] definitions) {
        final List<EntityDoc> list = new ArrayList<EntityDoc>(definitions.length);
        for (final EntityDoc d : definitions) {
            list.add(d);
        }
        this.definitions = list;
    }
}
