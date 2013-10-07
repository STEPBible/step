package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.APP_MISSING_FIELD;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.LexicalSuggestionType;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.search.OriginalWordSuggestionService;
import com.tyndalehouse.step.core.service.search.SubjectEntrySearchService;
import com.yammer.metrics.annotation.Timed;

/**
 * Caters for searching across the data base
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SearchController {
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchController.class);
    private final SearchService searchService;
    private final OriginalWordSuggestionService originalWordSuggestions;
    private final SubjectEntrySearchService subjectEntries;
    private SubjectSearchService subjectSearchService;

    /**
     * @param search the search service
     * @param originalWordSuggestions the original word suggestions
     * @param subjectEntries is able to retrieve the search entries
     */
    @Inject
    public SearchController(final SearchService search,
            final OriginalWordSuggestionService originalWordSuggestions,
            final SubjectEntrySearchService subjectEntries,
            final SubjectSearchService subjectSearchService) {
        this.searchService = search;
        this.originalWordSuggestions = originalWordSuggestions;
        this.subjectEntries = subjectEntries;
        this.subjectSearchService = subjectSearchService;
    }

    /**
     * @param searchQuery the query to search for
     * @param ranked true to indicate results should ranked in order of priority
     * @param context the amount of context to add to the verses hit by a search
     * @param pageNumber the number of the page that is desired
     * @param pageSize the size of the page that is desired
     * @return the search result(s)
     */
    @Timed(name = "search-main", group = "search", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public SearchResult search(final String searchQuery, final String ranked, final String context,
            final String pageNumber, final String pageSize) {
        notNull(searchQuery, "blank_search_provided", USER_MISSING_FIELD);
        notNull(pageNumber, "Page number is required", APP_MISSING_FIELD);
        notNull(ranked, "The ranking field is required", APP_MISSING_FIELD);
        notNull(context, "The context field is required", APP_MISSING_FIELD);
        notNull(pageSize, "Page size is required", APP_MISSING_FIELD);

        LOGGER.debug("Search query is [{}]", searchQuery);

        final SearchResult results = this.searchService.search(new SearchQuery(
                restoreSearchQuery(searchQuery), ranked, Integer.parseInt(context), Integer
                        .parseInt(pageNumber), Integer.parseInt(pageSize)));

        results.setQuery(undoRestoreSearchQuery(results.getQuery()));

        return results;
    }

    /**
     * Estimates the number of hits for a particular search query
     * 
     * @param searchQuery the search query.
     * @return the number of results
     */
    @Timed(name = "estimate", group = "search", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public long estimateSearch(final String searchQuery) {
        // JSword currently only allows estimates as ranked searches
        return this.searchService.estimateSearch(new SearchQuery(restoreSearchQuery(searchQuery), "false", 0,
                0, 0));
    }

    /**
     * Obtains a list of suggestions to display to the user
     * 
     * @param greekOrHebrew "greek" if greek is desired, otherwise "hebrew", if null, then returns immediately
     * @param form the form input so far
     * @param includeAllForms whether to include all known forms
     * @return a list of suggestions
     */
    @Timed(name = "lexical-suggestions", group = "languages", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public List<LexiconSuggestion> getLexicalSuggestions(final String greekOrHebrew, final String form,
            final String includeAllForms) {
        notBlank(form, "Blank lexical prefix passed.", APP_MISSING_FIELD);

        LexicalSuggestionType suggestionType = null;
        if ("greek".equals(greekOrHebrew)) {
            suggestionType = LexicalSuggestionType.GREEK;
        } else if ("hebrew".equals(greekOrHebrew)) {
            suggestionType = LexicalSuggestionType.HEBREW;
        } else if ("meaning".equals(greekOrHebrew)) {
            suggestionType = LexicalSuggestionType.MEANING;
        }

        // still null then return
        if (suggestionType == null) {
            return new ArrayList<LexiconSuggestion>(0);
        }

        return this.originalWordSuggestions.getLexicalSuggestions(suggestionType, restoreSearchQuery(form),
                Boolean.parseBoolean(includeAllForms));
    }

    /**
     * @param term the term entered by the user
     * @return the list of terms matching the entered text
     */
    public List<String> autocompleteSubject(String term) {
        return this.subjectSearchService.autocomplete(term);
    }

    /**
     * opposite of @link {@link SearchController#restoreSearchQuery}
     * 
     * @param searchQuery a query
     * @return the undone version
     */
    private String undoRestoreSearchQuery(final String searchQuery) {
        if (isBlank(searchQuery)) {
            return searchQuery;
        }

        return searchQuery.replace("/", "~slash~").replace("+", "~plus~");
    }

    /**
     * Replaces #plus# and #slash#
     * 
     * @param searchQuery the search query
     * @return the string that has replaced
     */
    private String restoreSearchQuery(final String searchQuery) {
        if (isBlank(searchQuery)) {
            return searchQuery;
        }

        return searchQuery.replace("#slash#", "/").replace("#plus#", "+");
    }

    /**
     * @param root the root word
     * @param fullHeader the header
     * @param version to be looked up
     * @return the list of verses for this subject
     */
    public List<OsisWrapper> getSubjectVerses(final String root, final String fullHeader, final String version) {
        return this.subjectEntries.getSubjectVerses(root, fullHeader, version);
    }
}
