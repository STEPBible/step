package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;

import java.util.List;

/**
 * @param <T> the type of intermediate result returned. Generally, either a String or an EntityDoc
 * @param <S> the type of collector to collect the results with the remaining count
 */
public interface SingleTypeSuggestionService<T, S> {
    T[] getExactTerms(SuggestionContext context, int max, final boolean popularSort);

    /**
     * Gets non-exact matches, based on the context, and limited to the total number the collector allows for
     * @param collector the collector containing max numbers
     * @param context the context containing the input from the user, and other information
     * @param alreadyRetrieved the entities that have already been retrieved
     * @param leftToCollect the left to collect
     * @return the list of entities
     */
    T[] collectNonExactMatches(S collector, SuggestionContext context, final T[] alreadyRetrieved, final int leftToCollect);

    /**
     * Converts a number of documents, strings, etc. to their PopularSuggestion equivalents. 
     * @param docs the array of documents that were retrieved as part of a first call (e.g. exact matches)
     * @param extraDocs the array of documents that were retrieved as part of the second call (non-exact matches)
     * @return the list of converted suggestions
     */
    List<? extends PopularSuggestion> convertToSuggestions(T[] docs,
                                                           T[] extraDocs);

    /**
     * Creates a 'collector', whose job is to collect entities (e.g. Strings, EntityDoc, etc.) as well as the counts
     * associated with the search, such as the maximum number of hits.)
     * @param leftToCollect how many items we really want to collect
     * @param popularSort the sort which we will use to collect these
     * @return the collector
     */
    S getNewCollector(int leftToCollect, boolean popularSort);
}
