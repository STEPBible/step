package com.tyndalehouse.step.core.service.impl.suggestion;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ReferenceSuggestionServiceImplTest {
    private ReferenceSuggestionServiceImpl service = new ReferenceSuggestionServiceImpl(null, null);

    @Test
    public void testPrepInput() throws Exception {
        assertEquals("", service.prepInput(""));
        assertEquals("a", service.prepInput("a"));
        assertEquals("Gen", service.prepInput("Gen"));
        assertEquals("Gen.1", service.prepInput("Gen.1"));
        assertEquals("Gen.1:1", service.prepInput("Gen.1:1"));
        assertEquals("Gen 1-2", service.prepInput("Gen 1-2"));
        assertEquals("Laf 1:1", service.prepInput("Laf 1:1"));
        assertEquals("Gen 1:1ff", service.prepInput("Gen 1:1-"));
        assertEquals("Gen 1:1ff", service.prepInput("Gen 1:1f"));
        assertEquals("Gen 1:1ff", service.prepInput("Gen 1:1-f"));
    }
}