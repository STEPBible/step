package com.tyndalehouse.step.core;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

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

        final String osisText = jsi.getOsisText("KJV", "Romans 1:4", options);
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        this.logger.debug("\n {}", xmlOutputter.outputString(d));
        Assert.assertTrue(osisText.contains("<span>"));
    }

    private StringBuffer getXml(final StringBuffer sb, final Element osisFragment) {
        final List<Element> children = osisFragment.getChildren();
        for (final Element e : children) {
            if (e.getChildren().size() == 0) {
                return sb.append(e.getText());
            }
            getXml(sb, e);
        }

        return sb;
    }
}
