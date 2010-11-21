package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.getAnyKey;
import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class StringConversionUtilsTest {
    @Test
    public void testGetAnyKey() {
        assertEquals(getAnyKey("strong:H1"), "1");
        assertEquals(getAnyKey("strong:H123"), "123");
        assertEquals(getAnyKey("strong:G1"), "1");
        assertEquals(getAnyKey("strong:G123"), "123");
        assertEquals(getAnyKey("G123"), "123");
        assertEquals(getAnyKey("H123"), "123");
        assertEquals(getAnyKey("123"), "123");
        assertEquals(getAnyKey("strong:G00123"), "123");
    }
}
