package com.tyndalehouse.step.core.service.jsword.impl;

import org.junit.Test;

/**
 * Tests the various searches
 * 
 * @author chrisburrell
 */
public class JSwordSearchServiceImplTest {
    @Test
    public void testMusings() {
        final JSwordSearchServiceImpl search = new JSwordSearchServiceImpl(
                new JSwordVersificationServiceImpl());

        search.search("KJV", "strong:g0016");
    }
}
