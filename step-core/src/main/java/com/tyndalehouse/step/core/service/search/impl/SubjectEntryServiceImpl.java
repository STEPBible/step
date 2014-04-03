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

import static org.apache.lucene.queryParser.QueryParser.escape;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.search.SubjectEntrySearchService;

/**
 * Retrieves the entries from a subject search
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SubjectEntryServiceImpl implements SubjectEntrySearchService {
    private static final int AGGREGATING_VERSE_DISTANCE = 10;
    private static final Logger LOGGER = LoggerFactory.getLogger(SubjectEntryServiceImpl.class);
    private final EntityIndexReader naves;
    private final JSwordVersificationService versificationService;
    private final JSwordPassageService jsword;

    /**
     * Instantiates a new subject entry service impl.
     * 
     * @param entityManager an entity manager providing access to all the different entities.
     * @param jsword the jsword library
     * @param versificationService the versification service
     */
    @Inject
    public SubjectEntryServiceImpl(final EntityManager entityManager, final JSwordPassageService jsword,
            final JSwordVersificationService versificationService) {
        this.jsword = jsword;
        this.versificationService = versificationService;
        this.naves = entityManager.getReader("nave");
    }

    @Override
    public List<OsisWrapper> getSubjectVerses(final String root, final String fullHeader, final String versions) {
        final StringBuilder sb = new StringBuilder(root.length() + fullHeader.length() + 64);

        sb.append("+root:\"");
        sb.append(escape(root));
        sb.append("\" ");

        sb.append("+fullHeader:\"");
        sb.append(escape(fullHeader));
        sb.append("\"");

        return getVersesForResults(this.naves.search("root", sb.toString()), versions);
    }

    /**
     * obtains the verses for all results
     * 
     * @param results the results
     * @param versions the version in which to look it up
     * @return the verses
     */
    private List<OsisWrapper> getVersesForResults(final EntityDoc[] results, final String versions) {
        final List<OsisWrapper> verses = new ArrayList<OsisWrapper>(32);
        for (final EntityDoc doc : results) {
            final String references = doc.get("references");
            collectVersesFromReferences(verses, versions, references);
        }
        return verses;
    }

    /**
     * Collects individual ranges
     * 
     * @param verses the verses
     * @param versionList the versions
     * @param references the list of references
     */
    private void collectVersesFromReferences(final List<OsisWrapper> verses, final String versionList,
            final String references) {
        
        final String[] versions = StringUtils.split(versionList, ",");
        final Passage verseRanges = this.jsword.getVerseRanges(references, versions[0]);
        final Iterator<VerseRange> rangeIterator = verseRanges.rangeIterator(RestrictionType.NONE);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.HIDE_XGEN);

        final Book book = this.versificationService.getBookFromVersion(versions[0]);
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
}
