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

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.jdom.Element;
import org.jdom.filter.Filter;
import org.slf4j.Logger;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.utils.StringConversionUtils;

/**
 * Provides each strong number given a verse.
 * <p>
 * TODO: is it worth introducing a cache here for all verses? Raise JIRA to work that one out at some point //
 * TODO: change to ESV book, rather than KJV TOD: Should we cache intermediate strongs? since they can be
 * re-used without looking up Lucene - on the other hand, Lucene is very quick
 */
public class JSwordStrongNumberHelper {
    private static final Logger LOG = org.slf4j.LoggerFactory.getLogger(JSwordStrongNumberHelper.class);
    private static final Book STRONG_REF_VERSION = Books.installed().getBook("KJV");
    private Map<String, SortedSet<LexiconSuggestion>> verseStrongs;

    /**
     * Instantiates a new strong number provider impl.
     * 
     * @param manager the manager that helps look up references
     * @param reference the reference in the KJV versification equivalent
     */
    public JSwordStrongNumberHelper(final EntityManager manager, final String reference) {
        try {
            final Key key = STRONG_REF_VERSION.getKey(reference);
            this.verseStrongs = new TreeMap<String, SortedSet<LexiconSuggestion>>();

            final List<Element> elements = getOsisElements(key);

            for (final Element e : elements) {
                readDataFromLexicon(manager.getReader("definition"),
                        e.getAttributeValue(OSISUtil.OSIS_ATTR_OSISID), OSISUtil.getStrongsNumbers(e));
            }

            // now read the index
        } catch (final NoSuchKeyException ex) {
            LOG.warn("Unable to enhance verse numbers.", ex);
        } catch (final BookException ex) {
            LOG.warn("Unable to enhance verse number", ex);
        }
    }

    /**
     * Read data from lexicon.
     * 
     * @param reader the reader
     * @param verseRef the verse ref
     * @param strongNumbers the strong numbers
     */
    private void readDataFromLexicon(final EntityIndexReader reader, final String verseRef,
            final String strongNumbers) {

        final String strongQuery = StringConversionUtils.getStrongPaddedKey(strongNumbers);

        final EntityDoc[] docs = reader.search("strongNumber", strongQuery);
        final SortedSet<LexiconSuggestion> verseSuggestions = new TreeSet<LexiconSuggestion>(
                new Comparator<LexiconSuggestion>() {

                    @Override
                    public int compare(final LexiconSuggestion o1, final LexiconSuggestion o2) {
                        return o1.getGloss().toLowerCase(Locale.ENGLISH)
                                .compareTo(o2.getGloss().toLowerCase(Locale.ENGLISH));
                    }
                });
        for (final EntityDoc d : docs) {
            final LexiconSuggestion ls = new LexiconSuggestion();
            ls.setStrongNumber(d.get("strongNumber"));
            ls.setGloss(d.get("stepGloss"));
            ls.setMatchingForm(d.get("accentedUnicode"));
            ls.setStepTransliteration(d.get("stepTransliteration"));
            verseSuggestions.add(ls);
        }

        this.verseStrongs.put(verseRef, verseSuggestions);
    }

    /**
     * Gets the osis elements.
     * 
     * @param key the key
     * @return the osis elements
     * @throws NoSuchKeyException the no such key exception
     * @throws BookException the book exception
     */
    @SuppressWarnings({ "unchecked", "serial" })
    private List<Element> getOsisElements(final Key key) throws NoSuchKeyException, BookException {
        final BookData data = new BookData(STRONG_REF_VERSION, key);
        final List<Element> elements = data.getOsisFragment().getContent(new Filter() {
            @Override
            public boolean matches(final Object object) {
                if (object instanceof Element) {
                    final Element element = (Element) object;
                    if (OSISUtil.OSIS_ELEMENT_VERSE.equals(element.getName())) {
                        return true;
                    }
                }
                return false;
            }
        });
        return elements;
    }

    /**
     * @return the verseStrongs
     */
    public Map<String, SortedSet<LexiconSuggestion>> getVerseStrongs() {
        return this.verseStrongs;
    }
}
