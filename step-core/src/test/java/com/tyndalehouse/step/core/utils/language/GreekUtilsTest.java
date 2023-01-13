package com.tyndalehouse.step.core.utils.language;

import org.junit.Test;

import static com.tyndalehouse.step.core.utils.language.GreekUtils.unAccent;
import static org.junit.Assert.assertEquals;

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
}
