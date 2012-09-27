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

import static com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl.FEMININE_FORM;
import static com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl.MASCULINE_FORM;
import static com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl.PLURAL_FORM;
import static com.tyndalehouse.step.core.xsl.impl.ColorCoderProviderImpl.SINGULAR_FORM;
import static java.util.Arrays.asList;
import static org.junit.Assert.assertTrue;

import java.util.Collection;
import java.util.regex.Pattern;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * color coding tests
 * 
 * @author chrisburrell
 * 
 *         * Feminine - all forms which contain "SF" or "PF" anywhere Masculine - all forms which contain "SM"
 *         or "PM" anywhere Plural is more complicated
 * 
 *         all forms ending with "P[MFN]" (ie "PM" or "PF" or "PN") or containing "P[MFN]-[A-Z]" or "[123]P"
 *         or "[CDFIKPQRSTX]-[123][A-Z]P" Singular all forms ending with "S[MFN]" or containing "S[MFN]-[A-Z]"
 *         or "[123]S" or "[CDFIKPQRSTX]-[123][A-Z]S"
 */
@RunWith(Parameterized.class)
public class ColorCoderProviderImplPatternsTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(ColorCoderProviderImplPatternsTest.class);
    private final Pattern p;
    private final String s;

    /**
     * @param p the pattern to be tested
     * @param s the string that should be matched
     */
    public ColorCoderProviderImplPatternsTest(final Pattern p, final String s) {
        this.p = p;
        this.s = s;
    }

    /**
     * tests that all sets of patterns find the relevant part
     */
    @Test
    public void testPatterns() {
        LOGGER.trace("Testing {} with {}", this.p.toString(), this.s);
        assertTrue(this.s, this.p.matcher(this.s).find());
    }

    /**
     * @return a collection of pairs. The first element is tested and should resolve to the 2nd element
     * 
     */
    @Parameterized.Parameters
    public static Collection<?> parameterizedTestCases() {
        return asList(new Object[][] { { FEMININE_FORM, "abc-SF-XYZ" }, { FEMININE_FORM, "abc-PF-xyz" },
                { FEMININE_FORM, "SF-XYZ" }, { FEMININE_FORM, "PF-xyz" }, { FEMININE_FORM, "abc-SF" },
                { FEMININE_FORM, "abc-PF" },

                { MASCULINE_FORM, "abc-SM-XYZ" }, { MASCULINE_FORM, "abc-PM-xyz" },
                { MASCULINE_FORM, "SM-XYZ" }, { MASCULINE_FORM, "PM-xyz" }, { MASCULINE_FORM, "abc-SM" },
                { MASCULINE_FORM, "abc-PM" },

                { SINGULAR_FORM, "xSM" }, { SINGULAR_FORM, "xSF" }, { SINGULAR_FORM, "xSN" },
                { SINGULAR_FORM, "xSM-H" }, { SINGULAR_FORM, "xSF-H" }, { SINGULAR_FORM, "xSN-H" },
                { SINGULAR_FORM, "x-1S-" }, { SINGULAR_FORM, "x-2S-" }, { SINGULAR_FORM, "x-3S-" },
                { SINGULAR_FORM, "xK-1BSa" },

                { PLURAL_FORM, "xPM-H" }, { PLURAL_FORM, "xPF-H" }, { PLURAL_FORM, "xPN-H" },
                { PLURAL_FORM, "x-1P-" }, { PLURAL_FORM, "x-2P-" }, { PLURAL_FORM, "x-3P-" },
                { PLURAL_FORM, "xK-1BPa" },

        });
    }
}
