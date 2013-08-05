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
import static java.lang.String.format;
import static org.crosswire.common.xml.XMLUtil.writeToString;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ATTR_OSISID;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ELEMENT_VERSE;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.xml.transform.TransformerException;

import org.crosswire.common.xml.Converter;
import org.crosswire.common.xml.JDOMSAXEventProvider;
import org.crosswire.common.xml.SAXEventProvider;
import org.crosswire.common.xml.TransformingSAXEventProvider;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Testament;
import org.crosswire.jsword.versification.Versification;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.filter.ElementFilter;
import org.jdom2.filter.Filter;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.tyndalehouse.step.core.exceptions.LocalisedException;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.impl.MorphologyServiceImpl;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.core.xsl.XslConversionType;
import com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl;
import com.tyndalehouse.step.core.xsl.impl.InterleavingProviderImpl;
import com.tyndalehouse.step.core.xsl.impl.MultiInterlinearProviderImpl;

/**
 * a service providing a wrapper around JSword
 *
 * @author CJBurrell
 */
@Singleton
public class JSwordPassageServiceImpl implements JSwordPassageService {
    private static final int MAX_SMALL_BOOK_CHAPTER_COUNT = 5;
    private static final String OSIS_ID_BOOK_CHAPTER = "%s.%s";
    private static final int MAX_VERSES_RETRIEVED = 300;
    private static final String OSIS_CHAPTER_FORMAT = "%s.%d";
    private static final String OSIS_CHAPTER_VERSE_FORMAT = "%s.%s.%d";
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordPassageServiceImpl.class);
    private final MorphologyServiceImpl morphologyProvider;
    private final JSwordVersificationService versificationService;
    private final VocabularyService vocabProvider;
    private final ColorCoderProviderImpl colorCoder;
    private final VersionResolver resolver;
    private final Book kjvaBook;
    private final Book esvBook;

    /**
     * constructs the jsword service.
     *
     * @param versificationService jsword versification service
     * @param morphologyProvider   provides morphological information
     * @param vocabProvider        the service providing lexicon and vocabulary information
     * @param colorCoder           the service to color code a passage
     * @param resolver             the resolver
     */
    @Inject
    public JSwordPassageServiceImpl(final JSwordVersificationService versificationService,
                                    final MorphologyServiceImpl morphologyProvider, final VocabularyService vocabProvider,
                                    final ColorCoderProviderImpl colorCoder, final VersionResolver resolver) {
        this.versificationService = versificationService;
        this.morphologyProvider = morphologyProvider;
        this.vocabProvider = vocabProvider;
        this.colorCoder = colorCoder;
        this.resolver = resolver;

        kjvaBook = Books.installed().getBook("KJVA");
        esvBook = Books.installed().getBook("ESV");
    }

    @Override
    public KeyWrapper getSiblingChapter(final String reference, final String version,
                                        final boolean previousChapter) {
        // getting the next chapter
        // FIXME find a way of getting the next chapter from the current key, in the current book, rather than
        // relying on versification systems which may contain verses that the Book does not support
        final Book currentBook = this.versificationService.getBookFromVersion(version);
        final Versification v11n = this.versificationService.getVersificationForVersion(currentBook);

        try {
            final Key key = currentBook.getKey(reference);

            final Verse verse = KeyUtil.getVerse(previousChapter ? key : key.get(key.getCardinality() - 1));
            final int chapter = verse.getChapter();
            final BibleBook bibleBook = verse.getBook();

            Verse targetVerse;

            if (previousChapter) {
                if (chapter > 1) {
                    targetVerse = new Verse(v11n, verse.getBook(), chapter - 1, 1);
                } else {
                    // we go down a book
                    final BibleBook previousBook = getNonIntroPreviousBook(bibleBook, v11n);

                    targetVerse = previousBook == null ? new Verse(v11n, BibleBook.GEN, 1, 1) : new Verse(
                            v11n, previousBook, v11n.getLastChapter(previousBook), 1);
                }
            } else {
                final int lastChapterInBook = v11n.getLastChapter(verse.getBook());
                if (chapter < lastChapterInBook) {
                    targetVerse = new Verse(v11n, verse.getBook(), chapter + 1, 1);
                } else {
                    // we go up a book
                    final BibleBook nextBook = getNonIntroNextBook(bibleBook, v11n);

                    final int lastChapter = v11n.getLastChapter(BibleBook.REV);
                    final int lastVerse = v11n.getLastVerse(BibleBook.REV, lastChapter);
                    targetVerse = nextBook == null ? new Verse(v11n, BibleBook.REV, lastChapter, lastVerse)
                            : new Verse(v11n, nextBook, 1, 1);
                }
            }

            // now we've got our target verse, use it, trim off the verse number
            return new KeyWrapper(currentBook.getKey(getChapter(targetVerse, v11n)));
        } catch (final NoSuchKeyException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }

    /**
     * @param targetVerse the verse for which we want to trim off the verse number
     * @param v11n        the versification of the book considered, required to deal with 1-chapter books
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
     * Gets the non intro next book.
     *
     * @param bibleBook the current book
     * @param v11n      the v11n
     * @return the next bible book that is not an introduction
     */
    private BibleBook getNonIntroNextBook(final BibleBook bibleBook, final Versification v11n) {
        BibleBook nextBook = bibleBook;
        do {
            nextBook = v11n.getNextBook(nextBook);
        } while (nextBook != null && isIntro(nextBook));
        return nextBook;
    }

    /**
     * Gets the non intro previous book.
     *
     * @param bibleBook the current book
     * @param v11n      the v11n
     * @return the previous bible book that is not an introduction
     */
    private BibleBook getNonIntroPreviousBook(final BibleBook bibleBook, final Versification v11n) {
        BibleBook previousBook = bibleBook;
        do {
            previousBook = v11n.getPreviousBook(previousBook);
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
    public KeyWrapper getKeyInfo(final String reference, final String sourceVersion, String version) {
        final Book currentBook = this.versificationService.getBookFromVersion(version);
        return this.versificationService.convertReference(reference, sourceVersion, version);
    }

    /**
     * Roudns up the reference to the next chapter + 1 (1 if it is the last verse)
     *
     * @param ref         the current reference, split into up-to three parts (book/chapter/verse)
     * @param currentKey  the current key
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
     * @param ref         the refParts, each element representing a portion of the OSIS ID
     * @param currentKey  the key that is currently being examined
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
     * @param bookName      the name of book, e.g. Gen
     * @param chapterNumber the chapter number
     * @param currentBook   the book to look for valid keys
     * @param currentKey    the current position in the book
     * @param gap           -1 for a previous chapter, +1 for a next chapter
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
     * @param bookName      the name of book, e.g. Gen
     * @param chapterNumber the chapter number
     * @param verseNumber   the verse number
     * @param currentBook   the book to look for valid keys
     * @param currentKey    the current position in the book
     * @param gap           the increment to expand to, e.g. 1 to the next chapter, -1 to the previous chapter (value in
     *                      approximate verse numbers)
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
        final Key k = this.versificationService.getBookFromVersion(version).getValidKey(reference);
        k.blur(100, RestrictionType.CHAPTER);
        return new KeyWrapper(k);
    }

    /**
     * returns a valid key to the book, either the one specified in the newKeyName or the currentKey
     *
     * @param currentBook the book to look for valid keys
     * @param currentKey  the current key
     * @param newKeyName  the new potential key name
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
                key = getFirstVerseExcludingZero(key, book);
            }

            final BookData data = new BookData(book, key);
            return OSISUtil.getCanonicalText(data.getOsisFragment());
        } catch (final BookException e) {
            throw new LocalisedException(e, e.getMessage());
        } catch (final NoSuchKeyException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }

    /**
     * Gets the key for verse 1
     *
     * @param key the current aggregate key
     * @param b   the book
     * @return the new key representing 1 verse only
     */
    @Override
    public Key getFirstVerseExcludingZero(final Key key, final Book b) {
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
    public Key getFirstVerseFromRange(final Key range) {
        if (range instanceof VerseRange) {
            final VerseRange verseRange = (VerseRange) range;

            final Iterator<Key> iterator = verseRange.iterator();
            if (!iterator.hasNext()) {
                // empty range
                return range;
            }

            final Key next = iterator.next();
            if (!(next instanceof Verse)) {
                throw new StepInternalException(
                        "Iterating through verse range does not give me a verse! Key was: "
                                + range.toString());
            }

            final Verse firstElement = (Verse) next;
            if (firstElement.getVerse() != 0) {
                return firstElement;
            }

            // otherwise, we were at verse 0, so try the next one
            if (!iterator.hasNext()) {
                // empty range, except for verse 0
                return range;
            }

            return iterator.next();

        }

        return range;
    }

    @Override
    public OsisWrapper peakOsisText(final Book bible, final Key key, final List<LookupOption> options) {
        options.add(LookupOption.HIDE_XGEN);

        final BookData bookData = new BookData(bible, key);
        return getTextForBookData(options, null, bookData, NONE);
    }

    @Override
    public OsisWrapper peakOsisText(final String version, final String keyedVersion, final String r) {
        // obtain first verse of each reference for display and add "..." on them...
        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();
        lookupOptions.add(LookupOption.HIDE_XGEN);

        final Book currentBook = this.versificationService.getBookFromVersion(keyedVersion);
        Key keyToPassage;
        try {
            keyToPassage = currentBook.getKey(r);
        } catch (final NoSuchKeyException e) {
            throw new LocalisedException(e, e.getMessage());
        }

        final Key firstVerse = this.getFirstVerseExcludingZero(keyToPassage, currentBook);
        return this.getOsisText(version, firstVerse.getOsisID(), lookupOptions, null, InterlinearMode.NONE);
    }

    @Override
    public OsisWrapper getOsisText(final String version, final String reference) {
        return getOsisText(version, reference, new ArrayList<LookupOption>(0), null, NONE);
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
     * @param version   the version to be used
     * @param reference the reference
     * @return the BookData object
     */
    BookData getBookData(final String version, final String reference) {
        final Book currentBook = this.versificationService.getBookFromVersion(version);
        final Versification v11n = this.versificationService.getVersificationForVersion(currentBook);

        try {
            Key key = currentBook.getKey(reference);
            key = normalize(key, v11n);

            return new BookData(currentBook, key);
        } catch (final NoSuchKeyException e) {
            return handlePassageLookupNSKException(reference, currentBook, v11n, e);

        }
    }

    /**
     * Handles the NoSuchKey Exception when a passage lookup occurs
     * @param reference the reference that cannot be found
     * @param currentBook the current book in question
     * @param v11n the associated v11n
     * @param e the exception that was the cause
     * @return the returned bookdata (of size 0) if we can
     */
    private BookData handlePassageLookupNSKException(final String reference, final Book currentBook, final Versification v11n, final NoSuchKeyException e) {
        //attempt to resolve the reference in the KJVA and if that isn't present then the ESV
        //and if that isn't present, throw the exception anyway.
        if(kjvaBook != null) {
            try {
                //attempt the parse
                kjvaBook.getKey(reference);
                return new BookData(currentBook, new DefaultKeyList());
            } catch (NoSuchKeyException ex) {
                //swallow this exception, and allow through
            }
        }

        //same thing for esv
        if(esvBook != null) {
            try {
                //attempt the parse
                esvBook.getKey(reference);
                return new BookData(currentBook, new RocketPassage(v11n));
            } catch (NoSuchKeyException ex) {
                //swallow this exception, and allow through
            }
        }

        throw new TranslatedException(e, "invalid_reference", reference);
    }

    /**
     * We have a whole book reference. If the book is less than 5 chapters, we display the whole book.
     * Otherwise we display the first chapter only.
     *
     * @param v11n             the alternative versification
     * @param requestedPassage the passage
     * @return the new key
     * @throws NoSuchKeyException the no such key exception
     */
    private Key trimExceedingVersesFromWholeReference(final Versification v11n, final Passage requestedPassage)
            throws NoSuchKeyException {
        if (v11n.getLastChapter(requestedPassage.getRangeAt(0, RestrictionType.NONE).getStart().getBook()) <= MAX_SMALL_BOOK_CHAPTER_COUNT) {
            // return whole chapter
            return requestedPassage;
        }

        // else return first chapter only.
        VerseRange firstChapter = requestedPassage.getRangeAt(0, RestrictionType.CHAPTER);
        if (firstChapter.getStart().getChapter() == 0) {
            // go for second chapter, which is chapter 1, going [0, 1, ...]
            firstChapter = requestedPassage.getRangeAt(1, RestrictionType.CHAPTER);
        }
        return normalize(firstChapter, v11n);
    }

    /**
     * @param requestedPassage the key passage object
     * @return true if represents a whole book.
     */
    private boolean isWholeBook(final Passage requestedPassage) {
        final VerseRange rangeAt = requestedPassage.getRangeAt(0, RestrictionType.NONE);

        // spanning multiple books?
        if (rangeAt.isMultipleBooks()) {
            return false;
        }

        // no range at all?
        if (rangeAt.getCardinality() <= 0) {
            return false;
        }

        final Verse firstVerse = rangeAt.getStart();
        final Verse endVerse = rangeAt.getEnd();
        final Versification versification = firstVerse.getVersification();

        return versification.isStartOfBook(firstVerse) && versification.isEndOfBook(endVerse);
    }

    /**
     * Removes verse 0 if present.
     *
     * @param reference the reference we wish to normalize
     * @param v11n      the versification that goes with the reference
     * @return normalized key, which could be different to the instance passed in
     * @throws NoSuchKeyException the exception indicating no key
     */
    Key normalize(final Key reference, final Versification v11n) throws NoSuchKeyException {
        return reduceKeySize(reference, v11n);
    }

    /**
     * Reduce key size to something acceptable by copyright holders.
     *
     * @param inputKey the input key
     * @param v11n     the versification
     * @return the key
     * @throws NoSuchKeyException the no such key exception
     */
    Key reduceKeySize(final Key inputKey, final Versification v11n) throws NoSuchKeyException {
        Key key = inputKey;
        final int cardinality = key.getCardinality();

        // if we're looking at a whole book, then we will deal with it in one way,
        final Passage requestedPassage = KeyUtil.getPassage(key);
        if (requestedPassage.countRanges(RestrictionType.NONE) == 1 && isWholeBook(requestedPassage)) {
            key = trimExceedingVersesFromWholeReference(v11n, requestedPassage);
        } else if (cardinality > MAX_VERSES_RETRIEVED) {
            requestedPassage.trimVerses(MAX_VERSES_RETRIEVED);
            key = requestedPassage;
        }
        return key;
    }

    /**
     * Gets the osis text
     *
     * @param options            the list of lookup options
     * @param interlinearVersion the interlinear version if applicable
     * @param bookData           the bookdata to use to look up the required version/reference combo
     * @param displayMode        the mode to display the text with
     * @return the html text
     */
    private OsisWrapper getTextForBookData(final List<LookupOption> options, final String interlinearVersion,
                                           final BookData bookData, final InterlinearMode displayMode) {

        // check we have a book in mind and a reference
        notNull(bookData, "An internal error occurred", UserExceptionType.SERVICE_VALIDATION_ERROR);
        notNull(bookData.getFirstBook(), "An internal error occurred",
                UserExceptionType.SERVICE_VALIDATION_ERROR);

        Key key = bookData.getKey();
        notNull(key, "An internal error occurred", UserExceptionType.SERVICE_VALIDATION_ERROR);

        // the original book
        final Book book = bookData.getFirstBook();
        final Versification versification = this.versificationService.getVersificationForVersion(book);

        try {
            // first check whether the key is contained in the book
            key = normalize(key, versification);
            final SAXEventProvider osissep = bookData.getSAXEventProvider();

            final TransformingSAXEventProvider htmlsep = executeStyleSheet(versification, options, interlinearVersion,
                    bookData, osissep, displayMode);

            final OsisWrapper osisWrapper = new OsisWrapper(writeToString(htmlsep), key, getLanguages(book, displayMode, htmlsep, options), versification);


            if (key instanceof Passage) {
                final Passage p = (Passage) key;
                final boolean hasMultipleRanges = p.hasRanges(RestrictionType.NONE);
                osisWrapper.setMultipleRanges(hasMultipleRanges);

                if (hasMultipleRanges) {
                    // get the first "range" and set up the start and ends
                    final VerseRange r = (VerseRange) p.rangeIterator(RestrictionType.NONE).next();
                    osisWrapper.setStartRange(versification.getOrdinal(r.getStart()));
                    osisWrapper.setEndRange(versification.getOrdinal(r.getEnd()));
                } else {
                    Iterator<Key> keys = p.iterator();
                    Verse start = null;
                    Verse end = null;
                    while (keys.hasNext()) {
                        if (start == null) {
                            start = (Verse) keys.next();
                        } else {
                            end = (Verse) keys.next();
                        }
                    }
                    if (start != null) {
                        osisWrapper.setStartRange(start.getOrdinal());
                    }
                    if (end != null) {
                        osisWrapper.setEndRange(end.getOrdinal());
                    } else if(start != null) {
                        osisWrapper.setEndRange(start.getOrdinal());
                    }
                }
            } else if (key instanceof VerseRange) {
                final VerseRange vr = (VerseRange) key;
                osisWrapper.setStartRange(versification.getOrdinal(vr.getStart()));
                osisWrapper.setEndRange(versification.getOrdinal(vr.getEnd()));
                osisWrapper.setMultipleRanges(false);
            }

            return osisWrapper;
        } catch (final BookException e) {
            throw new LocalisedException(e, e.getMessage());
        } catch (final SAXException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final TransformerException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final NoSuchKeyException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }

    /**
     * Gets languages as set up in the transformer
     *
     * @param mainBook the main book used for the interlinear/interleaving
     * @param mode     the mode of interlinear used
     * @param htmlsep  the transformer
     */
    private String[] getLanguages(final Book mainBook, final InterlinearMode mode, final TransformingSAXEventProvider htmlsep, List<LookupOption> options) {
        if (mode == InterlinearMode.INTERLINEAR) {
            return getLanguagesForInterlinear(mainBook, htmlsep);
        } else {
            return getLanguagesForInterleaved(mainBook, htmlsep);
        }
    }

    /**
     * Used to identify languages from the interleaving modes
     *
     * @param htmlsep
     * @return the list of language codes
     */
    private String[] getLanguagesForInterleaved(final Book mainBook, final TransformingSAXEventProvider htmlsep) {
        final InterleavingProviderImpl interleavingProvider = (InterleavingProviderImpl) htmlsep.getParameter("interleavingProvider");
        if(interleavingProvider == null) {
            return new String[] { mainBook.getLanguage().getCode() };
        }

        final String[] versions = interleavingProvider.getVersions();
        final String[] languages = new String[versions.length];
        for (int i = 0; i < versions.length; i++) {
            languages[i] = versificationService.getBookFromVersion(versions[i]).getLanguage().getCode();
        }

        return languages;
    }

    /**
     * Returns the set of languages when set in interlinear mode
     *
     * @param transformer the transforer
     * @return the array of languages
     */
    private String[] getLanguagesForInterlinear(final Book mainBook, final TransformingSAXEventProvider transformer) {
        final String interlinearVersion = (String) transformer.getParameter("interlinearVersion");
        final String[] versions = StringUtils.split(interlinearVersion, ", ?");
        final String[] totalVersions = new String[versions.length + 1];

        totalVersions[0] = mainBook.getLanguage().getCode();
        for (int ii = 0; ii < versions.length; ii++) {
            totalVersions[ii + 1] = this.versificationService.getBookFromVersion(versions[ii]).getLanguage().getCode();
        }

        return totalVersions;
    }

    @Override
    public OsisWrapper getInterleavedVersions(final String[] versions, final String reference,
                                              final List<LookupOption> options, final InterlinearMode displayMode) {
        notNull(versions, "No versions were passed in", UserExceptionType.SERVICE_VALIDATION_ERROR);
        notNull(reference, "No reference was passed in", UserExceptionType.SERVICE_VALIDATION_ERROR);

        options.add(LookupOption.VERSE_NEW_LINE);

        final Book[] books = getValidInterleavedBooks(versions, displayMode);
        final Versification v11n = this.versificationService.getVersificationForVersion(books[0]);
        BookData data = null;
        try {
            Key key = books[0].getKey(reference);
            key = normalize(key, v11n);

            data = new BookData(books, key, isComparingMode(displayMode));
        } catch(NoSuchKeyException nske) {
            data = handlePassageLookupNSKException(reference, books[0], v11n, nske);
        }

        try {
            setUnaccenter(data, displayMode);

            final TransformingSAXEventProvider transformer = executeStyleSheet(v11n, options, null, data,
                    data.getSAXEventProvider(), displayMode);

            String[] languages = new String[books.length];
            for (int ii = 0; ii < books.length; ii++) {
                languages[ii] = books[ii].getLanguage().getCode();
            }

            final OsisWrapper osisWrapper = new OsisWrapper(writeToString(transformer), data.getKey(), languages, v11n);


            return osisWrapper;
        } catch (final TransformerException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final SAXException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final BookException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }

    /**
     * Validates the books given and trims down by removing any following duplicates
     *
     * @param versions    the list of versions we are going to look up
     * @param displayMode the display mode
     * @return a list of books to use for looking up our data
     */
    private Book[] getValidInterleavedBooks(final String[] versions, final InterlinearMode displayMode) {
        Book[] books = new Book[versions.length];
        for (int ii = 0; ii < versions.length; ii++) {
            books[ii] = this.versificationService.getBookFromVersion(versions[ii]);
        }

        books = removeDifferentLanguageIfCompare(displayMode, books);
        books = removeSameBooks(displayMode, books);
        return books;
    }

    /**
     * Removes any book which is preceded by itself
     *
     * @param displayMode the display mode
     * @param books       the list of books
     * @return the new list of books
     */
    private Book[] removeSameBooks(final InterlinearMode displayMode, final Book[] books) {
        if (isComparingMode(displayMode)) {
            final List<Book> trimmedBooks = new ArrayList<Book>(books.length);
            trimmedBooks.add(books[0]);
            for (int i = 1; i < books.length; i++) {
                if (!books[i - 1].getInitials().equals(books[i].getInitials())) {
                    trimmedBooks.add(books[i]);
                }
            }

            if (trimmedBooks.size() < 2) {
                throw new TranslatedException("identical_texts");
            }

            if (trimmedBooks.size() == books.length) {
                return books;
            }

            final Book[] tBooks = new Book[trimmedBooks.size()];
            trimmedBooks.toArray(tBooks);
            return tBooks;
        }
        return books;
    }

    /**
     * Checks that if comparing, we are looking at versions of the same language, or at least two of them
     *
     * @param displayMode the display mode
     * @param books       the books that have been found
     */
    private Book[] removeDifferentLanguageIfCompare(final InterlinearMode displayMode, final Book[] books) {
        if (books.length == 0) {
            return books;
        }

        if (!isComparingMode(displayMode)) {
            return books;
        }

        final String firstLanguage = books[0].getLanguage().getCode();
        final List<Book> booksOfSameLanguage = new ArrayList<Book>();

        // check that we have at least two books of the same language
        for (final Book b : books) {
            if (firstLanguage.equals(b.getLanguage().getCode())) {
                booksOfSameLanguage.add(b);
            }
        }

        if (booksOfSameLanguage.size() < 2) {
            throw new TranslatedException("translations_in_different_languages");
        }

        return booksOfSameLanguage.toArray(new Book[0]);
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
     * @param data        the data
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

            final Filter<Element> verseFilter = new ElementFilter(OSIS_ELEMENT_VERSE);

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
                        parentElement.addContent(parentElement.indexOf(childVerse), e.clone());
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

            if (LOGGER.isDebugEnabled()) {
                final XMLOutputter xmlOutputter = new XMLOutputter(Format.getRawFormat());
                LOGGER.debug("\n {}", xmlOutputter.outputString(doc));
            }

            return new JDOMSAXEventProvider(doc);

        } catch (final BookException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }

    /**
     * Executes the stylesheet
     *
     * @param masterVersification the versification of the top line
     * @param options             the list of options to pass in
     * @param interlinearVersion  the interlinear version(s)
     * @param bookData            the book data, containing book and reference
     * @param osissep             the XML SAX provider
     * @param displayMode         the display mode
     * @return a Transforming SAX event provider, from which can be transformed into HTML
     * @throws TransformerException an exception in the stylesheet that is being executed
     */
    private TransformingSAXEventProvider executeStyleSheet(final Versification masterVersification,
                                                           final List<LookupOption> options,
                                                           final String interlinearVersion, final BookData bookData, final SAXEventProvider osissep,
                                                           final InterlinearMode displayMode) throws TransformerException {
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
                    setInterlinearOptions(tsep, masterVersification, getInterlinearVersion(interlinearVersion), bookData.getKey()
                            .getOsisID(), displayMode, bookData.getKey());
                    setInterleavingOptions(tsep, displayMode, bookData);
                    return tsep;
                } catch (final URISyntaxException e) {
                    throw new StepInternalException("Failed to load resource correctly", e);
                }
            }
        }.convert(osissep);
        return htmlsep;
    }

    /**
     * At the moment, we only support one stylesheet at the moment, so we only need to return one This may
     * change, but at that point we'll have a cleared view on requirements. For now, if one of the options
     * triggers anything but the default, then we return that. returns the stylesheet that should be used to
     * generate the text
     *
     * @param bookCategory the category of the book
     * @param options      the list of options that are currently applied to the passage
     * @param displayMode  the display mode with wich to display the style sheet
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
     * @param tsep                the transformer that we want to set up
     * @param masterVersification the versification of the top line
     * @param interlinearVersion  the interlinear version(s) that the users have requested
     * @param reference           the reference the user is interested in
     * @param displayMode         the mode to display the passage, i.e. interlinear, interleaved, etc.
     * @param key                 the key to the passage
     */
    private void setInterlinearOptions(final TransformingSAXEventProvider tsep, final Versification masterVersification,
                                       final String interlinearVersion, final String reference, final InterlinearMode displayMode, final Key key) {
        if (displayMode == InterlinearMode.INTERLINEAR) {
            tsep.setParameter("VLine", false);

            //TODO: work out OT or NT
            Iterator<Key> keys = key.iterator();
            if(keys.hasNext()) {
                Key firstKey = keys.next();
                if(firstKey instanceof Verse) {
                    final Verse verse = (Verse) firstKey;
                    Testament t = masterVersification.getTestament(verse.getOrdinal());
                    tsep.setParameter("isOT", t == Testament.OLD);
                }
            }

            if (isNotBlank(interlinearVersion)) {
                tsep.setParameter("interlinearVersion", interlinearVersion);
            }

            final MultiInterlinearProviderImpl multiInterlinear = new MultiInterlinearProviderImpl(masterVersification,
                    interlinearVersion, reference, this.versificationService, this.vocabProvider);
            tsep.setParameter("interlinearProvider", multiInterlinear);
        }
    }

    /**
     * Sets up interleaving vs column view
     *
     * @param tsep        the transformer
     * @param bookData    the book data object containing the list of books we are interested in.
     * @param displayMode the display mode that we are interested in
     */
    private void setInterleavingOptions(final TransformingSAXEventProvider tsep,
                                        final InterlinearMode displayMode, final BookData bookData) {
        // so long as we're not NONE or INTERLINEAR, we almost always need an InterlinearProvider
        final Book[] books = bookData.getBooks();
        final String[] versions = new String[books.length];
        for (int ii = 0; ii < books.length; ii++) {
            versions[ii] = this.resolver.getShortName(books[ii].getInitials());
        }

        if (displayMode != NONE && displayMode != INTERLINEAR) {
            tsep.setParameter("interleavingProvider", new InterleavingProviderImpl(this.versificationService,
                    versions, displayMode == INTERLEAVED_COMPARE || displayMode == COLUMN_COMPARE));
            tsep.setParameter("HideXGen", true);
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
     * @param tsep    the xslt transformer
     * @param options the options available
     * @param book    the version to initialise a potential interlinear with
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

    /**
     * @param references a list of references to be parsed
     * @param version    the version against which the refs are parsed
     * @return a String representing all the references
     */
    @Override
    public String getAllReferences(final String references, final String version) {
        final PassageKeyFactory keyFactory = PassageKeyFactory.instance();
        final Versification av11n = this.versificationService.getVersificationForVersion(version);
        final StringBuilder referenceString = new StringBuilder(1024);
        try {
            final Key k = keyFactory.getKey(av11n, references);
            final Iterator<Key> iterator = k.iterator();
            while (iterator.hasNext()) {
                referenceString.append(iterator.next().getOsisID());
                if (iterator.hasNext()) {
                    referenceString.append(' ');
                }
            }
            return referenceString.toString();
        } catch (final NoSuchKeyException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }

    /**
     * sanitizes the strings, removing leading commas and spaces
     *
     * @param interlinearVersion the input string
     * @return the output
     */
    String getInterlinearVersion(final String interlinearVersion) {
        if (isBlank(interlinearVersion)) {
            return null;
        }

        final String[] versions = StringUtils.split(interlinearVersion, "[ ,]+");
        final StringBuilder sb = new StringBuilder(interlinearVersion.length());

        for (int i = 0; i < versions.length; i++) {
            final String s = versions[i];
            if (s.length() == 0) {
                continue;
            }

            sb.append(s);

            if (i + 1 < versions.length) {
                sb.append(',');
            }
        }

        return sb.toString();
    }

    @Override
    public Passage getVerseRanges(final String references, final String version) {
        final Versification av11n = this.versificationService.getVersificationForVersion(version);
        final PassageKeyFactory keyFactory = PassageKeyFactory.instance();

        try {
            final Key key = keyFactory.getKey(av11n, references);
            if (key instanceof Passage) {
                return (Passage) key;
            }
            throw new StepInternalException("Was not given a passage back - why?");

        } catch (final NoSuchKeyException e) {
            throw new LocalisedException(e, e.getMessage());
        }
    }
}
