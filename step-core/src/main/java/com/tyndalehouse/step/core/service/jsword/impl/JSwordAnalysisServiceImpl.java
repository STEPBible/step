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

import static com.tyndalehouse.step.core.utils.StringUtils.split;

import javax.inject.Inject;
import javax.inject.Named;

import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.*;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.jsword.JSwordAnalysisService;
import org.crosswire.jsword.versification.Versification;

import java.util.*;

/**
 * The Class JSwordAnalysisServiceImpl.
 *
 * @author chrisburrell
 */
public class JSwordAnalysisServiceImpl implements JSwordAnalysisService {
    static final String WORD_SPLIT = "[,./<>?!;:'\\[\\]\\{\\}!\"\\-\u2013 ()]+";
    private static final String LANGUAGE_STOP_LIST = "analysis.stopWords.%s";
    private final JSwordVersificationService versification;
    private final Map<String, Set<String>> stopWords = new HashMap<String, Set<String>>(32);
    private final Set<String> stopStrongs;
    private final Versification strongsV11n;
    private final Book strongsBook;
    private final Properties stopWordsProperties;
    private StrongAugmentationService strongAugmentationService;

    /**
     * Instantiates a new jsword analysis service impl.
     *
     * @param versification the versification
     */
    @Inject
    public JSwordAnalysisServiceImpl(final JSwordVersificationService versification,
                                     @Named("StepCoreProperties") final Properties stopWordsProperties,
                                     @Named("analysis.stopStrongs") final String configuredStopStrongs,
                                     final StrongAugmentationService strongAugmentationService) {
        this.versification = versification;
        this.stopWordsProperties = stopWordsProperties;
        this.strongAugmentationService = strongAugmentationService;
        stopStrongs = StringUtils.createSet(configuredStopStrongs);
        strongsBook = this.versification.getBookFromVersion(JSwordPassageService.REFERENCE_BOOK);
        strongsV11n = this.versification.getVersificationForVersion(strongsBook);
    }

    @Override
    public PassageStat getWordStats(final Key reference, final ScopeType scopeType, final String userLanguage) {
        try {
            //change the reference to match what we need
//            Book currentBook = this.versification.getBookFromVersion("OHB");
//            Versification currentV11n = this.versification.getVersificationForVersion(currentBook);
            final BookData expandedBook = getExpandedBookData(reference, scopeType, strongsV11n, strongsBook);
            int startOrdinal = ((VerseRange) expandedBook.getKey()).getStart().getOrdinal();
            int lastOrdinal = ((VerseRange) expandedBook.getKey()).getEnd().getOrdinal();
            BitSet referenceStore = (BitSet) ((RocketPassage) reference).store;
            Key copyReference = reference.clone();
            BitSet copyStore = (BitSet) ((RocketPassage) copyReference).store;
            copyStore.clear();
            PassageStat result = new PassageStat();
            for (int i = startOrdinal; i <= lastOrdinal; i++) {
                (((RocketPassage) copyReference).store).set(i);
                BookData oneVerse = getExpandedBookData(copyReference, ScopeType.PASSAGE, strongsV11n, strongsBook);
                PassageStat tmpStat = getStatsFromStrongArray(expandedBook.getFirstBook().getInitials(), copyReference, split(OSISUtil.getStrongsNumbers(oneVerse.getOsisFragment())), userLanguage);
                for (Map.Entry<String, Integer[]> entry : tmpStat.getStats().entrySet()) {
                    String k = entry.getKey();
                    Integer[] v = entry.getValue();
                    Integer[] valuesInResult = result.getStats().get(k);
                    if (valuesInResult != null) {
                        valuesInResult[0] += v[0];
                        valuesInResult[1] += v[1];
                        valuesInResult[2] += v[2];
                    }
                    else
                        result.getStats().put(k, v);
                }
                (((RocketPassage) copyReference).store).clear(i);
            }
            return result;
        } catch (final BookException e) {
            throw new StepInternalException("Unable to read passage text", e);
        }
    }

    @Override
    public PassageStat getTextStats(final String version, final Key reference, final ScopeType scopeType) {
        try {
            final Book book = this.versification.getBookFromVersion(version);
            final Versification av11n = this.versification.getVersificationForVersion(book);
            final BookData bookData = getExpandedBookData(reference, scopeType, av11n, book);

            final String canonicalText = OSISUtil.getCanonicalText(bookData.getOsisFragment());
            final String[] words = split(canonicalText, WORD_SPLIT);

            Set<String> languageStopWords = getLanguageStopList(book);

            final PassageStat stat = new PassageStat();
            for (final String word : words) {
                //only add word if not in STOP list
                if (!languageStopWords.contains(StringConversionUtils.unAccent(word.toUpperCase(), true))) {
                    stat.addWord(word);
                }
            }
            return stat;
        } catch (final BookException e) {
            throw new StepInternalException("Unable to read passage text", e);
        }
    }

