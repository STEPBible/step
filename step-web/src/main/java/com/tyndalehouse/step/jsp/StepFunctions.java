package com.tyndalehouse.step.jsp;

import java.util.regex.Pattern;

/**
 * Some utility functions for using in tags and JSPs
 */
public final class StepFunctions {
    private static final Pattern MULTI_SYLLABLE_MATCHER = Pattern.compile("\\w+\\.\\w[a-zA-Z0-9.]*");

    private StepFunctions() {
        // no implementation
    }

    /**
     * Finds a string that contains a '.', and if so and it is wrapped by word-characters on each side, then assumes
     * a transliteration, and therefore returns the element wrapped in the transliteration markup.
     * @param input the input string
     * @return a string, wrapped if necessary with the transliteration mark-up each time it occurs.
     */
    public static String markTransliteration(String input) {
        return MULTI_SYLLABLE_MATCHER.matcher(input).replaceAll("<span class=\"transliteration\">$0</span>");
    }
}