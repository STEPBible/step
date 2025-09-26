package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.service.InternationalRangeService;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.JSwordUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.basic.AbstractPassageBook;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseKey;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.DivisionName;
import org.crosswire.jsword.versification.Versification;

import javax.inject.Inject;
import java.util.*;

/**
 * The getExactTerms method will attempt to parse the key as is, using the key factory. If sucessful,
 * it will mark a reference as a whole book if applicable.
 * <p/>
 * The getNonExactTerms method will attempt to match against BibleBook names first, and then will use
 * parsed key if available and suggest a few chapters that
 * would make sense.
 */
public class ReferenceSuggestionServiceImpl extends AbstractIgnoreMergedListSuggestionServiceImpl<BookName> {
    private static final String BOOK_CHAPTER_FORMAT = "%s %d";
    private static final String BOOK_CHAPTER_OSIS_FORMAT = "%s.%d";
    private final JSwordVersificationService versificationService;
    private final InternationalRangeService internationalRangeService;

    @Inject
    public ReferenceSuggestionServiceImpl(final JSwordVersificationService versificationService,
                                          final InternationalRangeService internationalRangeService) {
        this.versificationService = versificationService;
        this.internationalRangeService = internationalRangeService;
    }

    @Override
    public BookName[] getExactTerms(final SuggestionContext context, final int max, final boolean popularSort) {
        final String masterBook = getDefaultedVersion(context);
        final Book master = this.versificationService.getBookFromVersion(masterBook);
        final Versification masterV11n = this.versificationService.getVersificationForVersion(masterBook);

        final String input = prepInput(context.getInput());
        try {
            Key k = master.getKey(input);
            if (k != null) {
                // check this book actually contains this key, based on the scope...
                if (!JSwordUtils.containsAny(master, k)) {
                    return new BookName[0];
                }

                BookName bk;
                if (k instanceof VerseKey) {
                    final VerseKey verseKey = (VerseKey) k;
                    final boolean wholeBook = isBook(masterV11n, verseKey);
                    if (wholeBook) {
                        final BibleBook book = ((Verse) verseKey.iterator().next()).getBook();
                        bk = getBookFromBibleBook(book, masterV11n);
                    } else {
                        bk = new BookName(verseKey.getName(), verseKey.getName(), BookName.Section.PASSAGE, wholeBook, ((Verse) verseKey.iterator().next()).getBook(), k.getOsisRef());
                    }
                    return new BookName[]{bk};
                } else {
                    return new BookName[]{new BookName(k.getName(), k.getName(), BookName.Section.OTHER_NON_BIBLICAL, false, k.getOsisRef())};
                }
            }
        } catch (NoSuchKeyException ex) {
            //silently fail
        }
        return new BookName[0];
    }

    /**
     * We adjust the input slightly to make more hits. For example, it is clear that someone typing a '-' at the end may or may not want the whole passage to the end of the chapter
     * but he certainly doesn't want gen.1.1-. Similarly, with an 'f' at the end, we might as well do the same things
     *
     * @param input
     * @return
     */
    String prepInput(String input) {
        final int inputLength = input.length();
        if (inputLength > 0) {
            final char lastChar = input.charAt(inputLength - 1);

            //if the reference finishes with a -, might as well suggest a -ff
            if (lastChar == '-') {
                return input.substring(0, inputLength - 1) + "ff";
            }

            //if the length is longer, then we might finish with for these cases: -f and 1f
            if (inputLength > 1) {
                final char secondLastChar = input.charAt((inputLength - 2));
                if (inputLength > 1 && lastChar == 'f') {
                    if(Character.isDigit(secondLastChar)) {
                        return input.substring(0, inputLength - 1) + "ff";
                    } else if(secondLastChar == '-')
                    return input.substring(0, inputLength - 2) + "ff";
                }
            }
        }
        return input;
    }

