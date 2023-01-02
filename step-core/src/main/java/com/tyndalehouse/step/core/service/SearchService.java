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
