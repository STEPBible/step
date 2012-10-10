package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.APP_MISSING_FIELD;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.LexicalSuggestionType;
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
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchController.class);
    private static final Pattern SQUARE_BRACKETS = Pattern.compile("\\[[^\\]]*\\]");
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

        LOGGER.debug("Search query is [{}]", searchQuery);

        String newQuery;
        // work around - because apache is decoding for tomcat (i think) and thereby spaces are removed...
        final Matcher matcher = SQUARE_BRACKETS.matcher(searchQuery);
        final boolean find = matcher.find();
        if (find) {
            // then we add a plus in front if not already there...
            newQuery = getNewQuery(matcher, searchQuery);
        } else {
            newQuery = searchQuery;
        }

        return this.searchService.search(new SearchQuery(newQuery.replace('#', '/'), ranked, Integer
                .parseInt(context), Integer.parseInt(pageNumber), Integer.parseInt(pageSize)));
    }

    /**
     * re-adds a plus that apache may have taken out
     * 
     * @param matcher the matcher
     * @param searchQuery the query itself
     * @return the new string
     */
    private String getNewQuery(final Matcher matcher, final String searchQuery) {
        final int start = matcher.start();
        if (start > 0) {
            if (searchQuery.charAt(start - 1) != '+') {
                final StringBuilder sb = new StringBuilder(searchQuery);
                sb.insert(start - 1, '+');
                return sb.toString();
            }
        }
        return searchQuery;
    }

    /**
     * Estimates the number of hits for a particular search query
     * 
     * @param searchQuery the search query.
     * @return the number of results
     */
    public long estimateSearch(final String searchQuery) {
        // JSword currently only allows estimates as ranked searches
        return this.searchService.estimateSearch(new SearchQuery(searchQuery, "false", 0, 0, 0));
    }

    /**
     * Obtains a list of suggestions to display to the user
     * 
     * @param greekOrHebrew "greek" if greek is desired, otherwise "hebrew", if null, then returns immediately
     * @param form the form input so far
     * @param includeAllForms whether to include all known forms
     * @return a list of suggestions
     */
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

        return this.searchService.getLexicalSuggestions(suggestionType, form.replace('#', '/'),
                Boolean.parseBoolean(includeAllForms));
    }

}
