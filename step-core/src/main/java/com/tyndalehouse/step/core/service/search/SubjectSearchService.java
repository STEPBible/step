package com.tyndalehouse.step.core.service.search;

import java.util.List;

import com.tyndalehouse.step.core.models.OsisWrapper;
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

    /**
     * @param root the root word
     * @param fullHeader the full header
     * @param version TODO
     * @return the first verse of each range
     */
    List<OsisWrapper> getSubjectVerses(String root, String fullHeader, String version);

}
