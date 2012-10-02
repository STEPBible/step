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
import static com.tyndalehouse.step.core.utils.StringConversionUtils.unAccent;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static java.lang.Character.isDigit;
import static java.lang.String.format;

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

import org.crosswire.jsword.passage.Key;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.lexicon.Definition;
import com.tyndalehouse.step.core.data.entities.lexicon.SpecificForm;
import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;
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
    private static final String STRONG_THE = "G3588";
    private static final String START_OF_STRONG_FIELD = "strong='";
    private static final int START_OF_STRONG_FIELD_LENGTH = START_OF_STRONG_FIELD.length();
    private static final int MAX_SUGGESTIONS = 20;
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
    public List<LexiconSuggestion> getLexicalSuggestions(final LexicalSuggestionType suggestionType,
            final String form, final boolean includeAllForms) {
        if (isEmpty(form)) {
            return new ArrayList<LexiconSuggestion>();
        }

        final String lowerForm = form.toLowerCase() + '%';

        if (includeAllForms) {
            return getMatchingAllForms(suggestionType, lowerForm);
        } else {
            return getMatchingFormsFromLexicon(suggestionType, form, lowerForm);
        }
    }

    /**
     * retrieves forms from the lexicon
     * 
     * @param suggestionType indicates greek/hebrew look ups
     * @param form the form
     * @param lowerForm form in lower case, containing a % if appropriate
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingFormsFromLexicon(final LexicalSuggestionType suggestionType,
            final String form, final String lowerForm) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        final List<Definition> definitions = this.ebean.find(Definition.class)
                .select("accentedUnicode,stepTransliteration,stepGloss,blacklisted").where()
                .eq("blacklisted", false).like("strongNumber", suggestionType.getStrongPattern())
                .disjunction().like("accentedUnicode", lowerForm).like("unaccentedUnicode", lowerForm)
                .like("strongTranslit", lowerForm).like("strongPronunc", lowerForm)
                .like("stepTransliteration", lowerForm).like("unaccentedStepTransliteration", lowerForm)
                .like("alternativeTranslit1", lowerForm).like("alternativeTranslit1Unaccented", lowerForm)
                .eq("strongNumber", form).endJunction().setMaxRows(MAX_SUGGESTIONS).findList();
        for (final Definition def : definitions) {
            suggestions.add(convertToSuggestion(def));
        }
        return suggestions;
    }

    /**
     * retrieves forms from the lexicon
     * 
     * @param suggestionType indicates greek/hebrew look ups
     * @param lowerForm form in lower case, containing a % if appropriate
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingAllForms(final LexicalSuggestionType suggestionType,
            final String lowerForm) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();

        final List<SpecificForm> forms = this.ebean.find(SpecificForm.class)
                .fetch("strongNumber", "accentedUnicode,stepTransliteration,stepGloss,blacklisted").where()
                .disjunction().like("rawForm", lowerForm).like("unaccentedForm", unAccent(lowerForm))
                .like("transliteration", lowerForm).endJunction()
                .like("rawStrongNumber", suggestionType.getStrongPattern()).setMaxRows(MAX_SUGGESTIONS)
                .findList();

        for (final SpecificForm f : forms) {
            suggestions.add(convertToSuggestion(f));
        }
        return suggestions;
    }

    /**
     * @param f form retrieved from the database
     * @return the suggestion put back to the user
     */
    private LexiconSuggestion convertToSuggestion(final SpecificForm f) {
        final Definition strongNumber = f.getStrongNumber();
        final LexiconSuggestion suggestion = convertToSuggestion(strongNumber);

        suggestion.setMatchingForm(f.getRawForm());
        suggestion.setStepTransliteration(f.getTransliteration());
        return suggestion;
    }

    /**
     * convers a definition to a suggested form
     * 
     * @param def the definition
     * @return the suggestion
     */
    private LexiconSuggestion convertToSuggestion(final Definition def) {
        final LexiconSuggestion suggestion = new LexiconSuggestion();
        suggestion.setGloss(def.getStepGloss());

        if (Boolean.TRUE.equals(def.getBlacklisted())) {
            suggestion.setMatchingForm(def.getAccentedUnicode() + " [too frequent]");
        } else {
            suggestion.setMatchingForm(def.getAccentedUnicode());
        }

        suggestion.setStepTransliteration(def.getStepTransliteration());
        return suggestion;
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
            final Comparator<? super Definition> comparator) {
        // sq should have the strong numbers, if we're doing this kind of sort
        List<Definition> definitions = sq.getDefinitions();
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
        for (final Definition def : definitions) {
            final List<VerseSearchEntry> list = keyedOrder.get(def.getStrongNumber());
            if (list != null) {
                newOrder.addAll(list);
                for (final VerseSearchEntry e : list) {
                    e.setStepGloss(def.getStepGloss());
                    e.setStepTransliteration(def.getStepTransliteration());
                    e.setAccentedUnicode(def.getAccentedUnicode());
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
    private void setDefinitionForResults(final SearchResult result, final List<Definition> definitions) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        for (final Definition def : definitions) {
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
    private List<Definition> filterDefinitions(final SearchQuery sq, final List<Definition> definitions) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return definitions;
        }

        // bubble intersection, acceptable, because we're only dealing with a handful of definitions
        final List<Definition> keep = new ArrayList<Definition>(definitions.size());

        for (final Definition def : definitions) {
            for (final String filteredValue : originalFilter) {
                if (def.getAccentedUnicode().equals(filteredValue)) {
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
            strongs = findByTransliteration(searchQuery);
        }
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

        // TODO having wildcards both before and after and after is not good for performance - revise and use
        // full text search?
        final List<Definition> matchingMeanings = this.ebean.find(Definition.class)
                .select("accentedUnicode,strongNumber,stepGloss,accentedUnicode,stepTransliteration").where()
                .eq("blacklisted", false).ilike("translations.alternativeTranslation", "%" + query + "%")
                .findList();

        final List<String> strongs = new ArrayList<String>(matchingMeanings.size());
        for (final Definition d : matchingMeanings) {
            if (isInFilter(d, sq)) {
                strongs.add(d.getStrongNumber());
            }
        }

        final String textQuery = getQuerySyntaxForStrongs(strongs, sq);
        sq.getCurrentSearch().setQuery(textQuery);
        sq.setDefinitions(matchingMeanings);

        // return the strongs that the search will match
        return strongs;
    }

    /**
     * Returns true to indicate that the specified definition object should be included in the text search
     * 
     * @param d the definition
     * @param sq the search criteria
     * @return true if the object is to be included
     */
    private boolean isInFilter(final Definition d, final SearchQuery sq) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return true;
        }

        for (final String filterValue : originalFilter) {
            if (filterValue.equals(d.getAccentedUnicode())) {
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

        // remove strongs if not in filter
        final List<Definition> matchedStrongs = new ArrayList<Definition>();

        // get all similar ones
        final List<Definition> strongs = this.ebean
                .find(Definition.class)
                .fetch("similarStrongs",
                        "accentedUnicode,strongNumber,stepGloss,accentedUnicode,stepTransliteration")
                .select("strongNumber,stepGloss,accentedUnicode,stepTransliteration").where()
                .eq("blacklisted", false).eq("blacklisted", false).in("strongNumber", strongsFromQuery)
                .findList();

        matchedStrongs.addAll(strongs);
        for (final Definition s : strongs) {
            // remove from matched strong if not in filter
            if (!isInFilter(s, sq)) {
                strongsFromQuery.remove(s.getStrongNumber());
            }

            final List<Definition> similarStrongs = s.getSimilarStrongs();

            matchedStrongs.addAll(similarStrongs);
            for (final Definition similar : similarStrongs) {
                if (this.isInFilter(similar, sq)) {
                    strongsFromQuery.add(similar.getStrongNumber());
                }
            }
        }

        final String query = getQuerySyntaxForStrongs(strongsFromQuery, sq);

        // we can now change the individual search query, to the real text search
        sq.getCurrentSearch().setQuery(query);
        sq.setDefinitions(matchedStrongs);

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

        List<SpecificForm> forms = this.ebean.find(SpecificForm.class).select("rawStrongNumber").where()
                .eq("strongNumber.blacklisted", false).like("rawForm", searchQuery).findList();

        if (forms.isEmpty()) {
            final String unaccentedForm = unaccent(searchQuery, sq);

            if (unaccentedForm.charAt(unaccentedForm.length() - 1) == '*') {
                forms = this.ebean.find(SpecificForm.class).select("rawStrongNumber").where()
                        .eq("strongNumber.blacklisted", false).like("unaccentedForm", searchQuery).findList();
            } else {
                forms = this.ebean.find(SpecificForm.class).select("rawStrongNumber").where()
                        .eq("strongNumber.blacklisted", false).eq("unaccentedForm", searchQuery).findList();
            }
        }

        if (forms.isEmpty()) {
            return lookupFromLexicon(searchQuery, sq);
        }

        // if we matched more than one, then we don't have our assumed uniqueness... log warning and
        // continue with first matched strong

        final List<String> listOfStrongs = new ArrayList<String>();
        for (final SpecificForm f : forms) {
            listOfStrongs.add(f.getRawStrongNumber());
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
        // forms in lexicons are stored in lowercase
        final String queryLower = query.toLowerCase();

        // if we still have nothing, then look through the definitions
        List<Definition> definitions = this.ebean.find(Definition.class).select("strongNumber").where()
                .like("accentedUnicode", queryLower).eq("blacklisted", false).findList();

        if (definitions.isEmpty()) {
            definitions = this.ebean.find(Definition.class).select("strongNumber").where()
                    .like("unaccentedUnicode", unaccent(queryLower, sq)).eq("blacklisted", false).findList();
        }

        final List<String> matchedStrongs = new ArrayList<String>();
        if (definitions == null) {
            return matchedStrongs;
        }

        for (final Definition d : definitions) {
            matchedStrongs.add(d.getStrongNumber());
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
     * @param query the query to be found
     * @return the strongs that have been found/matched.
     */
    private List<String> findByTransliteration(final String query) {
        // first find by transliterations that we have
        final String lowerQuery = query.toLowerCase();
        final String betaQuery = toBetaLowercase(lowerQuery);
        final String betaUnaccentedQuery = toBetaUnaccented(lowerQuery);

        final List<Definition> defs = this.ebean.find(Definition.class).select("strongNumber").where()
                .eq("blacklisted", false).disjunction().eq("stepTransliteration", lowerQuery)
                .like("unaccentedStepTransliteration", lowerQuery).like("strongPronunc", lowerQuery)
                .like("strongTranslit", lowerQuery).like("alternativeTranslit1", betaQuery)
                .like("alternativeTranslit1Unaccented", betaUnaccentedQuery).findList();

        // finally, if we haven't found anything, then abort
        if (defs.isEmpty()) {
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
}
