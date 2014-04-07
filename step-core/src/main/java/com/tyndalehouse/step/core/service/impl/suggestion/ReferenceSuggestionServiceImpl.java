package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseKey;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * The getExactTerms method will attempt to parse the key as is, using the key factory. If sucessful,
 * it will mark a reference as a whole book if applicable.
 * <p/>
 * The getNonExactTerms method will attempt to match against BibleBook names first, and then will use
 * parsed key if available and suggest a few chapters that
 * would make sense.
 *
 * @author chrisburrell
 */
public class ReferenceSuggestionServiceImpl extends AbstractIgnoreMergedListSuggestionServiceImpl<BookName> {
    private static final String BOOK_CHAPTER_FORMAT = "%s %d";
    private final JSwordVersificationService versificationService;

    @Inject
    public ReferenceSuggestionServiceImpl(JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
    }

    @Override
    public BookName[] getExactTerms(final SuggestionContext context, final int max, final boolean popularSort) {
        final String masterBook = getDefaultedVersion(context);
        final Book master = this.versificationService.getBookFromVersion(masterBook);
        final Versification masterV11n = this.versificationService.getVersificationForVersion(masterBook);

        try {
            Key k = master.getKey(context.getInput());
            if (k != null) {
                BookName bk;
                if (k instanceof VerseKey) {
                    final VerseKey verseKey = (VerseKey) k;
                    final boolean wholeBook = isBook(masterV11n, verseKey);
                    if (wholeBook) {
                        final BibleBook book = ((Verse) verseKey.iterator().next()).getBook();
                        bk = getBookFromBibleBook(book, masterV11n);
                    } else {
                        bk = new BookName(verseKey.getName(), verseKey.getName(), wholeBook);
                    }
                    return new BookName[]{bk};
                } else {
                    return new BookName[]{new BookName(k.getName(), k.getName(), false)};
                }
            }
        } catch (NoSuchKeyException ex) {
            //silently fail
        }
        return new BookName[0];
    }


    @Override
    public BookName[] collectNonExactMatches(final TermsAndMaxCount<BookName> collector,
                                             final SuggestionContext context, final BookName[] alreadyRetrieved,
                                             final int leftToCollect) {
        if(context.isExampleData()) {
            return this.getSampleData(context);
        }
        
        //we've already attempted to parse the whole key, so left to do here, is to iterate through the books
        //and match against those names that make sense.
        final List<BookName> books = new ArrayList<BookName>();
        final String masterBook = getDefaultedVersion(context);
        final Versification masterV11n = this.versificationService.getVersificationForVersion(masterBook);
        final String input = context.getInput().toLowerCase();
        final Iterator<BibleBook> bookIterator = masterV11n.getBookIterator();

        while (bookIterator.hasNext()) {
            final BibleBook book = bookIterator.next();
            if (masterV11n.getLongName(book).toLowerCase().startsWith(input)
                    || masterV11n.getPreferredName(book).toLowerCase().startsWith(input)
                    || masterV11n.getShortName(book).toLowerCase().startsWith(input)) {
                addBookName(books, book, masterV11n);
            }
        }

        //de-duplicate by adding to a set
        final Set<BookName> bookNames = new LinkedHashSet<BookName>();
        bookNames.addAll(Arrays.asList(alreadyRetrieved));
        bookNames.addAll(books);

        //now, how many items do we have, and do we need to add a few chapters here?
        int spaceLeft = collector.getTotalCount() - bookNames.size();
        if (spaceLeft > 0) {
            final List<BookName> extras = new ArrayList<BookName>();
            //find a 'whole' book
            for (BookName bn : bookNames) {
                if (bn.isWholeBook() && bn.getBibleBook() != null) {
                    int lastChapter = masterV11n.getLastChapter(bn.getBibleBook());
                    for (int ii = 1; ii < lastChapter && spaceLeft > 0; ii++) {
                        extras.add(addChapter(masterV11n, bn.getBibleBook(), ii));
                        spaceLeft--;
                    }
                    collector.setTotalCount(lastChapter);
                }
            }
            bookNames.addAll(extras);
        }
        return bookNames.toArray(new BookName[bookNames.size()]);
    }

    /**
     * Returns all 66 books (or more) of the Bible.
     * @param context the context
     * @return the list of all book names
     */
    private BookName[] getSampleData(final SuggestionContext context) {
        final List<BookName> books = new ArrayList<BookName>();
        final String masterBook = getDefaultedVersion(context);
        final Versification masterV11n = this.versificationService.getVersificationForVersion(masterBook);
        final Iterator<BibleBook> bookIterator = masterV11n.getBookIterator();

        while (bookIterator.hasNext()) {
            final BibleBook book = bookIterator.next();
                addBookName(books, book, masterV11n);
        }
        
        return books.toArray(new BookName[books.size()]);
    }

    /**
     * Adds a chapter
     *
     * @param bibleBook     the bible book
     * @param chapterNumber the chapter number
     * @return a bookName representing a chapter number
     */
    private BookName addChapter(Versification versification,
                                final BibleBook bibleBook, final int chapterNumber) {
        // make sure first letter is CAPS, followed by the rest of the word and the chapter number
        final String chapNumber = String
                .format(BOOK_CHAPTER_FORMAT, versification.getShortName(bibleBook), chapterNumber);
        final String longChapNumber = String.format(BOOK_CHAPTER_FORMAT, versification.getLongName(bibleBook),
                chapterNumber);

        return new BookName(chapNumber, longChapNumber, false, null, true);
    }

    /**
     * @param masterV11n the v11n of the verse key
     * @param k          the key which may be a whole book
     * @return true if the first key and the last key match to a whole book
     */
    private boolean isBook(final Versification masterV11n, final VerseKey k) {
        int cardinality = k.getCardinality();
        if (cardinality == 0) {
            return false;
        }

        Key firstKey = k.get(0);
        Key lastKey = k.get(cardinality - 1);
        return masterV11n.isStartOfBook(((Verse) firstKey)) && masterV11n.isEndOfBook(((Verse) lastKey));
    }


    /**
     * Gets the version that the user has selected, defaulting to ESV otherwise
     *
     * @param context the context for the request
     * @return the name of the version
     */
    private String getDefaultedVersion(final SuggestionContext context) {
        String masterBook = context.getMasterBook();
        if (StringUtils.isBlank(masterBook)) {
            masterBook = JSwordPassageService.REFERENCE_BOOK;
        }
        return masterBook;
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

        matchingNames.add(getBookFromBibleBook(bookName, versification));
    }

    /**
     * Returns a book name, constructed from the correct versification table
     *
     * @param bookName      the bible book (JSword object)
     * @param versification its attached versification
     * @return the book name suggestion that we return to the user
     */
    private BookName getBookFromBibleBook(final BibleBook bookName, final Versification versification) {
        return new BookName(versification.getShortName(bookName), versification
                .getLongName(bookName), versification.getLastChapter(bookName) != 1, bookName, false);
    }
}
