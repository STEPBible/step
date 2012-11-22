package com.tyndalehouse.step.core.service.search;

import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.service.impl.SearchQuery;

/**
 * Searches for a specific subject
 * 
 * @author chrisburrell
 * 
 */
public interface SubjectSearchService {

    /**
     * Runs a subject search
     * 
     * @param sq the search query to run
     * @return the results obtained by carrying out the search
     */
    SearchResult search(SearchQuery sq);
}
