package com.tyndalehouse.step.tools.osis;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.basic.AbstractPassageBook;
import org.crosswire.jsword.book.sword.ConfigEntryType;
import org.crosswire.jsword.book.sword.SwordBookMetaData;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.VerseKey;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.input.JDOMParseException;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.utils.TestUtils;

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
        final String version = "ESV-THE";
        final String ref = "Ps.1.1";
        boolean format = true;

        final Book currentBook = Books.installed().getBook(version);

        final BookData bookData = new BookData(currentBook, currentBook.getKey(ref));
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(format ? Format.getPrettyFormat() : Format.getRawFormat());
        LOGGER.debug(xmlOutputter.outputString(osisFragment));

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                TestUtils.mockVersificationService(), null, null, null, TestUtils.mockVersionResolver(), null);
        final List<LookupOption> options = new ArrayList<LookupOption>();

//        options.add(LookupOption.DIVIDE_HEBREW);
        options.add(LookupOption.NOTES);
        options.add(LookupOption.HEADINGS);
        options.add(LookupOption.GREEK_ACCENTS);

        final String osisText = jsi.getOsisText(version, ref, options, "ESV-THE", InterlinearMode.NONE).getValue();
        final SAXBuilder sb = new SAXBuilder();

        try {
            final Document d = sb.build(new StringReader(osisText));

            LOGGER.debug("Transformed is:\n {}", xmlOutputter.outputString(d));
            xmlOutputter.outputString(d);
        } catch (final JDOMParseException e) {
            LOGGER.debug("Transformed is:\n [{}]", osisText);
        }
//        InterleavedOsisReader.outputUnicode(osisText);
        LOGGER.debug("Double whitespace: {}", osisText.contains("  "));
    }
}
