package com.tyndalehouse.step.jsp;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class StepFunctionsTest {

    @Test
    public void testMarkTransliteration() throws Exception {
        assertEquals("something <span class=\"transliteration\">a.b.c</span> here", StepFunctions.markTransliteration("something a.b.c here"));
    }
}