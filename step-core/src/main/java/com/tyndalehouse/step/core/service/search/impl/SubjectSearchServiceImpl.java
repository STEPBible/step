package com.tyndalehouse.step.core.service.search.impl;

import static com.tyndalehouse.step.core.models.LookupOption.HEADINGS_ONLY;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * Searches for a subject
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SubjectSearchServiceImpl implements SubjectSearchService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SubjectSearchServiceImpl.class);
    private final EntityIndexReader naves;
    private final JSwordSearchService jswordSearch;

    /**
     * @param entityManager an entity manager providing access to all the different entities.
     * @param jswordSearch the search service for text searching in jsword
     */
    @Inject
    public SubjectSearchServiceImpl(final EntityManager entityManager, final JSwordSearchService jswordSearch) {
        this.jswordSearch = jswordSearch;
        this.naves = entityManager.getReader("nave");
    }

    @Override
    public SearchResult searchByReference(final String reference) {
        final SearchResult sr = new SearchResult();
        sr.setQuery("sr=" + reference);
        final EntityDoc[] results = this.naves.search("expandedReferences", reference);
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

        switch (currentSearch.getType()) {
            case SUBJECT_SIMPLE:
                return searchSimple(sq);
            case SUBJECT_EXTENDED:
                return searchExtended(sq);
            case SUBJECT_FULL:
                return searchFull(sq);
            default:
                break;

        }
        return searchSimple(sq);
    }

    /**
     * runs a simple subject search
     * 
     * @param sq the search query
     * @return the results
     **/
    private SearchResult searchSimple(final SearchQuery sq) {
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

        final String[] split = StringUtils.split(query, ",");
        final StringBuilder sb = new StringBuilder(query.length() + 16);
        for (final String s : split) {
            // set mandatory
            sb.append('+');
            sb.append(s);
        }

        final EntityDoc[] results = this.naves.searchSingleColumn("rootStem", query, false);
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
        final EntityDoc[] results = this.naves.search(new String[] { "rootStem", "fullHeader" }, sq
                .getCurrentSearch().getQuery(), false);
        return getHeadingsSearchEntries(start, results);
    }

    /**
     * @param start the start time
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
