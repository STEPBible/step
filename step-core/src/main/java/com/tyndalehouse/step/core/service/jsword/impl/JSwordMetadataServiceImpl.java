package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;
import static org.crosswire.jsword.book.BookCategory.BIBLE;

import java.util.*;

import javax.inject.Inject;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.utils.JSwordUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.FeatureType;
import org.crosswire.jsword.book.basic.AbstractPassageBook;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.DivisionName;
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
    private final VersionResolver versionResolver;

    /**
     * Sets up the service for providing metadata information
     *
     * @param versificationService the versification service
     */
    @Inject
    public JSwordMetadataServiceImpl(final JSwordVersificationService versificationService, final VersionResolver versionResolver) {
        this.versificationService = versificationService;
        this.versionResolver = versionResolver;
    }

    @Override
    public String getFirstChapterReference(final String version) {
        final Book bookFromVersion = versificationService.getBookFromVersion(version);

        if(bookFromVersion instanceof AbstractPassageBook) {
            final Iterator<BibleBook> bookIterator = ((AbstractPassageBook) bookFromVersion).getBibleBooks().iterator();
            BibleBook bibleBook = bookIterator.next();
            if(BibleBook.INTRO_BIBLE.equals(bibleBook) || BibleBook.INTRO_OT.equals(bibleBook) || BibleBook.INTRO_NT.equals(bibleBook)) {
                bibleBook = bookIterator.next();
                if(BibleBook.INTRO_OT.equals(bibleBook) || BibleBook.INTRO_NT.equals(bibleBook)) {
                    bibleBook = bookIterator.next();
                }
            }
            return String.format("%s.%d", bibleBook.getOSIS(), 1);
        }
        throw new StepInternalException("Unable to ascertain first chapter of book.");
    }

    @Override
    public Set<LookupOption> getFeatures(final String version, List<String> extraVersions) {
        // obtain the book
        final Book book = this.versificationService.getBookFromVersion(version);
        final Set<LookupOption> options = new HashSet<LookupOption>(LookupOption.values().length * 2);

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
        addMasterAncientOptions(book, options);
        addAllMatchingLookupOptions(book, options);
        addHiddenOptions(options);

        return options;
    }

    private void addMasterAncientOptions(final Book currentVersion, final Set<LookupOption> options) {
        if (JSwordUtils.isAncientGreekBook(currentVersion) || JSwordUtils.isAncientHebrewBook(currentVersion)) {
            options.add(LookupOption.TRANSLITERATE_ORIGINAL);
        }
    }

    private void addHiddenOptions(final Set<LookupOption> options) {
        options.add(LookupOption.HIDE_XGEN);
        options.add(LookupOption.CHAPTER_BOOK_VERSE_NUMBER);
        options.add(LookupOption.HEADINGS_ONLY);
        options.add(LookupOption.HIDE_COMPARE_HEADERS);
    }

    /**
     * Adds options that apply regardless of the conditions
     *
     * @param currentVersion the current primary version
     * @param extraVersions  the secondary versions that affect feature resolution
     * @param options        the set of options
     */
    private void addAncientOptions(final String currentVersion, final List<String> extraVersions, final Set<LookupOption> options) {
        final List<String> allVersions = new ArrayList<String>(extraVersions);
        allVersions.add(currentVersion);

        boolean hasGreekVersion, hasHebrewVersion = hasGreekVersion = false;
        for (String version : allVersions) {
            Book book = this.versificationService.getBookFromVersion(version);
            if (JSwordUtils.isAncientGreekBook(book)) {
                hasGreekVersion = true;
            }

            if (JSwordUtils.isAncientHebrewBook(book)) {
                hasHebrewVersion = true;
            }
        }

        //hebrew/greek options for interlinears
        if (hasGreekVersion) {
            options.add(LookupOption.GREEK_ACCENTS);
        }

        if (hasHebrewVersion) {
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
    private void addHebrewOptions(final Book book, final Set<LookupOption> options) {
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
    private void addAllMatchingLookupOptions(final Book book, final Set<LookupOption> options) {
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
    private void addNotesOptions(final Book book, final Set<LookupOption> options) {
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
    private void addMorphologyOptions(final Book book, final Set<LookupOption> options) {
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
    private void addStrongNumberOptions(final Book book, final Set<LookupOption> options) {
        if (book.getBookMetaData().hasFeature(FeatureType.STRONGS_NUMBERS)) {
            options.add(LookupOption.ENGLISH_VOCAB);
            options.add(LookupOption.ES_VOCAB);
            options.add(LookupOption.ZH_TW_VOCAB);
            options.add(LookupOption.ZH_VOCAB);
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
    private void addRedLetterOptions(final Book book, final Set<LookupOption> options) {
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
    private void addBibleCategoryOptions(final Book book, final Set<LookupOption> options) {
        if (BIBLE.equals(book.getBookCategory())) {
            options.add(LookupOption.VERSE_NUMBERS);
            options.add(LookupOption.VERSE_NEW_LINE);
        }
    }

    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version, final String bookScope) {
        return this.getBibleBookNames(bookStart, version, bookScope, false);
    }

    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version, boolean autoLookupSingleBooks) {
        return this.getBibleBookNames(bookStart, version, null, autoLookupSingleBooks);
    }

    /**
     * returns a list of matching names or references in a particular book
     *
     * @param bookStart             the name of the matching key to look across book names
     * @param version               the name of the version, defaults to ESV if not found
     * @param bookScope             a scope that reduces the search
     * @param autoLookupSingleBooks true to indicate a single book should resolve to chapters
     * @return a list of matching bible book names
     */
    private List<BookName> getBibleBookNames(final String bookStart, final String version, final String bookScope,
                                             boolean autoLookupSingleBooks) {
        final String lookup = isBlank(bookStart) ? "" : bookStart;
        final Versification versification = this.versificationService.getVersificationForVersion(version);
        final List<BookName> books = getBooks(lookup, versification, bookScope, autoLookupSingleBooks);
        if (books.isEmpty()) {
            return getBooks(lookup, Versifications.instance().getVersification(Versifications.DEFAULT_V11N), bookScope, autoLookupSingleBooks);
        }
        return books;
    }

    /**
     * Looks through a versification for a particular type of book
     *
     * @param bookStart             the string to match
     * @param versification         the versification we are interested in
     * @param bookScope             the actual book required, usually to get chapters
     * @param autoLookupSingleBooks autoLookupSingleBooks true to indicate that for a single book, we should lookup
     *                              the chapters inside
     * @return the list of matching names
     */
    private List<BookName> getBooks(final String bookStart, final Versification versification, final String bookScope,
                                    final boolean autoLookupSingleBooks) {
        final String searchPattern = bookStart.toLowerCase(Locale.getDefault()).trim();

        final List<BookName> matchingNames = new ArrayList<BookName>();

        final Iterator<BibleBook> bookIterator = versification.getBookIterator();

        if (StringUtils.isNotBlank(bookScope)) {
            final List<BookName> optionsInBook = getChapters(versification, versification.getBook(bookScope));
            return optionsInBook;
        }

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

        if (autoLookupSingleBooks && matchingNames.size() == 1) {
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
                .getLongName(bookName), 
                DivisionName.BIBLE.contains(bookName) ? BookName.Section.BIBLE_BOOK : BookName.Section.APOCRYPHA, 
                versification.getLastChapter(bookName) != 1, bookName.getOSIS()));
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
        
        //we add the whole book + all the chapters
        BookName.Section section = DivisionName.BIBLE.contains(book) ? BookName.Section.BIBLE_BOOK : BookName.Section.APOCRYPHA;
        chapters.add(new BookName(versification.getShortName(book), versification
                .getLongName(book), section, versification.getLastChapter(book) != 1, book, false, book.getOSIS()));
        
        for (int ii = 1; ii <= lastChapter; ii++) {
            // final char f = Character.toUpperCase(searchSoFar.charAt(0));

            // make sure first letter is CAPS, followed by the rest of the word and the chapter number
            final String chapNumber = String
                    .format(BOOK_CHAPTER_FORMAT, versification.getShortName(book), ii);
            final String longChapNumber = String.format(BOOK_CHAPTER_FORMAT, versification.getLongName(book),
                    ii);

            chapters.add(new BookName(chapNumber, longChapNumber, BookName.Section.PASSAGE, false, book, true, JSwordUtils.getChapterOsis(book, ii)));
        }

        return chapters;
    }

    @Override
    public boolean hasVocab(final String version) {
        return supportsStrongs(this.versificationService.getBookFromVersion(version));
    }

    @Override
    public boolean supportsStrongs(Book book) {
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
    public InterlinearMode getBestInterlinearMode(String version, List<String> extraVersions, final InterlinearMode interlinearMode) {
        if (extraVersions == null || extraVersions.size() == 0) {
            return InterlinearMode.NONE;
        }

        //we've at least got several versions here, so, we prefer the option given to defaults
        if (interlinearMode == InterlinearMode.INTERLEAVED || interlinearMode == InterlinearMode.COLUMN) {
            return interlinearMode;
        }

        //so we've either asked for nothing, or asked for something that we need to check is appropriate

        Book main = this.versificationService.getBookFromVersion(version);
        String firstLanguage = main.getLanguage().getCode();
        boolean supportsStrongs = this.supportsStrongs(main);
        boolean sameLanguageAndBible = main.getBookCategory() == BIBLE;

        for (String extraVersion : extraVersions) {
            Book b = this.versificationService.getBookFromVersion(extraVersion);
            if (supportsStrongs && !this.supportsStrongs(b)) {
                supportsStrongs = false;
            }
            if (!firstLanguage.equalsIgnoreCase(b.getLanguage().getCode()) || b.getBookCategory() != BIBLE) {
                sameLanguageAndBible = false;
            }
            
            //small optimization
            if (!supportsStrongs && !sameLanguageAndBible) {
                break;
            }
        }

        //if compare options were given and are available, we return these.
        if (interlinearMode == InterlinearMode.INTERLEAVED_COMPARE || interlinearMode == InterlinearMode.COLUMN_COMPARE) {
            return getSameOrDowngradedInterlinearMode(interlinearMode, sameLanguageAndBible);
        }

        if (interlinearMode == InterlinearMode.INTERLINEAR && supportsStrongs && allVersionsSameTagging(version, extraVersions)) {
            return InterlinearMode.INTERLINEAR;
        }

        return InterlinearMode.INTERLEAVED;
    }

    /**
     * We check that all versions have the same Greek/Hebrew tagging. For example, Septuagint tagged texts should
     * not be mapped to the Hebrew texts
     * @param version the version
     * @param extraVersions the extra versions
     * @return true if all versions are of the same kind
     */
    private boolean allVersionsSameTagging(final String version, final List<String> extraVersions) {
        final boolean isSeptuagint = this.versionResolver.isSeptuagintTagging(version);
        for(String v : extraVersions) {
            if(isSeptuagint != this.versionResolver.isSeptuagintTagging(v)) {
                return false;
            }
        }
        return true;
    }


    @Override
    public boolean supportsFeature(final String version, LookupOption... options) {
        Book b = this.versificationService.getBookFromVersion(version);
        for(LookupOption lo : options) {
            FeatureType ft = lo.getFeature();
            if(ft != null) {
                if(!b.getBookMetaData().hasFeature(ft)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * if all versions are of the same language, then we return the interlinear mode.
     * Otherwise we return INTERLEAVED if INTERLEAVED_COMPARE was given, and COLUMN if COLUMN_COMPARED was given
     *
     * @param interlinearMode the original interlinear mode
     * @param sameLanguage    true to indicate all versions are of the same language
     * @return the final interlinear mode to be used going forward.
     */
    private InterlinearMode getSameOrDowngradedInterlinearMode(final InterlinearMode interlinearMode, final boolean sameLanguage) {
        if (sameLanguage) {
            return interlinearMode;
        } else if (interlinearMode == InterlinearMode.INTERLEAVED_COMPARE) {
            return InterlinearMode.INTERLEAVED;
        } else {
            return InterlinearMode.COLUMN;
        }
    }
}
