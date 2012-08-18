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

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;
import static java.lang.Integer.parseInt;
import static java.lang.Integer.valueOf;
import static java.lang.String.format;
import static org.crosswire.common.xml.XMLUtil.writeToString;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.xml.transform.TransformerException;

import org.crosswire.common.xml.Converter;
import org.crosswire.common.xml.SAXEventProvider;
import org.crosswire.common.xml.TransformingSAXEventProvider;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.NoSuchVerseException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.RocketPassage;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.exceptions.ValidationException;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.service.impl.MorphologyServiceImpl;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.xsl.XslConversionType;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
@Singleton
public class JSwordPassageServiceImpl implements JSwordPassageService {
    private static final String OSIS_CHAPTER_FORMAT = "%s.%d";
    private static final String OSIS_CHAPTER_VERSE_FORMAT = "%s.%s.%d";
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordPassageServiceImpl.class);
    private final MorphologyServiceImpl morphologyProvider;
    private final JSwordVersificationService versificationService;
    private final VocabularyService vocabProvider;

    /**
     * constructs the jsword service.
     * 
     * @param versificationService jsword versification service
     * @param morphologyProvider provides morphological information
     * @param vocabProvider the service providing lexicon and vocabulary information
     */
    @Inject
    public JSwordPassageServiceImpl(final JSwordVersificationService versificationService,
            final MorphologyServiceImpl morphologyProvider, final VocabularyService vocabProvider) {
        this.versificationService = versificationService;
        this.morphologyProvider = morphologyProvider;
        this.vocabProvider = vocabProvider;
    }

    @Override
    public KeyWrapper getSiblingChapter(final String reference, final String version,
            final boolean previousChapter) {
        // getting the next chapter
        final Book currentBook = Books.installed().getBook(version);

        try {
            final Key key = currentBook.getKey(reference);
            final String osisID = key.getOsisID();
            LOGGER.debug(osisID);

            // split down according to different references
            final String[] refs = split(osisID, "[,; \\-]+");
            final String interestedRef = previousChapter ? refs[0] : refs[refs.length - 1];
            final String[] refParts = split(interestedRef, "\\.");
            final Key newKey = previousChapter ? getPreviousRef(refParts, key, currentBook) : getNextRef(
                    refParts, key, currentBook);
            return new KeyWrapper(newKey);

        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Cannot find next chapter", e);
        }
    }

    @Override
    public KeyWrapper getKeyInfo(final String reference, final String version) {
        final Book currentBook = Books.installed().getBook(version);

        try {
            Key key;
            key = currentBook.getKey(reference);
            return new KeyWrapper(key);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Unable to resolve key: " + reference);
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

        return currentBook.getValidKey(format("%s.%s", bookName, chapterNumber));
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
    public OsisWrapper peakOsisText(final Book bible, final Key key, final LookupOption... options) {
        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();
        Collections.addAll(lookupOptions, options);
        lookupOptions.add(LookupOption.HIDE_XGEN);

        final BookData bookData = new BookData(bible, key);
        return getTextForBookData(lookupOptions, null, bookData);
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
        return getOsisText(version, reference, new ArrayList<LookupOption>(), null);
    }

    @Override
    public synchronized OsisWrapper getOsisTextByVerseNumbers(final String version,
            final String numberedVersion, final int startVerseId, final int endVerseId,
            final List<LookupOption> lookupOptions, final String interlinearVersion,
            final Boolean roundReference, final boolean ignoreVerse0) {

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
        return getTextForBookData(lookupOptions, interlinearVersion, lookupBookData);
    }

    // TODO: can we make this more performant by not re-compiling stylesheet - or is already cached
    // FIXME TODO: JS-109, email from CJB on 27/02/2011 remove synchronisation once book is fixed
    @Override
    public OsisWrapper getOsisText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion) {
        LOGGER.debug("Retrieving text for ({}, {})", version, reference);

        final BookData bookData = getBookData(version, reference);
        return getTextForBookData(options, interlinearVersion, bookData);
    }

    /**
     * Gets the BookData set up for verse retrieval
     * 
     * @param version the version to be used
     * @param reference the reference
     * @return the BookData object
     */
    private BookData getBookData(final String version, final String reference) {
        final Book currentBook = this.versificationService.getBookFromVersion(version);
        try {
            final Key key = currentBook.getKey(reference);

            // TODO, work this one out
            final int cardinality = key.getCardinality();
            if (cardinality > 500) {
                throw new ValidationException("The reference " + reference + " contains too many verses.",
                        UserExceptionType.USER_VALIDATION_ERROR);
            }

            return new BookData(currentBook, key);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("The verse specified was not found: " + reference, e);
        }
    }

    /**
     * Gets the osis text
     * 
     * @param options the list of lookup options
     * @param interlinearVersion the interlinear version if applicable
     * @param bookData the bookdata to use to look up the required version/reference combo
     * 
     * @return the html text
     */
    private synchronized OsisWrapper getTextForBookData(final List<LookupOption> options,
            final String interlinearVersion, final BookData bookData) {

        // check we have a book in mind and a reference
        notNull(bookData, "An internal error occurred", UserExceptionType.SERVICE_VALIDATION_ERROR);
        notNull(bookData.getFirstBook(), "An internal error occurred",
                UserExceptionType.SERVICE_VALIDATION_ERROR);
        notNull(bookData.getKey(), "An internal error occurred", UserExceptionType.SERVICE_VALIDATION_ERROR);

        // first check whether the key is contained in the book
        if (!keyExistsInBook(bookData)) {
            throw new StepInternalException("The specified reference does not exist in this Bible");
        }

        try {
            final XslConversionType requiredTransformation = identifyStyleSheet(options);

            final SAXEventProvider osissep = bookData.getSAXEventProvider();
            final TransformingSAXEventProvider htmlsep = (TransformingSAXEventProvider) new Converter() {
                @Override
                public SAXEventProvider convert(final SAXEventProvider provider) throws TransformerException {
                    try {
                        final String file = requiredTransformation.getFile();
                        final URI resourceURI = getClass().getResource(file).toURI();

                        final TransformingSAXEventProvider tsep = new TransformingSAXEventProvider(
                                resourceURI, osissep);

                        // set parameters here
                        setOptions(tsep, options, bookData.getFirstBook().getInitials());
                        setInterlinearOptions(tsep, interlinearVersion, bookData.getKey().getOsisID());
                        return tsep;
                    } catch (final URISyntaxException e) {
                        throw new StepInternalException("Failed to load resource correctly", e);
                    }
                }
            }.convert(osissep);

            // the original book
            final Book book = bookData.getFirstBook();
            final Versification versification = this.versificationService.getVersificationForVersion(book);

            final OsisWrapper osisWrapper = new OsisWrapper(writeToString(htmlsep), bookData.getKey()
                    .getName());

            final Key key = bookData.getKey();
            if (key instanceof Passage) {
                final Passage p = (Passage) bookData.getKey();
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
            final String reference = bookData.getKey().getOsisID();
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
     * @param options the list of options that are currently applied to the passage
     * @return the stylesheet (of stylesheets)
     */
    private XslConversionType identifyStyleSheet(final List<LookupOption> options) {
        for (final LookupOption lo : options) {
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
     */
    private void setInterlinearOptions(final TransformingSAXEventProvider tsep,
            final String interlinearVersion, final String reference) {
        if (tsep.getParameter(LookupOption.INTERLINEAR.getXsltParameterName()) != null) {
            tsep.setParameter("interlinearReference", reference);
            tsep.setParameter("VLine", false);

            if (isNotBlank(interlinearVersion)) {
                tsep.setParameter("interlinearVersion", interlinearVersion);
            }
        }
    }

    /**
     * This method sets up the options for the XSLT transformation. Note: the set of options is trimmed to
     * those actually available
     * 
     * @param tsep the xslt transformer
     * @param options the options available
     * @param version the version to initialise a potential interlinear with
     */
    protected void setOptions(final TransformingSAXEventProvider tsep, final List<LookupOption> options,
            final String version) {

        for (final LookupOption lookupOption : options) {
            if (lookupOption.getXsltParameterName() != null) {
                tsep.setParameter(lookupOption.getXsltParameterName(), true);

                if (LookupOption.VERSE_NUMBERS.equals(lookupOption)) {
                    tsep.setParameter(LookupOption.TINY_VERSE_NUMBERS.getXsltParameterName(), true);
                }

                if (LookupOption.MORPHOLOGY.equals(lookupOption)) {
                    // tsep.setDevelopmentMode(true);
                    tsep.setParameter("morphologyProvider", this.morphologyProvider);
                }

                if (LookupOption.ENGLISH_VOCAB.equals(lookupOption)
                        || LookupOption.TRANSLITERATION.equals(lookupOption)
                        || LookupOption.GREEK_VOCAB.equals(lookupOption)) {
                    tsep.setParameter("vocabProvider", this.vocabProvider);
                }
            }
        }

        tsep.setParameter("baseVersion", version);
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
