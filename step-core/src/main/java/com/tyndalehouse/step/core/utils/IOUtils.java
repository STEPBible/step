package com.tyndalehouse.step.core.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some IO Utils for use in the STEP application.
 * 
 * @author chrisburrell
 */
public final class IOUtils {
    private static final Logger LOG = LoggerFactory.getLogger(IOUtils.class);

    /** preventing instanciation */
    private IOUtils() {
        // hiding implementation
    }

    /**
     * Closes a @see Closeable properly.
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

    /**
     * Read a classpath resource into a String
     * 
     * @param classpathResource the classpath resource
     * @return the string
     */
    public static String readEntireClasspathResource(final String classpathResource) {
        InputStream s = null;
        InputStreamReader in = null;
        BufferedReader reader = null;

        try {
            s = IOUtils.class.getResourceAsStream(classpathResource);
            if (s == null) {
                return "";
            }

            in = new InputStreamReader(s, "UTF-8");
            reader = new BufferedReader(in);
            final StringBuilder sb = new StringBuilder(64000);

            final char[] chars = new char[8192];
            int l = -1;
            while ((l = reader.read(chars)) != -1) {
                sb.append(chars, 0, l);
            }

            return sb.toString();
        } catch (final IOException e) {
            LOG.warn("Unable to read file for resource: " + classpathResource);
            return "";
        } finally {
            IOUtils.closeQuietly(in);
            IOUtils.closeQuietly(reader);
            IOUtils.closeQuietly(s);
        }
    }
}
