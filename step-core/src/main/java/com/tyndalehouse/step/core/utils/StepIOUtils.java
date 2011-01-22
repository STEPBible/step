package com.tyndalehouse.step.core.utils;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some IO Utils for use in the STEP application
 * 
 * @author Chris
 * 
 */
public final class StepIOUtils {
    private static final Logger LOG = LoggerFactory.getLogger(StepIOUtils.class);

    /** preventing instanciation */
    private StepIOUtils() {
        // hiding implementation
    }

    /**
     * Closes a @see Closeable properly
     * 
     * @param c the closeable object
     */
    public static void closeQuietly(final java.io.Closeable c) {
        try {
            if (c != null) {
                c.close();
            }
        } catch (final IOException e) {
            // if exception thrown, do nothing
            LOG.warn("Failed to close reader or stream", e);
        }
    }
}
