package com.tyndalehouse.step.tools.esv;

import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.io.StringReader;

import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.index.lucene.analysis.StrongsNumberAnalyzer;
import org.crosswire.jsword.index.lucene.analysis.StrongsNumberFilter;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The Class StrongNumberFilterTest.
 */
public class StrongNumberFilterTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(StrongNumberFilterTest.class);

    @Test
    public void testNumberFilter() throws IOException {
        final TokenStream stream = mock(TokenStream.class);

        final StrongsNumberAnalyzer analyzer = new StrongsNumberAnalyzer(Books.installed().getBook("KJV"));

        final TokenStream ts = analyzer
                .reusableTokenStream(
                        "strong",
                        new StringReader(
                                "G5599 G453 G1052 G5101 G940 G5209 G3982 G3361 G3982 G3588 G225 G2596 G3739 G3788 G2424 G5547 G4270 G4717 G1722 G5213"));
        final StrongsNumberFilter strongsNumberFilter = new StrongsNumberFilter(Books.installed().getBook(
                "KJV"), ts);

        while (strongsNumberFilter.incrementToken()) {
            final TermAttribute attribute = strongsNumberFilter.getAttribute(TermAttribute.class);
            LOGGER.trace("Incrementing: {}", attribute.term());
        }
    }
}
