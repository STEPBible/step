package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.models.search.SuggestionType;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.TopFieldCollector;

import java.util.List;

/**
 * @param <T> the type of intermediate result returned. Generally, either a String or an EntityDoc
 * @param <S> the type of collector to collect the results with the remaining count
 * @author chrisburrell
 */
public interface SingleTypeSuggestionService<T, S> {
    T[] getExactTerms(String form, int max);

    Sort getSort();

    T[] collectNonExactMatches(S collector, String form, final T[] alreadyRetrieved, final int leftToCollect);

    List<? extends PopularSuggestion> convertToSuggestions(T[] docs,
                                                           T[] extraDocs);

    S getNewCollector(int leftToCollect);
}
