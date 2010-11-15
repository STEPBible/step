package com.tyndalehouse.step.core.xsl.impl;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class InterlinearProviderImplTest {
    /**
     * this checks that when keyed with strong, morph and verse number, we can retrieve the word. We should be able to
     * retrieve by (strong,morph), regardless of verse number. We should also be able to retrieve by (strong,verse
     * number)
     */
    @Test
    public void testInterlinearStrongMorphBased() {
        final InterlinearProviderImpl interlinear = new InterlinearProviderImpl();

        // add a word based on a strong,morph
        interlinear.addTextualInfo("v1", "strong", "morph", "word");

        assertEquals(interlinear.getWord("v1", "strong", "morph"), "word");
        assertEquals(interlinear.getWord("x", "strong", "morph"), "word");
        assertEquals(interlinear.getWord("x", "strong", ""), "word");
        assertEquals(interlinear.getWord("x", "strong", null), "word");
        assertEquals(interlinear.getWord("x", "strong"), "word");
    }
}
