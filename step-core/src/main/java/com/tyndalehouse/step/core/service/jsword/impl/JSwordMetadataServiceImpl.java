package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;
import static org.crosswire.jsword.book.BookCategory.BIBLE;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

import javax.inject.Inject;

import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.utils.JSwordUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.FeatureType;
import org.crosswire.jsword.versification.BibleBook;
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
 */
public class JSwordMetadataServiceImpl implements JSwordMetadataService {
    private static final String BOOK_CHAPTER_FORMAT = "%s %d";
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
    public List<LookupOption> getFeatures(final String version, List<String> extraVersions) {
        // obtain the book
        final Book book = this.versificationService.getBookFromVersion(version);
        final List<LookupOption> options = new ArrayList<LookupOption>(LookupOption.values().length + 1);

        if (book == null) {
            return options;
        }

        // some options are always there for Bibles:
        addBibleCategoryOptions(book, options);
        addRedLetterOptions(book, options);
        addStrongNumberOptions(book, options);
        addMorphologyOptions(book, options);
        addNotesOptions(book, options);
        addHebrewOptions(book, options);
        addAncientOptions(version, extraVersions, options);
        addAllMatchingLookupOptions(book, options);

        return options;
    }

    /**
     * Adds options that apply regardless of the conditions
     *
     * @param currentVersion the current primary version
     * @param extraVersions  the secondary versions that affect feature resolution 
     * @param options        the set of options
     */
    private void addAncientOptions(final String currentVersion, final List<String> extraVersions, final List<LookupOption> options) {
        final List<String> allVersions = new ArrayList<String>(extraVersions);
        allVersions.add(currentVersion);

        boolean hasGreekVersion, hasHebrewVersion = hasGreekVersion = false;
        for (String version : allVersions) {
            Book book = this.versificationService.getBookFromVersion(version);
            if(JSwordUtils.isAncientGreekBook(book)) {
                hasGreekVersion = true;
            }

            if(JSwordUtils.isAncientHebrewBook(book)) {
                hasHebrewVersion = true;
            }
        }
        
        //hebrew/greek options for interlinears
        if(hasGreekVersion) {
            options.add(LookupOption.GREEK_ACCENTS);
        }
        
        if(hasHebrewVersion) {
            options.add(LookupOption.HEBREW_ACCENTS);
            options.add(LookupOption.HEBREW_VOWELS);
        }
    }

    /**
     * For Hebrew books, we hard code availability of seg divisions for OHB and WLC
     *
     * @param book    the Book in question
     * @param options the available options
     */
    private void addHebrewOptions(final Book book, final List<LookupOption> options) {
        if ("OSMHB".equals(book.getInitials()) || "OHB".equals(book.getInitials()) || "OSHB".equals(book.getInitials())
                || "WLC".equals(book.getInitials())) {
            options.add(LookupOption.DIVIDE_HEBREW);
        }
    }

    /**
     * Add all options when the options match by their XsltParameter Name
     *
     * @param book    the book
     * @param options the options to be added to
     */
    private void addAllMatchingLookupOptions(final Book book, final List<LookupOption> options) {
        // cycle through each option
        for (final LookupOption lo : LookupOption.values()) {
            final FeatureType ft = FeatureType.fromString(lo.getXsltParameterName());
            if (ft != null && isNotEmpty(lo.name()) && book.getBookMetaData().hasFeature(ft)) {
                options.add(lo);
            }
        }
    }

    /**
     * Adds options for notes
     *
     * @param book    the book
     * @param options the options to be added to
     */
    private void addNotesOptions(final Book book, final List<LookupOption> options) {
        if (book.getBookMetaData().hasFeature(FeatureType.FOOTNOTES)
                || book.getBookMetaData().hasFeature(FeatureType.SCRIPTURE_REFERENCES)) {
            options.add(LookupOption.NOTES);
        }
    }

    /**
     * Adds options for morphology
     *
     * @param book    the book
     * @param options the options to be added to
     */
    private void addMorphologyOptions(final Book book, final List<LookupOption> options) {
        if (book.hasFeature(FeatureType.MORPHOLOGY)) {
            options.add(LookupOption.COLOUR_CODE);
        }
    }

    /**
     * Adds options for strong numbers
     *
     * @param book    the book
     * @param options the options to be added to
     */
    private void addStrongNumberOptions(final Book book, final List<LookupOption> options) {
        if (book.getBookMetaData().hasFeature(FeatureType.STRONGS_NUMBERS)) {
            options.add(LookupOption.ENGLISH_VOCAB);
            options.add(LookupOption.GREEK_VOCAB);
            options.add(LookupOption.TRANSLITERATION);
            options.add(LookupOption.INTERLINEAR);
        }
    }

    /**
     * Adds options for red letter Bible
     *
     * @param book    the book
     * @param options the options to be added to
     */
    private void addRedLetterOptions(final Book book, final List<LookupOption> options) {
        if (book.getBookMetaData().hasFeature(FeatureType.WORDS_OF_CHRIST)) {
            options.add(LookupOption.RED_LETTER);
        }
    }

