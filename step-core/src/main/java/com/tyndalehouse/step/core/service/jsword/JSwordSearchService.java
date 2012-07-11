package com.tyndalehouse.step.core.service.jsword;

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
     * @return the results
     */
    SearchResult search(String version, String query);
}
