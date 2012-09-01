package com.tyndalehouse.step.core.service.jsword;

import org.crosswire.jsword.passage.Key;

import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.search.SearchResult;

/**
 * Searches across jsword modules
 * 
 * @author chrisburrell
 * 
 */
public interface JSwordSearchService {
    /**
     * 
     * @param version the version to search across
     * @param query the query to be run
     * @param ranked whether the results are ranked in order of relevance
     * @param context the amnount of blurring/context given to each search result
     * @param options the list of options used to retrieve the text
     * @param pageNumber the page to be retrieved
     * @return the results
     */
    SearchResult search(String version, String query, boolean ranked, final int context,
            final int pageNumber, LookupOption... options);

    /**
     * Searches uniquely for the keys, in order to do the passage lookup at a later stage
     * 
     * @param version the version to be looked up
     * @param parsedQuery the query
     * @param ranked whether to rank or not
     * @param context the context of the search.
     * @param pageNumber the page to be retrieved
     * @return the search result keys
     */
    Key searchKeys(String version, String parsedQuery, boolean ranked, int context, final int pageNumber);

    /**
     * Searches uniquely for the keys, in order to do the passage lookup at a later stage
     * 
     * @param version the version to be looked up
     * @param query the query that was run, uniquely used to populate the POJO result object
     * @param ranked whether the search was ranked
     * @param context the context of the search.
     * @param start the time at which the search was started
     * @param results the list of keys retrieved
     * @param pageNumber the page number desired
     * @param options the list of options to use to retrieve the verse
     * @return the search result keys
     */
    SearchResult retrieveResultsFromKeys(String version, String query, boolean ranked, int context,
            long start, Key results, int pageNumber, LookupOption... options);

    /**
     * @param version the version we are querying
     * @param query the query to be run
     * @return the number of results returned by the query
     */
    int estimateSearchResults(String version, String query);

    /**
     * Returns the total number of results in the search
     * 
     * @param results the key containing all the results
     * @return the total number of results
     */
    int getTotal(Key results);
}
