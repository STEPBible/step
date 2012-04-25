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
package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.getAnyKey;
import static java.lang.String.format;
import static org.apache.commons.lang.StringUtils.split;

/**
 * A helper class for use during XSL transformations
 * 
 * @author Chris
 * 
 */
public final class XslHelper {
    private static final int APPROX_ANCHOR_LENGTH = 56;
    private static final int APPROX_SPAN_LENGTH = 46;
    private static final String START_ANCHOR = "<a href=\"";
    private static final String START_FUNCTION_WRAPPER = "('";
    private static final String END_FUNCTION_WRAPPER = "', this)";
    private static final String QUOTED_END_TAG = "\">";
    private static final String END_ANCHOR = "</a>";
    private static final String SEPARATORS = " |";
    private static final String BLANK_SPACE = "&nbsp;";

    /**
     * hiding implementation
     */
    private XslHelper() {
        // hiding implementation
    }

    /**
     * returns a "span" element for use in an HTML document
     * 
     * @param strongsText the key straight from the OSIS text
     * @param functionCall the javascript function that will be called upon click of the word
     * @return a span containing all the strongs, seperated by spaces
     * 
     */
    public static String getSpanFromAttributeName(final String strongsText, final String functionCall) {
        final String[] strongs = split(strongsText, SEPARATORS);
        if (strongs == null || strongs.length == 0) {
            return format(XslHelper.BLANK_SPACE);
        }

        // we transform each strong to something like: "<a href=\"%s\">%s</a>";
        final StringBuilder sb = new StringBuilder(APPROX_SPAN_LENGTH + strongs.length * APPROX_ANCHOR_LENGTH);

        String strongKey;
        for (int ii = 0; ii < strongs.length; ii++) {
            strongKey = getAnyKey(strongs[ii]);
            sb.append(START_ANCHOR);
            sb.append(functionCall);
            sb.append(START_FUNCTION_WRAPPER);
            sb.append(strongKey);
            sb.append(END_FUNCTION_WRAPPER);
            sb.append(QUOTED_END_TAG);
            sb.append(strongKey);
            sb.append(END_ANCHOR);

            if (ii + 1 != strongs.length) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }
}
