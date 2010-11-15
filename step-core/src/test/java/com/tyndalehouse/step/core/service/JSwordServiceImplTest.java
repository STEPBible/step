package com.tyndalehouse.step.core.service;

import static com.tyndalehouse.step.core.models.LookupOption.INTERLINEAR;

import java.io.StringReader;
import java.util.ArrayList;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.Books;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;
import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.impl.JSwordServiceImpl;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
public class JSwordServiceImplTest {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * tests what happens when we select interlinear
     * 
     * @throws Exception an uncaught exception
     */
    @Test
    public void testInterlinearTransformation() throws Exception {
        final Book currentBook = Books.installed().getBook("esv");
        final BookData bookData = new BookData(currentBook, currentBook.getKey("Romans 1"));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        this.logger.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordServiceImpl jsi = new JSwordServiceImpl();
        final ArrayList<LookupOption> options = new ArrayList<LookupOption>();
        options.add(INTERLINEAR);

        final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options, "");
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        this.logger.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("<span>"));

    }

    /**
     * tests that the XSLT transformation is handled correctly
     * 
     * @throws Exception uncaught exception
     */
    @Test
    public void testXslTransformation() throws Exception {
        final Book currentBook = Books.installed().getBook("KJV");
        final BookData bookData = new BookData(currentBook, currentBook.getKey("Romans 1:4"));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        this.logger.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordServiceImpl jsi = new JSwordServiceImpl();
        final ArrayList<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.STRONG_NUMBERS);

        final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options, "");
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        this.logger.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("<span>"));
    }
}
