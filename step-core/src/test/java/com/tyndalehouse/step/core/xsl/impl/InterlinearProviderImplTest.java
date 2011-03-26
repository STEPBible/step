package com.tyndalehouse.step.core.xsl.impl;

import static org.junit.Assert.assertEquals;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.junit.Test;

/**
 * A simple test class to test to the provider
 * 
 * @author Chris
 * 
 */
public class InterlinearProviderImplTest {
    /**
     * this checks that when keyed with strong, morph and verse number, we can retrieve the word. We should be
     * able to retrieve by (strong,morph), regardless of verse number. We should also be able to retrieve by
     * (strong,verse number)
     * 
     * @throws InvocationTargetException reflection exception which should fail the test
     * @throws IllegalAccessException reflection exception which should fail the test
     * @throws NoSuchMethodException reflect exception which should fail the test
     */
    @Test
    public void testInterlinearStrongMorphBased() throws IllegalAccessException, InvocationTargetException,
            NoSuchMethodException {
        final InterlinearProviderImpl interlinear = new InterlinearProviderImpl();

        // NOTE: because we don't want to expose a method called during initialisation as non-private (could
        // break
        // the initialisation, of the provider, we use reflection to open up its access for testing purposes!
        final Method method = interlinear.getClass().getDeclaredMethod("addTextualInfo", String.class,
                String.class, String.class, String.class);
        method.setAccessible(true);

        // add a word based on a strong,morph
        method.invoke(interlinear, "v1", "strong", "morph", "word");

        assertEquals(interlinear.getWord("v1", "strong", "morph"), "word");
        assertEquals(interlinear.getWord("x", "strong", "morph"), "word");
        assertEquals(interlinear.getWord("x", "strong", ""), "word");
        assertEquals(interlinear.getWord("x", "strong", null), "word");
        assertEquals(interlinear.getWord("x", "strong"), "word");
    }
}
