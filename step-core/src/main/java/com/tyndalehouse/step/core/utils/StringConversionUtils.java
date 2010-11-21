package com.tyndalehouse.step.core.utils;

/**
 * A collection of utility methods enabling us to convert Strings, references one way or another.
 * 
 * @author Chris
 */
public final class StringConversionUtils {
    private static final char KEY_SEPARATOR = ':';
    private static final String STRONG_PREFIX = "strong:";
    private static final int LANGUAGE_INDICATOR = STRONG_PREFIX.length();

    /**
     * hiding implementation
     */
    private StringConversionUtils() {
        // hiding implementation
    }

    /**
     * Not all bibles encode strong numbers as strong:[HG]\d+ unfortunately, so instead we cope for strong: and
     * strong:H.
     * 
     * In essence we chop off any of the following prefixes: strong:G, strong:H, strong:, H, G. We don't use a regularl
     * expression, since this will be much quicker
     * 
     * @param strong strong key
     * @return the key containing just the digits
     */
    public static String getStrongKey(final String strong) {
        if (strong.startsWith(STRONG_PREFIX)) {
            final char c = strong.charAt(LANGUAGE_INDICATOR);
            if (c == 'H' || c == 'G') {
                return strong.substring(LANGUAGE_INDICATOR + 1);
            }
            return strong.substring(LANGUAGE_INDICATOR);
        }

        final char c = strong.charAt(0);
        if (c == 'H' || c == 'G') {
            return strong.substring(1);
        }

        // perhaps some passages encode just the number
        return strong;
    }

    /**
     * in this case, we assume that a key starts shortly after the last ':' with a number
     * 
     * @param potentialKey a key that can potentially be shortened
     * @return the shortened key
     */
    public static String getAnyKey(final String potentialKey) {
        // find first colon and start afterwards, -1 yields 0, which is the beginning of the string
        // so we can work with that.
        int start = potentialKey.lastIndexOf(KEY_SEPARATOR) + 1;

        // start at the first char after the colon
        // int start = lastColon + 1;
        final char protocol = potentialKey.charAt(start);
        if (protocol == 'G' || protocol == 'H') {
            start++;
        }

        // finally, we may have 0s:
        while (potentialKey.charAt(start) == '0') {
            start++;
        }

        return potentialKey.substring(start);
    }
}
