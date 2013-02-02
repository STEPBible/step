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
package com.tyndalehouse.step.core.xsl.impl;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.getAnyKey;
import static com.tyndalehouse.step.core.utils.StringUtils.areAnyBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static java.lang.String.format;
import static org.crosswire.jsword.book.OSISUtil.ATTRIBUTE_W_LEMMA;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ATTR_OSISID;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ELEMENT_VERSE;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ELEMENT_W;

import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.BookMetaData;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.versification.Testament;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;
import org.jdom.Content;
import org.jdom.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.xsl.InterlinearProvider;

/**
 * This object is not purposed to be used as a singleton. It builds up textual information on initialisation,
 * and is specific to requests. On initialisation, the OSIS XML is retrieved and iterated through to find all
 * strong/morph candidates
 * 
 * @author chrisburrell
 * 
 */
public class InterlinearProviderImpl implements InterlinearProvider {

    /** The Constant LOGGER. */
    private static final Logger LOGGER = LoggerFactory.getLogger(InterlinearProviderImpl.class);

    /** limited accuracy tries to do a location look up by using the verse number as part of the key. */
    private final Map<DualKey<String, String>, Deque<Word>> limitedAccuracy = new HashMap<DualKey<String, String>, Deque<Word>>();

    /** The current book. */
    private Book currentBook;

    /** The hebrew direct mapping. */
    private Map<String, String> hebrewDirectMapping;

    /** The hebrew indirect mappings. */
    private Map<String, String> hebrewIndirectMappings;

    /** The testament. */
    private Testament testament;

