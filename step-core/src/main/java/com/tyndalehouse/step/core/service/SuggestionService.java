package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.SuggestionsSummary;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;

/**
 * The suggestion service will provide two sets of results.
 * 1- we may want the top 3 results from many different sources
 * 2- we may want the first 50 results from one source
 */
public interface SuggestionService {
    int MAX_RESULTS_NON_GROUPED = 50;

    /**
     * The top suggestions from all data source. The front-end will use these, and a count
     * to provide the below two examples (a,b,c are selected based on them being exact matches,
     * and then using the top 3 by 'popularity'.)
     * <pre>
     *     a
     *     b
     *     c
     *     + 6 more results
     * </pre>
     * <p/>
     * or
     * <pre>
     *     a
     *     b
     *     c
     *     d
     * </pre>
     *
     * @param context the context including the term we are searching for, the master book selected, etc.
     */
    SuggestionsSummary getTopSuggestions(SuggestionContext context, String searchLanguage);

    /**
     * Returns the first set of results that are available to the user
     *
     * @param context the context object in which all suggestion request information is
     *                stored (input, search type, etc.)
     */
    SuggestionsSummary getFirstNSuggestions(SuggestionContext context);
}
