package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.SingleSuggestionsSummary;
import com.tyndalehouse.step.core.models.SuggestionsSummary;
import com.tyndalehouse.step.core.service.impl.SearchType;

/**
 * The suggestion service will provide two sets of results.
 * 1- we may want the top 3 results from many different sources
 * 2- we may want the first 50 results from one source
 *
 * @author chrisburrell
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
     * @param term
     */
    SuggestionsSummary getTopSuggestions(String term);

    /**
     * Returns the first set of results that are available to the user
     *
     * @param searchType the type of search we want results from
     * @param term       the term that is being looked for.
     */
    SuggestionsSummary getFirstNSuggestions(String searchType, String term);
}
