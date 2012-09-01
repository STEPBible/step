package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.atLeast;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.exceptions.UserExceptionType;
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
     * @param ranked true to indicate results should ranked in order of priority
     * @return the search result(s)
     */
    public SearchResult search(final String version, final String searchQuery, final String ranked,
            final String context, final String pageNumber) {
        notNull(version, "A version must be selected", USER_MISSING_FIELD);
        notNull(searchQuery, "Please enter a search query", USER_MISSING_FIELD);
        notNull(pageNumber, "Page number is required", UserExceptionType.APP_MISSING_FIELD);

        return this.searchService.search(version, searchQuery, Boolean.parseBoolean(ranked),
                Integer.parseInt(context), Integer.parseInt(pageNumber));
    }

    /**
     * Estimates the number of hits for a particular search query
     * 
     * @param version the versions to search across
     * @param searchQuery the search query.
     * @return the number of results
     */
    public long estimateSearch(final String version, final String searchQuery) {
        return this.searchService.estimateSearch(version, searchQuery);
    }

    /**
     * @param version the version used to do the headings search
     * @param subject subject that is being searched for
     * @param pageNumber the page to be retrieved, starting at 1
     * @return the search result(s)
     */
    public SearchResult searchSubject(final String version, final String subject, final String pageNumber) {
        notNull(subject, "A subject must be provided", USER_MISSING_FIELD);
        notNull(pageNumber, "Page number is required", UserExceptionType.APP_MISSING_FIELD);

        return this.searchService.searchSubject(version, subject, Integer.parseInt(pageNumber));
    }

    /**
     * @param version the version to search across
     * @param searchStrong the query to search for
     * @param pageNumber the page to be retrieved, starting at 1
     * @return the search result(s)
     */
    public SearchResult searchStrong(final String version, final String searchStrong, final String pageNumber) {
        notNull(version, "A version must be selected", USER_MISSING_FIELD);
        notNull(searchStrong, "Please enter a search query", USER_MISSING_FIELD);
        notNull(pageNumber, "Page number is required", UserExceptionType.APP_MISSING_FIELD);
        return this.searchService.searchStrong(version, searchStrong, Integer.parseInt(pageNumber));
    }

    /**
     * @param version the version to search across
     * @param searchStrong the query to search for
     * @param pageNumber the page to be retrieved, starting at 1
     * @return the search result(s)
     */
    public SearchResult searchRelatedStrong(final String version, final String searchStrong,
            final String pageNumber) {
        notNull(version, "A version must be selected", USER_MISSING_FIELD);
        notNull(searchStrong, "Please enter a search query", USER_MISSING_FIELD);
        return this.searchService.searchRelatedStrong(version, searchStrong, Integer.parseInt(pageNumber));
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
