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

import java.util.List;

import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.LexicalSuggestionType;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.service.impl.SearchQuery;

/**
 * Runs various searches across the underlying database
 * 
 * @author chrisburrell
 * 
 */
public interface SearchService {
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
     * Retrieves all matching lexical entries for the word typed in
     * 
     * @param suggestionType indicates greek or hebrew
     * @param form the word that has been typed in so far
     * @param includeAllForms true to indicate results should come lexical_form table.
     * 
     * @return a list of lexicon suggestions
     */
    List<LexiconSuggestion> getLexicalSuggestions(LexicalSuggestionType suggestionType, String form,
            boolean includeAllForms);
}
