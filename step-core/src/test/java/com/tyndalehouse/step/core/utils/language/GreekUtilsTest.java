package com.tyndalehouse.step.core.utils.language;

import static com.tyndalehouse.step.core.utils.language.GreekUtils.unAccent;
import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * Greek utils tests
 * 
 * @author chrisburrell
 * 
 */
public class GreekUtilsTest {
    /** test the regex parses and removes the appropriate characters */
    @Test
    public void testUnaccentRegexParses() {
        assertEquals("Some wordis here", unAccent("Some word\u2e00is here\u0308"));
    }
}
