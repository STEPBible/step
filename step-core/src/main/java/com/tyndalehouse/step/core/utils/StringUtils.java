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

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * To avoid having large libraries, we provide here a small set of methods that can be used to perform various
 * string operations
 * 
 * @author chrisburrell
 * 
 */
public final class StringUtils {
    private static final Map<String, Pattern> PATTERNS = new HashMap<String, Pattern>();

    /** no op */
    private StringUtils() {
        // No-op
    }

    /**
     * checks for null and zero length
     * 
     * @param s the string
     * @return true if null or zero length
     */
    public static boolean isEmpty(final String s) {
        return s == null || s.length() == 0;
    }

    /**
     * @param s the value to test
     * @return !isEmpty(s), i.e. a non-null string of length >1
     */
    public static boolean isNotEmpty(final String s) {
        return !isEmpty(s);
    }

    /**
     * if any of the passed in values are blank, then returns true
     * 
     * @param strings the list of strings to evaluate
     * @return true if one or more strings are blank
     */
    public static boolean areAnyBlank(final String... strings) {

        for (final String s : strings) {
            if (isBlank(s)) {
                return true;
            }
        }
        return false;
    }

    /**
     * checks if a field is blank
     * 
     * @param s the string to be tested
     * @return true if blank (ie. only whitespace)
     */
    // CHECKSTYLE:OFF
    public static boolean isBlank(final String s) {
        int length;
        if (s == null || (length = s.length()) == 0) {
            return true;
        }

        // check for whitespace
        for (int ii = 0; ii < length; ii++) {
            if (!Character.isWhitespace(s.charAt(ii))) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param s the string to evaluate
     * @return !isBlank
     */
    public static boolean isNotBlank(final String s) {
        return !isBlank(s);
    }

    // CHECKSTYLE:ON

    /**
     * Uses a pre-compiled regular expression to comma separate - maybe a tad overkill
     * 
     * @param value the string to be split up
     * @return the array of strings containing the split values
     */
    public static String[] commaSeparate(final String value) {
        return split(value, ",");
    }

    /**
     * Splits by space
     * 
     * @param value the value to split
     * @return the array of split values
     */
    public static String[] split(final String value) {
        return split(value, " ");
    }

    /**
     * @param value the value to split
     * @param patternRegex the delimiter regex
     * @return the array of split values
     */
    public static String[] split(final String value, final String patternRegex) {
        if (value == null) {
            return new String[0];
        }

        Pattern p = PATTERNS.get(patternRegex);

        if (p == null) {
            p = Pattern.compile(patternRegex);
        }
        return p.split(value);
    }

    /**
     * @param s the string to evaluate
     * @return true to indicate only alpha numerics have been found
     */
    public static boolean containsAlphaNumeric(final String s) {
        for (int ii = 0; ii < s.length(); ii++) {
            if (Character.isLetterOrDigit(s.charAt(ii))) {
                return true;
            }
        }
        return false;
    }
}
