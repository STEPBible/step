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
package com.tyndalehouse.step.core.data.create;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import org.junit.Test;

import com.tyndalehouse.step.core.data.entities.DictionaryArticle;
import com.tyndalehouse.step.core.data.entities.reference.SourceType;

/**
 * testing the loader mechanism
 * 
 * @author chrisburrell
 * 
 */
public class DictionaryLoaderTest {
    /**
     * Testing field is obtained accurately
     */
    @Test
    public void testGetFieldContent() {
        assertEquals("hi you", new DictionaryLoader(null, null, null).parseFieldContent("@SOME_FIELD_NAME",
                "SOME_FIELD_NAME: hi you"));
    }

    /**
     * Tests various different types of resolving the headword instance
     */
    @Test
    public void testGetFieldHeadwordInstance() {
        final DictionaryLoader dl = new DictionaryLoader(null, null, null);
        assertEquals(1, dl.parseHeadwordInstance("SomeWord"));
        assertEquals(1, dl.parseHeadwordInstance("SomeWord ()"));
        assertEquals(1, dl.parseHeadwordInstance("SomeWord )"));
        assertEquals(1, dl.parseHeadwordInstance("SomeWord )("));
        assertEquals(1, dl.parseHeadwordInstance("SomeWord (d)"));
        assertEquals(2, dl.parseHeadwordInstance("SomeWord (2)"));
    }

    /**
     * tests that parsing an raw article makes it into html
     */
    @Test
    public void testParseArticle() {
        final DictionaryLoader dl = new DictionaryLoader(null, null, null);
        final DictionaryArticle article = new DictionaryArticle();
        article.setSource(SourceType.EASTON);

        assertEqualsArticleText("", "", article, dl);
        assertEqualsArticleText("", " ", article, dl);
        assertEqualsArticleText("text", "text", article, dl);

        assertEqualsArticleText("and <a onclick='goToArticle(\"EASTON\", \"Moses\", \"\")'>Moses</a>",
                "and [[Moses]]", article, dl);

        assertEqualsArticleText(
                "and <a onclick='goToArticle(\"EASTON\", \"Moses\", \"MOSES (1)\")'>Moses</a>",
                "and [[Moses|MOSES (1)]]", article, dl);

        assertEqualsArticleText("and <a onclick='viewPassage(this, \"Deut.32.32\")'>Deut 32:32</a>",
                "and [[Deut 32:32|Deut.32.32]]", article, dl);

        assertEqualsArticleText("", "", article, dl);
        assertEqualsArticleText("and <a onclick='goToArticle(\"EASTON\", \"Moses\", \"\")'>Moses</a> "
                + "see <a onclick='viewPassage(this, \"Deut.32.32\")'>Deut 32:32</a>",
                "and [[Moses]] see [[Deut 32:32|Deut.32.32]]", article, dl);

        assertEqualsArticleText("<a onclick='goToArticle(\"EASTON\", \"Amram\", \"AMRAM (1)\")'>Amram</a>",
                "[[Amram|AMRAM (1)]]", article, dl);
    }

    /**
     * Tests multiple expressions
     */
    @Test
    public void testMultipleExpressions() {
        final DictionaryLoader dl = new DictionaryLoader(null, null, null);
        final DictionaryArticle article = new DictionaryArticle();
        article.setSource(SourceType.EASTON);

        final String s = "The eldest son of [[Amram|AMRAM (1)]]"
                + " and [[Jochebed]], a [[daughter]] of [[Levi|LEVI (1)]] ([[Exod.6.20|Exod 6:20]])";
        dl.parseArticleText(article, new StringBuilder(s));

        System.out.println(article.getText());
        assertFalse(article.getText().contains("[["));
    }

    /**
     * helper method
     * 
     * @param expected the expected value
     * @param input the input to the est
     * @param article the article that contains the source of the article
     * @param dl the loader under test
     */
    private void assertEqualsArticleText(final String expected, final String input,
            final DictionaryArticle article, final DictionaryLoader dl) {
        dl.parseArticleText(article, toS(input));
        assertEquals(expected, article.getText());

    }

    /**
     * simple helper that shortens the tests
     * 
     * @param s a string
     * @return the string builder with the string contents
     */
    private StringBuilder toS(final String s) {
        return new StringBuilder(s);
    }
}
