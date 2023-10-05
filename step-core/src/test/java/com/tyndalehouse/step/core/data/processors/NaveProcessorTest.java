package com.tyndalehouse.step.core.data.processors;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class NaveProcessorTest {
    @Test
    public void testStripAlternatives()  {
        assertEquals("Some text is here", new NaveProcessor(null).stripAlternatives("Some text [with an alternative] is here"));
    }
}
