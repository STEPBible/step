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
package com.tyndalehouse.step.tools.esv;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/**
 * The Class EsvXmlEnhancerTest.
 */
public class EsvXmlEnhancerTest {
    @Test
    public void testMultipleStrongs() {
        final EsvXmlEnhancer esvXmlEnhancer = new EsvXmlEnhancer(null, null);
        Tagging t = new Tagging();
        t.setRawStrongs("<07651> <03967> <08141> <07657> <07651>");
        esvXmlEnhancer.splitStrong(t);

        assertEquals("07651 03967 08141 07657 07651", t.getStrongs());
    }

    @Test
    public void testMultipleStrongsRemoveSuffix() {
        final EsvXmlEnhancer esvXmlEnhancer = new EsvXmlEnhancer(null, null);
        Tagging t = new Tagging();
        t.setRawStrongs("<08337a> <03967> <0505> <07969> <0505> <02568> <03967> <02572>");
        esvXmlEnhancer.splitStrong(t);

        assertEquals("08337 03967 0505 07969 0505 02568 03967 02572", t.getStrongs());
    }

    @Test
    public void testNthOccurrence() {
        final EsvXmlEnhancer esvXmlEnhancer = new EsvXmlEnhancer(null, null);
        assertEquals(3, esvXmlEnhancer.findWordPosition("the dog", 0));
        assertEquals(10, esvXmlEnhancer.findWordPosition("the dog is in the garden", 2));
        assertEquals(11, esvXmlEnhancer.findWordPosition(" the dog is in the garden", 2));
        assertEquals(13, esvXmlEnhancer.findWordPosition("   the dog is in the garden", 2));
        assertEquals(13, esvXmlEnhancer.findWordPosition("-_ the dog is in the garden", 2));
        assertEquals(13, esvXmlEnhancer.findWordPosition("-_ the dog-is in the garden", 2));
        assertEquals(14, esvXmlEnhancer.findWordPosition("-_ the dog-,is in the garden", 2));
        assertEquals(6, esvXmlEnhancer.findWordPosition(" them, saying, ", 0));
    }

    @Test
    public void testEqualsIgnorePunctuationAndCase() {
        final EsvXmlEnhancer esvXmlEnhancer = new EsvXmlEnhancer(null, null);
        assertTrue(esvXmlEnhancer.equalsIngorePunctuationAndCase("the dog", "the dog"));
        assertTrue(esvXmlEnhancer.equalsIngorePunctuationAndCase("the,dog", "the dog"));
        assertTrue(esvXmlEnhancer.equalsIngorePunctuationAndCase("the dog", "the' dog"));
        assertTrue(esvXmlEnhancer.equalsIngorePunctuationAndCase("the Dog", "tHe dog"));
        assertFalse(esvXmlEnhancer.equalsIngorePunctuationAndCase("the Dog", "thedog"));
        assertFalse(esvXmlEnhancer.equalsIngorePunctuationAndCase("the,Dog", "thedog"));
        assertFalse(esvXmlEnhancer.equalsIngorePunctuationAndCase("the Dog ", "thedog "));
        assertFalse(esvXmlEnhancer.equalsIngorePunctuationAndCase("the Dog a", "the Dog i"));
        assertTrue(esvXmlEnhancer.equalsIngorePunctuationAndCase("you do", "you, do"));
    }

    @Test
    public void testGetLengthInDomWord() {
        final EsvXmlEnhancer esvXmlEnhancer = new EsvXmlEnhancer(null, null);
        assertEquals(7, esvXmlEnhancer.getLengthInDomWord("the dog", "the dog"));
        assertEquals(8, esvXmlEnhancer.getLengthInDomWord("the, dog", "the dog"));
        assertEquals(6, esvXmlEnhancer.getLengthInDomWord("wife's", "wife s"));
        assertEquals(26, esvXmlEnhancer.getLengthInDomWord(
                "you, that you have brought, on me and my kingdom a great sin as she tells you for",
                "you that you have brought"));
    }
}
