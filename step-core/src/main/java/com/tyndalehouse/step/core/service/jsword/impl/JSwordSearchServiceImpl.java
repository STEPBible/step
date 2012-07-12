package com.tyndalehouse.step.core.service.jsword.impl;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.index.search.DefaultSearchModifier;
import org.crosswire.jsword.index.search.DefaultSearchRequest;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.RestrictionType;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;

/**
 * API to search across the data
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class JSwordSearchServiceImpl implements JSwordSearchService {
    private static final int MAX_RESULTS = 500;
    private final JSwordVersificationService av11nService;
    private final JSwordPassageService jsword;

    /**
     * @param av11nService the versification service
     * @param jsword the jsword lookup service to retrieve the references
     */
    @Inject
    public JSwordSearchServiceImpl(final JSwordVersificationService av11nService,
            final JSwordPassageService jsword) {
        this.av11nService = av11nService;
        this.jsword = jsword;

    }

    @Override
    public SearchResult search(final String version, final String query) {
        final DefaultSearchModifier modifier = new DefaultSearchModifier();

        modifier.setRanked(false);
        modifier.setMaxResults(MAX_RESULTS);

        final Book bible = this.av11nService.getBookFromVersion(version);

        try {
            final Key results = bible.find(new DefaultSearchRequest(query, modifier));

            final List<SearchEntry> resultPassages = new ArrayList<SearchEntry>();
            final Iterator<Key> rangeIter = ((Passage) results).rangeIterator(RestrictionType.CHAPTER);
            // boundaries.
            while (rangeIter.hasNext()) {
                final Key range = rangeIter.next();

                final OsisWrapper peakOsisText = this.jsword.peakOsisText(bible, range);
                resultPassages
                        .add(new VerseSearchEntry(peakOsisText.getReference(), peakOsisText.getValue()));
            }

            final SearchResult r = new SearchResult();
            r.setResults(resultPassages);
            r.setQuery(query);
            r.setMaxReached(MAX_RESULTS == resultPassages.size());

            return r;
        } catch (final BookException e) {
            throw new StepInternalException("Unable to search for " + query + " with Bible " + version, e);
        }
    }
}
