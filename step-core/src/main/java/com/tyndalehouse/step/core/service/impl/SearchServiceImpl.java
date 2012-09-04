/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.models.LookupOption.HEADINGS_ONLY;
import static com.tyndalehouse.step.core.service.impl.VocabularyServiceImpl.padStrongNumber;
import static java.lang.String.format;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.PassageTally;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.LexiconDefinition;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.KeyedSearchResultSearchEntry;
import com.tyndalehouse.step.core.models.search.KeyedVerseContent;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.models.search.TimelineEventSearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;

/**
 * A federated search service implementation. see {@link SearchService}
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SearchServiceImpl implements SearchService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String STRONG_QUERY = "strong:";
    private static final String LIKE = "%%%s%%";
    private final EbeanServer ebean;
    private final JSwordSearchService jswordSearch;
    private final JSwordPassageService jsword;
    private final TimelineService timeline;

    /**
     * @param ebean the ebean server to carry out the search from
     * @param jsword used to convert references to numerals, etc.
     * @param timeline the timeline service
     * @param jswordSearch the search service
     */
    @Inject
    public SearchServiceImpl(final EbeanServer ebean, final JSwordSearchService jswordSearch,
            final JSwordPassageService jsword, final TimelineService timeline) {
        this.ebean = ebean;
        this.jswordSearch = jswordSearch;
        this.jsword = jsword;
        this.timeline = timeline;
    }

    @Override
    public long estimateSearch(final SearchQuery sq) {
        return this.jswordSearch.estimateSearchResults(sq);
    }

    @Override
    public SearchResult search(final SearchQuery sq) {
        final long start = System.currentTimeMillis();

        SearchResult result;
        // if we've only got one search, we want to retrieve the keys, the page, etc. all in one go
        if (sq.isIndividualSearch()) {
            result = executeOneSearch(sq);
        } else {
            result = executeJoiningSearches(sq);
        }

        // we split the query into separate searches
        // we run the search against the selected versions

        // we retrieve the keys
        // join the keys
        // return the results

        result.setTimeTookTotal(System.currentTimeMillis() - start);
        result.setQuery(sq.getOriginalQuery());
        return result;
    }

    /**
     * Runs a number of searches, joining them together (known as "refine searches"
     * 
     * @param sq the search query object
     * @return the list of search results
     */
    private SearchResult executeJoiningSearches(final SearchQuery sq) {
        // we run each individual search, and get all the keys out of each

        Key results = null;

        do {
            if (sq.getCurrentSearch().getType() == SearchType.TEXT) {
                results = intersect(results, this.jswordSearch.searchKeys(sq));
            } else {
                throw new StepInternalException(String.format(
                        "Search %s is not support, unable to refine search type [%s]", sq.getOriginalQuery(),
                        sq.getCurrentSearch().getType()));
            }
        } while (sq.hasMoreSearches());

        // now retrieve the results, we need to retrieve results as per the last type of search run
        // so first of all, we set the allKeys flag to false
        sq.setAllKeys(false);

        final IndividualSearch lastSearch = sq.getLastSearch();
        switch (lastSearch.getType()) {
            case TEXT:
                return buildCombinedVerseBasedResults(sq, results);
            case EXACT_STRONG:
            case RELATED_STRONG:
            case SUBJECT:
            case TIMELINE_DESCRIPTION:
            case TIMELINE_REFERENCE:
            default:
                throw new StepInternalException(String.format(
                        "Search refinement of %s of type %s is not supported", sq.getOriginalQuery(),
                        lastSearch.getType()));

        }
    }

    /**
     * executes a single search
     * 
     * @param sq the search query results
     * @return the results from the search query
     */
    private SearchResult executeOneSearch(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        switch (currentSearch.getType()) {
            case TEXT:
                return runTextSearch(sq);
            case SUBJECT:
                return runSubjectSearch(sq);
            case EXACT_STRONG:
                return runExactStrongSearch(sq);
            case RELATED_STRONG:
                return runRelatedStrongSearch(sq);
            case TIMELINE_DESCRIPTION:
                return runTimelineDescriptionSearch(sq);
            case TIMELINE_REFERENCE:
                return runTimelineReferenceSearch(sq);
            default:
                throw new StepInternalException("Attempted to execute unknown search");
        }
    }

    /**
     * Runs a query against the JSword modules backends
     * 
     * @param sq the search query contained
     * @return the search to be run
     */
    private SearchResult runTextSearch(final SearchQuery sq) {
        final IndividualSearch is = sq.getCurrentSearch();

        // for text searches, we may have a prefix of t=
        final String[] versions = is.getVersions();

        if (versions.length == 1) {
            return this.jswordSearch.search(sq, versions[0]);
        }

        // build combined results
        return buildCombinedVerseBasedResults(sq, this.jswordSearch.searchKeys(sq));
    }

    /**
     * Runs a subject search
     * 
     * @param sq the search query to run
     * @return the results obtained by carrying out the search
     */
    private SearchResult runSubjectSearch(final SearchQuery sq) {
        // TODO we assume we can only search against one version for headings...
        final SearchResult headingsSearch = this.jswordSearch.search(sq,
                sq.getCurrentSearch().getVersions()[0], HEADINGS_ONLY);

        // build the results and then return
        final SubjectHeadingSearchEntry headings = new SubjectHeadingSearchEntry();
        headings.setHeadingsSearch(headingsSearch);

        // return the results
        final SearchResult sr = new SearchResult();
        sr.addEntry(headings);
        sr.setTotal(headingsSearch.getTotal());
        sr.setTimeTookToRetrieveScripture(headingsSearch.getTimeTookToRetrieveScripture());
        return sr;
    }

    /**
     * Runs the search looking for particular strongs
     * 
     * @param sq the search query
     * @return the results
     */
    private SearchResult runExactStrongSearch(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String searchStrong = currentSearch.getQuery();

        LOGGER.debug("Searching for strongs [{}]", searchStrong);
        final List<String> strongs = getStrongsFromQuery(searchStrong);

        // there may only be one, but it works with one or more
        return runMultipleStrongSearch(sq, strongs);
    }

    /**
     * Looks up all related strongs then runs the search
     * 
     * @param sq the search query
     * @return the results
     */
    private SearchResult runRelatedStrongSearch(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String query = currentSearch.getQuery();

        LOGGER.debug("Searching for related strongs [{}]", query);
        final List<String> strongsFromQuery = getStrongsFromQuery(query);

        final List<LexiconDefinition> strongs = this.ebean.find(LexiconDefinition.class)
                .fetch("similarStrongs").select("similarStrongs.strong").where()
                .in("strong", strongsFromQuery).findList();

        for (final LexiconDefinition s : strongs) {
            final List<LexiconDefinition> similarStrongs = s.getSimilarStrongs();
            for (final LexiconDefinition similar : similarStrongs) {
                strongsFromQuery.add(similar.getStrong());
            }
        }

        return runMultipleStrongSearch(sq, strongsFromQuery);
    }

    /**
     * Runs a timeline description search
     * 
     * @param sq the search query
     * @return the search results
     */
    private SearchResult runTimelineDescriptionSearch(final SearchQuery sq) {
        final List<TimelineEvent> events = this.ebean.find(TimelineEvent.class).where()
                .ilike("name", format(LIKE, sq.getCurrentSearch().getQuery())).findList();

        return buildTimelineSearchResults(sq, events);
    }

    /**
     * Runs a timeline search, keyed by reference
     * 
     * @param sq the search query
     * @return the search results
     */
    private SearchResult runTimelineReferenceSearch(final SearchQuery sq) {
        final List<TimelineEvent> events = this.timeline.lookupEventsMatchingReference(sq.getCurrentSearch()
                .getQuery());
        return buildTimelineSearchResults(sq, events);
    }

    /**
     * Construct the relevant entity structure to represent timeline search results
     * 
     * @param sq the search query
     * @param events the list of events retrieved
     * @return the search results
     */
    private SearchResult buildTimelineSearchResults(final SearchQuery sq, final List<TimelineEvent> events) {
        final List<SearchEntry> results = new ArrayList<SearchEntry>();
        final SearchResult r = new SearchResult();
        r.setResults(results);

        for (final TimelineEvent e : events) {
            final List<ScriptureReference> references = e.getReferences();
            final List<VerseSearchEntry> verses = new ArrayList<VerseSearchEntry>();

            // TODO FIXME: REFACTOR to only make 1 jsword call
            for (final ScriptureReference ref : references) {
                // TODO: REFACTOR only supports one version lookup
                final OsisWrapper peakOsisText = this.jsword.peakOsisText(
                        sq.getCurrentSearch().getVersions()[0], TimelineService.KEYED_REFERENCE_VERSION, ref);

                final VerseSearchEntry verseEntry = new VerseSearchEntry();
                verseEntry.setKey(peakOsisText.getReference());
                verseEntry.setPreview(peakOsisText.getValue());
                verses.add(verseEntry);
            }

            final TimelineEventSearchEntry entry = new TimelineEventSearchEntry();
            entry.setId(e.getId());
            entry.setDescription(e.getName());
            entry.setVerses(verses);
            results.add(entry);
        }
        return r;
    }

    /**
     * runs the search and returns results
     * 
     * @param sq the holder for the search query
     * @param strongs the strong numbers to search for
     * @return the result
     */
    private SearchResult runMultipleStrongSearch(final SearchQuery sq, final List<String> strongs) {
        final StringBuilder query = new StringBuilder();
        for (final String s : strongs) {
            query.append(STRONG_QUERY);
            query.append(s);
            query.append(' ');
        }

        // TODO jsword bug - email 09-Jul-2012 - 19:11 GMT

        // we can now change the individual search query, to the real text search
        sq.getCurrentSearch().setQuery(query.toString().trim().toLowerCase());

        // and then run the search
        return runTextSearch(sq);
    }

    /**
     * Parses the search query, returned in upper case in case a database lookup is required
     * 
     * @param searchStrong the search query
     * @return the list of strongs
     */
    private List<String> getStrongsFromQuery(final String searchStrong) {
        final List<String> strongs = Arrays.asList(searchStrong.split("[, ;]+"));
        final List<String> strongList = new ArrayList<String>();
        for (final String s : strongs) {
            strongList.add(padStrongNumber(s.toUpperCase(Locale.ENGLISH), false));
        }
        return strongList;
    }

    /**
     * Builds the combined results
     * 
     * @param sq the search query object
     * @param results the set of keys that have been retrieved by each search
     * @return the set of results
     */
    private SearchResult buildCombinedVerseBasedResults(final SearchQuery sq, final Key results) {
        final SearchResult sr = new SearchResult();

        sr.setTotal(this.jswordSearch.getTotal(results));

        // double-indirection map, verse -> version -> content
        final Map<String, Map<String, VerseSearchEntry>> verseToVersionToContent = new LinkedHashMap<String, Map<String, VerseSearchEntry>>();

        // combine the results into 1 giant keyed map
        final IndividualSearch currentSearch = sq.getCurrentSearch();

        // iterate through the versions, first, to obtain all the results
        for (final String v : currentSearch.getVersions()) {
            // retrieve scripture content and set up basics
            final SearchResult s = this.jswordSearch.retrieveResultsFromKeys(sq, results, v);

            // key in to aggregating map
            for (final SearchEntry e : s.getResults()) {
                final VerseSearchEntry verseEntry = (VerseSearchEntry) e;

                // retrieve Verse to Version map
                Map<String, VerseSearchEntry> versionToContent = verseToVersionToContent.get(verseEntry
                        .getOsisId());
                if (versionToContent == null) {
                    // using a tree map to maintain the natural ordering
                    versionToContent = new LinkedHashMap<String, VerseSearchEntry>();
                    verseToVersionToContent.put(verseEntry.getOsisId(), versionToContent);
                }
                versionToContent.put(v, verseEntry);
            }
        }

        for (final Entry<String, Map<String, VerseSearchEntry>> verseToVersionToContentEntry : verseToVersionToContent
                .entrySet()) {
            // key= osisId, value=version+content
            final KeyedSearchResultSearchEntry aggregateVerse = new KeyedSearchResultSearchEntry();

            for (final Entry<String, VerseSearchEntry> versionToContentEntry : verseToVersionToContentEntry
                    .getValue().entrySet()) {
                final KeyedVerseContent keyedVerseContent = new KeyedVerseContent();
                keyedVerseContent.setContentKey(versionToContentEntry.getKey());
                final VerseSearchEntry verseSearchEntry = versionToContentEntry.getValue();
                keyedVerseContent.setPreview(verseSearchEntry.getPreview());

                // add to aggregation verse
                aggregateVerse.addEntry(keyedVerseContent);
                if (aggregateVerse.getKey() == null) {
                    aggregateVerse.setKey(verseSearchEntry.getKey());
                }
            }

            sr.addEntry(aggregateVerse);
        }

        sr.setQuery(sq.getOriginalQuery());
        return sr;
    }

    /**
     * Keeps keys of "results" where they are also in searchKeys
     * 
     * @param results the existing results that have already been obtained. If null, then searchKeys is
     *            returned
     * @param searchKeys the search keys of the current search
     * @return the intersection of both Keys, or searchKeys if results is null
     */
    private Key intersect(final Key results, final Key searchKeys) {
        if (results == null) {
            return searchKeys;
        }

        // otherwise we interesect and adjust the "total"
        results.retainAll(searchKeys);

        if (results instanceof PassageTally) {
            ((PassageTally) results).setTotal(results.getCardinality());
        }

        return results;
    }
    // TODO
    // @Override
    // public List<ScriptureReference> searchAllByReference(final String references) {
    // LOGGER.debug("Searching for all entries with references of [{}]", references);
    //
    // final List<ScriptureReference> inputRefs = this.jsword.resolveReferences(references, "KJV");
    //
    // final List<ScriptureReference> searchResults = new ArrayList<ScriptureReference>();
    //
    // // do search
    // for (final ScriptureReference r : inputRefs) {
    // searchResults.addAll(this.ebean.find(ScriptureReference.class).fetch("geoPlace")
    // .fetch("timelineEvent").setDistinct(true).fetch("dictionaryArticle").where()
    // .and(ge("endVerseId", r.getStartVerseId()), le("startVerseId", r.getEndVerseId()))
    // .findList());
    // }
    // return searchResults;
    // }
}
