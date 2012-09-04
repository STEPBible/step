package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.APP_MISSING_FIELD;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.impl.SearchQuery;

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
     * @param searchQuery the query to search for
     * @param ranked true to indicate results should ranked in order of priority
     * @param context the amount of context to add to the verses hit by a search
     * @param pageNumber the number of the page that is desired
     * @param pageSize the size of the page that is desired
     * @return the search result(s)
     */
    public SearchResult search(final String searchQuery, final String ranked, final String context,
            final String pageNumber, final String pageSize) {
        notNull(searchQuery, "Please enter a search query", USER_MISSING_FIELD);
        notNull(pageNumber, "Page number is required", APP_MISSING_FIELD);
        notNull(ranked, "The ranking field is required", APP_MISSING_FIELD);
        notNull(context, "The context field is required", APP_MISSING_FIELD);
        notNull(pageSize, "Page size is required", APP_MISSING_FIELD);

        return this.searchService.search(new SearchQuery(searchQuery, Boolean.parseBoolean(ranked), Integer
                .parseInt(context), Integer.parseInt(pageNumber), Integer.parseInt(pageSize)));
    }

    /**
     * Estimates the number of hits for a particular search query
     * 
     * @param version the versions to search across
     * @param searchQuery the search query.
     * @return the number of results
     */
    public long estimateSearch(final String searchQuery) {
        // JSword currently only allows estimates as ranked searches
        return this.searchService.estimateSearch(new SearchQuery(searchQuery, true, 0, 0, 0));
    }

}
