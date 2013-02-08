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

import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.io.StringReader;

import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.index.lucene.analysis.StrongsNumberAnalyzer;
import org.crosswire.jsword.index.lucene.analysis.StrongsNumberFilter;
import org.junit.Test;

/**
 * The Class StrongNumberFilterTest.
 */
public class StrongNumberFilterTest {
    @Test
    public void testNumberFilter() throws IOException {
        final TokenStream stream = mock(TokenStream.class);

        final StrongsNumberAnalyzer analyzer = new StrongsNumberAnalyzer(Books.installed().getBook("KJV"));

        final TokenStream ts = analyzer
                .reusableTokenStream(
                        "strong",
                        new StringReader(
                                "G5599 G453 G1052 G5101 G940 G5209 G3982 G3361 G3982 G3588 G225 G2596 G3739 G3788 G2424 G5547 G4270 G4717 G1722 G5213"));
        final StrongsNumberFilter strongsNumberFilter = new StrongsNumberFilter(Books.installed().getBook(
                "KJV"), ts);

        while (strongsNumberFilter.incrementToken()) {
            final TermAttribute attribute = strongsNumberFilter.getAttribute(TermAttribute.class);
            System.out.println("Incrementing: " + attribute.term());
        }
    }
}
