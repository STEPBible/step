package com.tyndalehouse.step.core.service.jsword.impl;

import java.util.ArrayList;
import java.util.Collections;
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
import org.crosswire.jsword.passage.PassageTally;
import org.crosswire.jsword.passage.PassageTally.Order;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LookupOption;
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
    private static final int PAGE_SIZE = 50;
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordSearchServiceImpl.class);
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
    public int estimateSearchResults(final String version, final String query) {
        final long start = System.currentTimeMillis();
        final Key k = searchKeys(version, query, true, 0, true, 0);
        if (k instanceof PassageTally) {
            LOGGER.trace("Took [{}]ms", System.currentTimeMillis() - start);
            return ((PassageTally) k).getTotal();
        }

        return -1;
    }

    @Override
    public Key searchKeys(final String version, final String query, final boolean ranked, final int context,
            final int pageNumber) {
        return searchKeys(version, query, ranked, context, false, pageNumber);
    }

    /**
     * Searches uniquely for the keys, in order to do the passage lookup at a later stage
     * 
     * @param version the version to be looked up
     * @param query the query
     * @param ranked whether to rank or not
     * @param context the context of the search.
     * @param estimation true to indicate we are not interested in the results per say.
     * @param pageNumber the pageNumber we are interested in, starting with page number 1
     * @return the search result keys
     */
    private Key searchKeys(final String version, final String query, final boolean ranked, final int context,
            final boolean estimation, final int pageNumber) {
        final DefaultSearchModifier modifier = new DefaultSearchModifier();
        modifier.setRanked(estimation ? true : ranked);
        modifier.setMaxResults(estimation ? 0 : pageNumber * PAGE_SIZE);

        final Book bible = this.av11nService.getBookFromVersion(version);

        try {
            // TODO JS-228 raised for thread-safety
            synchronized (this) {
                return bible.find(new DefaultSearchRequest(query, modifier));
            }
        } catch (final BookException e) {
            throw new StepInternalException("Unable to search for " + query + " with Bible " + version, e);
        }
    }

    @Override
    public SearchResult search(final String version, final String query, final boolean ranked,
            final int context, final int pageNumber, final LookupOption... options) {
        final long start = System.currentTimeMillis();
        final Key results = searchKeys(version, query, ranked, context, pageNumber);
        return retrieveResultsFromKeys(version, query, ranked, context, start, results, pageNumber, options);
    }

    @Override
    public SearchResult retrieveResultsFromKeys(final String version, final String query,
            final boolean ranked, final int context, final long start, final Key results,
            final int pageNumber, final LookupOption... options) {
        final int total = getTotal(results);

        LOGGER.debug("Total of [{}] results.", total);
        final Key newResults = rankAndTrimResults(ranked, results, pageNumber);
        LOGGER.debug("Trimmed down to [{}].", newResults.getCardinality());

        final long startRefs = System.currentTimeMillis();

        // if context > 0, then we need to add verse numbers:
        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();
        Collections.addAll(lookupOptions, options);
        if (context > 0) {
            lookupOptions.add(LookupOption.VERSE_NUMBERS);
        }

        final Book bible = this.av11nService.getBookFromVersion(version);
        final List<SearchEntry> resultPassages = getPassagesForResults(bible, newResults, context,
                lookupOptions);
        final long endRefs = System.currentTimeMillis();

        return getSearchResult(query, start, startRefs, endRefs, resultPassages, total);
    }

    /**
     * returns the total or -1 if not available
     * 
     * @param results the key to set of results
     * @return the results
     */
    private int getTotal(final Key results) {
        if (results instanceof PassageTally) {
            return ((PassageTally) results).getTotal();
        } else if (results instanceof Passage) {
            return ((Passage) results).getCardinality();
        }
        return -1;
    }

    /**
     * Constructs the search result object
     * 
     * @param query the query that was run
     * @param start the start time
     * @param startRefs the start time of retrieving the references
     * @param resultPassages the resulting passages
     * @param endRefs the end time of looking up the references
     * @return the search result to be returned to the service caller
     */
    private SearchResult getSearchResult(final String query, final long start, final long startRefs,
            final long endRefs, final List<SearchEntry> resultPassages, final int total) {
        final SearchResult r = new SearchResult();
        r.setResults(resultPassages);

        final long end = System.currentTimeMillis();

        // set stats:
        r.setMaxReached(MAX_RESULTS == resultPassages.size());
        r.setQuery(query);
        r.setTimeTookTotal(end - start);
        r.setTimeTookToRetrieveScripture(endRefs - startRefs);
        r.setTotal(total);
        return r;
    }

    /**
     * Looks up all passages represented by the key
     * 
     * @param bible the bible under examination
     * @param results the list of results
     * @param context amount of context to add
     * @param options to use to lookup the right parameterization of the text
     * @return the list of entries found
     */
    private List<SearchEntry> getPassagesForResults(final Book bible, final Key results, final int context,
            final List<LookupOption> options) {
        final List<SearchEntry> resultPassages = new ArrayList<SearchEntry>();
        final Iterator<Key> iterator = ((Passage) results).iterator();

        while (iterator.hasNext()) {
            final Key verse = iterator.next();
            final Key lookupKey;

            if (verse instanceof Verse) {
                // then we need to make it into a verse range
                final Versification v11n = this.av11nService.getVersificationForVersion(bible);
                final VerseRange vr = new VerseRange(v11n, (Verse) verse);
                vr.blur(context, RestrictionType.NONE);
                lookupKey = vr;
            } else {
                // assume blur is supported
                verse.blur(context, RestrictionType.NONE);
                lookupKey = verse;
            }

            final OsisWrapper peakOsisText = this.jsword.peakOsisText(bible, lookupKey, options);
            resultPassages.add(new VerseSearchEntry(peakOsisText.getReference(), peakOsisText.getValue(),
                    peakOsisText.getOsisId()));
        }
        return resultPassages;
    }

    /**
     * @param ranked true to indicate the search is desired in ranking order
     * @param results the result to be trimmed
     * @param pageNumber the page number we are interested in
     * @return the results
     */
    private Key rankAndTrimResults(final boolean ranked, final Key results, final int pageNumber) {
        rankResults(ranked, results);

        final Passage passage = (Passage) results;

        // we need the first pageNumber*PAGE_SIZE results, so remove anything beyond that.
        passage.trimVerses(pageNumber * PAGE_SIZE);
        Passage newResults = passage;

        while (newResults.getCardinality() > PAGE_SIZE) {
            newResults = newResults.trimVerses(PAGE_SIZE);
        }

        return newResults;
    }

    /**
     * Sets up the passage tally to rank the results
     * 
     * @param ranked true to indicate ranking occurs
     * @param results the results, amended to reflect what is desired
     */
    private void rankResults(final boolean ranked, final Key results) {
        if (ranked) {
            if (!(results instanceof PassageTally)) {
                throw new StepInternalException("Unable to retrieve in ranked order...");
            }

            ((PassageTally) results).setOrdering(Order.TALLY);

        }
    }
}
