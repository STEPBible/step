package com.tyndalehouse.step.core.service.jsword;

import com.tyndalehouse.step.core.models.*;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;

import java.util.List;

/**
 * The service providing access to JSword. All JSword calls should preferably be placed in this service
 */
public interface JSwordPassageService {
    String REFERENCE_BOOK = "ESV_th";
    String SECONDARY_REFERENCE_BOOK = "NIV";
    String OT_BOOK = "OSMHB";
    String BEST_VERSIFICATION = "KJV";
    int MAX_VERSES_RETRIEVED = 200;

    /**
     * returns the Osis Text as a String
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @param displayMode the mode with which display the passage text
     * @return the OSIS text in an HTML form
     */
    OsisWrapper getOsisText(String version, String reference, List<LookupOption> options,
            String interlinearVersion, InterlinearMode displayMode);

    /**
     * returns the biblical text as xml dom
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @return the OSIS text in an HTML form
     */
    OsisWrapper getOsisText(String version, String reference);

    /**
     * Given a verse number, we lookup the verse in question and return it. The numberedVersion is assumed to
     * be KJV (i.e. KJV is used for the number lookup)
     *
     * @param version the version to use for the passage lookup
     * @param numberedVersion the version to be used to lookup the ordinal verse numbers
     * @param startVerseId the start of the verse number to look up
     * @param endVerseId the end of the verse
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @param roundReference true to indicate to include everything to the next chapter.
     * @param ignoreVerse0 whether to ignore verse 0
     * @return the OsisWrapper containing the text
     */
    OsisWrapper getOsisTextByVerseNumbers(String version, String numberedVersion, int startVerseId,
                                          int endVerseId, List<LookupOption> options, final String interlinearVersion,
                                          Boolean roundReference, boolean ignoreVerse0);
    /**
     * Returns the previous or next chapter
     * 
     * @param reference the reference
     * @param version the version of the book we are interested in
     * @param previousChapter true for previous chapter, false for next chapter
     * @return the new reference to display on the user screen
     */
    KeyWrapper getSiblingChapter(String reference, String version, boolean previousChapter);

    /**
     * @param versions the list of versions to retrieve
     * @param lookupKey the key(s)
     * @param options the options to use
     * @return the right passage
     */
    OsisWrapper peakOsisText(String[] versions, Key lookupKey, List<LookupOption> options, String interlinearMode);
    
    /**
     * Looks up a very short starter for ten
     * 
     * @param bible the version to lookup the text from
     * @param range the key to the passage
     * @param options a set of lookup options
     * @return an osis wrapper
     */
    OsisWrapper peakOsisText(Book bible, Key range, List<LookupOption> options);

    /**
     * Returns info about the key
     * 
     * @param reference the reference we are looking up
     * @param version version to look up the key in
     * @return the key with its osis ID
     */
    KeyWrapper getKeyInfo(String reference, String sourceVersion, String version);

    /**
     * Expands the current reference to the whole chapter it is contained by
     * 
     * @param version the book such as KJV, ESV
     * @param reference the reference
     * @return the new reference representing the whole chapter
     */
    KeyWrapper expandToChapter(String version, String reference);

    /**
     * a text with interleaved verses from each version
     * 
     * @param versions the list of versions
     * @param reference the reference to be looked up in each version
     * @param options the list of options to use in the proper OSIS conversion
     * @param displayMode the mode with which display the passage text
     * @return the osis wrapper
     */
    OsisWrapper getInterleavedVersions(String[] versions, String reference, List<LookupOption> options,
            InterlinearMode displayMode, String userLanuage);

    /**
     * Returns some plain text for a passage
     * 
     * @param version the version
     * @param reference the reference
     * @param firstVerse include the first verse only
     * @return the plain text
     */
    String getPlainText(String version, String reference, boolean firstVerse);

    /**
     * Gets a String representation of all references, separated by a space.
     * 
     * @param references the list of references
     * @param version the version
     * @return the actual representation of all references
     */
    String getAllReferences(String references, String version);

    /**
     * Gets a String representation of all references, separated by a space.
     *
     * @param references the list of references
     * @param version the version
     * @return the actual representation of all references
     */
    StringAndCount getAllReferencesAndCounts(String references, String version);

    /**
     * @param key the big key
     * @param book the book
     * @return the new smaller key
     */
    Key getFirstVerseExcludingZero(Key key, Book book);

    /**
     * @param range a particular range of verses
     * @param context
     * @return the first verse, or verse 1 if verse 0 (only applies if verse 1 is actually in the range!)
     */
    Key getFirstVersesFromRange(Key range, final int context);


}
