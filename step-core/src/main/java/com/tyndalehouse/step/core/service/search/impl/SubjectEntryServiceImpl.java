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

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.search.SubjectEntrySearchService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.queryParser.QueryParser;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

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
    public List<OsisWrapper> getSubjectVerses(final String root, final String fullHeader, final String versionList,
                                              final String reference) {
        final StringBuilder sb = new StringBuilder(root.length() + fullHeader.length() + 64);

        appendMandatoryField(sb, "root", root);
        appendMandatoryField(sb, "fullHeaderAnalyzed", fullHeader);

        final String[] versions = StringUtils.split(versionList, ",");
        return getVersesForResults(this.naves.search("root", sb.toString()), versions, reference);
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
            if(StringUtils.isNotBlank(part)) {
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
     * @return the verses
     */
    private List<OsisWrapper> getVersesForResults(final EntityDoc[] results, final String[] versions,
                                                  final String limitingScopeReference) {
        final List<OsisWrapper> verses = new ArrayList<OsisWrapper>(32);
        for (final EntityDoc doc : results) {
            final String references = doc.get("references");
            collectVersesFromReferences(verses, versions, references, limitingScopeReference);
        }
        return verses;
    }

    /**
     * Collects individual ranges
     *
     * @param verses                 the verses
     * @param inputVersions               the versions
     * @param references             the list of references
     * @param limitingScopeReference the limiting scope for the reference
     */
    private void collectVersesFromReferences(final List<OsisWrapper> verses, final String[] inputVersions,
                                             final String references, final String limitingScopeReference) {

        GetBestVersionOrderAndKey getBestVersionOrderAndKey = new GetBestVersionOrderAndKey(inputVersions, references, limitingScopeReference).invoke();
        Passage verseRanges = getBestVersionOrderAndKey.getVerseRanges();
        Book book = getBestVersionOrderAndKey.getBook();
        String[] versions = getBestVersionOrderAndKey.getVersions();


        final Iterator<VerseRange> rangeIterator = verseRanges.rangeIterator(RestrictionType.NONE);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.HIDE_XGEN);
        options.add(LookupOption.GREEK_ACCENTS);
        options.add(LookupOption.HEBREW_VOWELS);

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

                final Key firstVerse = this.jsword.getFirstVerseFromRange(range);

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

    private class GetBestVersionOrderAndKey {
        private String[] versions;
        private String references;
        private String limitingScopeReference;
        private Book book;
        private Passage verseRanges;

        public GetBestVersionOrderAndKey(String[] versions, String references, String limitingScopeReference) {
            this.versions = versions;
            this.references = references;
            this.limitingScopeReference = limitingScopeReference;
        }

        public Book getBook() {
            return book;
        }

        public Passage getVerseRanges() {
            return verseRanges;
        }

        public GetBestVersionOrderAndKey invoke() {
            int ii = 0;
            boolean success = false;
            for(ii = 0; ii < versions.length && !success; ii++) {
                book = SubjectEntryServiceImpl.this.versificationService.getBookFromVersion(this.versions[ii]);
                success = tryBookKey();
            }

            if(!success) {
                book = SubjectEntryServiceImpl.this.versificationService.getBookFromVersion(JSwordPassageServiceImpl.REFERENCE_BOOK);
                success |= tryBookKey();
                if(!success) {
                    //failed to parse book reference
                    throw new StepInternalException("Unable to parse reference given with any books: " + references + " scope: " + limitingScopeReference);
                } else {
                    //copy ESV in as first book
                    String[] newVersions = new String[versions.length + 1];
                    System.arraycopy(versions, 0, newVersions, 1, versions.length);
                    newVersions[0] = "ESV";
                    versions = newVersions;
                }
            } else {
                String[] newVersions = new String[versions.length];
                //need to turn the modules around and cycle them...
                for(int jj = 0; jj < versions.length; jj++) {
                    newVersions[jj] = versions[(ii+jj-1) % versions.length];
                }
                versions = newVersions;
            }

            return this;
        }

        private boolean tryBookKey() {
            try {
                verseRanges = KeyUtil.getPassage(book.getKey(references));
                if (StringUtils.isNotBlank(limitingScopeReference)) {
                    verseRanges.retainAll(book.getKey(limitingScopeReference));
                }
                return true;
            } catch (NoSuchKeyException ex) {
                //swallow this.
                return false;
            }
        }

        public String[] getVersions() {
            return versions;
        }
    }
}