    /**
     * Adds options if module is a Bible
     *
     * @param book    the book
     * @param options the options to be added to
     */
    private void addBibleCategoryOptions(final Book book, final List<LookupOption> options) {
        if (BIBLE.equals(book.getBookCategory())) {
            options.add(LookupOption.VERSE_NUMBERS);
            options.add(LookupOption.VERSE_NEW_LINE);
        }
    }

    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version) {
        final String lookup = isBlank(bookStart) ? "" : bookStart;

        final Versification versification = this.versificationService.getVersificationForVersion(version);

        final List<BookName> books = getBooks(lookup, versification);
        if (books.isEmpty()) {
            return getBooks(lookup, Versifications.instance().getVersification(Versifications.DEFAULT_V11N));
        }

        return books;
    }

    /**
     * Looks through a versification for a particular type of book
     *
     * @param bookStart     the string to match
     * @param versification the versification we are interested in
     * @return the list of matching names
     */
    private List<BookName> getBooks(final String bookStart, final Versification versification) {
        final String searchPattern = bookStart.toLowerCase(Locale.getDefault()).trim();

        final List<BookName> matchingNames = new ArrayList<BookName>();

        final Iterator<BibleBook> bookIterator = versification.getBookIterator();

        BibleBook b = null;
        while (bookIterator.hasNext()) {
            final BibleBook book = bookIterator.next();
            if (versification.getLongName(book).toLowerCase().startsWith(searchPattern)
                    || versification.getPreferredName(book).toLowerCase().startsWith(searchPattern)
                    || versification.getShortName(book).toLowerCase().startsWith(searchPattern)) {
                b = book;
                addBookName(matchingNames, book, versification);
            }
        }

        if (matchingNames.size() == 1) {
            final List<BookName> optionsInBook = getChapters(versification, b);
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
     * @param bookName      the book that we are examining
     * @param versification the versification attached to the book.
     */
    private void addBookName(final List<BookName> matchingNames, final BibleBook bookName,
                             final Versification versification) {
        if (BibleBook.INTRO_BIBLE.equals(bookName) || BibleBook.INTRO_NT.equals(bookName)
                || BibleBook.INTRO_OT.equals(bookName)) {
            return;
        }

        matchingNames.add(new BookName(versification.getShortName(bookName), versification
                .getLongName(bookName), versification.getLastChapter(bookName) != 1));
    }

    /**
     * Returns the list of chapters
     *
     * @param versification the versification
     * @param book          the book
     * @return a list of books
     */
    private List<BookName> getChapters(final Versification versification, final BibleBook book) {
        final int lastChapter = versification.getLastChapter(book);
        final List<BookName> chapters = new ArrayList<BookName>();
        for (int ii = 1; ii <= lastChapter; ii++) {
            // final char f = Character.toUpperCase(searchSoFar.charAt(0));

            // make sure first letter is CAPS, followed by the rest of the word and the chapter number
            final String chapNumber = String
                    .format(BOOK_CHAPTER_FORMAT, versification.getShortName(book), ii);
            final String longChapNumber = String.format(BOOK_CHAPTER_FORMAT, versification.getLongName(book),
                    ii);

            chapters.add(new BookName(chapNumber, longChapNumber, false));
        }

        return chapters;
    }

    @Override
    public boolean hasVocab(final String version) {
        return supportsStrongs(this.versificationService.getBookFromVersion(version));
    }

    /**
     * Returns true if the book supports strong numbers
     * @param book the book
     * @return true if strongs are available
     */
    private boolean supportsStrongs(Book book) {
        return book.hasFeature(FeatureType.STRONGS_NUMBERS);
    }

    @Override
    public String[] getLanguages(final String... versions) {
        String[] languages = new String[versions.length];
        for (int i = 0; i < versions.length; i++) {
            final String version = versions[i];
            Book b = this.versificationService.getBookFromVersion(version);
            languages[i] = b.getLanguage().getCode();
        }
        return languages;
    }

    @Override
    public InterlinearMode getBestInterlinearMode(String version, List<String> extraVersions) {
        if(extraVersions == null || extraVersions.size() == 0) {
            return InterlinearMode.NONE;
        }
        
        Book main = this.versificationService.getBookFromVersion(version);
        String firstLanguage = main.getLanguage().getCode();
        boolean supportsStrongs = true;
        boolean sameLanguage = true;
        
        for(String extraVersion : extraVersions) {
            Book b = this.versificationService.getBookFromVersion(extraVersion);
            if(supportsStrongs && !this.supportsStrongs(b)) {
                supportsStrongs = false;
            }
            if(!firstLanguage.equalsIgnoreCase(b.getLanguage().getCode())) {
                sameLanguage = false;
            }
            
            //small optimization
            if(!supportsStrongs && !sameLanguage) {
                break;
            }
        }
        
        if(supportsStrongs) {
            return InterlinearMode.INTERLINEAR;
        }
        
        if(sameLanguage) {
            return InterlinearMode.INTERLEAVED_COMPARE;
        }
        
        return InterlinearMode.INTERLEAVED;
    }
}