    /**
     * //     * @param input the input
     *
     * @return the list of matching ranges
     */
    @Override
    public BookName[] collectNonExactMatches(final TermsAndMaxCount<BookName> collector,
                                             final SuggestionContext context, final BookName[] alreadyRetrieved,
                                             final int leftToCollect) {
        if (context.isExampleData()) {
            return this.getSampleData(context);
        }

        //we've already attempted to parse the whole key, so left to do here, is to iterate through the books
        //and match against those names that make sense.
        final List<BookName> books = new ArrayList<BookName>();
        final String masterBook = getDefaultedVersion(context);
        final Book master = this.versificationService.getBookFromVersion(masterBook);
        final Versification masterV11n = this.versificationService.getVersificationForVersion(master);
        final String input = context.getInput().toLowerCase();
        final Iterator<BibleBook> bookIterator = getBestIterator(master, masterV11n);

        addMatchingBooks(books, masterV11n, input, bookIterator);

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
                } else if (Character.isDigit(bn.getShortName().charAt(bn.getShortName().length() - 1))) {
                    String shortName = bn.getShortName();
                    int lastPart = shortName.lastIndexOf(' ');
                    if (lastPart != -1) {
                        try {
                            int chapter = Integer.parseInt(shortName.substring(lastPart + 1));
                            //we'll add all the chapters that exist.
                            int lastChapter = masterV11n.getLastChapter(bn.getBibleBook());
                            for (int ii = chapter * 10; ii < lastChapter && ii < chapter * 10 + 10; ii++) {
                                extras.add(addChapter(masterV11n, bn.getBibleBook(), ii));
                                spaceLeft--;
                            }

                            for (int ii = chapter * 100; ii < lastChapter && chapter < chapter * 100 + 100; ii++) {
                                extras.add(addChapter(masterV11n, bn.getBibleBook(), ii));
                                spaceLeft--;
                            }
                        } catch (NumberFormatException ex) {
                            //ignore
                        }
                    }
                }
            }
            bookNames.addAll(extras);
        }

        return bookNames.toArray(new BookName[bookNames.size()]);
    }

    /**
     * @param master     the master book
     * @param masterV11n the v11n of the book
     * @return
     */
    private Iterator<BibleBook> getBestIterator(Book master, Versification masterV11n) {
        if (master instanceof AbstractPassageBook) {
            return ((AbstractPassageBook) master).getBibleBooks().iterator();
        }

        return masterV11n.getBookIterator();
    }

    private void addMatchingBooks(final List<BookName> books, final Versification masterV11n, final String input, final Iterator<BibleBook> bookIterator) {
        while (bookIterator.hasNext()) {
            final BibleBook book = bookIterator.next();
            final String longName = masterV11n.getLongName(book);
            final String preferredName = masterV11n.getPreferredName(book);
            final String shortName = masterV11n.getShortName(book);
            if ((longName != null && longName.toLowerCase().startsWith(input))
                    || (preferredName != null && preferredName.toLowerCase().startsWith(input))
                    || (shortName != null && shortName.toLowerCase().startsWith(input))) {
                addBookName(books, book, masterV11n);
            }
        }
    }

    /**
     * Returns all books of the Bible.
     *
     * @param context the context
     * @return the list of all book names
     */
    private BookName[] getSampleData(final SuggestionContext context) {
        final List<BookName> books = new ArrayList<BookName>();
        final String masterBook = getDefaultedVersion(context);
        final Versification masterV11n = this.versificationService.getVersificationForVersion(masterBook);
		String hasAllNTOTorBoth = JSwordUtils.hasAllNTOTorBoth.get(masterBook);
        if ((hasAllNTOTorBoth != null) && (hasAllNTOTorBoth.equals("B") || hasAllNTOTorBoth.equals("O"))) {
            final Iterator<BibleBook> bookIterator = masterV11n.getBookIterator();
            // The following while is faster and can be used for Bibles with all 66 books or with all 39 OT books
            while (bookIterator.hasNext()) {
                final BibleBook book = bookIterator.next();
                addBookName(books, book, masterV11n);
                if (hasAllNTOTorBoth.equals("O") && (books.size() == 39)) // Got all 39 OT books
                    break;
            }
            if ((hasAllNTOTorBoth.equals("B") && (books.size() != 66)) ||
                (hasAllNTOTorBoth.equals("O") && (books.size() != 39)))
                books.clear(); // Did not get 66 or 39 books so use the next loop to get the list of books
        }
        if (books.size() == 0) {
            final Book bookForThisVersion = this.versificationService.getBookFromVersion(masterBook);
	        final Key keysOfThisVersion = bookForThisVersion.getGlobalKeyList();
            final Iterator<BibleBook> bookIterator = masterV11n.getBookIterator();
            while (bookIterator.hasNext()) { // slower loop, but should be use if they do not have the 66 books or 39 OT boots.
                final BibleBook book = bookIterator.next();
                final Key keyToBook = bookForThisVersion.getValidKey(book.getOSIS());
                keyToBook.retainAll(keysOfThisVersion);
                if (keyToBook.getCardinality() != 0)
                    addBookName(books, book, masterV11n);
            }
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
        return new BookName(chapNumber, longChapNumber, BookName.Section.PASSAGE, false, null, true, JSwordUtils.getChapterOsis(bibleBook, chapterNumber));
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

        Verse firstKey = (Verse) k.get(0);
        final boolean startOfBook = masterV11n.isStartOfBook(firstKey);
        if (!startOfBook) {
            return false;
        }

        final Verse lastKey = (Verse) k.get(cardinality - 1);


        return firstKey.getBook() == lastKey.getBook() && masterV11n.isEndOfBook(lastKey);
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
        BookName.Section section = DivisionName.BIBLE.contains(bookName) ? BookName.Section.BIBLE_BOOK : BookName.Section.APOCRYPHA;

        return new BookName(versification.getShortName(bookName), versification
                .getLongName(bookName), section, versification.getLastChapter(bookName) != 1, bookName, false, bookName.getOSIS());
    }
}
