package com.tyndalehouse.step.core.xsl.impl;

import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.Books;
import org.junit.Test;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * A simple test class to test to the provider
 */
public class InterleavingProviderImplTest {

    /**
     * check that comparing adds the right set of versions
     */
    @Test
    public void testInterleavingCompare() {
        final JSwordVersificationService versification = mock(JSwordVersificationService.class);

        when(versification.getBookFromVersion(anyString())).thenAnswer(new Answer<Book>() {

            @Override
            public Book answer(final InvocationOnMock invocation) {
                return Books.installed().getBook((String) invocation.getArguments()[0]);
            }
        });

        final InterleavingProviderImpl interleavingProviderImpl = new InterleavingProviderImpl(versification,
                new String[] { "KJV", "ESV_th", "NETfree", "Byz", "Tisch", "YLT", "ASV", "Montgomery",
                        "FreCrampon" }, true);

        final String[] expected = new String[] { "KJV", "ESV_th", "KJV", "NETfree", "KJV", "YLT", "KJV", "ASV",
                "KJV", "Montgomery", };
        assertEqualVersions(expected, interleavingProviderImpl);
    }

    /**
     * Tests that the main version obliterates the presence of the same version within the list.
     */
    @Test
    public void testInterleavingCompareWithSameVersion() {
        final JSwordVersificationService versification = mock(JSwordVersificationService.class);

        when(versification.getBookFromVersion(anyString())).thenAnswer(new Answer<Book>() {

            @Override
            public Book answer(final InvocationOnMock invocation) {
                return Books.installed().getBook((String) invocation.getArguments()[0]);
            }
        });

        final InterleavingProviderImpl interleavingProviderImpl = new InterleavingProviderImpl(versification,
                new String[] { "KJV", "ESV_th", "KJV", "ESV_th"}, true);

        assertEqualVersions(new String[] { "KJV", "ESV_th", "KJV", "ESV_th"}, interleavingProviderImpl);
    }



    /**
     * check that comparing adds the right set of versions
     */
    @Test
    public void testInterleavingNoCompare() {
        final InterleavingProviderImpl interleavingProviderImpl = new InterleavingProviderImpl(null,
                new String[] { "ESV_th", "SBLGNT" }, false);

        final String[] expected = new String[] { "ESV_th", "SBLGNT" };
        assertEqualVersions(expected, interleavingProviderImpl);
    }

    /**
     *
     * @param expected the expected versions
     * @param interleavingProviderImpl the provider of versions
     */
    private void assertEqualVersions(final String[] expected, final InterleavingProviderImpl interleavingProviderImpl) {
        for (int ii = 0; ii < expected.length; ii++) {
            assertEquals(expected[ii], interleavingProviderImpl.getVersions()[ii]);
        }
    }
}
