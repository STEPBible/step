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
package com.tyndalehouse.step.core.service.jsword.helpers;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.BookAndBibleCount;
import com.tyndalehouse.step.core.models.search.StrongCountsAndSubjects;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.JSwordUtils;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.TermDocs;
import org.apache.lucene.search.IndexSearcher;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.DivisionName;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.VersificationsMapper;
import org.jdom2.Element;
import org.slf4j.Logger;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

/**
 * Provides each strong number given a verse.
 * <p/>
 * <p/>
 * <p/>
 * Note, this object is not thread-safe. The intention is for it to be a use-once, throw-away type of object.
 */
public class JSwordStrongNumberHelper {
    private static final Logger LOG = org.slf4j.LoggerFactory.getLogger(JSwordStrongNumberHelper.class);
    private static final Book STRONG_NT_VERSION_BOOK = Books.installed().getBook(JSwordPassageService.REFERENCE_BOOK);
    private static final Book STRONG_OT_VERSION_BOOK = Books.installed().getBook(JSwordPassageService.OT_BOOK);
    private static volatile Versification ntV11n;
    private static volatile Versification otV11n;
    private final JSwordVersificationService versification;
    private final JSwordSearchService jSwordSearchService;
    private final StrongAugmentationService strongAugmentationService;
    private final EntityIndexReader definitions;
    private final Verse reference;
    private Map<String, List<LexiconSuggestion>> verseStrongs;
    private Map<String, BookAndBibleCount> allStrongs;
    private boolean isOT;

    /**
     * Instantiates a new strong number provider impl.
     * @param manager                   the manager that helps look up references
     * @param reference                 the reference in the KJV versification equivalent
     * @param versification             the versification service to lookup the versification of the reference book
     * @param jSwordSearchService       the jSword Search service
     * @param strongAugmentationService the strong augmentation service
     */
    public JSwordStrongNumberHelper(final EntityManager manager, final Verse reference,
                                    final JSwordVersificationService versification,
                                    final JSwordSearchService jSwordSearchService,
                                    final StrongAugmentationService strongAugmentationService) {
        this.versification = versification;
        this.jSwordSearchService = jSwordSearchService;
        this.strongAugmentationService = strongAugmentationService;
        this.definitions = manager.getReader("definition");
        this.reference = reference;
        initReferenceVersification();
    }

    /**
     * @param isOT true to indicate OT
     * @return the book that shoudd be read for obtaining strong number counts
     */
    public static Book getPreferredCountBook(boolean isOT) {
        return isOT ? STRONG_OT_VERSION_BOOK : STRONG_NT_VERSION_BOOK;
    }

    /**
     * Inits the reference versification system so that we don't ever need to do this again
     */
    private void initReferenceVersification() {
        if (ntV11n == null) {
            synchronized (JSwordStrongNumberHelper.class) {
                if (ntV11n == null) {
                    ntV11n = this.versification.getVersificationForVersion(STRONG_NT_VERSION_BOOK);
                    otV11n = this.versification.getVersificationForVersion(STRONG_OT_VERSION_BOOK);
                }
            }
        }
    }

    /**
     * Calculate counts for a particular key.
     */
    private void calculateCounts(String userLanguage) {
        try {
            Verse curReference = this.reference;
            final BibleBook book = curReference.getBook();
            this.isOT = DivisionName.OLD_TESTAMENT.contains(book);
			final Versification targetVersification;
			if (isOT) { //is key OT or NT
				targetVersification = otV11n;
				if (curReference.getVersification().getName().equals("MT")) // OHB and MT have the same chapters and numbers.  Converting has inconsistency in Neh.7.68, Ps.13.5, Isa 63.19
					curReference = new Verse(targetVersification, book, curReference.getChapter(), curReference.getVerse());
			}
			else targetVersification = ntV11n;
            final Key key = VersificationsMapper.instance().mapVerse(curReference, targetVersification);
            this.verseStrongs = new TreeMap<>();
            this.allStrongs = new HashMap<>(256);

            final Book preferredCountBook = getPreferredCountBook(this.isOT);
            final List<Element> elements = JSwordUtils.getOsisElements(new BookData(preferredCountBook, key));

            for (final Element e : elements) {
                final String verseRef = e.getAttributeValue(OSISUtil.OSIS_ATTR_OSISID);
                final String strongsNumbers = OSISUtil.getStrongsNumbers(e);
                if (StringUtils.isBlank(strongsNumbers)) {
                    LOG.warn("Attempting to search for 'no strongs' in verse [{}]", verseRef);
                    return;
                }
                final String strongQuery = StringConversionUtils.getStrongPaddedKey(strongsNumbers);
                String[] augmentedStrongs = strongAugmentationService.augment(preferredCountBook.getInitials(), verseRef, strongQuery);
                final String augmentedStrongNumbers = StringUtils.join(augmentedStrongs, ' ');
                readDataFromLexicon(this.definitions, verseRef, augmentedStrongNumbers, userLanguage);
            }

            // now get counts in the relevant portion of text
            applySearchCounts(getBookFromKey(key));
        } catch (final NoSuchKeyException ex) {
            LOG.warn("Unable to enhance verse numbers.", ex);
        } catch (final BookException ex) {
            LOG.warn("Unable to enhance verse number", ex);
        }
    }

