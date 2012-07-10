package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

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
        notNull(version, "A version must be selected", USER_MISSING_FIELD);
        notNull(searchQuery, "Please enter a search query", USER_MISSING_FIELD);
        return this.searchService.search(version, searchQuery);
    }

    /**
     * @param version the version to search across
     * @param searchStrong the query to search for
     * @return the search result(s)
     */
    public SearchResult searchStrong(final String version, final String searchStrong) {
        notNull(version, "A version must be selected", USER_MISSING_FIELD);
        notNull(searchStrong, "Please enter a search query", USER_MISSING_FIELD);
        return this.searchService.searchStrong(version, searchStrong);
    }

    /**
     * @param version the version to search across
     * @param searchStrong the query to search for
     * @return the search result(s)
     */
    public SearchResult searchRelatedStrong(final String version, final String searchStrong) {
        notNull(version, "A version must be selected", USER_MISSING_FIELD);
        notNull(searchStrong, "Please enter a search query", USER_MISSING_FIELD);
        return this.searchService.searchRelatedStrong(version, searchStrong);
    }
}
