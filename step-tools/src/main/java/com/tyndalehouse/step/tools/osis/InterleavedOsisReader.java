package com.tyndalehouse.step.tools.osis;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.Books;
import org.jdom2.Document;
import org.jdom2.Element;
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
public class InterleavedOsisReader {
    private static final Logger LOGGER = LoggerFactory.getLogger(InterleavedOsisReader.class);

    /**
     * Just shows XML on the stdout
     * 
     * @param args not used
     * @throws Exception any kind of exception
     */
    public static void main(final String[] args) throws Exception {
        final String[] versions = new String[] { "OSMHB", "ESV_th" };
        final String ref = "Mic.5";
        final boolean unicodeBreakDown = false;
        final boolean compare = true;
        final InterlinearMode interlinearMode = InterlinearMode.INTERLEAVED;
        boolean format = false;
        
        final Format prettyFormat = format ? Format.getPrettyFormat() : Format.getRawFormat();
        final Book currentBook = Books.installed().getBook(versions[0]);
        final Book[] books = new Book[versions.length];
        for (int ii = 0; ii < versions.length; ii++) {
            books[ii] = Books.installed().getBook(versions[ii]);
        }

        final BookData bookData = new BookData(books, currentBook.getKey(ref), compare);
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(prettyFormat);
        final String inputString = xmlOutputter.outputString(osisFragment);
        LOGGER.debug(inputString);

        if (unicodeBreakDown) {
            outputUnicode(inputString);
        }

        // do the test
        final JSwordPassageServiceImpl jsi = new JSwordPassageServiceImpl(
                TestUtils.mockVersificationService(), null, null, null, TestUtils.mockVersionResolver(), null);
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.CHAPTER_BOOK_VERSE_NUMBER);
//        options.add(LookupOption.HEADINGS_ONLY);
//        options.add(LookupOption.HEADINGS);
//        options.add(LookupOption.CHAPTER_BOOK_VERSE_NUMBER);
        
        final String osisText = jsi.getInterleavedVersions(versions, ref, options,
                interlinearMode, "en").getValue();
        LOGGER.debug(osisText);
        final SAXBuilder sb = new SAXBuilder();
//        final Document d = sb.build(new StringReader(osisText));

//        final String output = xmlOutputter.outputString(d);
//        LOGGER.debug("Transformed is:\n {}", output);

        if (unicodeBreakDown) {
            outputUnicode(osisText);
        }
    }

    public static void outputUnicode(final String s) {
        StringBuilder chars = new StringBuilder(16);
        StringBuilder intVals = new StringBuilder(16);

        for (int ii = 0; ii < s.length(); ii++) {

            final char c = s.charAt(ii);
            if (c == ' ') {
                LOGGER.debug("[{}] => [{}]", chars.toString(), intVals.toString());
                chars = new StringBuilder(16);
                intVals = new StringBuilder(16);
            } else {
                chars.append(c);
                intVals.append((int) c);
                intVals.append(", ");
            }
        }
    }
}
