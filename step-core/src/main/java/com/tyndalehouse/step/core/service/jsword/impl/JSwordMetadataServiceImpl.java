package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;
import static org.crosswire.jsword.book.BookCategory.BIBLE;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.inject.Inject;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.FeatureType;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.BibleBookList;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;

/**
 * Provides metadata for JSword modules
 * 
 * @author chrisburrell
 * 
 */
public class JSwordMetadataServiceImpl implements JSwordMetadataService {

    private final JSwordVersificationService versificationService;

    /**
     * Sets up the service for providing metadata information
     * 
     * @param versificationService the versification service
     */
    @Inject
    public JSwordMetadataServiceImpl(final JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
    }

    @Override
    public List<LookupOption> getFeatures(final String version) {
        // obtain the book
        final Book book = Books.installed().getBook(version);
        final List<LookupOption> options = new ArrayList<LookupOption>(LookupOption.values().length + 1);

        if (book == null) {
            return options;
        }

        // some options are always there for Bibles:
        if (BIBLE.equals(book.getBookCategory())) {
            options.add(LookupOption.VERSE_NUMBERS);
            options.add(LookupOption.VERSE_NEW_LINE);
        }

        if (book.getBookMetaData().hasFeature(FeatureType.WORDS_OF_CHRIST)) {
            options.add(LookupOption.RED_LETTER);
        }

        if (book.getBookMetaData().hasFeature(FeatureType.STRONGS_NUMBERS)) {
            options.add(LookupOption.ENGLISH_VOCAB);
            options.add(LookupOption.GREEK_VOCAB);
            options.add(LookupOption.TRANSLITERATION);
            options.add(LookupOption.INTERLINEAR);
        }

        if (book.hasFeature(FeatureType.MORPHOLOGY)) {
            options.add(LookupOption.COLOUR_CODE);
        }

        if (book.getBookMetaData().hasFeature(FeatureType.FOOTNOTES)
                || book.getBookMetaData().hasFeature(FeatureType.SCRIPTURE_REFERENCES)) {
            options.add(LookupOption.NOTES);
        }

        // cycle through each option
        for (final LookupOption lo : LookupOption.values()) {
            final FeatureType ft = FeatureType.fromString(lo.getXsltParameterName());
            if (ft != null && isNotEmpty(lo.name()) && book.getBookMetaData().hasFeature(ft)) {
                options.add(lo);
            }
        }

        return options;
    }

    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version) {
        final String lookup = isBlank(bookStart) ? "" : bookStart;

        final Versification versification = this.versificationService.getVersificationForVersion(version);

        final List<BookName> books = getBooks(lookup, versification);
        if (books.isEmpty()) {
            return getBooks(lookup, Versifications.instance().getDefaultVersification());
        }

        return books;
    }

    /**
     * Looks through a versification for a particular type of book
     * 
     * @param bookStart the string to match
     * @param versification the versification we are interested in
     * @return the list of matching names
     */
    private List<BookName> getBooks(final String bookStart, final Versification versification) {
        final String searchPattern = bookStart.toLowerCase(Locale.getDefault()).trim();

        final List<BookName> matchingNames = new ArrayList<BookName>();
        final BibleBookList books = versification.getBooks();

        BibleBook b = null;
        for (final BibleBook book : books) {
            if (book.getLongName().toLowerCase().startsWith(searchPattern)
                    || book.getPreferredName().toLowerCase().startsWith(searchPattern)
                    || book.getShortName().toLowerCase().startsWith(searchPattern)) {
                b = book;

                addBookName(matchingNames, book, versification);

            }
        }

        if (matchingNames.size() == 1) {
            final List<BookName> optionsInBook = getChapters(versification, b, searchPattern);
            if (!optionsInBook.isEmpty()) {
                return optionsInBook;
            }
        }

        return matchingNames;
    }

    /**
     * Adds all Bible books except for INTROs to NT, OT and Bible.
     * 
     * @param matchingNames the list of current names
     * @param bookName the book that we are examining
     * @param versification the versification attached to the book.
     */
    private void addBookName(final List<BookName> matchingNames, final BibleBook bookName,
            final Versification versification) {
        if (BibleBook.INTRO_BIBLE.equals(bookName) || BibleBook.INTRO_NT.equals(bookName)
                || BibleBook.INTRO_OT.equals(bookName)) {
            return;
        }

        matchingNames.add(new BookName(bookName.getShortName(), bookName.getLongName(), versification
                .getLastChapter(bookName) != 1));
    }

    /**
     * Returns the list of chapters
     * 
     * @param versification the versification
     * @param book the book
     * @param searchSoFar the search so far
     * @return a list of books
     */
    private List<BookName> getChapters(final Versification versification, final BibleBook book,
            final String searchSoFar) {
        final int lastChapter = versification.getLastChapter(book);
        final List<BookName> chapters = new ArrayList<BookName>();
        for (int ii = 1; ii <= lastChapter; ii++) {
            // final char f = Character.toUpperCase(searchSoFar.charAt(0));

            // make sure first letter is CAPS, followed by the rest of the word and the chapter number
            final String chapNumber = String.format("%s %d", book.getShortName(), ii);
            final String longChapNumber = String.format("%s %d", book.getLongName(), ii);

            chapters.add(new BookName(chapNumber, longChapNumber, false));
        }

        return chapters;
    }

    @Override
    public boolean hasVocab(final String version) {
        return Books.installed().getBook(version).hasFeature(FeatureType.STRONGS_NUMBERS);
    }
}
