package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.PassageReferenceUtils.getPassageReferences;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

import java.util.List;

import org.junit.Test;

import com.tyndalehouse.step.core.data.entities.ScriptureTarget;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;

/**
 * testing the passage reference utils class
 * 
 * @author Chris
 * 
 */
public class PassageReferenceUtilsTest {
    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testSingleReference() {
        final ScriptureTarget target = mock(ScriptureTarget.class);
        final List<ScriptureReference> refs = getPassageReferences(target, "Gen.1.1");

        assertEquals(refs.size(), 1);
        assertEquals(1, refs.get(0).getStartVerseId());
        assertEquals(1, refs.get(0).getEndVerseId());
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testMultipleReference() {
        final ScriptureTarget target = mock(ScriptureTarget.class);
        final List<ScriptureReference> refs = getPassageReferences(target, "Gen.1.1;Gen.1.3");

        assertEquals(2, refs.size());
        assertEquals(1, refs.get(0).getStartVerseId());
        assertEquals(1, refs.get(0).getEndVerseId());
        assertEquals(3, refs.get(1).getStartVerseId());
        assertEquals(3, refs.get(1).getEndVerseId());
    }

    /**
     * Tests the resolving of passage references
     */
    @Test
    public void testMultiplePassages() {
        final ScriptureTarget target = mock(ScriptureTarget.class);
        final List<ScriptureReference> refs = getPassageReferences(target, "Gen.1.1-2;Gen.1.4-5");

        assertEquals(refs.size(), 2);
        assertEquals(1, refs.get(0).getStartVerseId());
        assertEquals(2, refs.get(0).getEndVerseId());
        assertEquals(4, refs.get(1).getStartVerseId());
        assertEquals(5, refs.get(1).getEndVerseId());
    }

}
