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
package com.tyndalehouse.step.tools.esv;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static org.apache.commons.lang3.StringUtils.join;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;

import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.bean.ColumnPositionMappingStrategy;
import au.com.bytecode.opencsv.bean.CsvToBean;

import com.tyndalehouse.step.tools.MultiMap;
import com.tyndalehouse.step.tools.MultiMapIndexer;

/**
 * The Class EsvXmlEnhancer.
 */
@SuppressWarnings("all")
public class EsvXmlEnhancer {
    private static final Logger LOGGER = LoggerFactory.getLogger(EsvXmlEnhancer.class);
    private static final Pattern REF_CLEAN = Pattern.compile("[¬|¦#$]+");
    private static final Pattern PUNCTUATION = Pattern.compile("[—,.;*:'\\[\\]!\"`?’‘()-]+");
    private static final Pattern STRONGS_SPLITTING = Pattern.compile("<([^>]*)> ?(\\([^)]+\\))?.*");
    private static final Book ESV = Books.installed().getBook("ESV");
    private final File tagging;
    private final File esvText;
    private String currentVerse;
    private Deque<Tagging> verseTagging = null;
    private boolean error = false;

    /**
     * Instantiates a new esv xml enhancer.
     * 
     * @param tagging the tagging
     * @param esvText the esv text
     */
    public EsvXmlEnhancer(final File tagging, final File esvText) {
        this.tagging = tagging;
        this.esvText = esvText;
    }

    /**
     * The main method.
     * 
     * @param args the arguments
     * @throws Exception the exception
     */
    public static void main(final String[] args) throws Exception {
        final File tagging = new File(args[0]);
        final File esvText = new File(args[1]);

        new EsvXmlEnhancer(tagging, esvText).go();
    }

    private void go() throws Exception {
        applyToText(parseTagging());
    }

    private MultiMap<String, Tagging, Deque<Tagging>> parseTagging() throws Exception {
        final long start = System.currentTimeMillis();
        final List<Tagging> rawTagging = readTagging();
        cleanupTagging(rawTagging);
        final MultiMap<String, Tagging, Deque<Tagging>> indexTagging = indexTagging(rawTagging);

        LOGGER.debug("Init phase took [{}]ms", System.currentTimeMillis() - start);
        traceLog(indexTagging);
        return indexTagging;
    }

    private void applyToText(final MultiMap<String, Tagging, Deque<Tagging>> indexTagging) throws Exception {
        final Document esv = readESVDoc();
        try {
            traverse(esv.getDocumentElement(), indexTagging);
        } catch (final AbortTagException abort) {
            LOGGER.warn("Aborted...");
        }

        // save document
        writeDoc(esv);

    }

    private void writeDoc(final Document esv) throws Exception {
        final TransformerFactory factory = TransformerFactory.newInstance();
        final Transformer transformer = factory.newTransformer();
        final DOMSource source = new DOMSource(esv);
        final StreamResult result = new StreamResult(new File("c:\\temp\\esvtagging\\esv-out.xml"));
        transformer.transform(source, result);

    }

