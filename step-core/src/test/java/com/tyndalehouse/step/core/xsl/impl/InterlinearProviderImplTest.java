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
