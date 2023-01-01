package com.tyndalehouse.step.core.service.search.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.SubjectEntries;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.search.SubjectEntrySearchService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.queryParser.QueryParser;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.RangedPassage;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseKey;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.VersificationsMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * Retrieves the entries from a subject search
 *
 * @author chrisburrell
 */
@Singleton
public class SubjectEntryServiceImpl extends AbstractSubjectSearchServiceImpl implements SubjectEntrySearchService {
    private static final int AGGREGATING_VERSE_DISTANCE = 10;
    private static final Logger LOGGER = LoggerFactory.getLogger(SubjectEntryServiceImpl.class);
    private final EntityIndexReader naves;
    private final JSwordVersificationService versificationService;
    private final JSwordPassageService jsword;

    /**
     * Instantiates a new subject entry service impl.
     *
     * @param entityManager        an entity manager providing access to all the different entities.
     * @param jsword               the jsword library
     * @param versificationService the versification service
     */
    @Inject
    public SubjectEntryServiceImpl(final EntityManager entityManager, final JSwordPassageService jsword,
                                   final JSwordVersificationService versificationService) {
        super(versificationService);
        this.jsword = jsword;
        this.versificationService = versificationService;
        this.naves = entityManager.getReader("nave");
    }

    @Override
    public SubjectEntries getSubjectVerses(final String root, final String fullHeader, final String versionList,
                                           final String reference, final int context) {
        final StringBuilder sb = new StringBuilder(root.length() + fullHeader.length() + 64);

        appendMandatoryField(sb, "root", root);
        sb.append("+fullHeader:\"");
        sb.append(QueryParser.escape(fullHeader));
        sb.append("\"");

        final String[] versions = StringUtils.split(versionList, ",");
        return getVersesForResults(this.naves.search("root", sb.toString()), versions, reference, context);
    }

    /**
     * Appends each part of the query as a mandatory attribute
     *
     * @param query     the query
     * @param fieldName the field name
     * @param value     the value
     */
    private void appendMandatoryField(StringBuilder query, String fieldName, String value) {
        String[] parts = StringUtils.split(value, "[, -=:]+");

        for (final String part : parts) {
            if (StringUtils.isNotBlank(part)) {
                query.append('+');
                query.append(fieldName);
                query.append(':');
                query.append(QueryParser.escape(part));
                query.append(' ');
            }
        }
    }

    /**
     * obtains the verses for all results
     *
     * @param results  the results
     * @param versions the version in which to look it up
     * @param context  the context to expand with the reference
     * @return the verses
     */
    private SubjectEntries getVersesForResults(final EntityDoc[] results, final String[] versions,
                                               final String limitingScopeReference, final int context) {
        final List<OsisWrapper> verses = new ArrayList<OsisWrapper>(32);
        boolean masterVersionSwapped = false;
        for (final EntityDoc doc : results) {
            final String references = doc.get("references");
            masterVersionSwapped |= collectVersesFromReferences(verses, versions, references, limitingScopeReference, context);
        }
        return new SubjectEntries(verses, masterVersionSwapped);
    }

    /**
     * Collects individual ranges
     *
     * @param verses                 the verses
     * @param inputVersions          the versions
     * @param references             the list of resultsInKJV that form the results
     * @param limitingScopeReference the limiting scope for the reference
     * @param context                the context to expand with the reference
     */
    private boolean collectVersesFromReferences(final List<OsisWrapper> verses, final String[] inputVersions,
                                                final String references, final String limitingScopeReference,
                                                final int context) {

        final String originalMaster = inputVersions[0];
        Passage combinedScopeInKJVv11n = this.getCombinedBookScope(inputVersions);

        //now let's retain the verses that are of interest in the selected books
        Key resultsInKJV = null;
        try {
            resultsInKJV = this.versificationService.getBookFromVersion(JSwordPassageService.BEST_VERSIFICATION).getKey(references);
        } catch (NoSuchKeyException e) {
            throw new StepInternalException("Unable to parse resultsInKJV from Nave", e);
        }
        resultsInKJV.retainAll(combinedScopeInKJVv11n);

        trimResultsToInputSearchRange(inputVersions[0], limitingScopeReference, resultsInKJV);

        //then calculate what the best version order is
        GetBestVersionOrderAndKey getBestVersionOrderAndKey = new GetBestVersionOrderAndKey(inputVersions, resultsInKJV).invoke();

        Book book = getBestVersionOrderAndKey.getBook();
        String[] versions = getBestVersionOrderAndKey.getVersions();

        final Passage resultsInProperV11n = getBestVersionOrderAndKey.getVerseRanges();
        final Iterator<VerseRange> rangeIterator = resultsInProperV11n.rangeIterator(RestrictionType.NONE);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.HIDE_XGEN);
        options.add(LookupOption.GREEK_ACCENTS);
        options.add(LookupOption.HEBREW_VOWELS);

