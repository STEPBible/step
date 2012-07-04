package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;

import java.util.List;

import org.junit.Test;

/**
 * Tests {@link VocabularyServiceImpl}
 * 
 * @author chrisburrell
 * 
 */
public class VocabularyServiceImplTest {
    /**
     * Test key extraction
     */
    @Test
    public void testKeyExtraction() {
        final VocabularyServiceImpl vocab = new VocabularyServiceImpl(null);
        assertEquals("G0016", vocab.getKeys("strong:G16").get(0));

        assertEquals("G0016", vocab.getKeys("strong:G16,strong:G019").get(0));

    }

    /**
     * Test multiple key extraction
     */
    @Test
    public void testMultipleKeyExtraction() {
        final VocabularyServiceImpl vocab = new VocabularyServiceImpl(null);
        final List<String> keys = vocab.getKeys("strong:G16,strong:G09");
        assertEquals("G0016", keys.get(0));
        assertEquals("G0009", keys.get(1));

    }

}
