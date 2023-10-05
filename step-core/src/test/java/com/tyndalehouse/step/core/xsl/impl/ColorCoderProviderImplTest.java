package com.tyndalehouse.step.core.xsl.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

/**
 * The color coder tests
 */
@RunWith(MockitoJUnitRunner.class)
public class ColorCoderProviderImplTest {
    @Mock
    private EntityManager mockManager;
    @Mock
    private EntityIndexReader mockReader;
    @Mock
    private EntityDoc mockDoc;

    /**
     * Sets up the mocks
     */
    @Before
    public void setUp() {
        when(this.mockManager.getReader("morphology")).thenReturn(this.mockReader);
        when(this.mockReader.searchExactTermBySingleField("code", 1, "abc")).thenReturn(
                new EntityDoc[] { this.mockDoc });

        when(this.mockReader.searchExactTermBySingleField("code", 1, "def")).thenReturn(new EntityDoc[] {});
        when(this.mockDoc.get("cssClasses")).thenReturn("css");
    }

    /**
     * Test color coder.
     */
    @Test
    public void testColorCoder() {
        final String colorClass = new ColorCoderProviderImpl(this.mockManager).getColorClass("robinson:abc");
        assertEquals("css", colorClass);
    }

    /**
     * Test color coder.
     */
    @Test
    public void testColorCoderMultiple() {
        final String colorClass = new ColorCoderProviderImpl(this.mockManager)
                .getColorClass("robinson:def robinson:abc");
        assertEquals("css", colorClass);
    }

    /**
     * Test color coder.
     */
    @Test
    public void testColorCoderNoHits() {
        final String colorClass = new ColorCoderProviderImpl(this.mockManager).getColorClass("robinson:def");
        assertEquals("", colorClass);
    }

    /**
     * Test color coder.
     */
    @Test
    public void testColorCoderNoMultipleHits() {
        final String colorClass = new ColorCoderProviderImpl(this.mockManager)
                .getColorClass("robinson:def robinson:def");
        assertEquals("", colorClass);
    }
}