package com.tyndalehouse.step.core.service.jsword.impl;

import javax.inject.Singleton;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookMetaData;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;

import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;

/**
 * Deals with the versification
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class JSwordVersificationServiceImpl implements JSwordVersificationService {
    private static final String DEFAULT_NUMBERED_VERSION = "KJV";

    @Override
    public String getVerseRange(final int startVerseId, final int endVerseId) {
        return getVerseRange(startVerseId, endVerseId, DEFAULT_NUMBERED_VERSION);
    }

    @Override
    public String getVerseRange(final int startVerseId, final int endVerseId, final String version) {
        final Versification versification = getVersificationForVersion(version);

        Verse start = versification.decodeOrdinal(startVerseId);
        final Verse end = versification.decodeOrdinal(endVerseId);

        // TODO continue to discuss on JSWORD devel list
        if (start.getVerse() == 0) {
            start = versification.decodeOrdinal(startVerseId + 1);
        }

        final VerseRange vr = new VerseRange(versification, start, end);
        return vr.getName();
    }

    @Override
    public VerseRange getVerseRangeForSelectedVerses(final String version, final String numberedVersion,
            final Versification versificationForNumberedVersion, final Verse s, final Verse e,
            final Book lookupVersion, final Boolean roundReference, final boolean ignoreVerse0) {
        VerseRange range;

        // TODO - should this be amended? yes - probably
        final int verseNumber = ignoreVerse0 && s.getVerse() == 0 ? 1 : s.getVerse();
        final int chapterNumber = ignoreVerse0 && s.getChapter() == 0 ? 1 : s.getChapter();

        if (!numberedVersion.equals(version)) {
            // need to patch things over
            final Versification versificationLookupVersion = getVersificationForVersion(lookupVersion);
            final Verse targetStartVersionVerse = versificationLookupVersion.patch(s.getBook(),
                    chapterNumber, verseNumber);

            final Verse targetEndVersionsVerse = versificationLookupVersion.patch(e.getBook(),
                    e.getChapter(), e.getVerse());

            range = new VerseRange(versificationLookupVersion, targetStartVersionVerse,
                    targetEndVersionsVerse);
        } else {
            range = new VerseRange(versificationForNumberedVersion, s, e);
        }

        // now we may need to round the range up/down
        return roundRange(roundReference, range);
    }

    @Override
    public Book getBookFromVersion(final String version) {
        final Book currentBook = Books.installed().getBook(version);

        if (currentBook == null) {
            throw new TranslatedException("book_not_found", version);
        }
        return currentBook;
    }

    @Override
    public Versification getVersificationForVersion(final String version) {
        return getVersificationForVersion(getBookFromVersion(version));
    }

    @Override
    public Versification getVersificationForVersion(final Book version) {
        final Versification versification = Versifications.instance().getVersification(
                (String) version.getBookMetaData().getProperty(BookMetaData.KEY_VERSIFICATION));

        if (versification == null) {
            return Versifications.instance().getVersification(Versifications.DEFAULT_V11N);
        }
        return versification;
    }

    /**
     * rounds the range up or down
     * 
     * @param roundReference null to indicate no rounding, true to round up and false to round down.
     * @param range the range
     * @return the new verse range, rounded as appropriate
     */
    private VerseRange roundRange(final Boolean roundReference, final VerseRange range) {
        if (Boolean.TRUE.equals(roundReference)) {
            return roundRangeUp(range);
        } else if (Boolean.FALSE.equals(roundReference)) {
            return roundRangeDown(range);
        }

        return range;
    }

    /**
     * Round the range upwards, i.e. changes the end verse
     * 
     * @param range the range to be rounded up
     * @return the new range
     */
    private VerseRange roundRangeDown(final VerseRange range) {
        final Versification versification = range.getVersification();
        final Verse end = range.getEnd();
        return new VerseRange(versification, new Verse(versification, end.getBook(), end.getChapter(), 1),
                end);
    }

    /**
     * Round the range upwards, i.e. changes the end verse
     * 
     * @param range the range to be rounded up
     * @return the new range
     */
    private VerseRange roundRangeUp(final VerseRange range) {
        final Versification versification = range.getVersification();
        final Verse end = range.getEnd();
        final Verse endOfChapter = new Verse(versification, end.getBook(), end.getChapter(),
                versification.getLastVerse(end.getBook(), end.getChapter()));
        return new VerseRange(versification, range.getStart(), endOfChapter);
    }
}
