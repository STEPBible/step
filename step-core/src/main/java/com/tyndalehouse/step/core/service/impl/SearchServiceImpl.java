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
import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptForUnaccentedTransliteration;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static java.lang.Character.isDigit;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.apache.lucene.index.Term;
import org.apache.lucene.queryParser.MultiFieldQueryParser;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryParser.QueryParser.Operator;
import org.apache.lucene.search.CachingWrapperFilter;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.PrefixFilter;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.apache.lucene.util.Version;
import org.crosswire.jsword.passage.Key;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.KeyedSearchResultSearchEntry;
import com.tyndalehouse.step.core.models.search.KeyedVerseContent;
import com.tyndalehouse.step.core.models.search.LexicalSuggestionType;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.models.search.TimelineEventSearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.core.service.helpers.GlossComparator;
import com.tyndalehouse.step.core.service.helpers.OriginalSpellingComparator;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * A federated search service implementation. see {@link SearchService}
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SearchServiceImpl implements SearchService {
    /** value representing a vocabulary sort */
    public static final String VOCABULARY_SORT = "Vocabulary";
    /** value representing a original spelling sort */
    public static final Object ORIGINAL_SPELLING_SORT = "Original spelling";
    private static final String STRONG_NUMBER_FIELD = "strongNumber";
    private static final Filter GREEK_FILTER = new CachingWrapperFilter(new PrefixFilter(new Term(
            STRONG_NUMBER_FIELD, "G")));
    private static final Filter HEBREW_FILTER = new CachingWrapperFilter(new PrefixFilter(new Term(
            STRONG_NUMBER_FIELD, "H")));
    private static final Sort TRANSLITERATION_SORT = new Sort(new SortField("stepTransliteration",
            SortField.STRING));

    private static final String STRONG_THE = "G3588";
    private static final String START_OF_STRONG_FIELD = "strong='";
    private static final int START_OF_STRONG_FIELD_LENGTH = START_OF_STRONG_FIELD.length();
    private static final int MAX_SUGGESTIONS = 50;
    // TODO should this be parameterized?
    private static final String BASE_GREEK_VERSION = "WHNU";
    private static final String BASE_HEBREW_VERSION = "OSMHB";
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String STRONG_QUERY = "strong:";
    private final JSwordSearchService jswordSearch;
    private final JSwordPassageService jsword;
    private final TimelineService timeline;
    private final EntityIndexReader definitions;
    private final EntityIndexReader specificForms;
    private final EntityIndexReader timelineEvents;

    /**
     * @param jsword used to convert references to numerals, etc.
     * @param timeline the timeline service
     * @param jswordSearch the search service
     * @param entityManager the manager for all entities stored in lucene
     */
    @Inject
    public SearchServiceImpl(final JSwordSearchService jswordSearch, final JSwordPassageService jsword,
            final TimelineService timeline, final EntityManager entityManager) {
        this.jswordSearch = jswordSearch;
        this.jsword = jsword;
        this.timeline = timeline;
        this.definitions = entityManager.getReader("definition");
        this.specificForms = entityManager.getReader("specificForm");
        this.timelineEvents = entityManager.getReader("timelineEvent");

    }

    @Override
    public long estimateSearch(final SearchQuery sq) {
        return this.jswordSearch.estimateSearchResults(sq);
    }

    @Override
    public List<LexiconSuggestion> getLexicalSuggestions(final LexicalSuggestionType suggestionType,
            final String form, final boolean includeAllForms) {
        if (isEmpty(form)) {
            return new ArrayList<LexiconSuggestion>();
        }

        if (suggestionType == LexicalSuggestionType.MEANING) {
            return getMeaningSuggestions(form);
        }

        if (includeAllForms) {
            return getMatchingAllForms(suggestionType, form);
        } else {
            return getMatchingFormsFromLexicon(suggestionType, form);
        }
    }

    /**
     * Autocompletes the meaning search
     * 
     * @param form the form that we are looking for
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMeaningSuggestions(final String form) {
        // add leading wildcard to last word
        final String[] split = split(form);
        final StringBuilder sb = new StringBuilder(form.length() + 2);
        for (int ii = 0; ii < split.length; ii++) {
            if (ii == split.length - 1) {
                sb.append('*');
            }
            sb.append(split[ii]);
            if (ii == split.length - 1) {
                sb.append('*');
            }
        }

        final EntityDoc[] results = this.definitions.searchSingleColumn("translations", sb.toString(),
                Operator.AND, true);
        return convertDefinitionDocsToSuggestion(results);
    }

    /**
     * retrieves forms from the lexicon
     * 
     * @param suggestionType indicates greek/hebrew look ups
     * @param form the form
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingFormsFromLexicon(final LexicalSuggestionType suggestionType,
            final String form) {

        final EntityDoc[] results = this.definitions.search(
                new String[] { "accentedUnicode", "betaAccented", "stepTransliteration",
                        "simplifiedStepTransliteration", "twoLetter", "otherTransliteration" },
                QueryParser.escape(form) + '*', getStrongFilter(suggestionType), TRANSLITERATION_SORT, true,
                MAX_SUGGESTIONS);

        return convertDefinitionDocsToSuggestion(results);
    }

    /**
     * Takes EntityDocs representing Definition entities and converts them to a suggestion
     * 
     * @param results the results
     * @return true
     */
    private List<LexiconSuggestion> convertDefinitionDocsToSuggestion(final EntityDoc[] results) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        for (final EntityDoc def : results) {
            suggestions.add(convertToSuggestion(def));
        }
        return suggestions;
    }

    /**
     * retrieves forms from the lexicon
     * 
     * @param suggestionType indicates greek/hebrew look ups
     * @param form form in lower case, containing a % if appropriate
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingAllForms(final LexicalSuggestionType suggestionType,
            final String form) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();

        // TODO make into re-usable cache
        final EntityDoc[] searchResults = this.specificForms.search(new String[] { "accentedUnicode",
                "simplifiedStepTransliteration" }, QueryParser.escape(form) + '*',
                getStrongFilter(suggestionType), TRANSLITERATION_SORT, true, MAX_SUGGESTIONS);

        for (final EntityDoc f : searchResults) {
            final LexiconSuggestion suggestion = convertToSuggestionFromSpecificForm(f);
            if (suggestion != null) {
                suggestions.add(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * Filters the query by strong number
     * 
     * @param suggestionType the type of suggestion
     * @return a greek or hebrew filter
     */
    private Filter getStrongFilter(final LexicalSuggestionType suggestionType) {
        return suggestionType == LexicalSuggestionType.GREEK ? GREEK_FILTER : HEBREW_FILTER;
    }

    /**
     * Filters the query by strong number
     * 
     * @param isGreek true for greek, false for hebrew
     * @return the filter for greek or hebrew
     */
    private Filter getFilter(final boolean isGreek) {
        return isGreek ? GREEK_FILTER : HEBREW_FILTER;
    }

    private LexiconSuggestion convertToSuggestionFromSpecificForm(final EntityDoc specificForm) {
        final String strongNumber = specificForm.get(STRONG_NUMBER_FIELD);
        final EntityDoc[] results = this.definitions.searchExactTermBySingleField(STRONG_NUMBER_FIELD, 1,
                strongNumber);

        if (results.length > 0) {
            final LexiconSuggestion suggestion = new LexiconSuggestion();
            suggestion.setStrongNumber(strongNumber);
            suggestion.setGloss(results[0].get("stepGloss"));
            suggestion.setMatchingForm(specificForm.get("accentedUnicode"));
            suggestion.setStepTransliteration(specificForm.get("stepTransliteration"));
            markUpFrequentSuggestions(results[0], suggestion);
            return suggestion;
        }

        return null;
    }

    /**
     * convers a definition to a suggested form
     * 
     * @param def the definition
     * @return the suggestion
     */
    private LexiconSuggestion convertToSuggestion(final EntityDoc def) {
        final LexiconSuggestion suggestion = new LexiconSuggestion();
        suggestion.setGloss(def.get("stepGloss"));
        suggestion.setMatchingForm(def.get("accentedUnicode"));
        suggestion.setStepTransliteration(def.get("stepTransliteration"));
        suggestion.setStrongNumber(def.get(STRONG_NUMBER_FIELD));

        markUpFrequentSuggestions(def, suggestion);
        return suggestion;
    }

    private void markUpFrequentSuggestions(final EntityDoc def, final LexiconSuggestion suggestion) {
        final String stopWord = def.get("stopWord");
        if ("true".equals(stopWord)) {
            suggestion.setMatchingForm(suggestion.getMatchingForm() + " [too frequent]");
        }
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
        specialSort(sq, result);
        return result;
    }

    /**
     * We may have a special type of sort to operate
     * 
     * @param sq the search query
     * @param result the result to be sorted
     */
    private void specialSort(final SearchQuery sq, final SearchResult result) {
        // we only do this kind of sort if we have some strong numbers, and at least 2!
        if (result.getStrongHighlights() != null && result.getStrongHighlights().size() > 1) {

            result.setOrder(sq.getSortOrder());
            if (VOCABULARY_SORT.equals(sq.getSortOrder())) {
                sortByStrongNumber(sq, result, new GlossComparator());
            } else if (ORIGINAL_SPELLING_SORT.equals(sq.getSortOrder())) {
                sortByStrongNumber(sq, result, new OriginalSpellingComparator());
            }
        }
    }

    /**
     * For this kind of sort, we find out which strong number is present in a verse, then run a comparator on
     * the strong numbers sorts results by strong number
     * 
     * @param sq the search criteria
     * @param result results
     * @param comparator the comparator to use to sort the strong numbers
     */
    private void sortByStrongNumber(final SearchQuery sq, final SearchResult result,
            final Comparator<? super EntityDoc> comparator) {
        // sq should have the strong numbers, if we're doing this kind of sort
        List<EntityDoc> definitions = sq.getDefinitions();
        if (definitions == null) {
            // stop searching
            LOGGER.warn("Attempting to sort by strong number, but no strong numbers available. ");
            return;
        }

        final Set<String> strongs = new HashSet<String>(result.getStrongHighlights());

        final List<SearchEntry> entries = result.getResults();
        final List<SearchEntry> noOrder = new ArrayList<SearchEntry>(0);

        final Map<String, List<VerseSearchEntry>> keyedOrder = new HashMap<String, List<VerseSearchEntry>>(
                strongs.size());

        for (final SearchEntry entry : entries) {
            boolean added = false;
            if (entry instanceof VerseSearchEntry) {

                for (final String strong : strongs) {
                    final VerseSearchEntry verse = (VerseSearchEntry) entry;

                    if (strong == null) {
                        continue;
                    }

                    if (verse.getPreview().contains(strong)) {
                        List<VerseSearchEntry> list = keyedOrder.get(strong);
                        if (list == null) {
                            list = new ArrayList<VerseSearchEntry>(16);
                            keyedOrder.put(strong, list);
                        }
                        list.add(verse);
                        added = true;
                        // break and continue with next entry
                        break;
                    }
                }

                // should never happen
                if (!added) {
                    noOrder.add(entry);
                }
            }
        }

        // now work out the order of the strong numbers, probably best in terms of the gloss...
        // order the definitions, then simply re-do the list of verse search entries
        Collections.sort(definitions, comparator);

        // if we have filters, then we need to reduce further...
        definitions = filterDefinitions(sq, definitions);

        // now we have sorted definitions, we need to rebuild the search result
        final List<SearchEntry> newOrder = new ArrayList<SearchEntry>();
        for (final EntityDoc def : definitions) {
            final List<VerseSearchEntry> list = keyedOrder.get(def.get(STRONG_NUMBER_FIELD));
            if (list != null) {
                newOrder.addAll(list);
                for (final VerseSearchEntry e : list) {
                    e.setStepGloss(def.get("stepGloss"));
                    e.setStepTransliteration(def.get("stepTransliteration"));
                    e.setAccentedUnicode(def.get("accentedUnicode"));
                }
            }
        }

        final String[] filter = sq.getCurrentSearch().getOriginalFilter();
        if (filter == null || filter.length == 0) {
            newOrder.addAll(noOrder);
        }
        result.setResults(specialPaging(sq, newOrder));
    }

    /**
     * Sets the definitions onto the result object
     * 
     * @param result the result object
     * @param definitions the definitions that have been included in the search
     */
    private void setDefinitionForResults(final SearchResult result, final List<EntityDoc> definitions) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        for (final EntityDoc def : definitions) {
            suggestions.add(convertToSuggestion(def));
        }
        result.setDefinitions(suggestions);
    }

    /**
     * Keep definitions that are of current interest to the user... Remove all others
     * 
     * @param sq the search criteria
     * @param definitions the definitions
     * @return a list of definitions to be included in the filter
     */
    private List<EntityDoc> filterDefinitions(final SearchQuery sq, final List<EntityDoc> definitions) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return definitions;
        }

        // bubble intersection, acceptable, because we're only dealing with a handful of definitions
        final List<EntityDoc> keep = new ArrayList<EntityDoc>(definitions.size());

        for (final EntityDoc def : definitions) {
            for (final String filteredValue : originalFilter) {
                if (def.get("accentedUnicode").equals(filteredValue)) {
                    keep.add(def);

                    // break out of filterValues loop, and proceed with next definition
                    break;
                }
            }
        }
        return keep;
    }

    /**
     * Reduces the results to the correct page size
     * 
     * @param sq the search criteria
     * @param newOrder the elements in the new order
     * @return the new set of results, with only pageSize results
     */
    private List<SearchEntry> specialPaging(final SearchQuery sq, final List<SearchEntry> newOrder) {
        // runs paging after a special sort
        sq.getPageNumber();
        sq.getPageSize();

        // we want
        final int firstElement = (sq.getPageNumber() - 1) * sq.getPageSize();
        final int lastElement = firstElement + sq.getPageSize();

        final List<SearchEntry> newResults = new ArrayList<SearchEntry>(sq.getPageSize());
        for (int ii = firstElement; ii < lastElement && ii < newOrder.size(); ii++) {
            newResults.add(newOrder.get(ii));
        }
        return newResults;
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
     * Parses the XML crudely, by looking for the strongs tags just prior to any hit
     * 
     * @param queryText the query text that we have hit
     * @param results the results to be parsed
     * @return a list of strongs
     */
    private Set<String> getStrongsForPhrase(final String queryText, final SearchResult results) {
        final List<SearchEntry> resultEntries = results.getResults();
        final Set<String> strongs = new HashSet<String>(5);

        for (final SearchEntry se : resultEntries) {
            if (se instanceof VerseSearchEntry) {
                final VerseSearchEntry verseSearchEntry = (VerseSearchEntry) se;
                strongs.addAll(parseVerseSearchEntry(queryText, verseSearchEntry));

            }
        }

        removeBlacklistedStrongs(strongs);

        return strongs;
    }

    /**
     * Removes strongs that can appear all over the place such as for the words "the"
     * 
     * @param strongs strong numbers
     */
    private void removeBlacklistedStrongs(final Set<String> strongs) {
        strongs.remove(STRONG_THE);
    }

    /**
     * Looks for a hit
     * 
     * @param queryString the text that is being searched for
     * @param verseSearchEntry a verse search entry
     * @return a list of strongs that have been found in the verse
     */
    private Set<String> parseVerseSearchEntry(final String queryString,
            final VerseSearchEntry verseSearchEntry) {
        final String preview = verseSearchEntry.getPreview();
        final Set<String> strongs = new HashSet<String>(4);

        // start at the end and work backwards
        int firstHit = preview.lastIndexOf(queryString);
        while (firstHit != -1) {
            // look for strong field
            final int startOfStrongField = preview.lastIndexOf(START_OF_STRONG_FIELD, firstHit);
            if (startOfStrongField != -1) {
                final int endOfStrongField = preview.indexOf('\'', startOfStrongField
                        + START_OF_STRONG_FIELD_LENGTH);
                final String substring = preview.substring(START_OF_STRONG_FIELD_LENGTH + startOfStrongField,
                        endOfStrongField);
                final String[] split = substring.split(" ");
                for (final String potentialStrong : split) {
                    strongs.add(potentialStrong);
                }
            }
            firstHit = preview.lastIndexOf(queryString, startOfStrongField);
        }

        return strongs;
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

        final SearchResult result = runStrongTextSearch(sq, strongs);
        setDefinitionForResults(result, sq.getDefinitions());

        // we can now use the filter and save ourselves some effort

        return result;
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
        final SearchResult result = runStrongTextSearch(sq, strongs);
        setDefinitionForResults(result, sq.getDefinitions());
        return result;
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
        if (query.isEmpty()) {
            return new ArrayList<String>(0);
        }

        final boolean wildcard = query.charAt(query.length() - 1) == '*';
        final String searchQuery = wildcard ? query.replace("*", "%") : query;

        List<String> strongs;
        if (isDigit(query.charAt(0)) || (query.length() > 1 && isDigit(query.charAt(1)))) {
            // then we're dealing with a strong number, without its G/H prefix
            strongs = getStrongsFromCurrentSearch(sq);
        } else {
            // we're dealing with some sort of greek/hebrew form so we search the tables for this
            strongs = searchTextFieldsForDefinition(searchQuery, sq);
        }

        // run rules for transliteration
        if (strongs.isEmpty()) {
            // run transliteration rules
            final SearchType type = sq.getCurrentSearch().getType();
            if (type.isGreek() || type.isHebrew()) {
                strongs = findByTransliteration(searchQuery, type.isGreek());
            }
        }

        // now filter
        return strongs;
    }

    /**
     * Looks up all the glosses for a particular word, and then adapts to strong search and continues as
     * before
     * 
     * @param sq search criteria
     * @return a list of matching strongs
     */
    private List<String> adaptQueryForMeaningSearch(final SearchQuery sq) {
        final String query = sq.getCurrentSearch().getQuery();

        final QueryParser queryParser = new QueryParser(Version.LUCENE_30, "translations",
                this.definitions.getAnalyzer());
        queryParser.setDefaultOperator(Operator.AND);
        try {
            final Query parsed = queryParser.parse("-stopWord:true " + query);
            final EntityDoc[] matchingMeanings = this.definitions.search(parsed);

            final List<String> strongs = new ArrayList<String>(matchingMeanings.length);
            for (final EntityDoc d : matchingMeanings) {
                if (isInFilter(d, sq)) {
                    strongs.add(d.get(STRONG_NUMBER_FIELD));
                }
            }

            final String textQuery = getQuerySyntaxForStrongs(strongs, sq);
            sq.getCurrentSearch().setQuery(textQuery);
            sq.setDefinitions(matchingMeanings);

            // return the strongs that the search will match
            return strongs;
        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query for meaning search", e);
        }
    }

    /**
     * Returns true to indicate that the specified definition object should be included in the text search
     * 
     * @param d the definition
     * @param sq the search criteria
     * @return true if the object is to be included
     */
    private boolean isInFilter(final EntityDoc d, final SearchQuery sq) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return true;
        }

        for (final String filterValue : originalFilter) {
            if (filterValue.equals(d.get(STRONG_NUMBER_FIELD))) {
                return true;
            }
        }
        return false;
    }

    private boolean isInFilter(final String s, final SearchQuery sq) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return true;
        }

        for (final String filterValue : originalFilter) {
            if (filterValue.equals(s)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Takes in a normal search query, and adapts the current search by rewriting the query syntax so that it
     * can be parsed by JSword
     * 
     * @param sq the search query
     * @return a list of all matching strongs
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
     * @return a list of strong numbers
     */
    private List<String> adaptQueryForRelatedStrongSearch(final SearchQuery sq) {
        final List<String> strongsFromQuery = getStrongsFromTextCriteria(sq);

        final QueryParser p = new QueryParser(Version.LUCENE_30, STRONG_NUMBER_FIELD,
                this.definitions.getAnalyzer());
        final StringBuilder query = new StringBuilder(strongsFromQuery.size() * 6 + 16);
        query.append("-stopWord:true ");
        for (final String strong : strongsFromQuery) {
            query.append(strong);
            query.append(' ');

            // add related strong field
            query.append("relatedNumbers:");
            query.append(strong);
            query.append(' ');
        }

        Query q;
        try {
            q = p.parse(query.toString());
        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query", e);
        }

        final EntityDoc[] results = this.definitions.search(q);

        // filter original set:
        final List<String> filteredStrongs = new ArrayList<String>(strongsFromQuery.size());
        for (final String s : strongsFromQuery) {
            if (isInFilter(s, sq)) {
                filteredStrongs.add(s);
            }
        }

        // matchedStrongs.addAll(strongs);
        for (final EntityDoc doc : results) {
            // remove from matched strong if not in filter
            if (isInFilter(doc, sq)) {
                filteredStrongs.add(doc.get(STRONG_NUMBER_FIELD));
            }
        }

        final String queryString = getQuerySyntaxForStrongs(filteredStrongs, sq);

        // we can now change the individual search query, to the real text search
        sq.getCurrentSearch().setQuery(queryString);
        sq.setDefinitions(results);

        // return the strongs that the search will match
        return strongsFromQuery;
    }

    /**
     * Searches the underlying DB for the relevant entry
     * 
     * @param searchQuery the query that is being passed in
     * @param sq the search criteria
     * @return the list of strongs matched
     */
    private List<String> searchTextFieldsForDefinition(final String searchQuery, final SearchQuery sq) {
        // first look through the text forms

        final EntityDoc[] results = this.specificForms.search(new String[] { "accentedUnicode" },
                searchQuery, null, null, false, "-stopWord:false");
        if (results.length == 0) {
            return lookupFromLexicon(searchQuery, sq);
        }

        // if we matched more than one, then we don't have our assumed uniqueness... log warning and
        // continue with first matched strong
        final List<String> listOfStrongs = new ArrayList<String>();
        for (final EntityDoc f : results) {
            listOfStrongs.add(f.get(STRONG_NUMBER_FIELD));
        }
        return listOfStrongs;
    }

    /**
     * Looks up the search criteria from the lexicon
     * 
     * @param query the query
     * @param sq the search criteria
     * @return a list of strong numbers
     */
    private List<String> lookupFromLexicon(final String query, final SearchQuery sq) {
        // if we still have nothing, then look through the definitions
        final QueryParser parser = new QueryParser(Version.LUCENE_30, "accentedUnicode",
                this.definitions.getAnalyzer());
        Query parsed;
        try {
            parsed = parser.parse(QueryParser.escape(query));
        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query", e);
        }

        final EntityDoc[] results = this.definitions.search(parsed);

        final List<String> matchedStrongs = new ArrayList<String>();
        for (final EntityDoc d : results) {
            matchedStrongs.add(d.get(STRONG_NUMBER_FIELD));
        }

        return matchedStrongs;
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
     * @param sq
     * 
     * @param query the query to be found
     * @return the strongs that have been found/matched.
     */
    private List<String> findByTransliteration(final String query, final boolean isGreek) {
        // first find by transliterations that we have
        final String lowerQuery = query.toLowerCase();

        final String simplifiedTransliteration = adaptForUnaccentedTransliteration(lowerQuery, isGreek);

        final EntityDoc[] specificForms = this.specificForms.search(
                new String[] { "simplifiedTransliteration" }, simplifiedTransliteration, getFilter(isGreek),
                null, false);

        // finally, if we haven't found anything, then abort
        if (specificForms != null) {
            final List<String> strongs = new ArrayList<String>(specificForms.length);
            // nothing to search for..., so abort query
            for (final EntityDoc f : specificForms) {
                strongs.add(f.get(STRONG_NUMBER_FIELD));
            }
            return strongs;
        }

        final MultiFieldQueryParser queryParser = new MultiFieldQueryParser(Version.LUCENE_30, new String[] {
                "simplifiedTransliteration", "stepTransliteration", "otherTransliteration" },
                this.definitions.getAnalyzer());

        try {
            final Query luceneQuery = queryParser.parse("-stopWord:true " + lowerQuery);
            final EntityDoc[] results = this.definitions.search(luceneQuery);

            if (results.length == 0) {
                throw new AbortQueryException("No definitions found for input");
            }
            final List<String> strongs = new ArrayList<String>(results.length);
            for (final EntityDoc d : results) {
                strongs.add(d.get(STRONG_NUMBER_FIELD));
            }
            return strongs;
        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query", e);
        }

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
        return buildTimelineSearchResults(sq,
                this.timelineEvents.searchSingleColumn("name", sq.getCurrentSearch().getQuery()));
    }

    /**
     * Runs a timeline search, keyed by reference
     * 
     * @param sq the search query
     * @return the search results
     */
    private SearchResult runTimelineReferenceSearch(final SearchQuery sq) {
        final EntityDoc[] events = this.timeline.lookupEventsMatchingReference(sq.getCurrentSearch()
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
    private SearchResult buildTimelineSearchResults(final SearchQuery sq, final EntityDoc[] events) {
        final List<SearchEntry> results = new ArrayList<SearchEntry>();
        final SearchResult r = new SearchResult();
        r.setResults(results);

        for (final EntityDoc e : events) {
            final String refs = e.get("storedReferences");
            final String[] references = StringUtils.split(refs);

            final List<VerseSearchEntry> verses = new ArrayList<VerseSearchEntry>();

            // TODO FIXME: REFACTOR to only make 1 jsword call?
            for (final String ref : references) {
                // TODO: REFACTOR only supports one version lookup
                final OsisWrapper peakOsisText = this.jsword.peakOsisText(
                        sq.getCurrentSearch().getVersions()[0], TimelineService.KEYED_REFERENCE_VERSION, ref);

                final VerseSearchEntry verseEntry = new VerseSearchEntry();
                verseEntry.setKey(peakOsisText.getReference());
                verseEntry.setPreview(peakOsisText.getValue());
                verses.add(verseEntry);
            }

            final TimelineEventSearchEntry entry = new TimelineEventSearchEntry();
            entry.setId(e.get("id"));
            entry.setDescription(e.get("name"));
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
}
