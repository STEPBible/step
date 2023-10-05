package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.entities.impl.EntityManagerImpl;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

/**
 * Tests {@link VocabularyServiceImpl}
 */
public class VocabularyServiceImplTest {
    /**
     * Test key extraction
     */
    @Test
    public void testKeyExtraction() {
        final VocabularyServiceImpl vocab = new VocabularyServiceImpl(mock(EntityManagerImpl.class));
        assertEquals("G0016", vocab.getKeys("strong:G16")[0]);
        assertEquals("G0016", vocab.getKeys("strong:G16,strong:G019")[0]);

    }

    /**
     * Test multiple key extraction
     */
    @Test
    public void testMultipleKeyExtraction() {
        final VocabularyServiceImpl vocab = new VocabularyServiceImpl(mock(EntityManagerImpl.class));
        final String[] keys = vocab.getKeys("strong:G16,strong:G09");
        assertEquals("G0016", keys[0]);
        assertEquals("G0009", keys[1]);

    }

}
