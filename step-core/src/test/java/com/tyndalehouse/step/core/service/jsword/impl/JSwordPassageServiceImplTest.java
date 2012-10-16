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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;

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
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.system.Versifications;
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

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
public class JSwordPassageServiceImplTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordPassageServiceImplTest.class);

    /**
     * tests that verse 0 gets excluded
     * 
     * @throws NoSuchKeyException
     */
    @Test
    public void testNormalize() throws NoSuchKeyException {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);

        final Book book = Books.installed().getBook("KJV");

        final Key key = book.getKey("John 4");

        assertTrue(key.get(0).getOsisID().equals("John.4.0"));
        jsi.normalize(key, Versifications.instance().getDefaultVersification());
        assertFalse(key.get(0).getOsisID().equals("John.4.0"));

    }

    /**
     * Test for bug TYNSTEP-378
     */
    @Test
    public void testColorCoding() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, mock(ColorCoderProviderImpl.class));

        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.COLOUR_CODE);
        final OsisWrapper osisText = jsi.getOsisText("KJV", "Gen.1.1", options, null, InterlinearMode.NONE);
        assertTrue(osisText.getValue().contains("In the beginning"));
    }

    /**
     * Baseline for bug TYNSTEP-378, checking that in interlinear colour coding still works.
     */
    @Test
    public void testColorCodingInterlinear() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, mock(ColorCoderProviderImpl.class));

        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.COLOUR_CODE);
        options.add(LookupOption.INTERLINEAR);

        final OsisWrapper osisText = jsi.getOsisText("KJV", "Gen.1.1", options, "KJV",
                InterlinearMode.INTERLINEAR);
        assertTrue(osisText.getValue().contains("In the beginning"));
    }

    /**
     * should expand Ruth.1.22 to Ruth.1
     */
    @Test
    public void testExpandNoGap() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);

        final Key expandToFullChapter = jsi.expandToFullChapter("Ruth", "1", "22",
                Books.installed().getBook("KJV"), new Verse(BibleBook.RUTH, 1, 22), 0);
        LOGGER.debug(expandToFullChapter.getName());
    }

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
        LOGGER.trace(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        // options.add(INTERLINEAR);

        final String osisText = jsi.getOsisText("KJV", "Romans 1:1-3", options, "KJV",
                InterlinearMode.INTERLINEAR).getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.trace("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span class='interlinear'"));

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
        LOGGER.trace(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options, "", InterlinearMode.NONE)
                .getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.trace("\n {}", xmlOutputter.outputString(d));
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
        final Book currentBook = Books.installed().getBook("ESV");
        final Book secondaryBook = Books.installed().getBook("KJV");
        final Book tertiaryBook = Books.installed().getBook("ASV");

        final String reference = "Mark 3:1-2";
        final BookData bookData = new BookData(new Book[] { currentBook, secondaryBook, tertiaryBook },
                currentBook.getKey(reference), true);
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.info(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final String osisText = jsi.getInterleavedVersions(
                new String[] { currentBook.getInitials(), secondaryBook.getInitials() }, reference, options,
                InterlinearMode.INTERLEAVED_COMPARE).getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span"));
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testSingleReference() {
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final String allRefs = jsi.getAllReferences("Gen.1", "ESV");

        assertTrue(allRefs.contains("Gen.1.1"));
        assertTrue(allRefs.contains("Gen.1.2"));
    }

    /**
     * Tests that getting a bible book returns the correct set of names
     */
    @Test
    public void testGetBibleBooks() {
        final JSwordMetadataServiceImpl jsi = new JSwordMetadataServiceImpl(
                new JSwordVersificationServiceImpl());

        final List<BookName> bibleBookNames = jsi.getBibleBookNames("Ma", "ESV");
        final String[] containedAbbrevations = new String[] { "Mal", "Mat", "Mar" };

        for (final String s : containedAbbrevations) {
            boolean found = false;
            for (final BookName b : bibleBookNames) {
                if (s.equalsIgnoreCase(b.getShortName())) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                fail(s + " was not found");
            }
        }
    }

    /**
     * Testing that reference gets bumped up and down
     */
    @Test
    public void testGetSiblingChapter() {
        org.crosswire.jsword.versification.BookName.setFullBookName(false);
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);

        // previous chapter tests
        assertEquals("Gen 1", jsword.getSiblingChapter("Genesis 2", "ESV", true).getName());
        assertEquals("Gen 1", jsword.getSiblingChapter("Genesis 2:5", "ESV", true).getName());
        assertEquals("Gen 1", jsword.getSiblingChapter("Genesis 2-3:17", "ESV", true).getName());
        assertEquals("Gen 1", jsword.getSiblingChapter("Genesis 2:3-3:17", "ESV", true).getName());

        // next chapter tests
        assertEquals("Gen 4", jsword.getSiblingChapter("Genesis 2-3:17", "ESV", false).getName());
        assertEquals("Gen 4", jsword.getSiblingChapter("Genesis 2-3:24", "ESV", false).getName());
        assertEquals("Gen 4", jsword.getSiblingChapter("Genesis 3:17", "ESV", false).getName());
        assertEquals("Gen 4", jsword.getSiblingChapter("Genesis 3:24", "ESV", false).getName());
        assertEquals("Gen 3", jsword.getSiblingChapter("Genesis 2", "ESV", false).getName());

        assertEquals("Mal 4", jsword.getSiblingChapter("Mat 1", "ESV", true).getName());
        assertEquals("Mat 1", jsword.getSiblingChapter("Mal 4", "ESV", false).getName());

        assertEquals("Mar 16", jsword.getSiblingChapter("Luke 1", "ESV", true).getName());
        assertEquals("Luk 1", jsword.getSiblingChapter("Mark 16", "ESV", false).getName());

        assertEquals("Gen 1", jsword.getSiblingChapter("Genesis 1:2", "ESV", true).getName());
        assertEquals("Rev 22", jsword.getSiblingChapter("Revelation 22:5", "ESV", false).getName());

    }

    /**
     * testing variations of getting the previous reference
     * 
     * @throws NoSuchKeyException uncaught exception
     */
    @Test
    public void testGetPreviousRef() throws NoSuchKeyException {
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
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
                new JSwordVersificationServiceImpl(), null, null, null);
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
    public void testInterleave() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        final String ref = "John 4:1";

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);

        final String[] versions = new String[] { "Byz", "Tisch" };
        final BookData data = new BookData(new Book[] { Books.installed().getBook(versions[0]),
                Books.installed().getBook(versions[1]) }, Books.installed().getBook(versions[0]).getKey(ref),
                true);

        LOGGER.debug("Original is:\n {}", xmlOutputter.outputString(data.getOsisFragment()));

        final OsisWrapper interleavedVersions = jsi.getInterleavedVersions(versions, ref,
                new ArrayList<LookupOption>(), InterlinearMode.COLUMN_COMPARE);

        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(interleavedVersions.getValue()));
        LOGGER.debug("\n {}", xmlOutputter.outputString(d));
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
    public void testLongHeaders() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final String version = "ESV";
        final String ref = "Luk 4:27";

        // set up the static JSword field
        org.crosswire.jsword.versification.BookName.setFullBookName(false);

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final String osisText = jsi.getOsisText(version, ref, new ArrayList<LookupOption>(), null,
                InterlinearMode.NONE).getValue();

        if (LOGGER.isDebugEnabled()) {
            final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
            final SAXBuilder sb = new SAXBuilder();
            final Document d = sb.build(new StringReader(osisText));
            LOGGER.debug("\n {}", xmlOutputter.outputString(d));
        }

        Assert.assertTrue(osisText.contains("Luke 4:27"));
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
        final String version = "KJV";
        final String ref = "Phil.4.23";
        final Book currentBook = Books.installed().getBook(version);
        final BookData bookData = new BookData(currentBook, currentBook.getKey(ref));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.NOTES);

        final String osisText = jsi.getOsisText(version, ref, options, null, InterlinearMode.NONE).getValue();
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
                null, null, null);
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

    /**
     * tries to replicate the issue with bookdata not being able to be read in a concurrent fashion
     * 
     * @throws NoSuchKeyException a no such key exception
     * @throws BookException a book exception
     * @throws InterruptedException when the thread is interrupted
     */
    // FIXME: currently disabled
    // @Test
    // public void testConcurrencyIssueThroughStep() throws NoSuchKeyException, BookException,
    // InterruptedException {
    // final String[] names = { "KJV", "ESV" };
    // final String[] ref = { "Rom.2", "John 7", "2Ki.2", "Rom.1;John 4;2Ki.2", "Acts 3:4-6" };
    //
    // final ThreadMXBean thbean = ManagementFactory.getThreadMXBean();
    // thbean.setThreadContentionMonitoringEnabled(true);
    // final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
    // new JSwordVersificationServiceImpl(), null, null);
    //
    // final Queue<Long> times = new ConcurrentLinkedQueue<Long>();
    // final AtomicLong iterations = new AtomicLong();
    //
    // final Runnable r1 = new Runnable() {
    // @Override
    // public void run() {
    // for (int ii = 0; ii < 1000; ii++) {
    // final long l = System.currentTimeMillis();
    // jsi.getOsisText(names[ii % 2], ref[ii % 5]);
    // times.add(System.currentTimeMillis() - l);
    // iterations.incrementAndGet();
    // }
    //
    // final ThreadInfo threadInfo = thbean.getThreadInfo(new long[] { Thread.currentThread()
    // .getId() }, true, true)[0];
    // System.err.println("Waited a total of " + threadInfo.getBlockedCount()
    // + " times, resulting in " + threadInfo.getBlockedTime() + "ms wasted time");
    // }
    // };
    //
    // int ii = 0;
    //
    // final long start = System.currentTimeMillis();
    // final List<Thread> threads = new ArrayList<Thread>();
    // while (ii++ < 16) {
    // final Thread t1 = new Thread(r1);
    // t1.start();
    // threads.add(t1);
    // }
    //
    // new Thread(new Runnable() {
    // @Override
    // public void run() {
    // while (true) {
    // try {
    // Thread.sleep(10000);
    // } catch (final InterruptedException e) {
    // e.printStackTrace();
    // }
    // System.out.println(iterations.get() + " iterations so far");
    // }
    //
    // }
    // }).start();
    //
    // for (final Thread t : threads) {
    // t.join();
    // }
    //
    // final long total = System.currentTimeMillis() - start;
    // System.err.println(String.format("Executed: %d in %d ms, %f ms / iteration", iterations.get(), total,
    // (double) total / (double) iterations.get()));
    //
    // }
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
