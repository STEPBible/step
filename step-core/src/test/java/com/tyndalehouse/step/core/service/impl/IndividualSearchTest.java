package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * tests for {@link IndividualSearch}
 * 
 * @author chrisburrell
 * 
 */
public class IndividualSearchTest {
    /**
     * tests versions are matched and split correctly
     */
    @Test
    public void testMultiVersion() {
        final IndividualSearch s = new IndividualSearch("t=blah", new String[] {"ESV", "KJV","ASV"});

        final String[] versions = s.getVersions();
        assertEquals(3, versions.length);
        assertEquals("ESV", versions[0]);
        assertEquals("KJV", versions[1]);
        assertEquals("ASV", versions[2]);
        assertEquals(SearchType.TEXT, s.getType());
        assertEquals("blah", s.getQuery());
    }

    /**
     * tests versions are matched and split correctly
     */
    @Test
    public void testIndividualVersion() {
        final IndividualSearch s = new IndividualSearch("t=blah", new String[] {"ESV"});

        final String[] versions = s.getVersions();
        assertEquals("ESV", versions[0]);
        assertEquals(1, versions.length);
        assertEquals(SearchType.TEXT, s.getType());
        assertEquals("blah", s.getQuery());
    }

    /**
     * Tests the extraction of a original word search with a sub-range
     */
    @Test
    public void testSubRangeText() {
        final IndividualSearch s = new IndividualSearch("om=+[Gen-Rev] {John} good", new String[] {"ESV"});

        assertEquals(SearchType.ORIGINAL_MEANING, s.getType());
        assertEquals("good", s.getQuery());
        assertEquals("+[Gen-Rev]", s.getMainRange());
        assertEquals("John", s.getSubRange());
    }
}