        if(context > 0) {
            //add verse numbers
//            options.add(LookupOption.TINY_VERSE_NUMBERS);
            options.add(LookupOption.VERSE_NUMBERS);
        }

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
                osisWrapper.setFragment(true);
                try {
                    osisWrapper.setReference(book.getKey(stringBuilder.toString()).getName());
                } catch (final NoSuchKeyException e) {
                    // fail to get a key, let's log and continue
                    LOGGER.warn("Unable to get key for reference: [{}]", osisWrapper.getReference());
                    LOGGER.trace("Root cause is", e);
                }
            } else {

                final Key firstVerse = this.jsword.getFirstVersesFromRange(range, context);

                final OsisWrapper passage = this.jsword.peakOsisText(versions, firstVerse, options, InterlinearMode.INTERLEAVED_COMPARE.name());
                passage.setReference(range.getName());

                if (range.getCardinality() > 1) {
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

        return !getBestVersionOrderAndKey.versions[0].equals(originalMaster);
    }

    /**
     * Reduces the results so far to what is contained in the v11n
     *
     * @param inputVersion           input version
     * @param limitingScopeReference the limiting scope
     * @param resultsInKJV           the results retrieved so far.
     */
    private void trimResultsToInputSearchRange(final String inputVersion, final String limitingScopeReference, final Key resultsInKJV) {
        if (StringUtils.isNotBlank(limitingScopeReference)) {
            final Book limitingBook;
            limitingBook = this.versificationService.getBookFromVersion(inputVersion);
            try {
                final Key key = KeyUtil.getPassage(limitingBook.getKey(limitingScopeReference));

                //now map to the KJV versification
                Passage p = VersificationsMapper.instance().map(KeyUtil.getPassage(key), ((VerseKey) resultsInKJV).getVersification());

                //now convert retain against existing resultsInKJV
                resultsInKJV.retainAll(p);
            } catch (NoSuchKeyException ex) {
                throw new TranslatedException(ex, "invalid_reference_in_book", limitingScopeReference, limitingBook.getInitials());
            }
        }
    }

    /**
     * Gets a key in the KJV versification that represents the total combined key for all search resutls.
     *
     * @param inputVersions the input version the kjv versified keys
     * @return
     */
    private Passage getCombinedBookScope(String[] inputVersions) {
        final Versification bestVersification = this.versificationService.getVersificationForVersion(JSwordPassageService.BEST_VERSIFICATION);

        Passage range = new RangedPassage(bestVersification);
        for (final String v : inputVersions) {
            final Book bookFromVersion = this.versificationService.getBookFromVersion(v);
            final VerseKey scope = bookFromVersion.getBookMetaData().getScope();
            range.addAll(VersificationsMapper.instance().map(KeyUtil.getPassage(scope), bestVersification));
        }
        return range;
    }

    /**
     * @param av11n     the versification
     * @param range     the range/verse
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

    /**
     * A private class that helps rotate the versions around to list the best version available first.
     */
    private class GetBestVersionOrderAndKey {
        private String[] versions;
        private Passage resultsInKJV;
        private Book book;
        private Passage verseRanges;

        public GetBestVersionOrderAndKey(String[] versions, Key resultsInKJV) {
            this.versions = versions;
            this.resultsInKJV = KeyUtil.getPassage(resultsInKJV);
        }

        public Book getBook() {
            return this.book;
        }

        public Passage getVerseRanges() {
            return this.verseRanges;
        }

        public GetBestVersionOrderAndKey invoke() {
            int maxCardinality = -1;
            int bestVersion = 0;
            Book bestBook = null;
            Key bestKey = this.resultsInKJV;
            Set<String> triedV11ns = new HashSet<String>();
            for (int i = 0; i < versions.length; i++) {
                String v = versions[i];
                Book b = SubjectEntryServiceImpl.this.versificationService.getBookFromVersion(v);
                final Versification v11n = SubjectEntryServiceImpl.this.versificationService.getVersificationForVersion(b);
                if (!triedV11ns.contains(v11n)) {
                    final Passage potentialKey = VersificationsMapper.instance()
                            .map(this.resultsInKJV,
                                    v11n);
                    int cardinality = potentialKey.getCardinality();

                    if (cardinality > maxCardinality) {
                        bestVersion = i;
                        maxCardinality = cardinality;
                        bestKey = potentialKey;
                        bestBook = b;
                    }
                }
                triedV11ns.add(v11n.getName());
            }

            if (bestVersion != 0) {
                final String temp = this.versions[bestVersion];
                this.versions[bestVersion] = this.versions[0];
                this.versions[0] = temp;
            }
            this.verseRanges = KeyUtil.getPassage(bestKey);
            this.book = bestBook;

            // convert to master version, and be dnoe with it?
            return this;
        }

        public String[] getVersions() {
            return versions;
        }
    }
}
