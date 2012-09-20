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
import static com.tyndalehouse.step.core.utils.StringConversionUtils.toBetaLowercase;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.toBetaUnaccented;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static java.lang.Character.isDigit;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.lexicon.Definition;
import com.tyndalehouse.step.core.data.entities.lexicon.LexicalForm;
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
import com.tyndalehouse.step.core.utils.StringConversionUtils;

/**
 * A federated search service implementation. see {@link SearchService}
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SearchServiceImpl implements SearchService {
    // TODO should this be parameterized?
    private static final String BASE_GREEK_VERSION = "WHNU";
    private static final String BASE_HEBREW_VERSION = "OSMHB";
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
        try {

            if (sq.isIndividualSearch()) {
                result = executeOneSearch(sq);
            } else {
                result = executeJoiningSearches(sq);
            }
        } catch (final AbortQueryException ex) {
            result = new SearchResult();
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
     * Runs a number of searches, joining them together (known as "refine searches")
     * 
     * @param sq the search query object
     * @return the list of search results
     */
    private SearchResult executeJoiningSearches(final SearchQuery sq) {
        // we run each individual search, and get all the keys out of each

        final Key results = runJoiningSearches(sq);

        // now retrieve the results, we need to retrieve results as per the last type of search run
        // so first of all, we set the allKeys flag to false
        sq.setAllKeys(false);

        return extractSearchResults(sq, results);
    }

    /**
     * Runs each individual search and gives us a key that can be used to retrieve every passage
     * 
     * @param sq the search query
     * @return the key to all the results
     */
    private Key runJoiningSearches(final SearchQuery sq) {
        Key results = null;
        do {
            switch (sq.getCurrentSearch().getType()) {
                case TEXT:
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case ORIGINAL_GREEK_FORMS:
                case ORIGINAL_HEBREW_FORMS:
                    adaptQueryForStrongSearch(sq);
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case ORIGINAL_GREEK_RELATED:
                case ORIGINAL_HEBREW_RELATED:
                    adaptQueryForRelatedStrongSearch(sq);
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case ORIGINAL_MEANING:
                    adaptQueryForMeaningSearch(sq);
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case ORIGINAL_GREEK_EXACT:
                case ORIGINAL_HEBREW_EXACT:
                    results = intersect(results, getKeysFromOriginalText(sq));
                    break;
                case SUBJECT:
                case TIMELINE_DESCRIPTION:
                case TIMELINE_REFERENCE:
                default:
                    throw new StepInternalException(String.format(
                            "Search %s is not support, unable to refine search type [%s]",
                            sq.getOriginalQuery(), sq.getCurrentSearch().getType()));
            }
        } while (sq.hasMoreSearches());
        return results;
    }

    /**
     * Extracts the search results from a multi-joined search query
     * 
     * @param sq the search query
     * @param results the results
     * @return the search results ready to send back
     */
    private SearchResult extractSearchResults(final SearchQuery sq, final Key results) {
        final IndividualSearch lastSearch = sq.getLastSearch();
        switch (lastSearch.getType()) {
            case TEXT:
                // case ORIGINAL_FORM:
            case ORIGINAL_MEANING:
            case ORIGINAL_GREEK_EXACT:
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_GREEK_RELATED:
            case ORIGINAL_HEBREW_EXACT:
            case ORIGINAL_HEBREW_RELATED:
            case ORIGINAL_HEBREW_FORMS:
                return buildCombinedVerseBasedResults(sq, results);
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
                // case EXACT_STRONG:
                // return runExactStrongSearch(sq);
                // case RELATED_STRONG:
                // return runRelatedStrongSearch(sq);
            case TIMELINE_DESCRIPTION:
                return runTimelineDescriptionSearch(sq);
            case TIMELINE_REFERENCE:
                return runTimelineReferenceSearch(sq);
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_HEBREW_FORMS:
                return runAllFormsStrongSearch(sq);
            case ORIGINAL_GREEK_RELATED:
            case ORIGINAL_HEBREW_RELATED:
                return runRelatedStrongSearch(sq);
            case ORIGINAL_GREEK_EXACT:
            case ORIGINAL_HEBREW_EXACT:
                return runExactOriginalTextSearch(sq);
            case ORIGINAL_MEANING:
                return runMeaningSearch(sq);
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
     * Obtains all glosses with a particular meaning
     * 
     * @param sq the search criteria
     * @return the result from the corresponding text search
     */
    private SearchResult runMeaningSearch(final SearchQuery sq) {
        final List<String> strongs = adaptQueryForMeaningSearch(sq);
        return runStrongTextSearch(sq, strongs);
    }

    /**
     * Runs the search looking for particular strongs
     * 
     * @param sq the search query
     * @return the results
     */
    private SearchResult runAllFormsStrongSearch(final SearchQuery sq) {
        final List<String> strongs = adaptQueryForStrongSearch(sq);

        // TODO jsword bug - email 09-Jul-2012 - 19:11 GMT
        // and then run the search
        return runStrongTextSearch(sq, strongs);
    }

    /**
     * Looks up all related strongs then runs the search
     * 
     * @param sq the search query
     * @return the results
     */
    private SearchResult runRelatedStrongSearch(final SearchQuery sq) {
        final List<String> strongs = adaptQueryForRelatedStrongSearch(sq);

        // and then run the search
        return runStrongTextSearch(sq, strongs);
    }

    /**
     * Runs a search using the exact form, i.e. without any lookups, a straight text search on the original
     * text
     * 
     * @param sq the search criteria
     * @return the results to be shown
     */
    private SearchResult runExactOriginalTextSearch(final SearchQuery sq) {
        final Key resultKeys = getKeysFromOriginalText(sq);

        // return results from appropriate versions
        return extractSearchResults(sq, resultKeys);
    }

    /**
     * Runs the search, and adds teh strongs to the search results
     * 
     * @param sq the search criteria
     * @param strongs the list of strongs that were searched for
     * @return the search results
     */
    private SearchResult runStrongTextSearch(final SearchQuery sq, final List<String> strongs) {
        final SearchResult textResults = runTextSearch(sq);
        textResults.setStrongHighlights(strongs);
        return textResults;
    }

    /**
     * Searches for all passage references matching an original text (greek or hebrew)
     * 
     * @param sq the search criteria
     * @return the list of verses
     */
    private Key getKeysFromOriginalText(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String[] soughtAfterVersions = currentSearch.getVersions();

        // overwrite version with Tisch to do the search
        if (currentSearch.getType() == SearchType.ORIGINAL_GREEK_EXACT) {
            currentSearch.setVersions(new String[] { BASE_GREEK_VERSION });
            currentSearch.setQuery(unaccent(currentSearch.getQuery(), sq));
        } else {
            currentSearch.setVersions(new String[] { BASE_HEBREW_VERSION });
        }

        final Key resultKeys = this.jswordSearch.searchKeys(sq);

        // now overwrite again and do the intersection with the normal text
        currentSearch.setVersions(soughtAfterVersions);
        return resultKeys;
    }

    /**
     * Attempts to recognise the input, whether it is a strong number, a transliteration or a hebrew/greek
     * word
     * 
     * @param sq the search criteria
     * @return a list of match strong numbers
     */
    private List<String> getStrongsFromTextCriteria(final SearchQuery sq) {
        // we can be dealing with a strong number, if so, no work required...
        final String query = sq.getCurrentSearch().getQuery();

        List<String> strongs;
        if (isDigit(query.charAt(0)) || (query.length() > 1 && isDigit(query.charAt(1)))) {
            // then we're dealing with a strong number, without its G/H prefix
            strongs = getStrongsFromCurrentSearch(sq);
        } else {
            // we're dealing with some sort of greek/hebrew form so we search the tables for this
            strongs = searchTextFieldsForDefinition(query, sq);
        }

        // run rules for transliteration
        if (strongs.isEmpty()) {
            // run transliteration rules
            strongs = findByTransliteration(query);
        }
        return strongs;
    }

    /**
     * Looks up all the glosses for a particular word, and then adapts to strong search and continues as
     * before
     * 
     * @param sq
     * @return
     */
    private List<String> adaptQueryForMeaningSearch(final SearchQuery sq) {
        final String query = sq.getCurrentSearch().getQuery();

        // TODO having wildcards both before and after and after is not good for performance - revise and use
        // full text search?
        final List<Definition> matchingMeanings = this.ebean.find(Definition.class).select("strongNumber")
                .where().ilike("stepGloss", "%" + query + "%").findList();
        final List<String> strongs = new ArrayList<String>(matchingMeanings.size());
        for (final Definition d : matchingMeanings) {
            strongs.add(d.getStrongNumber());
        }

        final String textQuery = getQuerySyntaxForStrongs(strongs, sq);
        sq.getCurrentSearch().setQuery(textQuery);

        // return the strongs that the search will match
        return strongs;
    }

    /**
     * Takes in a normal search query, and adapts the current search by rewriting the query syntax so that it
     * can be parsed by JSword
     * 
     * @param sq the search query
     */
    private List<String> adaptQueryForStrongSearch(final SearchQuery sq) {
        final List<String> strongs = getStrongsFromTextCriteria(sq);

        final String textQuery = getQuerySyntaxForStrongs(strongs, sq);

        // we can now change the individual search query, to the real text search
        sq.getCurrentSearch().setQuery(textQuery);

        // return the strongs that the search will match
        return strongs;
    }

    /**
     * Adapts the search query to be used in a strong search
     * 
     * @param sq the search query object
     */
    private List<String> adaptQueryForRelatedStrongSearch(final SearchQuery sq) {
        final List<String> strongsFromQuery = getStrongsFromTextCriteria(sq);

        // get all similar ones
        final List<Definition> strongs = this.ebean.find(Definition.class).fetch("similarStrongs")
                .select("similarStrongs.strongNumber").where().in("strongNumber", strongsFromQuery)
                .findList();

        for (final Definition s : strongs) {
            final List<Definition> similarStrongs = s.getSimilarStrongs();
            for (final Definition similar : similarStrongs) {
                strongsFromQuery.add(similar.getStrongNumber());
            }
        }

        final String query = getQuerySyntaxForStrongs(strongsFromQuery, sq);

        // we can now change the individual search query, to the real text search
        sq.getCurrentSearch().setQuery(query);

        // return the strongs that the search will match
        return strongsFromQuery;
    }

    /**
     * Searches the underlying DB for the relevant entry
     * 
     * @param query the query that is being passed in
     * @param sq the search criteria
     * @return the list of strongs matched
     */
    private List<String> searchTextFieldsForDefinition(final String query, final SearchQuery sq) {
        List<LexicalForm> forms = this.ebean.find(LexicalForm.class).select("rawStrongNumber").where()
                .eq("rawForm", query).findList();
        if (forms == null) {
            forms = this.ebean.find(LexicalForm.class).where().eq("unaccentedForm", unaccent(query, sq))
                    .findList();
        }

        if (forms == null) {
            return new ArrayList<String>(0);
        }

        // if we matched more than one, then we don't have our assumed uniqueness... log warning and
        // continue with first matched strong

        final List<String> listOfStrongs = new ArrayList<String>();
        for (final LexicalForm f : forms) {
            listOfStrongs.add(f.getRawStrongNumber());
        }
        return listOfStrongs;
    }

    /**
     * removes accents, hebrew vowels, etc.
     * 
     * @param query query
     * @param sq the current query criteria
     * @return the unaccented string
     */
    private String unaccent(final String query, final SearchQuery sq) {
        final SearchType currentSearchType = sq.getCurrentSearch().getType();
        switch (currentSearchType) {
            case ORIGINAL_GREEK_EXACT:
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_GREEK_RELATED:
                return StringConversionUtils.unAccent(query, true);
            case ORIGINAL_HEBREW_EXACT:
            case ORIGINAL_HEBREW_FORMS:
            case ORIGINAL_HEBREW_RELATED:
                return StringConversionUtils.unAccent(query, false);

            default:
                return query;
        }
    }

    /**
     * Runs the transliteration rules on the input in an attempt to match an entry in the lexicon
     * 
     * @param query the query to be found
     * @return the strongs that have been found/matched.
     */
    private List<String> findByTransliteration(final String query) {
        final List<Definition> definitions = new ArrayList<Definition>();

        // first find by transliterations that we have
        final String lowerQuery = query.toLowerCase();
        final String betaQuery = toBetaLowercase(lowerQuery);
        final String betaUnaccentedQuery = toBetaUnaccented(lowerQuery);

        final List<Definition> defs = this.ebean.find(Definition.class).select("strongNumber").where()
                .disjunction().eq("stepTransliteration", lowerQuery)
                .eq("unaccentedTransliteration", lowerQuery).eq("strongPronunc", lowerQuery)
                .eq("strongTranslit", lowerQuery).eq("lsjWordBeta", betaQuery)
                .eq("lsjWordBetaUnaccented", betaUnaccentedQuery).findList();

        // finally, if we haven't found anything, then abort
        if (definitions.isEmpty()) {
            // TODO obtain and implement transliteration rules
            // nothing to search for..., so abort query
            throw new AbortQueryException("No definitions found for input");
        }

        final List<String> strongs = new ArrayList<String>(defs.size());
        for (final Definition d : defs) {
            strongs.add(d.getStrongNumber());
        }

        return strongs;
    }

    /**
     * splits up the query syntax and returns a list of all strong numbers required
     * 
     * @param sq the search query
     * @return the list of strongs
     */
    private List<String> getStrongsFromCurrentSearch(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String searchStrong = currentSearch.getQuery();

        LOGGER.debug("Searching for strongs [{}]", searchStrong);
        final List<String> strongs = splitToStrongs(searchStrong, sq.getCurrentSearch().getType());
        return strongs;
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
     * @param strongs a list of strongs
     * @param sq the current search criteria containing the range of interest
     * @return the query syntax
     */
    private String getQuerySyntaxForStrongs(final List<String> strongs, final SearchQuery sq) {
        final StringBuilder query = new StringBuilder(64);

        // adding a space in front in case we prepend a range
        query.append(' ');
        for (final String s : strongs) {
            query.append(STRONG_QUERY);
            query.append(s);
            query.append(' ');
        }

        final String mainRange = sq.getCurrentSearch().getMainRange();
        if (isNotBlank(mainRange)) {
            query.insert(0, mainRange);

        }
        return query.toString().trim().toLowerCase();
    }

    /**
     * Parses the search query, returned in upper case in case a database lookup is required
     * 
     * @param searchStrong the search query
     * @param searchType type of search, this includes greek vs hebrew...
     * @return the list of strongs
     */
    private List<String> splitToStrongs(final String searchStrong, final SearchType searchType) {
        final List<String> strongs = Arrays.asList(searchStrong.split("[, ;]+"));
        final List<String> strongList = new ArrayList<String>();
        for (final String s : strongs) {
            final String prefixedStrong = isDigit(s.charAt(0)) ? getPrefixed(s, searchType) : s;
            strongList.add(padStrongNumber(prefixedStrong.toUpperCase(Locale.ENGLISH), false));
        }
        return strongList;
    }

    /**
     * @param s the string to add a prefix to
     * @param searchType the type of search
     * @return the prefixed string with H/G
     */
    private String getPrefixed(final String s, final SearchType searchType) {
        switch (searchType) {
            case ORIGINAL_GREEK_EXACT:
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_GREEK_RELATED:
                return 'G' + s;
            case ORIGINAL_HEBREW_EXACT:
            case ORIGINAL_HEBREW_FORMS:
            case ORIGINAL_HEBREW_RELATED:
                return 'H' + s;
            default:
                return null;

        }
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
