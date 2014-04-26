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
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.StringAndCount;
import com.tyndalehouse.step.core.models.search.ExpandableSubjectHeadingEntry;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.service.impl.IndividualSearch;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static com.tyndalehouse.step.core.models.LookupOption.HEADINGS_ONLY;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

/**
 * Searches for a subject
 *
 * @author chrisburrell
 */
@Singleton
public class SubjectSearchServiceImpl extends AbstractSubjectSearchServiceImpl implements SubjectSearchService {
    private static final Sort NAVE_SORT = new Sort(new SortField("root", SortField.STRING_VAL), new SortField("fullHeader", SortField.STRING_VAL));
    private static final String[] REF_VERSIONS = new String[]{JSwordPassageService.REFERENCE_BOOK, JSwordPassageService.SECONDARY_REFERENCE_BOOK};
    private static final Logger LOGGER = LoggerFactory.getLogger(SubjectSearchServiceImpl.class);
    public static final String NAVE_STORED_REFERENCES = "references";
    private final EntityIndexReader naves;
    private final JSwordSearchService jswordSearch;
    private final JSwordMetadataService jSwordMetadataService;
    private final JSwordModuleService jSwordModuleService;

    /**
     * Instantiates a new subject search service impl.
     *
     * @param entityManager an entity manager providing access to all the different entities.
     * @param jswordSearch  the search service for text searching in jsword
     */
    @Inject
    public SubjectSearchServiceImpl(final EntityManager entityManager,
                                    final JSwordSearchService jswordSearch,
                                    final JSwordMetadataService jSwordMetadataService,
                                    final JSwordModuleService jSwordModuleService,
                                    final JSwordVersificationService jSwordVersificationService) {
        super(jSwordVersificationService);
        this.jswordSearch = jswordSearch;
        this.jSwordMetadataService = jSwordMetadataService;
        this.jSwordModuleService = jSwordModuleService;
        this.naves = entityManager.getReader("nave");
    }


    @Override
    public SearchResult searchByMultipleReferences(final String version, final String references) {
        final StringAndCount allReferencesAndCounts = this.getInputReferenceForNaveSearch(references, version);
        int count = allReferencesAndCounts.getCount();
        if (count > JSwordPassageService.MAX_VERSES_RETRIEVED) {
            throw new TranslatedException("subject_reference_search_too_big",
                    Integer.valueOf(count).toString(),
                    Integer.valueOf(JSwordPassageService.MAX_VERSES_RETRIEVED).toString());
        }
        return searchByReference(allReferencesAndCounts.getValue());
    }

