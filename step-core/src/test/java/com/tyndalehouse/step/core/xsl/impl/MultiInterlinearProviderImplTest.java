package com.tyndalehouse.step.core.xsl.impl;

import org.junit.Test;

import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static com.tyndalehouse.step.core.xsl.impl.MultiInterlinearProviderImpl.VERSION_SEPARATOR;
import static org.junit.Assert.assertArrayEquals;

/**
 * Tests the version splitters
 */
public class MultiInterlinearProviderImplTest {
    /**
     * test the versions splitter characters
     */
    @Test
    public void testVersionSplitterRegex() {
        assertArrayEquals(new String[] { "a" }, split("a", VERSION_SEPARATOR));
        assertArrayEquals(new String[] { "a", "b" }, split("a,b", VERSION_SEPARATOR));
        assertArrayEquals(new String[] { "a", "b" }, split("a, b", VERSION_SEPARATOR));
        assertArrayEquals(new String[] { "a", "", "b" }, split("a,,b", VERSION_SEPARATOR));
    }
}
