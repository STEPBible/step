package com.tyndalehouse.step.core.utils;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * Tests the {@link StringUtils} class
 */
public class StringUtilsTest {
    /** test normal split condition */
    @Test
    public void testSplit() {
        final String[] split = StringUtils.split("hello,hi", ",");
        assertEquals("hello", split[0]);
        assertEquals("hi", split[1]);
    }

    /** checks that tokens are preserved when splitting */
    @Test
    public void testPreservesTokens() {
        final String[] split = StringUtils.split("hello,,hi", ",");
        assertEquals("hello", split[0]);
        assertEquals("", split[1]);
        assertEquals("hi", split[2]);
    }

    /** checks that tokens are preserved when splitting */
    @Test
    public void testRegexTokens() {
        final String[] split = StringUtils.split("hello;hi; howdy ;cheerio", "[ ]?;[ ]?");
        assertEquals("hello", split[0]);
        assertEquals("hi", split[1]);
        assertEquals("howdy", split[2]);
        assertEquals("cheerio", split[3]);
    }

}