    @Override
    public SearchResult searchByReference(final String referenceQuerySyntax) {
        final SearchResult sr = new SearchResult();
        sr.setQuery("sr=" + referenceQuerySyntax);

        //referenceQuerySyntax could be a full referenceQuerySyntax, or could be the start of a referenceQuerySyntax here
        final EntityDoc[] results = getDocsByExpandedReferences(referenceQuerySyntax);
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

    /**
     * @param referenceQuerySyntax ther
     * @return
     */
    private EntityDoc[] getDocsByExpandedReferences(String referenceQuerySyntax) {
        return this.naves.searchSingleColumn("expandedReferences", referenceQuerySyntax, NAVE_SORT);
    }


    @Override
    public SearchResult search(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        LOGGER.debug("Executing subject search of type [{}]", currentSearch.getType());

        SearchQuery currentQuery = sq;
        switch (currentSearch.getType()) {
            case SUBJECT_SIMPLE:
                final SearchResult simpleSearchResults = searchSimple(currentQuery);
                return simpleSearchResults;
            case SUBJECT_EXTENDED:
                final SearchResult searchResult = searchExtended(currentQuery);
                searchResult.setQuery(currentSearch.getQuery());
                return searchResult;
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
     * Related subject returns subjects, not verses...
     *
     * @param sq the search query.
     * @return the subjects
     */
    private SearchResult relatedSubjects(final SearchQuery sq) {
        return searchByMultipleReferences(sq.getCurrentSearch().getVersions()[0], sq.getCurrentSearch().getQuery());
    }

    @Override
    public Key getKeys(SearchQuery sq) {
        switch (sq.getCurrentSearch().getType()) {
            case SUBJECT_SIMPLE:
                final String[] originalVersions = sq.getCurrentSearch().getVersions();
                prepareSearchForHeadings(sq);
                final Key allTopics = this.jswordSearch.searchKeys(sq);
                cleanUpSearchFromHeadingsSearch(sq, originalVersions);
                return allTopics;
            case SUBJECT_EXTENDED:
                return naveDocsToReference(sq, this.getNaveDocs(sq));
            case SUBJECT_FULL:
                return naveDocsToReference(sq, this.getNaveDocs(sq));
            case SUBJECT_RELATED:
                return naveDocsToReference(sq, getDocsByExpandedReferences(this.getInputReferenceForNaveSearch(
                        sq.getCurrentSearch().getVersions()[0],
                        sq.getCurrentSearch().getQuery()).getValue()));
            default:
                throw new StepInternalException("Unrecognized subject search");
        }
    }

    /**
     * Converts a set of nave documents to their reference equivalent
     *
     * @param extendedDocs
     * @return
     */
    private Key naveDocsToReference(SearchQuery sq, EntityDoc[] extendedDocs) {
        String mainVersion = sq.getCurrentSearch().getVersions()[0];
        Book bookFromVersion = this.jSwordVersificationService.getBookFromVersion(mainVersion);
        Key passageKey = null;
        for (EntityDoc d : extendedDocs) {
            String storedReferences = d.get(NAVE_STORED_REFERENCES);
            final Key key;
            try {
                key = bookFromVersion.getKey(storedReferences);
            } catch (Exception ex) {
                throw new StepInternalException("Stored references are unparseable in nave module: " + storedReferences);
            }

            if (passageKey == null) {
                passageKey = key;
            } else {
                passageKey.addAll(key);
            }
        }

        return passageKey;
    }

    /**
     * runs a simple subject search
     *
     * @param sq the search query
     * @return the results
     */
    private SearchResult searchSimple(final SearchQuery sq) {
        //ensure we're using the latest range
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        currentSearch.setQuery(currentSearch.getQuery(), true);

        final String[] originalVersions = currentSearch.getVersions();
        final String[] searchableVersions = prepareSearchForHeadings(sq);
        final Key allTopics = this.jswordSearch.searchKeys(sq);

        SearchResult resultsAsHeadings = getResultsAsHeadings(sq, searchableVersions, allTopics);
        cleanUpSearchFromHeadingsSearch(sq, originalVersions);
        return resultsAsHeadings;
    }

    /**
     * Performs clean up operation on the search query object, restoring the original versions
     *
     * @param sq               the search query
     * @param originalVersions the original versions prior to the query being run.
     */
    private void cleanUpSearchFromHeadingsSearch(SearchQuery sq, String[] originalVersions) {
        sq.getCurrentSearch().setVersions(originalVersions);
    }

    /**
     * Amends the SearchQuery object to contain the versions that we should use for a headings search
     *
     * @param sq the search query
     * @return the versions that should be searched
     */
    private String[] prepareSearchForHeadings(SearchQuery sq) {
        final String[] searchableVersions = getHeadingVersions(sq);
        sq.getCurrentSearch().setVersions(searchableVersions);
        return searchableVersions;
    }

    /**
     * @param sq the search query
     * @return the set of versions to search against for obtaining headings
     */
    private String[] getHeadingVersions(SearchQuery sq) {
        //versions are - the ones selected + the ESV & NIV
        Set<String> versions = new LinkedHashSet<String>(Arrays.asList(sq.getCurrentSearch().getVersions()));
        for (String s : REF_VERSIONS) {
            //only add if available
            if (this.jSwordModuleService.isInstalled(s) && this.jSwordModuleService.isIndexed(s)) {
                versions.add(s);
            } else {
                LOGGER.error("Unable to search across [{}]", s);
            }
        }

        trimToVersionsWithHeadingsOnly(versions);
        if (versions.size() == 0) {
            //unable to search versions
            throw new StepInternalException("Unable to carry out normal search. ESV and NIV are both absent.");
        }

        if (versions.size() > 1) {
            sq.setInterlinearMode(InterlinearMode.INTERLEAVED.name());
        }

        //search for the keys first...
        return versions.toArray(new String[versions.size()]);
    }

    private SearchResult getResultsAsHeadings(SearchQuery sq, String[] searchableVersions, Key allTopics) {
        final SearchResult headingsSearch = this.jswordSearch.getResultsFromTrimmedKeys(sq,
                searchableVersions, allTopics.getCardinality(), allTopics, HEADINGS_ONLY);

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
     * Removes any version that does not support headings
     *
     * @param versions the list of versions
     */
    private void trimToVersionsWithHeadingsOnly(final Set<String> versions) {
        final Iterator<String> iterator = versions.iterator();
        while (iterator.hasNext()) {
            final String version = iterator.next();
            if (!this.jSwordMetadataService.supportsFeature(version, LookupOption.HEADINGS)) {
                iterator.remove();
            }
        }
    }

    /**
     * Carries out the extended search
     *
     * @param sq the search query
     * @return results with the headings only
     */
    private SearchResult searchExtended(final SearchQuery sq) {
        final long start = System.currentTimeMillis();
        final EntityDoc[] results = getNaveDocs(sq);
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
        final EntityDoc[] results = getExtendedNaveDocs(sq);
        return getHeadingsSearchEntries(start, results);
    }


    /**
     * All entity docs for normal nave search
     *
     * @param sq the search query
     * @return the entity docs matching the query
     */
    private EntityDoc[] getNaveDocs(SearchQuery sq) {
        final String query = sq.getCurrentSearch().getQuery();

        final String[] split = StringUtils.split(query, "[, -=:]+");
        final StringBuilder sb = new StringBuilder(query.length() + 16);
        sb.append("+(");
        for (final String s : split) {
            // set mandatory
            sb.append("+rootStem:");
            sb.append(QueryParser.escape(s.trim()));
            sb.append(" ");
        }
        sb.append(") ");

        //construct query
        sb.append(this.getInputReferenceForNaveSearch(sq.getCurrentSearch().getVersions()[0], sq.getCurrentSearch().getMainRange()).getValue());

        try {
            return this.naves.search(this.naves.getQueryParser(false, true, "rootStem").parse(sb.toString()), Integer.MAX_VALUE, NAVE_SORT, null);
        } catch (ParseException ex) {
            throw new StepInternalException("Unable to parse generated query.");
        }
    }

    /**
     * Return the docs for the extended naves
     *
     * @param sq the search query
     * @return entity docs matching the extended nave search
     */
    private EntityDoc[] getExtendedNaveDocs(SearchQuery sq) {
        String queryBody = QueryParser.escape(sq.getCurrentSearch().getQuery());


        //construct query
        StringBuilder query = new StringBuilder(256);
        query.append("+(");
        query.append("rootStem:");
        query.append(queryBody);
        query.append(" fullHeaderAnalyzed:");
        query.append(queryBody);
        query.append(") ");
        query.append(this.getInputReferenceForNaveSearch(sq.getCurrentSearch().getVersions()[0], sq.getCurrentSearch().getMainRange()).getValue());

        try {
            return this.naves.search(this.naves.getQueryParser(false, true, "rootStem").parse(query.toString()), Integer.MAX_VALUE, NAVE_SORT, null);
        } catch (ParseException ex) {
            throw new StepInternalException("Unable to parse generated query.");
        }
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
