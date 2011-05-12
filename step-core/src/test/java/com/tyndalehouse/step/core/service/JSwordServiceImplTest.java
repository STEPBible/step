package com.tyndalehouse.step.core.service;

import static com.tyndalehouse.step.core.models.LookupOption.INTERLINEAR;
import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
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
import com.tyndalehouse.step.core.service.impl.JSwordServiceImpl;

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
        final JSwordServiceImpl jsi = new JSwordServiceImpl(null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(INTERLINEAR);

        final String osisText = jsi.getOsisText("KJV", "Romans 1:1-3", options, "KJV");
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
        final JSwordServiceImpl jsi = new JSwordServiceImpl(null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.STRONG_NUMBERS);

        final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options, "");
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
        final JSwordServiceImpl jsi = new JSwordServiceImpl(null);
        final List<ScriptureReference> refs = jsi.getPassageReferences("Gen.1.1");

        assertEquals(refs.size(), 1);
        assertEquals(1, refs.get(0).getStartVerseId());
        assertEquals(1, refs.get(0).getEndVerseId());
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testMultipleReference() {
        final JSwordServiceImpl jsi = new JSwordServiceImpl(null);
        final List<ScriptureReference> refs = jsi.getPassageReferences("Gen.1.1;Gen.1.3");

        assertEquals(2, refs.size());
        assertEquals(1, refs.get(0).getStartVerseId());
        assertEquals(1, refs.get(0).getEndVerseId());
        assertEquals(3, refs.get(1).getStartVerseId());
        assertEquals(3, refs.get(1).getEndVerseId());
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testMultiplePassages() {
        final JSwordServiceImpl jsi = new JSwordServiceImpl(null);
        final List<ScriptureReference> refs = jsi.getPassageReferences("Gen.1.1-2;Gen.1.4-5");

        assertEquals(refs.size(), 2);
        assertEquals(1, refs.get(0).getStartVerseId());
        assertEquals(2, refs.get(0).getEndVerseId());
        assertEquals(4, refs.get(1).getStartVerseId());
        assertEquals(5, refs.get(1).getEndVerseId());
    }

    /**
     * Tests an example from the geo file
     */
    @Test
    public void testGeoPassageExample() {
        final JSwordServiceImpl jsi = new JSwordServiceImpl(null);

        // TODO change spaces between 1 and Kgs! This doesn't seem to work...

        // final List<ScriptureReference> refs = getPassageReferences(target, "Josh 12:24; Sng 6:4");
        final List<ScriptureReference> refs = jsi.getPassageReferences("Song 6:4");
        assertEquals(refs.size(), 1);
    }

    /**
     * tries to replicate the issue with bookdata not being able to be read in a concurrent fashion
     * 
     * @throws NoSuchKeyException a no such key exception
     * @throws BookException a book exception
     * @throws InterruptedException when the thread is interrupted
     */
    // TODO: currently disabled
    @Test
    public void testConcurrencyIssueOnBookData() throws NoSuchKeyException, BookException,
            InterruptedException {
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
    }
}
