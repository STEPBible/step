package com.tyndalehouse.step.core.utils;

import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.BookName;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Lengthens the name of a header
 */
public final class HeadingsUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(HeadingsUtil.class);

    /**
     * prevent instanciation
     */
    private HeadingsUtil() {
        // NO-op
    }

    /**
     * @param v11n        the versification system
     * @param shortHeader the short header
     * @return the String representing the long header
     */
    public static String getLongHeader(final Versification v11n, final String shortHeader) {
        if (BookName.isFullBookName()) {
            return shortHeader;
        }

        try {
            final Key key = PassageKeyFactory.instance().getKey(v11n, shortHeader);

            return longNameFromKey(v11n, key);
        } catch (final NoSuchKeyException e) {
            // unable to convert, so return short
            LOGGER.warn(e.getMessage(), e);
            return shortHeader;
        }
    }

    /**
     * @param v11n the versification system
     * @param key  the key to get the long name from
     * @return the String representing the long header
     */
    public static String getLongHeader(final Versification v11n, final Key key) {
        if (BookName.isFullBookName()) {
            return key.getName();
        }

        return longNameFromKey(v11n, key);
    }

    /**
     * @param v11n the versification system
     * @param key  the key to get the long name from
     * @return the String representing the long header
     */
    private static String longNameFromKey(final Versification v11n, final Key key) {
        try {
            final Verse firstVerse = KeyUtil.getVerse(key);

            final BibleBook book = firstVerse.getBook();

            if (v11n.isIntro(firstVerse)) {
                // then exclude that verse from the key
                try {
                    key.removeAll(firstVerse);
                } catch (final UnsupportedOperationException ex) {
                    // silently fail
                    LOGGER.trace("Unable to remove verse, but continuing.", ex);
                }
            }
            String longBookName = v11n.getLongName(book);
            if (longBookName == null)
                return "";
            return key.getName().replace(v11n.getShortName(book), longBookName);
        } catch (ArrayIndexOutOfBoundsException ex) {
            //occurs for a zero-sized key
            return "";
        }
    }
}
