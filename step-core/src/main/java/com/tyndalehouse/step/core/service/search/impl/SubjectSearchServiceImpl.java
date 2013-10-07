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
package com.tyndalehouse.step.core.service.search.impl;

import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.search.ExpandableSubjectHeadingEntry;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.service.impl.IndividualSearch;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.utils.LuceneUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.queryParser.QueryParser;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.*;

import static com.tyndalehouse.step.core.models.LookupOption.HEADINGS_ONLY;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

/**
 * Searches for a subject
 *
 * @author chrisburrell
 */
@Singleton
public class SubjectSearchServiceImpl implements SubjectSearchService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SubjectSearchServiceImpl.class);
    private final EntityIndexReader naves;
    private final JSwordSearchService jswordSearch;
    private final JSwordPassageService jswordPassage;

    /**
     * Instantiates a new subject search service impl.
     *
     * @param entityManager an entity manager providing access to all the different entities.
     * @param jswordSearch  the search service for text searching in jsword
     * @param jswordPassage the jsword passage
     */
    @Inject
    public SubjectSearchServiceImpl(final EntityManager entityManager,
                                    final JSwordSearchService jswordSearch, final JSwordPassageService jswordPassage) {
        this.jswordSearch = jswordSearch;
        this.jswordPassage = jswordPassage;
        this.naves = entityManager.getReader("nave");
    }

    @Override
    public List<String> autocomplete(String userEnteredTerm) {
        if (StringUtils.isBlank(userEnteredTerm)) {
            return new ArrayList<String>(0);
        }

        //take the last word
        final String trimmedUserEntry = userEnteredTerm.toLowerCase().trim();
        int lastWordStart = trimmedUserEntry.indexOf(' ');
        String searchTerm = lastWordStart != -1 ? trimmedUserEntry.substring(lastWordStart + 1) : trimmedUserEntry;

        Set<String> naveTerms = this.naves.findSetOfTermsStartingWith(QueryParser.escape(searchTerm), "root", "fullHeaderAnalyzed");
        naveTerms.addAll(LuceneUtils.getAllTermsPrefixedWith(this.jswordSearch.getIndexSearcher(JSwordPassageService.REFERENCE_BOOK),
                LuceneIndex.FIELD_HEADING,
                searchTerm));

        final ArrayList<String> results = new ArrayList<String>(naveTerms);
        Collections.sort(results);
        return results;
    }

    @Override
    public SearchResult searchByMultipleReferences(final String version, final String references) {
        final String allReferences = this.jswordPassage.getAllReferences(references, version);
        return searchByReference(allReferences);

    }

    @Override
    public SearchResult searchByReference(final String referenceQuerySyntax) {
        final SearchResult sr = new SearchResult();
        sr.setQuery("sr=" + referenceQuerySyntax);

        //referenceQuerySyntax could be a full referenceQuerySyntax, or could be the start of a referenceQuerySyntax here
        final EntityDoc[] results = this.naves.searchSingleColumn("expandedReferences", referenceQuerySyntax);
        final List<SearchEntry> resultList = new ArrayList<SearchEntry>(results.length);
        for (final EntityDoc d : results) {
            final ExpandableSubjectHeadingEntry entry = new ExpandableSubjectHeadingEntry(d.get("root"),
                    d.get("fullHeader"), d.get("alternate"));
            resultList.add(entry);
        }

        sr.setResults(resultList);
        sr.setTotal(resultList.size());
        return sr;
    }

    @Override
    public SearchResult search(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        LOGGER.debug("Executing subject search of type [{}]", currentSearch.getType());

        SearchQuery currentQuery = sq;
        switch (currentSearch.getType()) {
            case SUBJECT_SIMPLE:
                final SearchResult simpleSearchResults = searchSimple(currentQuery);
                if (haveSearchResults(simpleSearchResults)) {
                    return simpleSearchResults;
                }
                //otherwise fall-through, and convert search to a nave search
                currentQuery = convertToNewSubjectSearchQuery(currentQuery, "s=", "s+=");
            case SUBJECT_EXTENDED:
                final SearchResult searchResult = searchExtended(currentQuery);
                if (haveSearchResults(searchResult)) {
                    searchResult.setQuery(currentSearch.getQuery());
                    return searchResult;
                }
                //otherwise fall-through
                currentQuery = convertToNewSubjectSearchQuery(currentQuery, "s+=", "s++=");
            case SUBJECT_FULL:
                return searchFull(currentQuery);
            case SUBJECT_RELATED:
                return relatedSubjects(currentQuery);
            default:
                break;

        }
        return searchSimple(currentQuery);
    }

    /**
     * Promotes or demotes a query by recreating the search query
     * @param expectedPrefix the expected prefix
     * @param newSearchPrefix the new search prefix
     * @param sq the search query
     * @return the new search query
     */
    private SearchQuery convertToNewSubjectSearchQuery(final SearchQuery sq, final String expectedPrefix, final String newSearchPrefix) {
        
        final SearchQuery newSearchQuery = new SearchQuery(sq.getOriginalQuery().replaceFirst(expectedPrefix, newSearchPrefix),
                sq.getSortOrder(),
                sq.getContext(),
                sq.getPageNumber(),
                sq.getPageSize());
        sq.setOriginalQuery(newSearchQuery.getOriginalQuery());
        return newSearchQuery;
    }

    /**
     * Returns true if we have search results.
     *
     * @param searchResult the search results themselves
     * @return true if more than 1 result is found
     */
    private boolean haveSearchResults(final SearchResult searchResult) {
        return searchResult.getTotal() != 0;
    }

    /**
     * Related subject returns subjects, not verses...
     *
     * @param sq the search query.
     * @return the subjects
     */
    private SearchResult relatedSubjects(final SearchQuery sq) {
        return searchByMultipleReferences(sq.getCurrentSearch().getVersions()[0], sq.getCurrentSearch().getQuery());
    }

    /**
     * runs a simple subject search
     *
     * @param sq the search query
     * @return the results
     */
    private SearchResult searchSimple(final SearchQuery sq) {
        sq.setAllKeys(true);

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
     * Carries out the extended search
     *
     * @param sq the search query
     * @return results with the headings only
     */
    private SearchResult searchExtended(final SearchQuery sq) {
        final long start = System.currentTimeMillis();
        final String query = sq.getCurrentSearch().getQuery();

        final String[] split = StringUtils.split(query, "[, -=:]+");
        final StringBuilder sb = new StringBuilder(query.length() + 16);
        for (final String s : split) {
            // set mandatory
            sb.append(" ");
            sb.append(QueryParser.escape(s.trim()));
        }

        final EntityDoc[] results = this.naves.searchSingleColumn("rootStem", sb.toString(), false);
        return getHeadingsSearchEntries(start, results);
    }

    /**
     * Carries out the full search
     *
     * @param sq the search query
     * @return results with the headings only
     */
    private SearchResult searchFull(final SearchQuery sq) {
        final long start = System.currentTimeMillis();
        final EntityDoc[] results = this.naves.search(new String[]{"rootStem", "fullHeaderAnalyzed"},
                QueryParser.escape(sq.getCurrentSearch().getQuery()), false);
        return getHeadingsSearchEntries(start, results);
    }

    /**
     * @param start   the start time
     * @param results the results that have been found
     * @return the list of results
     */
    private SearchResult getHeadingsSearchEntries(final long start, final EntityDoc[] results) {
        final List<SearchEntry> headingMatches = new ArrayList<SearchEntry>(results.length);
        for (final EntityDoc d : results) {
            headingMatches.add(new ExpandableSubjectHeadingEntry(d.get("root"), d.get("fullHeader"), d
                    .get("alternate")));
        }

        // sort the results
        Collections.sort(headingMatches, new Comparator<SearchEntry>() {

            @Override
            public int compare(final SearchEntry o1, final SearchEntry o2) {
                final ExpandableSubjectHeadingEntry e1 = (ExpandableSubjectHeadingEntry) o1;
                final ExpandableSubjectHeadingEntry e2 = (ExpandableSubjectHeadingEntry) o2;

                return compareSubjectEntries(e1, e2);
            }

        });

        final SearchResult sr = new SearchResult();
        sr.setTimeTookTotal(System.currentTimeMillis() - start);
        sr.setTimeTookToRetrieveScripture(0);
        sr.setResults(headingMatches);
        sr.setTotal(headingMatches.size());
        return sr;
    }

    /**
     * Compares two entries.
     *
     * @param e1 the first entry
     * @param e2 the second entry
     * @return See {@link Comparable } for the return values
     */
    private int compareSubjectEntries(final ExpandableSubjectHeadingEntry e1,
                                      final ExpandableSubjectHeadingEntry e2) {
        final int rootCompare = e1.getRoot().compareToIgnoreCase(e2.getRoot());
        if (rootCompare != 0) {
            return rootCompare;
        }

        // we make sure that entries that start with "See " go to the bottom

        final String e1SeeAlso = e1.getSeeAlso();
        final String e2SeeAlso = e2.getSeeAlso();

        final boolean isSeeRef1 = isBlank(e1SeeAlso);
        final boolean isSeeRef2 = isBlank(e2SeeAlso);
        if (isSeeRef1 && !isSeeRef2) {
            return 1;
        } else if (!isSeeRef1 && isSeeRef2) {
            return -1;
        }

        final String heading1 = e1.getHeading();
        final String heading2 = e1.getHeading();
        return compareHeadings(heading1, heading2);
    }

    /**
     * Compares the headings of two entries
     *
     * @param heading1 first heading
     * @param heading2 second heading
     * @return accounts for nulls, such that two nulls are equal, a single null comes before any other string
     */
    private int compareHeadings(final String heading1, final String heading2) {
        if (heading1 == null && heading2 == null) {
            return 0;
        } else if (heading1 == null) {
            return -1;
        } else if (heading2 == null) {
            return 1;
        }

        return heading1.compareToIgnoreCase(heading2);
    }
}
