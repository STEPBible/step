package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.models.LexiconSuggestion;

import java.util.Comparator;
import java.util.Locale;

/**
 * a set of utility methods to sort various collections
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
