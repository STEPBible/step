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

import static com.tyndalehouse.step.core.service.impl.VocabularyServiceImpl.padStrongNumber;
import static java.lang.String.format;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.LexiconDefinition;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
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

    /**
     * @param ebean the ebean server to carry out the search from
     * @param jsword used to convert references to numerals, etc.
     * @param jswordSearch the search service
     */
    @Inject
    public SearchServiceImpl(final EbeanServer ebean, final JSwordSearchService jswordSearch,
            final JSwordPassageService jsword) {
        this.ebean = ebean;
        this.jswordSearch = jswordSearch;
        this.jsword = jsword;
    }

    @Override
    public SearchResult search(final String version, final String query) {
        return this.jswordSearch.search(version, query);
    }

    @Override
    public SearchResult searchStrong(final String version, final String searchStrong) {
        LOGGER.debug("Searching for strongs [{}]", searchStrong);
        final List<String> strongs = getStrongsFromQuery(searchStrong);
        return runStrongSearch(version, strongs);
    }

    @Override
    public SearchResult searchRelatedStrong(final String version, final String searchStrong) {
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

        return runStrongSearch(version, strongsFromQuery);
    }

    @Override
    public SearchResult searchTimelineDescription(final String version, final String description) {
        final List<TimelineEvent> events = this.ebean.find(TimelineEvent.class).where()
                .ilike("name", format(LIKE, description)).findList();

        final List<SearchEntry> results = new ArrayList<SearchEntry>();
        final SearchResult r = new SearchResult();
        r.setQuery("timeline:description:" + description);
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
     * @return the result
     */
    private SearchResult runStrongSearch(final String version, final List<String> strongs) {
        final StringBuilder query = new StringBuilder();
        for (final String s : strongs) {
            query.append(STRONG_QUERY);
            query.append(s);
            query.append(' ');
        }

        // TODO jsword bug - email 09-Jul-2012 - 19:11 GMT
        return search(version, query.toString().trim().toLowerCase());
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
            strongList.add(padStrongNumber(s.toUpperCase(), false));
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
