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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.crosswire.jsword.passage.Key;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.LexiconDefinition;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;
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
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * A federated search service implementation. see {@link SearchService}
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SearchServiceImpl implements SearchService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String TEXT_SEARCH = "t=";
    private static final String STRONG_QUERY = "strong:";
    private static final String LIKE = "%%%s%%";
    private static final int MAX_PAGE_RETURNED = 50;
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
    public long estimateSearch(final String version, final String searchQuery) {
        final String parsedQuery = getParsedQuery(searchQuery);
        final String[] versions = getVersions(version);

        long estimates = 0;
        for (final String v : versions) {
            estimates += this.jswordSearch.estimateSearchResults(v, parsedQuery);
        }

        return estimates;
    }

    @Override
    public SearchResult search(final String version, final String query, final boolean ranked,
            final int context, final int pageNumber) {

        // for text searches, we may have a prefix of t=
        final String parsedQuery = getParsedQuery(query);
        final String[] versions = getVersions(version);

        if (versions.length == 1) {
            return this.jswordSearch.search(versions[0], parsedQuery, ranked, context, pageNumber);
        }

        // otherwise, we are into the realm of searching across multiple versions
        final long start = System.currentTimeMillis();

        final Map<String, Key> resultsPerVersion = new HashMap<String, Key>();
        // no need to rank, since it won't be possible to rank accurately across versions
        for (final String v : versions) {
            resultsPerVersion.put(v,
                    this.jswordSearch.searchKeys(v, parsedQuery, false, context, MAX_PAGE_RETURNED));
        }

        final Key results = mergeSearches(resultsPerVersion);

        // build combined results
        return buildCombinedResults(versions, results, parsedQuery, context, start, pageNumber);
    }

    /**
     * Splits a potentially concatenated set of versions into an array of independant versions: "ESV, KJV"
     * becomes ["ESV", "KJV"]
     * 
     * @param version version or versions passed in
     * @return an array of individual versions
     */
    private String[] getVersions(final String version) {
        return version.split("[, ]+");
    }

    /**
     * removes the prefix from the query
     * 
     * @param query the pre-parsed query
     * @return the query after parsing
     */
    private String getParsedQuery(final String query) {
        return query.startsWith(TEXT_SEARCH) ? query.substring(2) : query;
    }

    /**
     * Builds the combined results
     * 
     * @param versions the array of versions that are to be looked up from the keys
     * @param results the set of results
     * @param parsedQuery the parsed query, used for populate of the POJO
     * @param context how much context to add
     * @param start the start time of the search
     * @param pageNumber the page to be retrieved
     * @return the set of results
     */
    private SearchResult buildCombinedResults(final String[] versions, final Key results,
            final String parsedQuery, final int context, final long start, final int pageNumber) {
        final SearchResult sr = new SearchResult();

        sr.setTotal(this.jswordSearch.getTotal(results));

        // double-indirection map, verse -> version -> content
        final Map<String, Map<String, VerseSearchEntry>> verseToVersionToContent = new LinkedHashMap<String, Map<String, VerseSearchEntry>>();

        // combine the results into 1 giant keyed map
        for (final String v : versions) {
            final long totalScriptureRetrievalStart = System.currentTimeMillis();

            // retrieve scripture content and set up basics
            final SearchResult s = this.jswordSearch.retrieveResultsFromKeys(v, parsedQuery, false, context,
                    start, results, pageNumber);
            sr.setTimeTookToRetrieveScripture(sr.getTimeTookToRetrieveScripture()
                    + System.currentTimeMillis() - totalScriptureRetrievalStart);
            sr.setMaxReached(sr.isMaxReached() || s.isMaxReached());

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

        sr.setQuery(parsedQuery);
        sr.setTimeTookTotal(System.currentTimeMillis() - start);
        return sr;

    }

    /**
     * merges all search results together
     * 
     * @param resultsPerVersion the results per version
     * @return the list of results
     */
    private Key mergeSearches(final Map<String, Key> resultsPerVersion) {
        Key all = null;

        for (final Entry<String, Key> entry : resultsPerVersion.entrySet()) {
            final Key value = entry.getValue();
            LOGGER.debug("Sub-result-set [{}] has [{}] entries", entry.getKey(), value.getCardinality());

            if (all == null) {
                all = value;
            } else {
                all.addAll(value);
            }
        }

        LOGGER.debug("Combined result-set has [{}] entries", all.getCardinality());
        return all;
    }

    @Override
    public SearchResult searchStrong(final String version, final String searchStrong, final int pageNumber) {
        LOGGER.debug("Searching for strongs [{}]", searchStrong);
        final List<String> strongs = getStrongsFromQuery(searchStrong);
        return runStrongSearch(version, strongs, pageNumber);
    }

    @Override
    public SearchResult searchSubject(final String version, final String subject, final int pageNumber) {
        final long start = System.currentTimeMillis();
        final String parsedSubject = subject.startsWith("s=") ? subject.substring(2) : subject;

        // assume subject is partial
        final String[] keys = StringUtils.split(parsedSubject);
        final StringBuilder query = new StringBuilder();

        for (int i = 0; i < keys.length; i++) {
            query.append(LuceneIndex.FIELD_HEADING);
            query.append(':');
            query.append(keys[i]);

            if (i + 1 < keys.length) {
                query.append(" AND ");
            }
        }

        final SearchResult headingsSearch = this.jswordSearch.search(version, query.toString(), false, 0,
                pageNumber, HEADINGS_ONLY);

        final SubjectHeadingSearchEntry headings = new SubjectHeadingSearchEntry();
        headings.setHeadingsSearch(headingsSearch);

        final SearchResult sr = new SearchResult();
        sr.setQuery("subject:" + query);
        sr.addEntry(headings);
        sr.setTotal(headingsSearch.getTotal());
        sr.setTimeTookToRetrieveScripture(headingsSearch.getTimeTookToRetrieveScripture());
        sr.setTimeTookTotal(System.currentTimeMillis() - start);
        return sr;
    }

    @Override
    public SearchResult searchRelatedStrong(final String version, final String searchStrong,
            final int pageNumber) {
        LOGGER.debug("Searching for related strongs [{}]", searchStrong);
        final List<String> strongsFromQuery = getStrongsFromQuery(searchStrong);

        final List<LexiconDefinition> strongs = this.ebean.find(LexiconDefinition.class)
                .fetch("similarStrongs").select("similarStrongs.strong").where()
                .in("strong", strongsFromQuery).findList();

        for (final LexiconDefinition s : strongs) {
            final List<LexiconDefinition> similarStrongs = s.getSimilarStrongs();
            for (final LexiconDefinition similar : similarStrongs) {
                strongsFromQuery.add(similar.getStrong());
            }
        }

        return runStrongSearch(version, strongsFromQuery, pageNumber);
    }

    @Override
    public SearchResult searchTimelineDescription(final String version, final String description) {
        final List<TimelineEvent> events = this.ebean.find(TimelineEvent.class).where()
                .ilike("name", format(LIKE, description)).findList();

        return buildTimelineSearchResults(version, "timeline:description:" + description, events);
    }

    @Override
    public SearchResult searchTimelineReference(final String version, final String reference) {
        final List<TimelineEvent> events = this.timeline.lookupEventsMatchingReference(reference);
        return buildTimelineSearchResults(version, "timeline:reference:" + reference, events);
    }

    /**
     * Construct the relevant entity structure to represent timeline search results
     * 
     * @param version the version we want to look up references from
     * @param query the query that was run (in case we extend our language further at a later stage)
     * @param events the events that were found
     * @return the search results
     */
    private SearchResult buildTimelineSearchResults(final String version, final String query,
            final List<TimelineEvent> events) {
        final List<SearchEntry> results = new ArrayList<SearchEntry>();
        final SearchResult r = new SearchResult();
        r.setQuery(query);
        r.setResults(results);

        for (final TimelineEvent e : events) {
            final List<ScriptureReference> references = e.getReferences();
            final List<VerseSearchEntry> verses = new ArrayList<VerseSearchEntry>();

            for (final ScriptureReference ref : references) {
                final OsisWrapper peakOsisText = this.jsword.peakOsisText(version,
                        TimelineService.KEYED_REFERENCE_VERSION, ref);

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
     * @param version the version to run against
     * @param strongs the strong numbers to search for
     * @param pageNumber the page to be retrieved, starting at 1
     * @return the result
     */
    private SearchResult runStrongSearch(final String version, final List<String> strongs,
            final int pageNumber) {
        final StringBuilder query = new StringBuilder();
        for (final String s : strongs) {
            query.append(STRONG_QUERY);
            query.append(s);
            query.append(' ');
        }

        // TODO jsword bug - email 09-Jul-2012 - 19:11 GMT
        return search(version, query.toString().trim().toLowerCase(), false, 0, pageNumber);
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
