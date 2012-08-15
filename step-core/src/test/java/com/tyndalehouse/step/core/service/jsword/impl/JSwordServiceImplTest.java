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

import static com.tyndalehouse.step.core.models.LookupOption.INTERLINEAR;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;
import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.models.LookupOption;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
public class JSwordServiceImplTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordServiceImplTest.class);

    /**
     * tests what happens when we select interlinear
     * 
     * @throws NoSuchKeyException uncaught exceptions
     * @throws BookException uncaught exception
     * @throws IOException uncaught exception
     * @throws JDOMException uncaught exception
     * 
     */
    @Test
    public void testInterlinearTransformation() throws NoSuchKeyException, BookException, JDOMException,
            IOException {
        final Book currentBook = Books.installed().getBook("KJV");
        final BookData bookData = new BookData(currentBook, currentBook.getKey("Romans 1:1-3"));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(INTERLINEAR);

        final String osisText = jsi.getOsisText("KJV", "Romans 1:1-3", options, "KJV").getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span"));

    }

    /**
     * tests that the XSLT transformation is handled correctly
     * 
     * @throws BookException uncaught exception
     * @throws NoSuchKeyException uncaught exception
     * @throws IOException uncaught exception
     * @throws JDOMException uncaught exception
     */
    @Test
    public void testXslTransformation() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final Book currentBook = Books.installed().getBook("KJV");
        final BookData bookData = new BookData(currentBook, currentBook.getKey("Romans 1:4"));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options, "").getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span"));
    }

    /**
     * tests that the XSLT transformation is handled correctly
     * 
     * @throws BookException uncaught exception
     * @throws NoSuchKeyException uncaught exception
     * @throws IOException uncaught exception
     * @throws JDOMException uncaught exception
     */
    @Test
    public void testComparing() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final Book currentBook = Books.installed().getBook("KJV");
        final Book secondaryBook = Books.installed().getBook("ESV");

        final BookData bookData = new BookData(new Book[] { currentBook, secondaryBook },
                currentBook.getKey("Romans 1:4"), true);
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        // // final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
        // // new JSwordVersificationServiceImpl(), null, null);
        // // final List<LookupOption> options = new ArrayList<LookupOption>();
        // //
        // // final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options, "").getValue();
        // // final SAXBuilder sb = new SAXBuilder();
        // // final Document d = sb.build(new StringReader(osisText));
        //
        // LOGGER.debug("\n {}", xmlOutputter.outputString(d));
        // Assert.assertTrue(osisText.contains("span"));
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testSingleReference() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final List<ScriptureReference> refs = jsi.resolveReferences("Gen.1.1", "KJV");

        assertEquals(refs.size(), 1);
        assertEquals(4, refs.get(0).getStartVerseId());
        assertEquals(4, refs.get(0).getEndVerseId());
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testMultipleReference() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final List<ScriptureReference> refs = jsi.resolveReferences("Gen.1.1;Gen.1.3", "KJV");

        assertEquals(2, refs.size());
        assertEquals(4, refs.get(0).getStartVerseId());
        assertEquals(4, refs.get(0).getEndVerseId());
        assertEquals(6, refs.get(1).getStartVerseId());
        assertEquals(6, refs.get(1).getEndVerseId());
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testMultiplePassages() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final List<ScriptureReference> refs = jsi.resolveReferences("Gen.1.1-2;Gen.1.4-5", "KJV");

        assertEquals(refs.size(), 2);
        assertEquals(4, refs.get(0).getStartVerseId());
        assertEquals(5, refs.get(0).getEndVerseId());
        assertEquals(7, refs.get(1).getStartVerseId());
        assertEquals(8, refs.get(1).getEndVerseId());
    }

    /**
     * Tests an example from the geo file
     */
    @Test
    public void testGeoPassageExample() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);

        // TODO change spaces between 1 and Kgs! This doesn't seem to work...

        // final List<ScriptureReference> refs = getPassageReferences(target, "Josh 12:24; Sng 6:4");
        final List<ScriptureReference> refs = jsi.resolveReferences("Song 6:4", "KJV");
        assertEquals(refs.size(), 1);
    }

    /**
     * Tests that getting a bible book returns the correct set of names
     */
    @Test
    public void testGetBibleBooks() {
        final JSwordMetadataServiceImpl jsi = new JSwordMetadataServiceImpl(
                new JSwordVersificationServiceImpl());

        final List<String> bibleBookNames = jsi.getBibleBookNames("Ma", "ESV");

        assertTrue(bibleBookNames.contains("Mal"));
        assertTrue(bibleBookNames.contains("Mat"));
        assertTrue(bibleBookNames.contains("Mar"));
    }

    /**
     * Testing that reference gets bumped up and down
     */
    @Test
    public void testGetSiblingChapter() {
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);

        // previous chapter tests
        assertEquals("Genesis 1", jsword.getSiblingChapter("Genesis 2", "KJV", true));
        assertEquals("Genesis 2", jsword.getSiblingChapter("Genesis 2:5", "KJV", true));
        assertEquals("Genesis 1", jsword.getSiblingChapter("Genesis 2-3:17", "KJV", true));
        assertEquals("Genesis 2", jsword.getSiblingChapter("Genesis 2:3-3:17", "KJV", true));

        // next chapter tests
        assertEquals("Genesis 3", jsword.getSiblingChapter("Genesis 2-3:17", "KJV", false));
        assertEquals("Genesis 4", jsword.getSiblingChapter("Genesis 2-3:24", "KJV", false));
        assertEquals("Genesis 3", jsword.getSiblingChapter("Genesis 3:17", "KJV", false));
        assertEquals("Genesis 4", jsword.getSiblingChapter("Genesis 3:24", "KJV", false));
        assertEquals("Genesis 3", jsword.getSiblingChapter("Genesis 2", "KJV", false));
    }

    /**
     * testing variations of getting the previous reference
     * 
     * @throws NoSuchKeyException uncaught exception
     */
    @Test
    public void testGetPreviousRef() throws NoSuchKeyException {
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final Book book = Books.installed().getBook("KJV");
        final Key key = book.getKey("Genesis 3:17");

        assertEquals("Gen.3", jsword.getPreviousRef(new String[] { "Gen", "3", "17" }, key, book)
                .getOsisRef());
        assertEquals("Gen.2", jsword.getPreviousRef(new String[] { "Gen", "3", "1" }, key, book).getOsisRef());
        assertEquals("Gen.2", jsword.getPreviousRef(new String[] { "Gen", "3" }, key, book).getOsisRef());
    }

    /**
     * testing variations of getting the previous reference
     * 
     * @throws NoSuchKeyException uncaught exception
     */
    @Test
    public void testGetNextRef() throws NoSuchKeyException {
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final Book book = Books.installed().getBook("KJV");
        final Key key = book.getKey("Genesis 3:24");

        assertEquals("Gen.4", jsword.getNextRef(new String[] { "Gen", "3", "24" }, key, book).getOsisRef());
        assertEquals("Gen.4", jsword.getNextRef(new String[] { "Gen", "3" }, key, book).getOsisRef());
    }

    /**
     * Justs shows XML on the stdout
     * 
     * @throws BookException an exceptioon
     * @throws NoSuchKeyException an exception
     * @throws IOException an exception
     * @throws JDOMException an exception
     */
    @Test
    public void testPrettyXml() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final String version = "ESV";
        final String ref = "Psalm 3:1";
        final Book currentBook = Books.installed().getBook(version);
        final BookData bookData = new BookData(currentBook, currentBook.getKey(ref));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.NOTES);

        final String osisText = jsi.getOsisText(version, ref, options, "TR").getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span"));
    }

    /**
     * Tests a lookup by number
     */
    @Test
    public void testNumberLookup() {
        final JSwordPassageServiceImpl j = new JSwordPassageServiceImpl(new JSwordVersificationServiceImpl(),
                null, null);
        assertTrue(j
                .getOsisTextByVerseNumbers("ESV", "KJV", 4, 4, new ArrayList<LookupOption>(), null, null,
                        false).getValue().contains("In the beginning"));
        assertTrue(j
                .getOsisTextByVerseNumbers("ESV", "KJV", 60000, 60000, new ArrayList<LookupOption>(), null,
                        null, false).getValue().contains("The grace of the Lord Jesus"));
        assertTrue(j
                .getOsisTextByVerseNumbers("FreSegond", "KJV", 60000, 60000, new ArrayList<LookupOption>(),
                        null, null, false).getValue()
                .contains("Que la gr\u00e2ce du Seigneur J\u00e9sus soit avec tous!"));

    }

    // /**
    // * tries to replicate the issue with bookdata not being able to be read in a concurrent fashion
    // *
    // * @throws NoSuchKeyException a no such key exception
    // * @throws BookException a book exception
    // * @throws InterruptedException when the thread is interrupted
    // */
    // // FIXME: currently disabled
    // @Test
    // public void testConcurrencyIssueOnBookData() throws NoSuchKeyException, BookException,
    // InterruptedException {
    // final String[] names = { "KJV", "ESV" };
    // final String ref = "Rom.1.1";
    //
    // final Runnable r1 = new Runnable() {
    // @Override
    // public void run() {
    // final Book b0 = Books.installed().getBook(names[0]);
    // BookData bd1;
    // try {
    // bd1 = new BookData(b0, b0.getKey(ref));
    // bd1.getSAXEventProvider();
    // } catch (final NoSuchKeyException e) {
    // LOGGER.error("A jsword error during test", e);
    // Assert.fail("JSword bug has occured");
    // } catch (final BookException e) {
    // LOGGER.error("A jsword error during test", e);
    // Assert.fail("JSword bug has occured");
    // }
    // }
    // };
    //
    // final Runnable r2 = new Runnable() {
    // @Override
    // public void run() {
    // final Book b0 = Books.installed().getBook(names[1]);
    // BookData bd1;
    // try {
    // bd1 = new BookData(b0, b0.getKey(ref));
    // bd1.getSAXEventProvider();
    // } catch (final NoSuchKeyException e) {
    // LOGGER.error("A jsword error during test", e);
    // Assert.fail("JSword bug has occured");
    // } catch (final BookException e) {
    // LOGGER.error("A jsword error during test", e);
    // Assert.fail("JSword bug has occured");
    // }
    // }
    // };
    //
    // int ii = 0;
    // while (ii++ < 15) {
    // final Thread t1 = new Thread(r1);
    // final Thread t2 = new Thread(r2);
    // t1.start();
    // t2.start();
    //
    // t1.join();
    // t2.join();
    // }
    // }
}