    /**
     * Lazily obtains the stop list for the specific language of a book
     *
     * @param book the book that the viewer is looking at
     * @return the set of words that form part of the stop list
     */
    private Set<String> getLanguageStopList(final Book book) {
        String code = book.getLanguage().getCode();
        Set<String> languageStopList = this.stopWords.get(code);
        if (languageStopList == null) {
            //only one language gets loaded at any one time
            synchronized (this) {
                languageStopList = this.stopWords.get(code);
                if (languageStopList == null) {
                    languageStopList = StringUtils.createSet(this.stopWordsProperties.getProperty(String.format(LANGUAGE_STOP_LIST, code.toLowerCase())), true);
                    this.stopWords.put(code, languageStopList);
                }
            }
        }

        return languageStopList;
    }


    /**
     * Expands the key to the correct part, depending on whether we want the single chapter,
     * the surrounding chapters, or the whole book.
     *
     * @param scopeType       the scope type
     * @param v11n            the v11n for the book we are looking up
     * @param bookFromVersion the book containing the text/key
     * @return the correct key.
     */
    BookData getExpandedBookData(final Key key, final ScopeType scopeType, final Versification v11n, final Book bookFromVersion) {
        if (scopeType == ScopeType.PASSAGE) {
            return new BookData(bookFromVersion, key);
        }

        //validate the key is a verse key
        if (!(key instanceof VerseKey)) {
            throw new StepInternalException("Unable to identify verses in this passage");
        }

        //if we have no data, then no point in continuing
        if (!key.iterator().hasNext()) {
            //there is no data
            return new BookData(bookFromVersion, new RangedPassage(v11n));
        }

        Verse firstVerse = KeyUtil.getVerse(key);
        Verse lastVerse;
        if (key instanceof AbstractPassage) {
            final AbstractPassage abstractPassage = (AbstractPassage) key;
            lastVerse = (Verse) abstractPassage.get(abstractPassage.getCardinality() - 1);
        } else if (key instanceof VerseRange) {
            lastVerse = ((VerseRange) key).getEnd();
        } else {
            lastVerse = firstVerse;
        }


        Verse start = null;
        Verse end = null;

        switch (scopeType) {
            case CHAPTER:
                start = new Verse(v11n, firstVerse.getBook(), firstVerse.getChapter(), 0);
                end = new Verse(v11n, lastVerse.getBook(), lastVerse.getChapter(), v11n.getLastVerse(lastVerse.getBook(), lastVerse.getChapter()));
                break;
            case NEAR_BY_CHAPTER:
                final int lastChapInBook = v11n.getLastChapter(firstVerse.getBook());
                int previousChapter = firstVerse.getChapter() - 1;
                if (previousChapter < 1) {
                    previousChapter = 1;
                }

                int nextChapter = lastVerse.getChapter() + 1;
                int lastChapter = lastChapInBook;
                if (nextChapter > lastChapInBook) {
                    nextChapter = lastChapter;
                }

                //book (n-1):0
                start = new Verse(v11n, firstVerse.getBook(), previousChapter, 0);

                //book (n+1):last
                end = new Verse(v11n, lastVerse.getBook(), nextChapter, v11n.getLastVerse(lastVerse.getBook(), nextChapter));
                break;
            case BOOK:
                final int lastChapterInBook = v11n.getLastChapter(firstVerse.getBook());
                //book 1:0
                start = new Verse(v11n, firstVerse.getBook(), 1, 0);

                //book end:verse
                end = new Verse(v11n, lastVerse.getBook(), lastChapterInBook, v11n.getLastVerse(lastVerse.getBook(), lastChapterInBook));
                break;
            default:
                throw new StepInternalException("Unable to recognise passed-in scope type.");
        }
        return new BookData(bookFromVersion, new VerseRange(v11n, start, end));

    }

    /**
     * Gets the stats from word array, counting words one by one and using the {@link PassageStat} to do the
     * incrementing word by word
     *
     * @param words the words
     * @return the stats from word array
     */
    private PassageStat getStatsFromStrongArray(final String version, final Key reference, final String[] words, final String userLanguage) {
        PassageStat stat = new PassageStat();
        //slight annoyance that we are deserializing the key to re-serialise later
        final String ref = reference.getOsisRef();
        for (final String unaugmentedWord : words) {
            String[] strongs = this.strongAugmentationService.augment(version, ref, unaugmentedWord);
            for(String word : strongs) {
                final String paddedStrongNumber = StringConversionUtils.getStrongPaddedKey(word);
                if (!this.stopStrongs.contains(paddedStrongNumber.toUpperCase())) {
                    stat.addWord(paddedStrongNumber);
                }
            }
        }
        return stat;
    }

    /**
     * @return access tot he default v11n for analysis
     */
    Versification getStrongsV11n() {
        return this.strongsV11n;
    }

    /**
     * @return the default versification
     */
    Book getStrongsBook() {
        return this.strongsBook;
    }
}
