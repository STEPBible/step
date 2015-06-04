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
package com.tyndalehouse.step.core.service.jsword.impl;

import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.utils.TestUtils;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.system.Versifications;
import org.junit.Test;

import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

/**
 * The Class JSwordAnalysisServiceImplTest.
 */
public class JSwordAnalysisServiceImplTest {

    /**
     * Test pattern is correct.
     */
    @Test
    public void testPatternIsCorrect() {
        Pattern.compile(JSwordAnalysisServiceImpl.WORD_SPLIT);
    }

    @Test
    public void testExpand() throws NoSuchKeyException {
        JSwordAnalysisServiceImpl impl = new JSwordAnalysisServiceImpl(TestUtils.mockVersificationService(), null, null, mock(StrongAugmentationService.class));

        //normal use cases
        assertEquals("Gen.3", impl.getExpandedBookData(get("Gen.3.3"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen.2-Gen.4", impl.getExpandedBookData(get("Gen.3.3"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen", impl.getExpandedBookData(get("Gen.3.3"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //beginning of a book
        assertEquals("Gen.1", impl.getExpandedBookData(get("Gen.1.3"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen.1-Gen.2", impl.getExpandedBookData(get("Gen.1.3"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen", impl.getExpandedBookData(get("Gen.1.3"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //end of a book
        assertEquals("Rev.22", impl.getExpandedBookData(get("Rev.22.3"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Rev.21-Rev.22", impl.getExpandedBookData(get("Rev.22.3"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Rev", impl.getExpandedBookData(get("Rev.22.3"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //test short book
        assertEquals("3John", impl.getExpandedBookData(get("3John.2"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("3John", impl.getExpandedBookData(get("3John.2"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("3John", impl.getExpandedBookData(get("3John.2"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //test cross chapter
        assertEquals("Gen.3-Gen.4", impl.getExpandedBookData(get("Gen.3.3-Gen.4.2"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen.2-Gen.5", impl.getExpandedBookData(get("Gen.3.3-Gen.4.2"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen", impl.getExpandedBookData(get("Gen.3.3-Gen.4.2"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

    }

    /**
     * a simple wrapper method to get a proper passage
     * @param key the key
     * @return the passage
     * @throws NoSuchKeyException an unhandled exception
     */
    private Passage get(String key) throws NoSuchKeyException {
        return PassageKeyFactory.instance().getKey(Versifications.instance().getVersification(Versifications.DEFAULT_V11N), key);
    }
}
