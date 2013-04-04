/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.xsl.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;

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
