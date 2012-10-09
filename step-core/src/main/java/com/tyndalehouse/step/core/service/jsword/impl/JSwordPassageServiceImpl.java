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
package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.models.InterlinearMode.COLUMN_COMPARE;
import static com.tyndalehouse.step.core.models.InterlinearMode.INTERLEAVED;
import static com.tyndalehouse.step.core.models.InterlinearMode.INTERLEAVED_COMPARE;
import static com.tyndalehouse.step.core.models.InterlinearMode.INTERLINEAR;
import static com.tyndalehouse.step.core.models.InterlinearMode.NONE;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;
import static java.lang.Integer.parseInt;
import static java.lang.Integer.valueOf;
import static java.lang.String.format;
import static org.crosswire.common.xml.XMLUtil.writeToString;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ATTR_OSISID;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.xml.transform.TransformerException;

import org.crosswire.common.xml.Converter;
import org.crosswire.common.xml.JDOMSAXEventProvider;
import org.crosswire.common.xml.SAXEventProvider;
import org.crosswire.common.xml.TransformingSAXEventProvider;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.book.UnAccenter;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.NoSuchVerseException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.RocketPassage;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.BibleBookList;
import org.crosswire.jsword.versification.Versification;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.filter.Filter;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.service.impl.MorphologyServiceImpl;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.xsl.XslConversionType;
import com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl;
import com.tyndalehouse.step.core.xsl.impl.InterleavingProviderImpl;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
@Singleton
public class JSwordPassageServiceImpl implements JSwordPassageService {
    private static final String OSIS_ID_BOOK_CHAPTER = "%s.%s";
    private static final int MAX_VERSES_RETRIEVED = 300;
    private static final String OSIS_CHAPTER_FORMAT = "%s.%d";
    private static final String OSIS_CHAPTER_VERSE_FORMAT = "%s.%s.%d";
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordPassageServiceImpl.class);
    private final MorphologyServiceImpl morphologyProvider;
    private final JSwordVersificationService versificationService;
    private final VocabularyService vocabProvider;
    private final ColorCoderProviderImpl colorCoder;

    /**
     * constructs the jsword service.
     * 
     * @param versificationService jsword versification service
     * @param morphologyProvider provides morphological information
     * @param vocabProvider the service providing lexicon and vocabulary information
     */
    @Inject
    public JSwordPassageServiceImpl(final JSwordVersificationService versificationService,
            final MorphologyServiceImpl morphologyProvider, final VocabularyService vocabProvider,
            final ColorCoderProviderImpl colorCoder) {
        this.versificationService = versificationService;
        this.morphologyProvider = morphologyProvider;
        this.vocabProvider = vocabProvider;
        this.colorCoder = colorCoder;
    }

    @Override
    public KeyWrapper getSiblingChapter(final String reference, final String version,
            final boolean previousChapter) {
        // getting the next chapter
        // FIXME find a way of getting the next chapter from the current key, in the current book, rather than
        // relying on verisification systems which may contain verses that the Book does not support
        final Book currentBook = Books.installed().getBook(version);
        final Versification v11n = this.versificationService.getVersificationForVersion(currentBook);

        try {
            final Key key = currentBook.getKey(reference);

            final Verse verse = KeyUtil.getVerse(previousChapter ? key : key.get(key.getCardinality() - 1),
                    v11n);
            final int chapter = verse.getChapter();
            final BibleBook bibleBook = verse.getBook();

            Verse targetVerse;

            if (previousChapter) {
                if (chapter > 1) {
                    targetVerse = new Verse(verse.getBook(), chapter - 1, 1);
                } else {
                    // we go down a book
                    final BibleBookList books = v11n.getBooks();

                    final BibleBook previousBook = getNonIntroPreviousBook(bibleBook, books);

                    targetVerse = previousBook == null ? new Verse(BibleBook.GEN, 1, 1) : new Verse(
                            previousBook, v11n.getLastChapter(previousBook), 1);
                }
            } else {
                final int lastChapterInBook = v11n.getLastChapter(verse.getBook());
                if (chapter < lastChapterInBook) {
                    targetVerse = new Verse(verse.getBook(), chapter + 1, 1);
                } else {
                    // we go up a book
                    final BibleBookList books = v11n.getBooks();
                    final BibleBook nextBook = getNonIntroNextBook(bibleBook, books);

                    final int lastChapter = v11n.getLastChapter(BibleBook.REV);
                    final int lastVerse = v11n.getLastVerse(BibleBook.REV, lastChapter);
                    targetVerse = nextBook == null ? new Verse(BibleBook.REV, lastChapter, lastVerse)
                            : new Verse(nextBook, 1, 1);
                }
            }

            // now we've got our target verse, use it, trim off the verse number
            return new KeyWrapper(currentBook.getKey(getChapter(targetVerse, v11n)));
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Cannot find next chapter", e);
        }
    }

    /**
     * @param targetVerse the verse for which we want to trim off the verse number
     * @param v11n the versification of the book considered, required to deal with 1-chapter books
     * @return the reference without the verse number
     */
    private String getChapter(final Verse targetVerse, final Versification v11n) {
        final String osisID = targetVerse.getOsisID();
        final String[] parts = osisID.split("[.]");

        if (v11n.getLastChapter(targetVerse.getBook()) == 1) {
            // we're dealing with a 1-chapter book, so we only send back the name of the book
            return parts[0];
        }

        // otherwise, we always send back book+chapter
        if (parts.length == 3) {
            return String.format(OSIS_ID_BOOK_CHAPTER, parts[0], parts[1]);
        }

        return null;
    }

    /**
     * @param bibleBook the current book
     * @param books the list of books
     * @return the next bible book that is not an introduction
     */
    private BibleBook getNonIntroNextBook(final BibleBook bibleBook, final BibleBookList books) {
        BibleBook nextBook = bibleBook;
        do {
            nextBook = books.getNextBook(nextBook);
        } while (nextBook != null && isIntro(nextBook));
        return nextBook;
    }

    /**
     * @param bibleBook the current book
     * @param books the list of books
     * @return the previous bible book that is not an introduction
     **/
    private BibleBook getNonIntroPreviousBook(final BibleBook bibleBook, final BibleBookList books) {
        BibleBook previousBook = bibleBook;
        do {
            previousBook = books.getPreviousBook(previousBook);
        } while (previousBook != null && isIntro(previousBook));
        return previousBook;
    }

    /**
     * @param book the book to test
     * @return true to indicate the book is an introduction to the NT/OT/Bible
     */
    private boolean isIntro(final BibleBook book) {
        return book.getOSIS().startsWith("Intro");
    }

    @Override
    public KeyWrapper getKeyInfo(final String reference, final String version) {
        final Book currentBook = Books.installed().getBook(version);

        try {
            Key key;
            key = currentBook.getKey(reference);
            return new KeyWrapper(key);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Unable to resolve key: " + reference, e);
        }
    }

    /**
     * Roudns up the reference to the next chapter + 1 (1 if it is the last verse)
     * 
     * @param ref the current reference, split into up-to three parts (book/chapter/verse)
     * @param currentKey the current key
     * @param currentBook the book containing all valid keys
     * @return the next key in the list
     */
    Key getNextRef(final String[] ref, final Key currentKey, final Book currentBook) {
        switch (ref.length) {
            case 3:
                return expandToFullChapter(ref[0], ref[1], ref[2], currentBook, currentKey, 1);
            case 2:
                // if we only have 2 parts, then we take the chapter number +1 and see if that makes sense
                return getAdjacentChapter(ref[0], ref[1], currentBook, currentKey, 1);
            default:
                break;
        }

        return currentKey;
    }

    /**
     * attempts to resolve to the next previous chapter
     * 
     * @param ref the refParts, each element representing a portion of the OSIS ID
     * @param currentKey the key that is currently being examined
     * @param currentBook the book that is currently being referenced
     * @return the new OSIS ID, whether it exists or not.
     */
    Key getPreviousRef(final String[] ref, final Key currentKey, final Book currentBook) {

        // are we dealing with something like Book.chapter.verse?
        switch (ref.length) {
            case 3:
                return expandToFullChapter(ref[0], ref[1], ref[2], currentBook, currentKey, -1);
            case 2:
                return getAdjacentChapter(ref[0], ref[1], currentBook, currentKey, -1);
            default:
                // we are dealing with a book or something else.
                break;
        }

        return currentKey;
    }

    /**
     * attemps to expand to the next chapter if exists, other returns the same key as currently if no new
     * chapter is found
     * 
     * @param bookName the name of book, e.g. Gen
     * @param chapterNumber the chapter number
     * @param currentBook the book to look for valid keys
     * @param currentKey the current position in the book
     * @param gap -1 for a previous chapter, +1 for a next chapter
     * @return the new key, referring to the next chapter of previous as requested
     */
    Key getAdjacentChapter(final String bookName, final String chapterNumber, final Book currentBook,
            final Key currentKey, final int gap) {
        final int newChapter = parseInt(chapterNumber) + gap;

        return getValidOrSameKey(currentBook, currentKey, format(OSIS_CHAPTER_FORMAT, bookName, newChapter));
    }

    /**
     * Expands the key to full chapter, or if it is the last verse in the chapter, then it expands to the next
     * chapter
     * 
     * @param bookName the name of book, e.g. Gen
     * @param chapterNumber the chapter number
     * @param verseNumber the verse number
     * @param currentBook the book to look for valid keys
     * @param currentKey the current position in the book
     * @param gap the increment to expand to, e.g. 1 to the next chapter, -1 to the previous chapter (value in
     *            approximate verse numbers)
     * @return the new key, whether it refers to this current chapter or the next
     */
    Key expandToFullChapter(final String bookName, final String chapterNumber, final String verseNumber,
            final Book currentBook, final Key currentKey, final int gap) {
        final int nextVerse = parseInt(verseNumber) + gap;

        final Key newKey = getValidOrSameKey(currentBook, currentKey,
                format(OSIS_CHAPTER_VERSE_FORMAT, bookName, chapterNumber, nextVerse));

        // if we're on a beginning of a chapter
        if (newKey.getOsisID().endsWith(".0") || newKey.equals(currentKey)) {
            return getAdjacentChapter(bookName, chapterNumber, currentBook, currentKey, gap);
        }

        return currentBook.getValidKey(format(OSIS_ID_BOOK_CHAPTER, bookName, chapterNumber));
    }

    @Override
    public KeyWrapper expandToChapter(final String version, final String reference) {
        final Key k = Books.installed().getBook(version).getValidKey(reference);
        k.blur(100, RestrictionType.CHAPTER);
        return new KeyWrapper(k);
    }

    /**
     * returns a valid key to the book, either the one specified in the newKeyName or the currentKey
     * 
     * @param currentBook the book to look for valid keys
     * @param currentKey the current key
     * @param newKeyName the new potential key name
     * @return the newKey if newKeyName was a good guess, or currentKey if not
     */
    private Key getValidOrSameKey(final Book currentBook, final Key currentKey, final String newKeyName) {
        final Key validKey = currentBook.getValidKey(newKeyName);
        if (validKey.isEmpty()) {
            return currentKey;
        }
        return validKey;
    }

    @Override
    public String getPlainText(final String version, final String reference, final boolean firstVerse) {
        final Book book = this.versificationService.getBookFromVersion(version);
        try {
            Key key = book.getKey(reference);
            if (firstVerse) {
                key = getFirstverseExcludingZero(key, book);
            }

            final BookData data = new BookData(book, key);
            return OSISUtil.getCanonicalText(data.getOsisFragment());
        } catch (final BookException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * Gets the key for verse 1
     * 
     * @param key the current aggregate key
     * @param b the book
     * @return the new key representing 1 verse only
     */
    private Key getFirstverseExcludingZero(final Key key, final Book b) {
        if (key.getCardinality() < 1) {
            return key;
        }

        final Key subKey = key.get(0);
        if (subKey instanceof Verse) {
            final Verse verse = (Verse) subKey;
            if (verse.getVerse() == 0) {
                // then return verse 1 if available
                if (key.getCardinality() > 1) {
                    return key.get(1);
                }
                return this.versificationService.getVersificationForVersion(b).add(verse, 1);
            }
            return verse;
        }
        return key;
    }

    @Override
    public OsisWrapper peakOsisText(final Book bible, final Key key, final List<LookupOption> options) {
        options.add(LookupOption.HIDE_XGEN);

        final BookData bookData = new BookData(bible, key);
        return getTextForBookData(options, null, bookData, NONE);
    }

    @Override
    public OsisWrapper peakOsisText(final String version, final String keyedVersion,
            final ScriptureReference r) {
        // obtain first verse of each reference for display and add "..." on them...
        final int startVerseId = r.getStartVerseId();

        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();
        lookupOptions.add(LookupOption.HIDE_XGEN);

        final OsisWrapper osisText = this.getOsisTextByVerseNumbers(version, keyedVersion, startVerseId,
                startVerseId, lookupOptions, null, null, true);

        if (startVerseId != r.getEndVerseId()) {
            osisText.setFragment(true);
            osisText.setReference(this.versificationService.getVerseRange(startVerseId, r.getEndVerseId()));
        }

        return osisText;
    }

    @Override
    public OsisWrapper getOsisText(final String version, final String reference) {
        return getOsisText(version, reference, new ArrayList<LookupOption>(), null, NONE);
    }

    @Override
    public OsisWrapper getOsisTextByVerseNumbers(final String version, final String numberedVersion,
            final int startVerseId, final int endVerseId, final List<LookupOption> lookupOptions,
            final String interlinearVersion, final Boolean roundReference, final boolean ignoreVerse0) {

        // coded from numbered version.
        final Versification versificationForNumberedVersion = this.versificationService
                .getVersificationForVersion(numberedVersion);
        final Verse s = versificationForNumberedVersion.decodeOrdinal(startVerseId);
        final Verse e = versificationForNumberedVersion.decodeOrdinal(endVerseId);

        // convert it over to target versification
        final Book lookupVersion = this.versificationService.getBookFromVersion(version);

        final VerseRange range = this.versificationService.getVerseRangeForSelectedVerses(version,
                numberedVersion, versificationForNumberedVersion, s, e, lookupVersion, roundReference,
                ignoreVerse0);

        final BookData lookupBookData = new BookData(lookupVersion, range);
        return getTextForBookData(lookupOptions, interlinearVersion, lookupBookData, NONE);
    }

    // TODO: can we make this more performant by not re-compiling stylesheet - or is already cached
    // FIXME TODO: JS-109, email from CJB on 27/02/2011 remove synchronisation once book is fixed
    @Override
    public OsisWrapper getOsisText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion,
            final InterlinearMode displayMode) {
        LOGGER.debug("Retrieving text for ({}, {})", version, reference);

        final BookData bookData = getBookData(version, reference);
        return getTextForBookData(options, interlinearVersion, bookData, displayMode);
    }

    /**
     * Gets the BookData set up for verse retrieval
     * 
     * @param version the version to be used
     * @param reference the reference
     * @return the BookData object
     */
    BookData getBookData(final String version, final String reference) {
        final Book currentBook = this.versificationService.getBookFromVersion(version);
        final Versification v11n = this.versificationService.getVersificationForVersion(currentBook);

        try {
            Key key = currentBook.getKey(reference);
            normalize(key, v11n);

            // TODO, work this one out
            final int cardinality = key.getCardinality();
            if (cardinality > MAX_VERSES_RETRIEVED) {
                // then we go for the first chapter instead...
                // if the reference was for a whole book, we go for chapter 1, otherwise, we trim the range
                // down to the limit

                final Passage requestedPassage = KeyUtil.getPassage(key, v11n);
                if (requestedPassage.countRanges(RestrictionType.NONE) == 1
                        && requestedPassage.getRangeAt(0, RestrictionType.NONE).isWholeBook()) {
                    // ignoring chapter 0
                    key = requestedPassage.getRangeAt(1, RestrictionType.CHAPTER);
                } else {
                    requestedPassage.trimVerses(MAX_VERSES_RETRIEVED);
                }
            } else if (key.getCardinality() == 0) {
                throw new NoSuchKeyException("Cardinality of key is 0");
            }

            return new BookData(currentBook, key);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("The Bible text (" + reference + ")  is invalid.", e);
        }
    }

    /**
     * Removes verse 0 if present
     * 
     * @param reference the reference we wish to normalize
     */
    void normalize(final Key reference, final Versification v) {
        final Passage passage = KeyUtil.getPassage(reference, v);
        final int cardinality = passage.getCardinality();
        if (cardinality > 1) {
            final Key firstVerse = passage.get(0);
            if (firstVerse instanceof Verse && v.isStartOfChapter((Verse) firstVerse)) {
                passage.remove(firstVerse);
            }
        }
    }

    /**
     * Gets the osis text
     * 
     * @param options the list of lookup options
     * @param interlinearVersion the interlinear version if applicable
     * @param bookData the bookdata to use to look up the required version/reference combo
     * @param displayMode the mode to display the text with
     * 
     * @return the html text
     */
    private synchronized OsisWrapper getTextForBookData(final List<LookupOption> options,
            final String interlinearVersion, final BookData bookData, final InterlinearMode displayMode) {

        // check we have a book in mind and a reference
        notNull(bookData, "An internal error occurred", UserExceptionType.SERVICE_VALIDATION_ERROR);
        notNull(bookData.getFirstBook(), "An internal error occurred",
                UserExceptionType.SERVICE_VALIDATION_ERROR);

        final Key key = bookData.getKey();
        notNull(key, "An internal error occurred", UserExceptionType.SERVICE_VALIDATION_ERROR);

        // the original book
        final Book book = bookData.getFirstBook();
        final Versification versification = this.versificationService.getVersificationForVersion(book);
        normalize(key, versification);

        // first check whether the key is contained in the book
        // if (!keyExistsInBook(bookData)) {
        // throw new StepInternalException("The specified reference does not exist in this Bible");
        // }

        try {
            final SAXEventProvider osissep = bookData.getSAXEventProvider();

            final TransformingSAXEventProvider htmlsep = executeStyleSheet(options, interlinearVersion,
                    bookData, osissep, displayMode);

            final OsisWrapper osisWrapper = new OsisWrapper(writeToString(htmlsep), key, book.getLanguage()
                    .getCode(), versification);

            containsAncient(osisWrapper, interlinearVersion);

            if (key instanceof Passage) {
                final Passage p = (Passage) key;
                osisWrapper.setMultipleRanges(p.hasRanges(RestrictionType.NONE));

                // get the first "range" and set up the start and ends
                final VerseRange r = (VerseRange) p.rangeIterator(RestrictionType.NONE).next();
                osisWrapper.setStartRange(versification.getOrdinal(r.getStart()));
                osisWrapper.setEndRange(versification.getOrdinal(r.getEnd()));
            } else if (key instanceof VerseRange) {
                final VerseRange vr = (VerseRange) key;
                osisWrapper.setStartRange(versification.getOrdinal(vr.getStart()));
                osisWrapper.setEndRange(versification.getOrdinal(vr.getEnd()));
                osisWrapper.setMultipleRanges(false);
            }

            return osisWrapper;
        } catch (final BookException e) {
            final String reference = key.getOsisID();
            final String version = bookData.getFirstBook().getInitials();

            throw new StepInternalException("Unable to query the book data to retrieve specified passage: "
                    + version + ", " + reference, e);
        } catch (final SAXException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final TransformerException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * @param osisWrapper the osis wrapper to eventually be returned
     * @param interlinearVersion the interlinear versions in a comma separated format
     */
    private void containsAncient(final OsisWrapper osisWrapper, final String interlinearVersion) {
        if (isBlank(interlinearVersion)) {
            return;
        }

        final String[] versions = interlinearVersion.split(", ?");

        for (final String v : versions) {
            if (isNotBlank(v)) {
                final Book book = Books.installed().getBook(v.trim());
                if (book != null) {
                    final String code = book.getLanguage().getCode();
                    setIfContainsHebrew(osisWrapper, code);
                    setIfContainsGreek(osisWrapper, code);
                }
            }
        }
    }

    @Override
    public synchronized OsisWrapper getInterleavedVersions(final String[] versions, final String reference,
            final List<LookupOption> options, final InterlinearMode displayMode) {
        notNull(versions, "No versions were passed in", UserExceptionType.SERVICE_VALIDATION_ERROR);
        notNull(reference, "No reference was passed in", UserExceptionType.SERVICE_VALIDATION_ERROR);

        options.add(LookupOption.VERSE_NEW_LINE);

        final Book[] books = new Book[versions.length];
        for (int ii = 0; ii < versions.length; ii++) {
            books[ii] = this.versificationService.getBookFromVersion(versions[ii]);
        }

        validateInterleavedVersions(displayMode, books);

        try {
            final Key key = books[0].getKey(reference);
            final Versification v11n = this.versificationService.getVersificationForVersion(books[0]);
            normalize(key, v11n);

            final BookData data = new BookData(books, key, isComparingMode(displayMode));

            setUnaccenter(data, displayMode);

            final TransformingSAXEventProvider transformer = executeStyleSheet(options, null, data,
                    data.getSAXEventProvider(), displayMode, versions);

            final OsisWrapper osisWrapper = new OsisWrapper(writeToString(transformer), data.getKey(), data
                    .getFirstBook().getLanguage().getCode(), v11n);

            for (final Book b : books) {
                final String languageCode = b.getLanguage().getCode();
                setIfContainsHebrew(osisWrapper, languageCode);
                setIfContainsGreek(osisWrapper, languageCode);
            }

            return osisWrapper;
        } catch (final TransformerException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final SAXException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final BookException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * Checks that if comparing, we are looking at versions of the same language, or at least two of them
     * 
     * @param displayMode the display mode
     * @param books the books that have been found
     */
    private void validateInterleavedVersions(final InterlinearMode displayMode, final Book[] books) {
        final Set<String> languageCodes = new HashSet<String>(books.length);
        if (isComparingMode(displayMode)) {
            // check that we have at least two books of the same language
            for (final Book b : books) {
                final String code = b.getLanguage().getCode();
                if (languageCodes.contains(code)) {
                    return;
                }
                // otherwise we add and hope another version turns up
                languageCodes.add(code);
            }
            throw new StepInternalException(
                    "Cannot compare the selected versions as they are written in different languages");
        }

    }

    /**
     * @param displayMode the display mode of the passage
     * @return true if we are comparing
     */
    private boolean isComparingMode(final InterlinearMode displayMode) {
        return displayMode == InterlinearMode.COLUMN_COMPARE
                || displayMode == InterlinearMode.INTERLEAVED_COMPARE;
    }

    /**
     * if we're comparing, we want to compare unaccented forms
     * 
     * @param data the data
     * @param displayMode the chosen display mode
     */
    private void setUnaccenter(final BookData data, final InterlinearMode displayMode) {
        if (displayMode == COLUMN_COMPARE || displayMode == INTERLEAVED_COMPARE) {
            data.setUnaccenter(new UnAccenter() {

                @Override
                public String unaccent(final String accentedForm) {
                    return StringConversionUtils.unAccent(accentedForm);
                }
            });
        }
    }

    /**
     * sets the flag on the osis wrapper if it the code represents the greek
     * 
     * @param osisWrapper osis Wrapper
     * @param code the code to be examined
     */
    private void setIfContainsGreek(final OsisWrapper osisWrapper, final String code) {
        if ("grc".equals(code)) {
            osisWrapper.setContainsGreek(true);
        }
    }

    /**
     * sets the flag on the osis wrapper if it the code represents the hebrew
     * 
     * @param osisWrapper osis Wrapper
     * @param code the code to be examined
     */
    private void setIfContainsHebrew(final OsisWrapper osisWrapper, final String code) {
        if ("he".equals(code)) {
            osisWrapper.setContainsHebrew(true);
        }
    }

    // FIXME: TODO can be unsynchronized when JS-109 is rewritten

    /**
     * Changes the input OSIS document to have extra verses, the ones from the other versions
     * 
     * @param bookDatas the list of all book datas that we will be querying
     * @return the provider of events for the stylesheet to execute upon
     */
    SAXEventProvider buildInterleavedVersions(final BookData... bookDatas) {

        final Map<String, Element> versions = new HashMap<String, Element>();
        try {
            // obtain OSIS from every version
            for (final BookData bookData : bookDatas) {
                final Element osis = bookData.getOsis();
                versions.put(bookData.getFirstBook().getInitials(), osis);
            }

            final Filter verseFilter = new Filter() {
                @Override
                public boolean matches(final Object element) {
                    if (element instanceof Element) {
                        final Element e = (Element) element;
                        return "verse".equalsIgnoreCase(e.getName());
                    }
                    return false;
                }
            };

            // select one version and iterate through the others and change the OSIS
            boolean firstVersion = true;
            final Map<String, Element> versesFromMaster = new HashMap<String, Element>();

            // iterate through documents of every version
            for (final BookData data : bookDatas) {
                final String version = data.getFirstBook().getInitials();

                final Element element = versions.get(version);
                final Iterator<Element> docIterator = element.getDescendants(verseFilter);
                Element previousAppendedElement = null;

                // save the first version
                while (docIterator.hasNext()) {
                    final Element e = docIterator.next();
                    LOGGER.debug("Obtaining verse [{}]", e.getAttributeValue(OSIS_ATTR_OSISID));
                    final String osisID = e.getAttributeValue(OSIS_ATTR_OSISID).toLowerCase();
                    if (firstVersion) {
                        versesFromMaster.put(osisID, e);
                    } else {
                        Element childVerse = versesFromMaster.get(osisID);

                        if (childVerse == null) {
                            LOGGER.debug("Orphaned row: [{}]", osisID);
                            childVerse = previousAppendedElement;
                        }

                        final Element parentElement = childVerse.getParentElement();
                        parentElement.addContent(parentElement.indexOf(childVerse), (Element) e.clone());
                        previousAppendedElement = childVerse;
                    }
                }

                firstVersion = false;
            }

            final Element amendedOsis = versions.get(bookDatas[0].getFirstBook().getInitials());
            Document doc = amendedOsis.getDocument();

            if (doc == null) {
                doc = new Document(amendedOsis);
            }

            final XMLOutputter xmlOutputter = new XMLOutputter(Format.getRawFormat());
            LOGGER.debug("\n {}", xmlOutputter.outputString(doc));

            return new JDOMSAXEventProvider(doc);

        } catch (final BookException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    private TransformingSAXEventProvider executeStyleSheet(final List<LookupOption> options,
            final String interlinearVersion, final BookData bookData, final SAXEventProvider osissep,
            final InterlinearMode displayMode, final String... interleavingVersions)
            throws TransformerException {
        final XslConversionType requiredTransformation = identifyStyleSheet(bookData.getFirstBook()
                .getBookCategory(), options, displayMode);

        final TransformingSAXEventProvider htmlsep = (TransformingSAXEventProvider) new Converter() {
            @Override
            public SAXEventProvider convert(final SAXEventProvider provider) throws TransformerException {
                try {
                    final String file = requiredTransformation.getFile();
                    final URI resourceURI = getClass().getResource(file).toURI();

                    final TransformingSAXEventProvider tsep = new TransformingSAXEventProvider(resourceURI,
                            osissep);

                    // set parameters here
                    setOptions(tsep, options, bookData.getFirstBook());
                    setInterlinearOptions(tsep, interlinearVersion, bookData.getKey().getOsisID(),
                            displayMode);
                    setInterleavingOptions(tsep, displayMode, interleavingVersions);
                    return tsep;
                } catch (final URISyntaxException e) {
                    throw new StepInternalException("Failed to load resource correctly", e);
                }
            }
        }.convert(osissep);
        return htmlsep;
    }

    /**
     * If the key exists in one of the book, returns true, otherwise false
     * 
     * @param bookData the book data containing all books and the key
     * @return true if the key exists in one of the books
     */
    private boolean keyExistsInBook(final BookData bookData) {
        final Book[] books = bookData.getBooks();

        final Key key = bookData.getKey();
        for (final Book b : books) {
            if (b.contains(key)) {
                return true;
            }
        }

        return false;
    }

    /**
     * At the moment, we only support one stylesheet at the moment, so we only need to return one This may
     * change, but at that point we'll have a cleared view on requirements. For now, if one of the options
     * triggers anything but the default, then we return that. returns the stylesheet that should be used to
     * generate the text
     * 
     * @param bookCategory the category of the book
     * 
     * @param options the list of options that are currently applied to the passage
     * @param displayMode the display mode with wich to display the style sheet
     * @return the stylesheet (of stylesheets)
     */
    private XslConversionType identifyStyleSheet(final BookCategory bookCategory,
            final List<LookupOption> options, final InterlinearMode displayMode) {
        if (BookCategory.COMMENTARY.equals(bookCategory)) {
            return XslConversionType.COMMENTARY;
        }

        // for interlinears, we automatically add that option
        if (displayMode == InterlinearMode.INTERLINEAR) {
            options.add(LookupOption.INTERLINEAR);
        }

        for (final LookupOption lo : options) {
            // TODO refactor to remove completely the options adding / removing in preference for putting in
            // trim() in BibleInformationServiceImpl
            if (!XslConversionType.DEFAULT.equals(lo.getStylesheet())) {
                if (XslConversionType.INTERLINEAR.equals(lo.getStylesheet())) {
                    options.add(LookupOption.CHAPTER_VERSE);

                    // FIXME: also remove headers, as not yet supported
                    options.remove(LookupOption.HEADINGS);
                }

                return lo.getStylesheet();
            }
        }

        return XslConversionType.DEFAULT;
    }

    /**
     * sets up the default interlinear options
     * 
     * @param tsep the transformer that we want to set up
     * @param interlinearVersion the interlinear version(s) that the users have requested
     * @param reference the reference the user is interested in
     * @param displayMode the mode to display the passage, i.e. interlinear, interleaved, etc.
     */
    private void setInterlinearOptions(final TransformingSAXEventProvider tsep,
            final String interlinearVersion, final String reference, final InterlinearMode displayMode) {
        if (displayMode == InterlinearMode.INTERLINEAR) {
            tsep.setParameter("interlinearReference", reference);
            tsep.setParameter("VLine", false);

            if (isNotBlank(interlinearVersion)) {
                tsep.setParameter("interlinearVersion", interlinearVersion);
            }
        }
    }

    /**
     * Sets up interleaving vs column view
     * 
     * @param tsep the transformer
     * @param versions interleavingProvider the provider of interleaved version names
     * @param displayMode the display mode that we are interested in
     */
    private void setInterleavingOptions(final TransformingSAXEventProvider tsep,
            final InterlinearMode displayMode, final String[] versions) {
        // so long as we're not NONE or INTERLINEAR, we almost always need an InterlinearProvider
        if (displayMode != NONE && displayMode != INTERLINEAR) {
            tsep.setParameter("interleavingProvider", new InterleavingProviderImpl(versions,
                    displayMode == INTERLEAVED_COMPARE || displayMode == COLUMN_COMPARE));
        }

        if (displayMode == INTERLEAVED || displayMode == INTERLEAVED_COMPARE) {
            tsep.setParameter("Interleave", true);

        }

        if (displayMode == INTERLEAVED_COMPARE || displayMode == COLUMN_COMPARE) {
            tsep.setParameter("comparing", true);
        }

    }

    /**
     * This method sets up the options for the XSLT transformation. Note: the set of options is trimmed to
     * those actually available
     * 
     * @param tsep the xslt transformer
     * @param options the options available
     * @param book the version to initialise a potential interlinear with
     */
    protected void setOptions(final TransformingSAXEventProvider tsep, final List<LookupOption> options,
            final Book book) {

        for (final LookupOption lookupOption : options) {
            if (lookupOption.getXsltParameterName() != null) {
                tsep.setParameter(lookupOption.getXsltParameterName(), true);

                if (LookupOption.VERSE_NUMBERS == lookupOption) {
                    tsep.setParameter(LookupOption.TINY_VERSE_NUMBERS.getXsltParameterName(), true);
                }

                if (LookupOption.MORPHOLOGY == lookupOption) {
                    // tsep.setDevelopmentMode(true);
                    tsep.setParameter("morphologyProvider", this.morphologyProvider);
                }

                if (LookupOption.ENGLISH_VOCAB == lookupOption
                        || LookupOption.TRANSLITERATION == lookupOption
                        || LookupOption.GREEK_VOCAB == lookupOption) {
                    tsep.setParameter("vocabProvider", this.vocabProvider);
                }

                if (LookupOption.COLOUR_CODE == lookupOption) {
                    tsep.setParameter("colorCodingProvider", this.colorCoder);
                }
            }
        }

        tsep.setParameter("direction", book.getBookMetaData().isLeftToRight() ? "ltr" : "rtl");
        tsep.setParameter("baseVersion", book.getInitials());
    }

    @Override
    public List<ScriptureReference> resolveReferences(final String references, final String version) {

        LOGGER.trace("Resolving references for [{}]", references);
        try {
            final List<ScriptureReference> refs = new ArrayList<ScriptureReference>();

            if (isBlank(references)) {
                return refs;
            }

            final PassageKeyFactory keyFactory = PassageKeyFactory.instance();
            final Versification av11n = this.versificationService.getVersificationForVersion(version);
            final RocketPassage rp = (RocketPassage) keyFactory.getKey(av11n, references);

            for (int ii = 0; ii < rp.countRanges(RestrictionType.NONE); ii++) {
                final VerseRange vr = rp.getRangeAt(ii, RestrictionType.NONE);
                final Verse start = vr.getStart();
                final Verse end = vr.getEnd();

                final int startVerseId = av11n.getOrdinal(start);
                final int endVerseId = av11n.getOrdinal(end);

                LOGGER.trace("Found reference [{}] to [{}]", valueOf(startVerseId), valueOf(endVerseId));
                final ScriptureReference sr = new ScriptureReference();

                sr.setStartVerseId(startVerseId);
                sr.setEndVerseId(endVerseId);
                refs.add(sr);
            }
            return refs;
        } catch (final NoSuchVerseException nsve) {
            throw new StepInternalException("Verse " + references + " does not exist", nsve);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

}
