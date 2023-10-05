package com.tyndalehouse.step.core.utils.language;

import java.util.Locale;

/**
 * Utilities for doing Hebrew transliteration
 */
public final class ContemporaryLanguageUtils {
    /** prevent instantiation */
    private ContemporaryLanguageUtils() {
        // do nothing
    }

    /**
     * Gets the locale from tag, for e.g. zh_TW constructs new Locale(zh, TW). Only deals with 2 parts at the
     * moment
     * 
     * @param tag the tag
     * @return the locale from tag
     */
    public static Locale getLocaleFromTag(final String tag) {
        final String[] tagParts = tag.split("[-_]");
        if (tagParts.length == 1) {
            return new Locale(tag);
        } else {
            return new Locale(tagParts[0], tagParts[1]);
        }
    }

    /**
     * Capitalises the first letter, hoping this works for all Locales. To be revisited otherwise
     * 
     * @param originalLanguageName the original language name
     * @return the string
     */
    public static String capitaliseFirstLetter(final String originalLanguageName) {
        final char codePointAt = originalLanguageName.charAt(0);
        final char firstLetterTitle = Character.toTitleCase(codePointAt);
        return firstLetterTitle + originalLanguageName.substring(1);
    }
}