    /**
     * Calculate counts for an array of Strong number.
     */
    public PassageStat calculateStrongArrayCounts(final String version, PassageStat stat, final String userLanguage) {
        Map<String, Integer[]> result = new HashMap<>(128);
		Verse curReference = this.reference;
		final BibleBook book = curReference.getBook();
		this.isOT = DivisionName.OLD_TESTAMENT.contains(book);
        final Versification targetVersification;
		if (isOT) { //is key OT or NT
			targetVersification = otV11n;
			if (curReference.getVersification().getName().equals("MT")) // OHB and MT have the same chapters and numbers.  Converting has inconsistency in Neh.7.68, Ps.13.5, Isa 63.19
				curReference = new Verse(targetVersification, book, curReference.getChapter(), curReference.getVerse());
		}
		else targetVersification = ntV11n;
        final Key key = VersificationsMapper.instance().mapVerse(curReference, targetVersification);
        this.allStrongs = new HashMap<>(256);
        Map<String, Integer[]> temp = stat.getStats();
        temp.forEach((strongNum, feq) -> this.allStrongs.put(strongNum, new BookAndBibleCount()));
        // now get counts in the relevant portion of text
        applySearchCounts(getBookFromKey(key));
        temp.forEach((strongNum, freq) -> {
            BookAndBibleCount bBCount = this.allStrongs.get(strongNum);
            result.put(strongNum, new Integer[]{freq[0], bBCount.getBook(), bBCount.getBible()});
        });
        stat.setStats(result);
        return stat;
    }

    /**
     * The book of the OSIS ID reference, or the passed in parameter in every other case where the OSIS ID does not
     * contain multiple part.
     *
     * @param key the key, used to lookup the OSIS ID
     * @return the book from osis
     */
    private String getBookFromKey(final Key key) {
        final String osisID = key.getOsisID();
        final int firstPartStart = osisID.indexOf('.');
        if (firstPartStart == -1) {
            // then looking at a whole book, so just return
            return osisID;
        }
        return osisID.substring(0, firstPartStart);
    }

    /**
     * Applies the search counts for every strong number.
     *
     * @param bookName the book name
     */
    private void applySearchCounts(final String bookName) {

        try {
            final IndexSearcher is = jSwordSearchService.getIndexSearcher(
                    this.isOT ? STRONG_OT_VERSION_BOOK.getInitials() : STRONG_NT_VERSION_BOOK.getInitials());
            final TermDocs termDocs = is.getIndexReader().termDocs();
            for (final Entry<String, BookAndBibleCount> strong : this.allStrongs.entrySet()) {
                final String strongKey = strong.getKey();

                boolean isAugmentedStrong = !this.strongAugmentationService.isNonAugmented(strongKey);
                StrongAugmentationService.AugmentedStrongsForSearchCount augDStrongArgs = null;
                if (isAugmentedStrong) // Prepare for the aug strong lookup.
                    augDStrongArgs = strongAugmentationService.getRefIndexWithStrong(strongKey);

                termDocs.seek(new Term(LuceneIndex.FIELD_STRONG, this.strongAugmentationService.reduce(strongKey)));

                // we'll never need more than 200 documents as this is the cut off point
                int bible = 0;
                int book = 0;
                while (termDocs.next()) {
                    final int freq = termDocs.freq();
                    final Document doc = is.doc(termDocs.doc());
                    final String docRef = doc.get(LuceneIndex.FIELD_KEY);
                    if ((augDStrongArgs == null) || (strongAugmentationService.isVerseInAugStrong(docRef, strongKey, augDStrongArgs))) {
                        if (docRef != null && docRef.startsWith(bookName))
                            book += freq;
                        bible += freq;
                    }
                }
                final BookAndBibleCount value = strong.getValue();
                value.setBible(bible);
                value.setBook(book);
            }
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * Read data from lexicon.
     *
     * @param reader        the reader
     * @param verseRef      the verse ref
     * @param augmentedStrongNumbers the strong numbers
     */
    private void readDataFromLexicon(final EntityIndexReader reader,
                                     final String verseRef,
                                     final String augmentedStrongNumbers,
                                     final String userLanguage) {

        final EntityDoc[] docs = reader.search("strongNumber", augmentedStrongNumbers);
        final List<LexiconSuggestion> verseSuggestions = new ArrayList<>();

        Map<String, LexiconSuggestion> suggestionsFromSearch = new HashMap<>(docs.length * 2);
        for (final EntityDoc d : docs) {
            final LexiconSuggestion ls = new LexiconSuggestion();
            ls.setStrongNumber(d.get("strongNumber"));
            ls.setGloss(d.get("stepGloss"));
            if (userLanguage.equalsIgnoreCase("es")) {
                ls.set_es_Gloss(d.get("es_Gloss"));
            }
            else if (userLanguage.equalsIgnoreCase("zh")) {
                ls.set_zh_Gloss(d.get("zh_Gloss"));
            }
            else if (userLanguage.equalsIgnoreCase("zh_tw")) {
                ls.set_zh_tw_Gloss(d.get("zh_tw_Gloss"));
            }
            ls.setMatchingForm(d.get("accentedUnicode"));
            ls.setStepTransliteration(d.get("stepTransliteration"));
            suggestionsFromSearch.put(ls.getStrongNumber(), ls);

            this.allStrongs.put(ls.getStrongNumber(), new BookAndBibleCount());
        }

        String[] strongs = StringUtils.split(augmentedStrongNumbers);
        for (String s : strongs) {
            verseSuggestions.add(suggestionsFromSearch.get(s));
        }
        this.verseStrongs.put(verseRef, verseSuggestions);
    }

    /**
     * @return the verseStrongs
     */
    public StrongCountsAndSubjects getVerseStrongs(String userLanguage) {
        calculateCounts(userLanguage);
        final StrongCountsAndSubjects sac = new StrongCountsAndSubjects();
        sac.setCounts(this.allStrongs);
        sac.setStrongData(this.verseStrongs);
        sac.setOT(this.isOT);
        return sac;
    }
}
