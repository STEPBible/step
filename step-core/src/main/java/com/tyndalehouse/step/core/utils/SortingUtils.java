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

import com.tyndalehouse.step.core.models.LexiconSuggestion;

import java.util.Comparator;
import java.util.Locale;

/**
 * a set of utility methods to sort various collections
 *
 * @author chrisburrell
 */
public final class SortingUtils {

    public static final Comparator<LexiconSuggestion> LEXICON_SUGGESTION_COMPARATOR = new Comparator<LexiconSuggestion>() {

        @Override
        public int compare(final LexiconSuggestion o1, final LexiconSuggestion o2) {
            final int equalStrongs = compareValues(o1.getStrongNumber(), o2.getStrongNumber());
            if (equalStrongs != 0) {
                return equalStrongs;
            }

            return 0;
        }

        /**
         * Compares null values safely
         * @param val1 the first value
         * @param val2 the second value
         * @return
         */
        private int compareValues(String val1, String val2) {
            if (val1 == null) {
                return -1;
            }

            if (val2 == null) {
                return 1;
            }

            //if they are equal, we still want to preserve, so compare based on the
            //hebrew instead.
            return val1.toLowerCase(Locale.ENGLISH).compareTo(
                    val2.toLowerCase(Locale.ENGLISH));

        }
    };

    /**
     * hiding implementaiton
     */
    private SortingUtils() {
        // no implementation
    }


}
