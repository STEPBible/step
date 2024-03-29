package com.tyndalehouse.step.core.data.entities.impl;

import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;

import java.util.List;

/**
 * This is a mock class and as a result has very few implemented methods
 */
public class MockJSwordPassageServiceImpl implements JSwordPassageService {

    /**
     * Gets the osis text.
     * 
     * @param version the version
     * @param reference the reference
     * @param options the options
     * @param interlinearVersion the interlinear version
     * @param displayMode the display mode
     * @return the osis text
     */
    @Override
    public OsisWrapper getOsisText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion,
            final InterlinearMode displayMode) {

        return null;
    }

    /**
     * Gets the osis text.
     * 
     * @param version the version
     * @param reference the reference
     * @return the osis text
     */
    @Override
    public OsisWrapper getOsisText(final String version, final String reference) {

        return null;
    }

    /**
     * Gets the sibling chapter.
     * 
     * @param reference the reference
     * @param version the version
     * @param previousChapter the previous chapter
     * @return the sibling chapter
     */
    @Override
    public KeyWrapper getSiblingChapter(final String reference, final String version,
            final boolean previousChapter) {

        return null;
    }

    @Override
    public OsisWrapper peakOsisText(final String[] versions, final Key lookupKey, final List<LookupOption> options, final String interlinearMode) {
        return null;
    }

    /**
     * Gets the osis text by verse numbers.
     * 
     * @param version the version
     * @param numberedVersion the numbered version
     * @param startVerseId the start verse id
     * @param endVerseId the end verse id
     * @param options the options
     * @param interlinearVersion the interlinear version
     * @param roundReference the round reference
     * @param ignoreVerse0 the ignore verse0
     * @return the osis text by verse numbers
     */
    @Override
    public OsisWrapper getOsisTextByVerseNumbers(final String version, final String numberedVersion,
            final int startVerseId, final int endVerseId, final List<LookupOption> options,
            final String interlinearVersion, final Boolean roundReference, final boolean ignoreVerse0) {

        return null;
    }

    /**
     * Peak osis text.
     * 
     * @param bible the bible
     * @param range the range
     * @param options the options
     * @return the osis wrapper
     */
    @Override
    public OsisWrapper peakOsisText(final Book bible, final Key range, final List<LookupOption> options) {

        return null;
    }

    /**
     * Gets the key info.
     * 
     * @param reference the reference
     * @param version the version
     * @return the key info
     */
    @Override
    public KeyWrapper getKeyInfo(final String reference, final String sourceVersion, final String version) {
        final KeyWrapper keyWrapper = new KeyWrapper();
        keyWrapper.setOsisKeyId("Gen.1.1");
        return keyWrapper;
    }

    /**
     * Expand to chapter.
     * 
     * @param version the version
     * @param reference the reference
     * @return the key wrapper
     */
    @Override
    public KeyWrapper expandToChapter(final String version, final String reference) {

        return null;
    }

    /**
     * Gets the interleaved versions.
     * 
     * @param versions the versions
     * @param reference the reference
     * @param options the options
     * @param displayMode the display mode
     * @return the interleaved versions
     */
    @Override
    public OsisWrapper getInterleavedVersions(final String[] versions, final String reference,
            final List<LookupOption> options, final InterlinearMode displayMode, final String userLanguage) {

        return null;
    }

    /**
     * Gets the plain text.
     * 
     * @param version the version
     * @param reference the reference
     * @param firstVerse the first verse
     * @return the plain text
     */
    @Override
    public String getPlainText(final String version, final String reference, final boolean firstVerse) {

        return null;
    }

    /**
     * Gets the all references.
     * 
     * @param references the references
     * @param version the version
     * @return the all references
     */
    @Override
    public String getAllReferences(final String references, final String version) {
        return "a ref";
    }

    @Override
    public StringAndCount getAllReferencesAndCounts(String references, String version) {
        return null;
    }

     /**
     * Gets the first verse excluding zero.
     * 
     * @param key the key
     * @param book the book
     * @return the first verse excluding zero
     */
    @Override
    public Key getFirstVerseExcludingZero(final Key key, final Book book) {

        return null;
    }

    /**
     * Gets the first verse from range.
     * 
     * @param range the range
     * @param context
     * @return the first verse from range
     */
    @Override
    public Key getFirstVersesFromRange(final Key range, final int context) {

        return null;
    }

}
