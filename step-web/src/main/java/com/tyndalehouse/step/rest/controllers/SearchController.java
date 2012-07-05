package com.tyndalehouse.step.rest.controllers;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.SearchResult;
import com.tyndalehouse.step.core.service.SearchService;

/**
 * Caters for searching across the data base
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SearchController {
    private final SearchService searchService;

    /**
     * @param search the search service
     */
    @Inject
    public SearchController(final SearchService search) {
        this.searchService = search;
    }

    /**
     * @param version the version to search across
     * @param searchQuery the query to search for
     * @return the search result(s)
     */
    public SearchResult search(final String version, final String searchQuery) {
        return this.searchService.search(version, searchQuery);
    }
}
