package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.atLeast;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.search.SearchResult;
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
     * @param options a list of options to be passed in
     * @param interlinearVersion the interlinear version if provided adds lines under the text
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

    /**
     * Searches the timeline
     * 
     * @param version the version to use to lookup references
     * @param description the description of the event
     * @return the search results
     */
    public SearchResult searchTimelineDescription(final String version, final String description) {
        notNull(version, "A version must be selected as results contain scripture references",
                USER_MISSING_FIELD);
        notNull(description, "A description must be provided", USER_MISSING_FIELD);
        atLeast(description, 4, "The description must be at least 4 characters long", USER_MISSING_FIELD);

        return this.searchService.searchTimelineDescription(version, description);
    }

    /**
     * Searches the timeline
     * 
     * @param version the version to use to lookup references
     * @param year the year around which the event occurred
     * @param plusMinus a error margin within which events are accepted
     * @return the search results
     */
    public SearchResult searchTimelineDating(final String version, final String year, final String plusMinus) {
        notNull(version, "A version must be selected as results contain scripture references",
                USER_MISSING_FIELD);
        notNull(year, "A year must be provided to carry out searching by date", USER_MISSING_FIELD);

        // not yet implemented
        return null;
    }

    /**
     * Searches the timeline
     * 
     * @param version the version to use to lookup references
     * @param reference the reference to look up against timeline events
     * @return the search results
     */
    public SearchResult searchTimelineReference(final String version, final String reference) {
        notNull(version, "A version must be selected as results contain scripture references.",
                USER_MISSING_FIELD);
        notNull(reference, "A reference must be provided for this search.", USER_MISSING_FIELD);
        return this.searchService.searchTimelineReference(version, reference);
    }
}
