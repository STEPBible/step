package com.tyndalehouse.step.core.utils;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.crosswire.common.util.Language;
import org.crosswire.jsword.book.Book;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;

/**
 * Static utility class for Bible language code lookups.
 * Suitable for calling from Xalan XSLT 1.0 as a Java extension.
 */
public class BibleUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleUtil.class);
    private static final String VERSION_NOT_INITIALIZED_MESSAGE =
            "JSwordVersificationService is not initialized";
    private static final String CACHE_HIT_LOG_FORMAT = "Cache hit for version '{}': {}";
    private static final String CACHE_MISS_RESOLVED_LOG_FORMAT =
            "Cache miss for version '{}', resolved to: {}";
    private static final String CACHE_MISS_UNRESOLVED_LOG_FORMAT =
            "Cache miss for version '{}', could not resolve language code";
    private static final String LANGUAGE_CODE_RESOLUTION_ERROR =
            "Failed to resolve language code for version: {}";

    private static boolean isDebugLoggingEnabled = false;
    private static JSwordVersificationService versificationService;
    private static final ConcurrentMap<String, String> languageCodeCache = new ConcurrentHashMap<>();

    private BibleUtil() {
        // Prevent instantiation of utility class
    }

    /**
     * Initializes the service required for language code resolution.
     * Must be called once before using getLanguageCode().
     *
     * @param service the JSwordVersificationService instance
     */
    public static void setVersificationService(JSwordVersificationService service) {
        versificationService = service;
    }

    /**
     * Enables or disables debug logging for cache operations and language resolution.
     *
     * @param enabled true to enable debug logging, false to disable
     */
    public static void setDebugLoggingEnabled(boolean enabled) {
        isDebugLoggingEnabled = enabled;
    }

    /**
     * Returns the ISO-639 language code for a Bible version (e.g., "KJV" → "en").
     * Results are cached for performance.
     *
     * @param version the Bible version identifier
     * @return the ISO-639 language code, or null if resolution fails
     * @throws IllegalStateException if JSwordVersificationService is not initialized
     */
    public static String getLanguageCode(String version) {
        if (version == null || version.trim().isEmpty()) {
            LOGGER.warn("Requested language code for null or empty version");
            return null;
        }

        if (versificationService == null) {
            throw new IllegalStateException(VERSION_NOT_INITIALIZED_MESSAGE);
        }

        return languageCodeCache.compute(version, (versionKey, cachedLanguageCode) -> {
            if (cachedLanguageCode != null) {
                if (isDebugLoggingEnabled) {
                    LOGGER.info(CACHE_HIT_LOG_FORMAT, versionKey, cachedLanguageCode);
                }
                return cachedLanguageCode;
            }

            String resolvedLanguageCode = resolveLanguageCode(versionKey);
            if (isDebugLoggingEnabled) {
                if (resolvedLanguageCode != null) {
                    LOGGER.info(CACHE_MISS_RESOLVED_LOG_FORMAT, versionKey, resolvedLanguageCode);
                } else {
                    LOGGER.info(CACHE_MISS_UNRESOLVED_LOG_FORMAT, versionKey);
                }
            }
            return resolvedLanguageCode;
        });
    }

    /**
     * Resolves the language code for a given Bible version by querying the versification service.
     *
     * @param version the Bible version identifier
     * @return the ISO-639 language code, or null if resolution fails
     */
    private static String resolveLanguageCode(String version) {
        try {
            Book bibleBook = versificationService.getBookFromVersion(version);
            Language bookLanguage = bibleBook.getLanguage();
            return bookLanguage != null ? bookLanguage.getCode() : null;
        } catch (Exception exception) {
            LOGGER.error(LANGUAGE_CODE_RESOLUTION_ERROR, version, exception);
            return null;
        }
    }
}