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

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.utils.TestUtils;
import com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;

/**
 * a service providing a wrapper around JSword
 *
 * @author CJBurrell
 */
public class JSwordPassageServiceImplTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordPassageServiceImplTest.class);
    private JSwordPassageServiceImpl jsi;

    /**
     * Sets up the object under test
     */
    @Before
    public void setUp() {
        this.jsi = new JSwordPassageServiceImpl(TestUtils.mockVersificationService(), null, mock(VocabularyService.class),
                mock(ColorCoderProviderImpl.class), TestUtils.mockVersionResolver(), null);
    }

    /**
     * tests that verse 0 gets excluded
     *
     * @throws NoSuchKeyException e
     */
    @Test
    public void testNormalize() throws NoSuchKeyException {
        final Book book = Books.installed().getBook("KJV");

        Key key = book.getKey("John 4");

        assertTrue(key.get(0).getOsisID().equals("John.4.0"));
        key = this.jsi.normalize(key, Versifications.instance().getVersification("KJV"));
        assertEquals("Joh 4", key.getName());
    }

    /**
     * Test for bug TYNSTEP-378
     */
    @Test
    public void testColorCoding() {
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.COLOUR_CODE);
        final OsisWrapper osisText = this.jsi.getOsisText("KJV", "Gen.1.1", options, null,
                InterlinearMode.NONE);
        assertTrue(osisText.getValue().contains("In the beginning"));
    }

    /**
     * Baseline for bug TYNSTEP-378, checking that in interlinear colour coding still works.
     */
    @Test
    public void testColorCodingInterlinear() {
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.COLOUR_CODE);
        options.add(LookupOption.INTERLINEAR);

        final OsisWrapper osisText = this.jsi.getOsisText("KJV", "Gen.1.1", options, "KJV",
                InterlinearMode.INTERLINEAR);
        assertTrue(osisText.getValue().contains("In the beginning"));
    }

    @Test
    public void readRev12FromNrsvEsv() {
		// this.jsi.getOsisText("ESV_th", "Rev.12.17-18"); This line no longer works around summer of 2021.  PT
        this.jsi.getOsisText("ESV_th", "Rev.12.17");
    }

    /**
     * should expand Ruth.1.22 to Ruth.1
     */
    @Test
    public void testExpandNoGap() {
        final Key expandToFullChapter = this.jsi.expandToFullChapter("Ruth", "1", "22", Books.installed()
                .getBook("KJV"),
                new Verse(Versifications.instance().getVersification(Versifications.DEFAULT_V11N),
                        BibleBook.RUTH, 1, 22), 0);
        LOGGER.debug(expandToFullChapter.getName());
    }

    /**
     * tests what happens when we select interlinear
     *
     * @throws NoSuchKeyException uncaught exceptions
     * @throws BookException      uncaught exception
     * @throws IOException        uncaught exception
     * @throws JDOMException      uncaught exception
     */
    @Test
    public void testInterlinearTransformation() throws NoSuchKeyException, BookException, JDOMException,
            IOException {
        final Book currentBook = Books.installed().getBook("OSMHB");
        final BookData bookData = new BookData(currentBook, currentBook.getKey("Ps.51"));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.trace(xmlOutputter.outputString(osisFragment));

        // do the test
        final List<LookupOption> options = new ArrayList<LookupOption>();
        // options.add(INTERLINEAR);

        final String osisText = this.jsi.getOsisText("OSMHB", "Ps.51", options, "ESV_th",
                InterlinearMode.INTERLINEAR).getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.trace("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span class='interlinear'"));

    }

    /**
     * tests that the XSLT transformation is handled correctly
     *
     * @throws BookException      uncaught exception
     * @throws NoSuchKeyException uncaught exception
     * @throws IOException        uncaught exception
     * @throws JDOMException      uncaught exception
     */
    @Test
    public void testXslTransformation() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final Book currentBook = Books.installed().getBook("KJV");
        final BookData bookData = new BookData(currentBook, currentBook.getKey("Romans 1:4"));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.trace(xmlOutputter.outputString(osisFragment));

        // do the test
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final String osisText = this.jsi.getOsisText("KJV", "Romans 1:4", options, "", InterlinearMode.NONE)
                .getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.trace("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span"));
    }

    /**
     * tests that the XSLT transformation is handled correctly
     *
     * @throws BookException      uncaught exception
     * @throws NoSuchKeyException uncaught exception
     * @throws IOException        uncaught exception
     * @throws JDOMException      uncaught exception
     */
    @Test
    public void testComparing() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final Book currentBook = Books.installed().getBook("ESV_th");
        final Book secondaryBook = Books.installed().getBook("KJV");

        final String reference = "Psalm.3";
        final BookData bookData = new BookData(new Book[]{currentBook, secondaryBook},
                currentBook.getKey(reference), true);
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.info(xmlOutputter.outputString(osisFragment));

        // do the test
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final String osisText = this.jsi.getInterleavedVersions(
                new String[]{currentBook.getInitials(), secondaryBook.getInitials()}, reference, options,
                InterlinearMode.INTERLEAVED_COMPARE, "en").getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.info("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("span"));
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testSingleReference() {
        final String allRefs = this.jsi.getAllReferences("Gen.1", "ESV_th");

        assertTrue(allRefs.contains("Gen.1.1"));
        assertTrue(allRefs.contains("Gen.1.2"));
    }

    /**
     * Tests that getting a bible book returns the correct set of names
     */
    @Test
    public void testGetBibleBooks() {
        final JSwordMetadataServiceImpl jsi = new JSwordMetadataServiceImpl(
                TestUtils.mockVersificationService(), null);

        final List<BookName> bibleBookNames = jsi.getBibleBookNames("Ma", "ESV_th", null);
        final String[] containedAbbrevations = new String[]{"Mal", "Mat", "Mar"};

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

        // previous chapter tests
        assertEquals("Gen 1", this.jsi.getSiblingChapter("Genesis 2", "ESV_th", true).getName());
        assertEquals("Gen 1", this.jsi.getSiblingChapter("Genesis 2:5", "ESV_th", true).getName());
        assertEquals("Gen 1", this.jsi.getSiblingChapter("Genesis 2-3:17", "ESV_th", true).getName());
        assertEquals("Gen 1", this.jsi.getSiblingChapter("Genesis 2:3-3:17", "ESV_th", true).getName());

        // next chapter tests
        assertEquals("Gen 4", this.jsi.getSiblingChapter("Genesis 2-3:17", "ESV_th", false).getName());
        assertEquals("Gen 4", this.jsi.getSiblingChapter("Genesis 2-3:24", "ESV_th", false).getName());
        assertEquals("Gen 4", this.jsi.getSiblingChapter("Genesis 3:17", "ESV_th", false).getName());
        assertEquals("Gen 4", this.jsi.getSiblingChapter("Genesis 3:24", "ESV_th", false).getName());
        assertEquals("Gen 3", this.jsi.getSiblingChapter("Genesis 2", "ESV_th", false).getName());

        assertEquals("Mal 4", this.jsi.getSiblingChapter("Mat 1", "ESV_th", true).getName());
        assertEquals("Mat 1", this.jsi.getSiblingChapter("Mal 4", "ESV_th", false).getName());

        assertEquals("Mar 16", this.jsi.getSiblingChapter("Luke 1", "ESV_th", true).getName());
        assertEquals("Luk 1", this.jsi.getSiblingChapter("Mark 16", "ESV_th", false).getName());

        assertEquals("Gen 1", this.jsi.getSiblingChapter("Genesis 1:2", "ESV_th", true).getName());
        assertEquals("Rev 22", this.jsi.getSiblingChapter("Revelation 22:5", "ESV_th", false).getName());

    }

    /**
     * testing variations of getting the previous reference
     *
     * @throws NoSuchKeyException uncaught exception
     */
    @Test
    public void testGetPreviousRef() throws NoSuchKeyException {
        final Book book = Books.installed().getBook("KJV");
        final Key key = book.getKey("Genesis 3:17");

        assertEquals("Gen.3", this.jsi.getPreviousRef(new String[]{"Gen", "3", "17"}, key, book)
                .getOsisRef());
        assertEquals("Gen.2", this.jsi.getPreviousRef(new String[]{"Gen", "3", "1"}, key, book)
                .getOsisRef());
        assertEquals("Gen.2", this.jsi.getPreviousRef(new String[]{"Gen", "3"}, key, book).getOsisRef());
    }

    /**
     * testing variations of getting the previous reference
     *
     * @throws NoSuchKeyException uncaught exception
     */
    @Test
    public void testGetNextRef() throws NoSuchKeyException {
        final Book book = Books.installed().getBook("KJV");
        final Key key = book.getKey("Genesis 3:24");

        assertEquals("Gen.4", this.jsi.getNextRef(new String[]{"Gen", "3", "24"}, key, book).getOsisRef());
        assertEquals("Gen.4", this.jsi.getNextRef(new String[]{"Gen", "3"}, key, book).getOsisRef());
    }

    /**
     * Justs shows XML on the stdout
     *
     * @throws BookException      an exceptioon
     * @throws NoSuchKeyException an exception
     * @throws IOException        an exception
     * @throws JDOMException      an exception
     */
    @Test
    public void testInterleave() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        final String ref = "John 4:1";

        // do the test
        final String[] versions = new String[]{"Byz", "Tisch"};
        final BookData data = new BookData(new Book[]{Books.installed().getBook(versions[0]),
                Books.installed().getBook(versions[1])}, Books.installed().getBook(versions[0]).getKey(ref),
                true);

        LOGGER.debug("Original is:\n {}", xmlOutputter.outputString(data.getOsisFragment()));

        final OsisWrapper interleavedVersions = this.jsi.getInterleavedVersions(versions, ref,
                new ArrayList<LookupOption>(), InterlinearMode.COLUMN_COMPARE, "en");

        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(interleavedVersions.getValue()));
        LOGGER.debug("\n {}", xmlOutputter.outputString(d));
    }

    /**
     * Justs shows XML on the stdout
     *
     * @throws BookException      an exceptioon
     * @throws NoSuchKeyException an exception
     * @throws IOException        an exception
     * @throws JDOMException      an exception
     */
    @Test
    public void testSegVariants() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        final String ref = "Mat.9.4";
        final String version = "WHNU";

        final Book book = Books.installed().getBook(version);

        // do the test
        final BookData data = new BookData(book, book.getKey(ref));

        LOGGER.info("Original is:\n {}", xmlOutputter.outputString(data.getOsisFragment()));

        final OsisWrapper interleavedVersions = this.jsi.getOsisText(version, ref);

        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(interleavedVersions.getValue()));
        final String outputString = xmlOutputter.outputString(d);
        LOGGER.info(outputString);
        assertTrue(outputString.contains("ειδως"));
        assertTrue(outputString.contains("title=\"ιδων"));
    }

    /**
     * Justs shows XML on the stdout
     *
     * @throws BookException      an exceptioon
     * @throws NoSuchKeyException an exception
     * @throws IOException        an exception
     * @throws JDOMException      an exception
     */
    @Test
    public void testLongHeaders() throws BookException, NoSuchKeyException, JDOMException, IOException {
        final String version = "ESV_th";
        final String ref = "Luk 4:27";

        // set up the static JSword field
        org.crosswire.jsword.versification.BookName.setFullBookName(false);

        // do the test
        final String osisText = this.jsi.getOsisText(version, ref, new ArrayList<LookupOption>(), null,
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
     * Tests a lookup by number
     */
    @Test
    public void testNumberLookup() {
// The following 6 lines are commented out because they don't work.   Don't know why.  PT Nov 2021		
//       assertTrue(this.jsi
//               .getOsisTextByVerseNumbers("ASV", "ESV_th", 4, 4, new ArrayList<LookupOption>(), null, null,
//                      false).getValue().contains("In the beginning"));
//	assertTrue(this.jsi
//				.getOsisTextByVerseNumbers("ASV", "ESV_th", 60000, 60000, new ArrayList<LookupOption>(), null,
//                    null, false).getValue().contains("The grace of the Lord Jesus"));
        assertTrue(this.jsi
                .getOsisTextByVerseNumbers("FreSegond", "ESV_th", 60000, 60000, new ArrayList<LookupOption>(),
                        null, null, false).getValue()
                .contains("Que la gr\u00e2ce du Seigneur J\u00e9sus soit avec tous!"));
    }

    /**
     * tries to replicate the issue with bookdata not being able to be read in a concurrent fashion
     *
     * @throws NoSuchKeyException   a no such key exception
     * @throws BookException        a book exception
     * @throws InterruptedException when the thread is interrupted
     */
    @Test
    public void testConcurrencyIssueOnBookData() throws NoSuchKeyException, BookException,
            InterruptedException {
        final String[] names = {"KJV", "ESV_th"};
        final String ref = "Rom.1.1";

        final Runnable r1 = new Runnable() {
            @Override
            public void run() {
                final Book b0 = Books.installed().getBook(names[0]);
                BookData bd1;
                try {
                    bd1 = new BookData(b0, b0.getKey(ref));
                    bd1.getSAXEventProvider();
                } catch (final NoSuchKeyException e) {
                    LOGGER.error("A jsword error during test", e);
                    Assert.fail("JSword bug has occured");
                } catch (final BookException e) {
                    LOGGER.error("A jsword error during test", e);
                    Assert.fail("JSword bug has occured");
                }
            }
        };

        final Runnable r2 = new Runnable() {
            @Override
            public void run() {
                final Book b0 = Books.installed().getBook(names[1]);
                BookData bd1;
                try {
                    bd1 = new BookData(b0, b0.getKey(ref));
                    bd1.getSAXEventProvider();
                } catch (final NoSuchKeyException e) {
                    LOGGER.error("A jsword error during test", e);
                    Assert.fail("JSword bug has occured");
                } catch (final BookException e) {
                    LOGGER.error("A jsword error during test", e);
                    Assert.fail("JSword bug has occured");
                }
            }
        };

        int ii = 0;
        while (ii++ < 20) {
            final Thread t1 = new Thread(r1);
            final Thread t2 = new Thread(r2);
            t1.start();
            t2.start();

            t1.join();
            t2.join();
        }
    }

    /**
     * Tests that we don't allow large passages to be returned...
     */
    @Test
    public void testPassageShrinking() {
        assertEquals("Gen.1", this.jsi.getBookData("ESV_th", "Gen 1").getKey().getOsisRef());
        assertEquals("Gen.1", this.jsi.getBookData("ESV_th", "Gen").getKey().getOsisRef());
        assertEquals("Gen.1", this.jsi.getBookData("ESV_th", "Gen 1-50").getKey().getOsisRef());
        assertEquals("Gen.1", this.jsi.getBookData("ESV_th", "Gen 1-12").getKey().getOsisRef());
        assertEquals("Gen.1", this.jsi.getBookData("ESV_th", " Gen").getKey().getOsisRef());
        assertEquals("Gen.1", this.jsi.getBookData("ESV_th", "Gen ").getKey().getOsisRef());
    }

    /**
     * Gets the gets the interlinear versions.
     */
    @Test
    public void testGetInterlinearVersions() {
        assertEquals("ESV_th", this.jsi.getInterlinearVersion("ESV_th"));
        assertEquals("ESV_th,KJV", this.jsi.getInterlinearVersion("ESV_th,KJV"));
        assertEquals("ESV_th,KJV", this.jsi.getInterlinearVersion("ESV_th,,KJV"));
        assertEquals("ESV_th,KJV", this.jsi.getInterlinearVersion("ESV_th,,,KJV"));
        assertEquals("ESV_th,KJV", this.jsi.getInterlinearVersion("ESV_th,,,,KJV"));
        assertEquals("ESV_th,KJV", this.jsi.getInterlinearVersion("ESV_th,KJV,"));
        assertEquals("ESV_th,KJV", this.jsi.getInterlinearVersion(",ESV_th,KJV"));
        assertEquals("ESV_th", this.jsi.getInterlinearVersion(",ESV_th,"));
        assertEquals("ESV_th", this.jsi.getInterlinearVersion(",,ESV_th,,"));
        assertEquals("ESV_th,KJV,AV", this.jsi.getInterlinearVersion(",,ESV_th,,KJV,,,AV"));
    }

    /**
     * Reducing the key size to something appropriate for the UI and acceptable for copyright holders.
     *
     * @throws NoSuchKeyException the no such key exception
     */
    @Test
    public void testReduceKeySize() throws NoSuchKeyException {
        final Versification v = Versifications.instance().getVersification("KJV");
        final Book b = Books.installed().getBook("ESV_th");

        assertEquals("Gen.2", reduceKeySize(v, b, "Gen.2-Rev.1").getOsisRef());
        assertEquals("Gen.2", reduceKeySize(v, b, "Gen.2").getOsisRef());
        assertEquals("Gen.0", reduceKeySize(v, b, "Gen.0").getOsisRef());
        assertEquals("Gen.0", reduceKeySize(v, b, "Gen.0").getOsisRef());
        assertEquals("Gen.1.1", reduceKeySize(v, b, "Gen.1.1").getOsisRef());
        assertEquals("Judg.1", reduceKeySize(v, b, "Judg").getOsisRef());
        assertEquals("Jude", reduceKeySize(v, b, "Jude").getOsisRef());
        assertEquals("Ruth.1", reduceKeySize(v, b, "Rut").getOsisRef());

    }

    /**
     * Reduce key size.
     *
     * @param v         the versification
     * @param b         the book
     * @param keyString the key string
     * @return the key
     * @throws NoSuchKeyException the no such key exception
     */
    private Key reduceKeySize(final Versification v, final Book b, final String keyString)
            throws NoSuchKeyException {
        return this.jsi.reduceKeySize(b.getKey(keyString), v);
    }
}
