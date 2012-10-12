package com.tyndalehouse.step.core.service.search.impl;

import static com.tyndalehouse.step.core.models.LookupOption.HEADINGS_ONLY;
import static org.apache.lucene.queryParser.QueryParser.escape;
import static org.apache.lucene.search.SortField.STRING;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;

import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;

import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.ExpandableSubjectHeadingEntry;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.service.impl.IndividualSearch;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;

/**
 * Searches for a subject
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SubjectSearchServiceImpl implements SubjectSearchService {
    private final static int AGGREGATING_VERSE_DISTANCE = 10;
    private final EntityIndexReader naves;
    private final JSwordSearchService jswordSearch;
    private final JSwordPassageService jsword;
    private final Sort naveSort = new Sort(new SortField("root", STRING), new SortField("fullHeader",
            SortField.STRING_VAL));
    private final JSwordVersificationService versificationService;

    /**
     * @param entityManager an entity manager providing access to all the different entities.
     * @param jswordSearch the search library for jsword
     * @param jsword the jsword library
     */
    @Inject
    public SubjectSearchServiceImpl(final EntityManager entityManager,
            final JSwordSearchService jswordSearch, final JSwordPassageService jsword,
            final JSwordVersificationService versificationService) {
        this.jswordSearch = jswordSearch;
        this.jsword = jsword;
        this.versificationService = versificationService;
        this.naves = entityManager.getReader("nave");
    }

    @Override
    public List<OsisWrapper> getSubjectVerses(final String root, final String fullHeader, final String version) {
        final StringBuilder sb = new StringBuilder(root.length() + fullHeader.length() + 64);

        sb.append("+root:\"");
        sb.append(escape(root));
        sb.append("\" ");

        sb.append("+fullHeader:\"");
        sb.append(escape(fullHeader));
        sb.append("\"");

        return getVersesForResults(this.naves.search("root", sb.toString()), version);
    }

    /**
     * obtains the verses for all results
     * 
     * @param results the results
     * @param version the version in which to look it up
     * @return the verses
     */
    private List<OsisWrapper> getVersesForResults(final EntityDoc[] results, final String version) {
        final List<OsisWrapper> verses = new ArrayList<OsisWrapper>(32);
        for (final EntityDoc doc : results) {
            final String references = doc.get("references");
            collectVersesFromReferences(verses, version, references);
        }
        return verses;
    }

    /**
     * Collects individual ranges
     * 
     * @param verses the verses
     * @param version the version
     * @param references the list of references
     */
    private void collectVersesFromReferences(final List<OsisWrapper> verses, final String version,
            final String references) {
        final Passage verseRanges = this.jsword.getVerseRanges(references, version);
        final Iterator<Key> rangeIterator = verseRanges.rangeIterator(RestrictionType.NONE);
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final Book book = this.versificationService.getBookFromVersion(version);
        final Versification av11n = this.versificationService.getVersificationForVersion(book);

        Verse lastVerse = null;
        while (rangeIterator.hasNext()) {
            final Key range = rangeIterator.next();

            // get the distance between the first verse in the range and the last verse
            if (lastVerse != null && isCloseVerse(av11n, lastVerse, range)) {
                final OsisWrapper osisWrapper = verses.get(verses.size() - 1);
                final StringBuilder stringBuilder = new StringBuilder();
                stringBuilder.append(osisWrapper.getReference());
                stringBuilder.append("; ");
                stringBuilder.append(range.getName());
                osisWrapper.setReference(stringBuilder.toString());

            } else {

                final Key firstVerse = this.jsword.getFirstVerseFromRange(range);

                final OsisWrapper passage = this.jsword.peakOsisText(book, firstVerse, options);
                passage.setReference(range.getName());
                if (passage.getOsisId().indexOf(' ') > 0) {
                    passage.setFragment(true);
                }
                verses.add(passage);
            }

            // record last verse
            if (range instanceof VerseRange) {
                final VerseRange verseRange = (VerseRange) range;
                lastVerse = verseRange.getEnd();
            } else if (range instanceof Verse) {
                lastVerse = (Verse) range;
            }

        }
    }

    /**
     * @param av11n the versification
     * @param range the range/verse
     * @param lastVerse the last verse
     * @return true if the verse should be wrapped in with the range before
     */
    private boolean isCloseVerse(final Versification av11n, final Verse lastVerse, final Key range) {
        Verse startOfNextRange = null;
        if (range instanceof VerseRange) {
            final VerseRange verseRange = (VerseRange) range;
            startOfNextRange = verseRange.getStart();
        } else if (range instanceof Verse) {
            startOfNextRange = (Verse) range;
        } else {
            // unable to determine whether the verses are close or not...
            return false;
        }

        final int distance = Math.abs(av11n.distance(lastVerse, startOfNextRange));

        if (distance < AGGREGATING_VERSE_DISTANCE) {
            return true;
        }

        return false;
    }

    @Override
    public SearchResult search(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();

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
     * @return the results
     * @param sq the search query
     **/
    private SearchResult searchSimple(final SearchQuery sq) {
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
     * Carries out the extended search
     * 
     * @param sq the search query
     * @return results with the headings only
     */
    private SearchResult searchExtended(final SearchQuery sq) {
        final long start = System.currentTimeMillis();
        final EntityDoc[] results = this.naves.searchSingleColumn("root", sq.getCurrentSearch().getQuery(),
                this.naveSort);
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
        final EntityDoc[] results = this.naves.search(new String[] { "root", "fullHeader" }, sq
                .getCurrentSearch().getQuery(), this.naveSort);
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
            headingMatches.add(new ExpandableSubjectHeadingEntry(d.get("root"), d.get("fullHeader")));
        }

        final SearchResult sr = new SearchResult();
        sr.setTimeTookTotal(System.currentTimeMillis() - start);
        sr.setTimeTookToRetrieveScripture(0);
        sr.setResults(headingMatches);
        sr.setTotal(headingMatches.size());
        return sr;
    }
}