    private void traverse(final Element esv, final MultiMap<String, Tagging, Deque<Tagging>> indexTagging)
            throws Exception {
        // filter all verses first, we will process verse by verse
        LOGGER.trace("Tag [{}]", esv.getNodeName());

        if ("verse".equals(esv.getNodeName())) {
            this.currentVerse = esv.getAttribute("osisID");
            this.error = false;
            //
            // if ("Gen.2.1".equals(this.currentVerse)) {
            // throw new AbortTagException();
            // }

            this.verseTagging = indexTagging.get(this.currentVerse);
            processVerse(esv, indexTagging);
            return;
        }

        final Element element = (Element) esv;
        final NodeList childNodes = element.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            final Node item = childNodes.item(i);
            if (item instanceof Text) {
                if (StringUtils.isNotBlank(this.currentVerse)) {
                    if (this.verseTagging != null & !this.error) {
                        try {
                            final int advanceTokens = processVerseContent((Text) item, this.verseTagging);

                            if (advanceTokens != 0) {
                                LOGGER.debug("Avancing by [{}] token(s)", advanceTokens);
                                i += advanceTokens;
                            }
                        } catch (final AbortTagException e) {
                            // already logged
                        }
                    }
                }
            } else if (item instanceof Element) {
                final Element traversableElement = (Element) item;
                if (!isIgnoreable(traversableElement)) {
                    traverse(traversableElement, indexTagging);
                }
            }
        }
    }

    private boolean isIgnoreable(final Element traversableElement) {
        final String nodeName = traversableElement.getNodeName();

        if (nodeName.equals("note")) {
            return true;
        }

        return false;
    }

    private int processVerseContent(final Text item, final Deque<Tagging> verseTagging) throws Exception {
        final String textContent = item.getTextContent();
        LOGGER.trace("{}: [{}]", this.currentVerse, textContent);

        final String wordsFromESV = replacePunctuation(textContent);
        Tagging firstTag = verseTagging.peekFirst();
        if (firstTag == null) {
            if (isNotBlank(wordsFromESV)) {
                LOGGER.warn("{}: No tagging for [{}]", this.currentVerse, wordsFromESV);
                this.error = true;
                throw new AbortTagException();
            }
            return 0;
        }

        Remainder initialRemainder = new Remainder(wordsFromESV, firstTag.getNonTaggedText());

        while (true) {
            final Remainder remainderAfterProcessingTag = processTag(initialRemainder.clone(), firstTag, item);

            if (isEmpty(remainderAfterProcessingTag.sourceText) || remainderAfterProcessingTag.advance > 0) {
                // remove the tag if empty
                if (isEmpty(firstTag.getNonTaggedText()) && isEmpty(firstTag.getTaggedText())) {
                    verseTagging.removeFirst();
                }

                // all text processed, so return
                return remainderAfterProcessingTag.advance;
            }

            // if both parts of the tag are empty by the end, then we can move on to the next tag
            if (isEmpty(firstTag.getNonTaggedText()) && isEmpty(firstTag.getTaggedText())) {
                verseTagging.removeFirst();
                firstTag = verseTagging.peekFirst();

                if (firstTag == null) {
                    LOGGER.warn("{}: Arrived at end of tagging data. Remainder of ESV text is: [{}]",
                            this.currentVerse, remainderAfterProcessingTag.sourceText);
                    return remainderAfterProcessingTag.advance;
                }

                remainderAfterProcessingTag.taggingText = firstTag.getNonTaggedText();
            }

            // check we have actually processed something
            if (initialRemainder.sourceText.equalsIgnoreCase(remainderAfterProcessingTag.sourceText)
                    && initialRemainder.taggingText.equalsIgnoreCase(remainderAfterProcessingTag.taggingText)) {
                LOGGER.warn("{}: No processing was made on ESV text between [{}] and [{}]",
                        this.currentVerse, remainderAfterProcessingTag.sourceText,
                        remainderAfterProcessingTag.taggingText);
                this.error = true;
                // abort the tag processing
                throw new AbortTagException();
            }

            // set up to go round the look again
            initialRemainder = remainderAfterProcessingTag;
        }
    }

    private Remainder processTag(Remainder remainder, final Tagging firstTag, final Text item)
            throws AbortTagException {
        // final String nonTaggedText = firstTag.getNonTaggedText();
        // Remainder remainder = new Remainder(wordsFromESV, nonTaggedText);
        remainder = matchEsvToTagging(remainder, null, item);
        firstTag.setNonTaggedText(remainder.taggingText);

        if (isEmpty(remainder.sourceText)) {
            return remainder;
        }

        // now check if we parsed all the non-tagged text. if so, we can do the same for the tagging part
        if (isEmpty(firstTag.getNonTaggedText())) {
            remainder.taggingText = firstTag.getTaggedText();
        }

        remainder = matchEsvToTagging(remainder, firstTag, item);
        firstTag.setTaggedText(remainder.taggingText);
        return remainder;
    }

    class Remainder {
        int positionInSourceText = 0;
        String sourceText;
        String taggingText;

        int advance = 0;

        /**
         * @param sourceText
         * @param taggingText
         */
        public Remainder(final String sourceText, final String taggingText, final int positionInSourceText) {
            this.sourceText = sourceText;
            this.taggingText = taggingText;
            this.positionInSourceText = positionInSourceText;
        }

        /**
         * @param sourceText
         * @param taggingText
         */
        public Remainder(final String sourceText, final String taggingText) {
            this.sourceText = sourceText;
            this.taggingText = taggingText;
        }

        @Override
        protected Remainder clone() throws CloneNotSupportedException {
            return new Remainder(this.sourceText, this.taggingText, this.positionInSourceText);
        }
    }

    /**
     * 
     * 
     * @param wordsFromESV
     * @param firstTag
     * @param taggedText
     * @return Remainder of tagging portion.
     * @throws AbortTagException
     */
    private Remainder matchEsvToTagging(final Remainder remainder, final Tagging tagData, final Text item)
            throws AbortTagException {
        final String taggedText = remainder.taggingText;
        final String wordsFromESV = remainder.sourceText;

        if (isNotBlank(taggedText)) {
            // no tag for these words - but need to check they match
            if (wordsFromESV.equalsIgnoreCase(taggedText)) {
                // full match, so simply set the tagging to nothing
                LOGGER.debug("{}: Matched words: [{}]", this.currentVerse, wordsFromESV);

                tagWord(taggedText, tagData, item, remainder);

                // no need to increment position in source text since there is nothing left
                remainder.sourceText = "";
                remainder.taggingText = "";
                return remainder;
            } else {
                // partial match
                final String[] taggedWords = taggedText.split(" ");
                final String[] esvWords = wordsFromESV.split(" ");

                // how many words can we match
                int ii = 0;
                for (; ii < esvWords.length && ii < taggedWords.length; ii++) {
                    if (esvWords[ii].equalsIgnoreCase(taggedWords[ii])) {
                        LOGGER.debug("{}: Partial matching of [{}]", this.currentVerse, esvWords[ii]);

                        // now we can tag a word
                        tagWord(taggedWords[ii], tagData, item, remainder);

                        remainder.positionInSourceText++;
                        // if we've tagged a word, move i forward to reflect below correctly and break
                        if (remainder.advance > 0) {
                            ii++;
                            break;
                        }
                    } else {
                        break;
                    }
                }

                // now look at value of ii, which is equal to last non-match
                // if we didn't get to the end of the tagged words
                final String esvLeftOver = ii < esvWords.length ? join(esvWords, ' ', ii, esvWords.length)
                        : "";
                final String tagLeftOver = ii < taggedWords.length ? join(taggedWords, ' ', ii,
                        taggedWords.length) : "";

                remainder.sourceText = esvLeftOver;
                remainder.taggingText = tagLeftOver;
                return remainder;
            }
        }

        return remainder;
    }

    private void tagWord(final String taggedText, final Tagging tagData, final Text item,
            final Remainder remainder) throws AbortTagException {

        if (tagData == null) {
            return;
        }

        if (tagData.getNonTaggedText().length() > 0) {
            LOGGER.error("{}:Tagging with still unmunched non-tagged data: [{}]", this.currentVerse,
                    tagData.getNonTaggedText());
            throw new AbortTagException();
        }

        LOGGER.trace("Tagging [{}] with [{}] in tag [{}]", taggedText, tagData, item);

        if (tagData.getOriginalTaggedText().equals(tagData.getTaggedText())) {
            LOGGER.info("{}: Tagging entire tagData item: [{}] for words at position: [{}]",
                    this.currentVerse, tagData.getTaggedText(), remainder.positionInSourceText);

            int finalPosition = 0;
            if (remainder.positionInSourceText != 0) {
                final int position = remainder.positionInSourceText == 0 ? 0 : nthOccurrence(
                        item.getTextContent(), ' ', remainder.positionInSourceText - 1);
                if (position == -1) {
                    LOGGER.error("Couldn't find a matched word to tag.");
                    throw new AbortTagException();
                }
                finalPosition = position + 1;
            } else {
                finalPosition = fastForwardNonAlphaNumeric(item.getTextContent());
            }

            final Text wordInDoc = item.splitText(finalPosition);

            if (wordInDoc.getTextContent().length() == tagData.getTaggedText().length()) {
                // take the whole tag
            } else {
                // need to split further
                wordInDoc.splitText(tagData.getTaggedText().length());
            }

            // double check that we're tagging is what's in the word we've selected
            // Several things to think about
            // A- We must check that what we're tagging is the same as what's in the wordInDoc
            if (!wordInDoc.getTextContent().equalsIgnoreCase(tagData.getTaggedText())) {
                LOGGER.warn("The tagged content [{}] differs from the select portion of the Text node [{}]",
                        wordInDoc.getTextContent());
            }

            // TODO TODO TODO
            // B- What happens if we're what we're tagging contains some punctuation - we probably end up with
            // not quite the right word
            // C- We need some way of telling the calling method that we have tagged the whole tag, not just a
            // little bit of it. As a result, we may need to increment bits further

            final Element w = createWElement(tagData, wordInDoc);

            item.getParentNode().insertBefore(w, wordInDoc);

            // move the text into the w node
            w.appendChild(wordInDoc);

            remainder.advance++;

        } else {
            LOGGER.info("{}: Tagging data across tags: [{}], original was [{}]", this.currentVerse,
                    tagData.getTaggedText(), tagData.getOriginalTaggedText());
        }
    }

    private int fastForwardNonAlphaNumeric(final String str) {
        // fast forward if we're starting with c
        int start = 0;
        for (; !Character.isLetterOrDigit(str.charAt(start)); start++) {
            ;
        }
        return start;
    }

    private Element createWElement(final Tagging tagData, final Text wordInDoc) {
        final Document ownerDocument = wordInDoc.getOwnerDocument();
        final Element w = ownerDocument.createElement("w");
        final Attr lemma = ownerDocument.createAttribute("lemma");
        lemma.setNodeValue(createLemmaAttribute(tagData));
        w.setAttributeNode(lemma);
        return w;
    }

    private String createLemmaAttribute(final Tagging tagData) {
        final String strongs = tagData.getStrongs();
        final String grammar = tagData.getGrammar();

        final String[] splitLemmas = strongs.split(" ");
        final String[] splitGrammar = grammar.length() == 0 ? new String[0] : grammar.split(" ");
        final StringBuilder s = new StringBuilder(strongs.length() + grammar.length() + 32);
        for (int i = 0; i < splitLemmas.length; i++) {
            s.append("strong:");
            s.append(splitLemmas[i]);

            if (i < splitLemmas.length - 1) {
                s.append(" ");
            }
        }

        for (int i = 0; i < splitGrammar.length; i++) {
            s.append(' ');
            s.append("morph:");
            s.append(splitGrammar[i]);
        }

        return s.toString();
    }

    private int nthOccurrence(final String str, final char c, int n) {
        final int start = fastForwardNonAlphaNumeric(str);

        int pos = str.indexOf(c, start);
        while (n-- > 0 && pos != -1) {
            pos = str.indexOf(c, pos + 1);
        }
        return pos;
    }

    private void processVerse(final Element esv, final MultiMap<String, Tagging, Deque<Tagging>> indexTagging) {
        final String osisID = esv.getAttribute("osisID");
        LOGGER.trace("Processing [{}]", osisID);
    }

    private Document readESVDoc() throws ParserConfigurationException, SAXException, IOException {
        final long start = System.currentTimeMillis();

        final DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        final DocumentBuilder newDocumentBuilder = factory.newDocumentBuilder();
        final Document esv = newDocumentBuilder.parse(this.esvText);

        LOGGER.debug("Took [{}]ms to read ESV into Document", System.currentTimeMillis() - start);
        return esv;
    }

    private void cleanupTagging(final List<Tagging> rawTagging) throws Exception {
        for (final Tagging t : rawTagging) {
            cleanRef(t);
            removePunctuation(t);
            splitStrong(t);

            t.setOriginalTaggedText(t.getTaggedText());
        }
    }

    private void splitStrong(final Tagging t) {
        final String rawStrongs = t.getRawStrongs();
        if (rawStrongs == null) {
            t.setStrongs("");
            t.setGrammar("");
            return;
        }

        final Matcher matcher = STRONGS_SPLITTING.matcher(rawStrongs);
        final boolean matches = matcher.matches();
        if (matches) {
            if (matcher.groupCount() > 1) {
                t.setStrongs(matcher.group(1));
            }

            if (matcher.groupCount() == 2) {
                final String group = matcher.group(2);
                if (group != null) {
                    t.setGrammar(group.replaceAll("[()]+", ""));
                }
            }
        }

        if (t.getStrongs() == null) {
            t.setStrongs("");
        }
        if (t.getGrammar() == null) {
            t.setGrammar("");
        }
    }

    private void removePunctuation(final Tagging t) {
        t.setNonTaggedText(replacePunctuation(t.getNonTaggedText()));
        t.setTaggedText(replacePunctuation(t.getTaggedText()));
    }

    private String replacePunctuation(final String text) {
        if (text == null) {
            return "";
        }

        final String remainingText = PUNCTUATION.matcher(text).replaceAll(" ");
        if (remainingText != null) {
            return remainingText.replaceAll("\\s\\s+", " ").trim();
        }
        return "";
    }

    private void cleanRef(final Tagging t) throws NoSuchKeyException {
        final String reference = REF_CLEAN.matcher(t.getRef()).replaceAll("").trim();
        if (isBlank(reference)) {
            LOGGER.warn("Unable to parse reference [{}]", t.getRef());
            return;
        }
        t.setRef(ESV.getKey(reference).getOsisID());
    }

    /**
     * Trace log of the tagging
     * 
     * @param indexTagging the index tagging
     */
    private void traceLog(final MultiMap<String, Tagging, Deque<Tagging>> indexTagging) {
        if (LOGGER.isTraceEnabled()) {
            final Set<Entry<String, Deque<Tagging>>> entrySet = indexTagging.entrySet();
            for (final Entry<String, Deque<Tagging>> mappedEntry : entrySet) {
                LOGGER.trace("Contains ref [{}]", mappedEntry.getKey());
                final Deque<Tagging> value = mappedEntry.getValue();
                for (final Tagging t : value) {
                    LOGGER.trace("\tTagging is: [{}]", t);
                }
            }
        }
    }

    private MultiMap<String, Tagging, Deque<Tagging>> indexTagging(final List<Tagging> rawTagging) {
        final MultiMap<String, Tagging, Deque<Tagging>> map = new MultiMap<String, Tagging, Deque<Tagging>>(
                LinkedList.class);
        map.putCollection(rawTagging, new MultiMapIndexer<String, Tagging>() {

            @Override
            public String getKey(final Tagging t) {
                return t.getRef();
            }
        });

        return map;
    }

    private List<Tagging> readTagging() throws FileNotFoundException {
        final ColumnPositionMappingStrategy strat = new ColumnPositionMappingStrategy();
        strat.setType(Tagging.class);
        final String[] columns = new String[] { "ref", "nonTaggedText", "taggedText", "rawStrongs" };
        strat.setColumnMapping(columns);

        final CsvToBean csv = new CsvToBean();
        final CSVReader reader = new CSVReader(IOUtils.toBufferedReader(new FileReader(this.tagging)), '\t',
                '@');

        return csv.parse(strat, reader);
    }
}
