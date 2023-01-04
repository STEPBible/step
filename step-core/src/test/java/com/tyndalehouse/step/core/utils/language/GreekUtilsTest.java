package com.tyndalehouse.step.core.utils.language;

import static com.tyndalehouse.step.core.utils.language.GreekUtils.unAccent;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.Books;
import org.jdom2.Element;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.junit.Test;

/**
 * Greek utils tests
 */
public class GreekUtilsTest {
    /** test the regex parses and removes the appropriate characters */
    @Test
    public void testUnaccentRegexParses() {
        final String unAccent = unAccent("Some word\u2e00is\u2e02 here\u0308");
        assertEquals("Some wordis here", unAccent);

    }

    /**
     * Tests that combining characters get removed in comparisons
     * 
     * @throws Exception an uncaught exception
     */
    @Test
    public void testDodgyUnicodeGreekCombiningCharacters() throws Exception {
        final String[] versions = new String[] { "SBLGNT", "TR" };
        final String ref = "Mar 3:3";
        final Book currentBook = Books.installed().getBook(versions[0]);

        final Book[] books = new Book[versions.length];
        for (int ii = 0; ii < versions.length; ii++) {
            books[ii] = Books.installed().getBook(versions[ii]);
        }

        final BookData bookData = new BookData(books, currentBook.getKey(ref), false);
        final Element osisFragment = bookData.getOsisFragment();

        final XMLOutputter xmlOutputter = new XMLOutputter(Format.getRawFormat());
        final String unAccented = xmlOutputter.outputString(osisFragment);
        for (int ii = 0; ii < unAccented.length(); ii++) {
            assertTrue(unAccented.charAt(ii) < 0xe200);
        }
    }
}