    /**
     * sets up the interlinear provider with the correct version and text scope.
     * 
     * @param version the version to use to set up the interlinear
     * @param textScope the text scope reference, defining the bounds of the lookup
     * @param hebrewDirectMapping the hebrew overriding mappings
     * @param hebrewIndirectMappings the mappings used if no other mapping is found
     */
    public InterlinearProviderImpl(final String version, final String textScope,
            final Map<String, String> hebrewDirectMapping, final Map<String, String> hebrewIndirectMappings) {
        // first check whether the values passed in are correct
        if (areAnyBlank(version, textScope)) {
            return;
        }

        this.hebrewIndirectMappings = hebrewIndirectMappings;
        this.hebrewDirectMapping = hebrewDirectMapping;
        this.currentBook = Books.installed().getBook(version);
        if (this.currentBook == null) {
            throw new StepInternalException(format("Couldn't look up book: [%s]", version));
        }

        BookData bookData;

        try {
            final Key key = this.currentBook.getKey(textScope);
            setTestamentType(key);

            bookData = new BookData(this.currentBook, key);
            scanForTextualInformation(bookData.getOsisFragment());
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final BookException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * package private version for testing purposes.
     */
    InterlinearProviderImpl() {
        // exposing package private constructor
    }

    @Override
    public String getWord(final String verseNumber, final String strong, final String morph) {
        // we use a linked hashset, because we want the behaviour of a set while we add to it,
        // but at the end, we will want to return the elements in order
        LOGGER.trace("Retrieving word for verse [{}], strong [{}], morph [{}]", new Object[] { verseNumber,
                strong, morph });

        final Set<String> results = new LinkedHashSet<String>();
        if (isBlank(strong)) {
            // we might as well return, as we have no information to go on
            return "";
        }

        // the keys passed in may have multiple references and morphologies, therefore, we need to lookup
        // multiple items.
        final String[] strongs = split(strong);

        // There are at most strongs.length words, and we might have morphological data to help
        for (final String s : strongs) {

            // find corresponding strong:
            LOGGER.debug("Finding strong key [{}]", s);
            final String strongKey = getAnyKey(s);

            results.add(getWord(verseNumber, strongKey));
        }

        return convertToString(results);
    }

    /**
     * Takes a set, and outputs the strings concatenated together (and separated by a space.
     * 
     * @param results the results that should be converted to a string
     * @return a String containing results to be displayed
     */
    private String convertToString(final Set<String> results) {
        final Iterator<String> iterator = results.iterator();
        final StringBuilder sb = new StringBuilder(results.size() * 16);

        // add the first word without a space
        if (iterator.hasNext()) {
            sb.append(iterator.next());
        }

        // add spaces between each element now
        while (iterator.hasNext()) {
            sb.append(' ');
            sb.append(iterator.next());
        }
        return sb.toString();
    }

    /**
     * returns words based on strong and verse number only.
     * 
     * @param verseNumber the verse number
     * @param strong the strong reference
     * @return a word that matches or the empty string
     */
    String getWord(final String verseNumber, final String strong) {
        if (strong != null && verseNumber != null) {
            final DualKey<String, String> key = new DualKey<String, String>(strong, verseNumber);

            final Deque<Word> list = this.limitedAccuracy.get(key);
            if (list != null && !list.isEmpty()) {
                return retrieveWord(list);
            } else {
                return lookupMappings(strong);
            }
        }

        // it is important to return an empty string here
        return "";
    }

    /**
     * Lookup mappings, if the strong number is there, then it is used
     * 
     * @param strong the strong
     * @return the string
     */
    private String lookupMappings(final String strong) {
        // we ignore mapping lookups for anything greek or hebrew...
        if ("he".equals(this.currentBook.getLanguage().getCode())
                || "grc".equals(this.currentBook.getLanguage().getCode())) {
            return "";
        }

        // currently only supporting OLD Testament
        if (this.testament == Testament.OLD) {
            final String direct = this.hebrewDirectMapping.get(strong);
            if (direct != null) {
                return direct;
            }

            final String indirect = this.hebrewIndirectMappings.get(strong);
            if (indirect != null) {
                return indirect;
            }
        }
        return "";
    }

    /**
     * Retrieves the first word from the list, and removes from the list. If the word is PARTIAL, then
     * retrieves the next one too, and concatenates
     * 
     * @param list a dequue containing all the items in question
     * @return the string
     */
    private String retrieveWord(final Deque<Word> list) {
        Word word = list.removeFirst();
        if (!word.isPartial()) {
            return word.getText();
        }

        final StringBuilder text = new StringBuilder(32);
        while (word != null && word.isPartial()) {
            text.append(word.getText());
            text.append(", ");

            // increment to next word
            word = list.pollFirst();
        }

        // append the last word
        if (word != null) {
            text.append(word.getText());
        }
        return text.toString();
    }

    /**
     * retrieves context textual information from a passage.
     * 
     * @param osisFragment the fragment of XML that should be examined
     */
    private void scanForTextualInformation(final Element osisFragment) {
        // redirect with null verse
        scanForTextualInformation(osisFragment, null);
    }

    /**
     * setups all the initial textual information for fast retrieval during XSL transformation.
     * 
     * @param element element to start with.
     * @param currentVerse the current verse to use as part of the key
     */
    @SuppressWarnings("unchecked")
    private void scanForTextualInformation(final Element element, final String currentVerse) {
        // check to see if we've hit a new verse, if so, we update the verse
        final String verseToBeUsed = element.getName().equals(OSIS_ELEMENT_VERSE) ? element
                .getAttributeValue(OSIS_ATTR_OSISID) : currentVerse;

        // check to see if we've hit a node of interest
        if (element.getName().equals(OSIS_ELEMENT_W)) {
            extractTextualInfoFromNode(element, verseToBeUsed);
            return;
        }

        // iterate through all children and call recursively
        Object data = null;
        Element ele = null;
        final Iterator<Content> contentIter = element.getContent().iterator();
        while (contentIter.hasNext()) {
            data = contentIter.next();
            if (data instanceof Element) {
                ele = (Element) data;
                scanForTextualInformation(ele, verseToBeUsed);
            }
        }
    }

    /**
     * retrieves textual information and adds it to the provider.
     * 
     * @param element the element to extract information from
     * @param verseReference verse reference to use for locality of keying
     */
    private void extractTextualInfoFromNode(final Element element, final String verseReference) {
        final String strong = element.getAttributeValue(ATTRIBUTE_W_LEMMA);
        final String word = element.getText();

        // do we need to do any manipulation? probably not because we are going to be
        // comparing against other OSIS XML texts which should be formatted in the same way!
        // however, some attributes may contain multiple strongs and morphs tagged to one word.
        // therefore we do need to split the text.
        final String[] strongs = split(strong);

        if (strongs == null) {
            return;
        }

        // there is no way of know which strong goes with which morph, and we only
        // have one phrase anyway
        final List<Word> words = new ArrayList<Word>(2);
        boolean partial = false;
        for (int ii = 0; ii < strongs.length; ii++) {
            final String strongKey = getAnyKey(strongs[ii]);
            if (!isH00(strongKey) && !blacklisted(strongKey)) {
                words.add(addTextualInfo(verseReference, strongKey, word));
            } else {
                partial = true;
            }
        }

        if (partial) {
            for (final Word w : words) {
                w.setPartial(true);
            }
        }
    }

    /**
     * Blacklisted, if the word is contained in a direct mapping for the relevant testament
     * 
     * @param strongKey the strong key
     * @return true, if successful
     */
    private boolean blacklisted(final String strongKey) {
        return this.testament == Testament.OLD && this.hebrewDirectMapping.containsKey(strongKey);
    }

    /**
     * Checks if is h00.
     * 
     * @param currentStrong a strong number
     * @return true, if is a single H followed by only 0s, which indicates that the strong numbers go with
     *         their next occurrence
     */
    private boolean isH00(final String currentStrong) {
        for (int ii = 0; ii < currentStrong.length(); ii++) {
            if (currentStrong.charAt(ii) != '0') {
                return false;
            }
        }

        return true;
    }

    /**
     * Finally, we have some information to add to this provider. We try and add it in an efficient fashion.
     * 
     * So, how do we store this? The most meaningful piece of data is a STRONG number, since it identifies the
     * word that we want to retrieve. Without the strong number, we don't have any information at all.
     * Therefore, the first level of lookup should be by Strong number.
     * 
     * @param verseReference the verse reference that specifies locality (least important factor)
     * @param strongKey the strong number (identifies the root/meaning of the word)
     * @param word the word to be stored
     * @return the word that has been added
     */
    private Word addTextualInfo(final String verseReference, final String strongKey, final String word) {

        final DualKey<String, String> strongVerseKey = new DualKey<String, String>(strongKey, verseReference);
        Deque<Word> verseKeyedStrongs = this.limitedAccuracy.get(strongVerseKey);
        if (verseKeyedStrongs == null) {
            verseKeyedStrongs = new LinkedList<Word>();
            this.limitedAccuracy.put(strongVerseKey, verseKeyedStrongs);
        }
        final Word w = new Word(word);
        verseKeyedStrongs.add(w);
        return w;
    }

    /**
     * Sets the testament, to be used to determine the indirect/direct mappings to use when generating the
     * interlinear.
     * 
     * @param key the key to the passage being looked up
     */
    private void setTestamentType(final Key key) {
        final Versification v11n = Versifications.instance().getVersification(
                (String) this.currentBook.getBookMetaData().getProperty(BookMetaData.KEY_VERSIFICATION));
        final Passage passage = KeyUtil.getPassage(key, v11n);
        this.testament = v11n.getTestament(v11n.getOrdinal(passage.getVerseAt(0)));
    }

    /**
     * @param currentBook the currentBook to set
     */
    void setCurrentBook(final Book currentBook) {
        this.currentBook = currentBook;
    }

}
