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

import com.tyndalehouse.step.core.models.AbstractComplexSearch;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.SearchToken;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.service.impl.SearchQuery;

import java.util.List;

/**
 * Runs various searches across the underlying database
 *
 * @author chrisburrell
 */
public interface SearchService {
    /**
     * Max number of terms to retrieve when auto-completing a dropdown
     */
    int MAX_SUGGESTIONS = 50;

    /**
     * Runs a search against STEP
     *
     * @param sq the query to be run, possibly containing multiple versions or even refined searches
     * @return the search results
     */
    SearchResult search(SearchQuery sq);

    /**
     * Estimates the number of results returned by the search
     *
     * @param sq the query
     * @return the search results
     */
    long estimateSearch(SearchQuery sq);

    /**
     * Runs the appropriate search for the given list of search tokens
     *
     * @param searchTokens  the tokens
     * @param sort          the type of sort
     * @param context       the number of extra verses to lookup for each verse
     * @param display       the type of display mode, e.g. interlinear, interleaved, etc.
     * @param pageNumber    the page number to retrieve
     * @param filter        the filter to apply (or blank to retrieve just the particular search query.
     * @param options       the options ticked by the user
     * @param originalItems the original query as given by the user
     * @param userLanguage  the user language in the browser (e.g.: en, zh, es, ...)
     * @return the results from the search/passage lookup
     */
    AbstractComplexSearch runQuery(List<SearchToken> searchTokens, final String options, final String display,
                                   final int pageNumber, final String filter, final String sort, int context,
                                   final String originalItems, final String userLanguage);
}
