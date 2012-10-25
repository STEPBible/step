package com.tyndalehouse.step.tools.osis;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;

/**
 * Reads an osis ref in a module
 * 
 * @author chrisburrell
 * 
 */
public class OsisReader {
    private static final Logger LOGGER = LoggerFactory.getLogger(OsisReader.class);

    /**
     * Just shows XML on the stdout
     * 
     * @param args not used
     * @throws Exception any kind of exception
     */
    public static void main(final String[] args) throws Exception {
        final String version = "Alford";
        final String ref = "Matt.1.0";
        final Book currentBook = Books.installed().getBook(version);
        final BookData bookData = new BookData(currentBook, currentBook.getKey(ref));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getPrettyFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                new JSwordVersificationServiceImpl(), null, null, null);
        final List<LookupOption> options = new ArrayList<LookupOption>();

        final String osisText = jsi.getOsisText(version, ref, options, null, InterlinearMode.NONE).getValue();
        final SAXBuilder sb = new SAXBuilder();
        final Document d = sb.build(new StringReader(osisText));

        LOGGER.debug("Transformed is:\n {}", xmlOutputter.outputString(d));
    }
}
