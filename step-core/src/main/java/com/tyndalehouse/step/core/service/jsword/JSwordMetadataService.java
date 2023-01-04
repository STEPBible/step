package com.tyndalehouse.step.core.service.jsword;

import java.util.List;
import java.util.Set;

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import org.crosswire.jsword.book.Book;

/**
 * The service providing access to JSword. All JSword calls should preferably be placed in this service
 */
public interface JSwordMetadataService {
    /**
     * @param version the initials of the book to look up
     * @return the first chapter OSIS ID
     */
    String getFirstChapterReference(String version);

    /**
     * Gets the features for a module
     *
     * @param version       the initials of the book to look up
     * @param extraVersions the secondary versions that affect feature resolution
     * @return the list of supported features
     */
    Set<LookupOption> getFeatures(String version, List<String> extraVersions);

    /**
     * returns a list of matching names or references in a particular book
     *
     * @param bookStart the name of the matching key to look across book names
     * @param version   the name of the version, defaults to ESV if not found
     * @param bookScope scope that restricts the match to a particular OSIS book
     * @return a list of matching bible book names
     */
    List<BookName> getBibleBookNames(String bookStart, String version, final String bookScope);

    /**
     * returns a list of matching names or references in a particular book
     *
     * @param bookStart the name of the matching key to look across book names
     * @param version   the name of the version, defaults to ESV if not found
     * @param autoLookupSingleBooks true to indicate that we are wanting chapters if a single book is found
     * @return a list of matching bible book names
     */
    List<BookName> getBibleBookNames(String bookStart, String version, boolean autoLookupSingleBooks);

    /**
     * @param version version of interest
     * @return true if the version in question contains Strongs
     */
    boolean hasVocab(String version);

    /**
     * Returns true if the book supports strong numbers
     * @param book the book
     * @return true if strongs are available
     */
    boolean supportsStrongs(Book book);

    /**
     * Returns the languages for a set of versions
     *
     * @param versions
     * @return
     */
    String[] getLanguages(String... versions);

    /**
     * Determines the best interlinear mode available for the given versions. The order of preference is
     * <p/>
     * INTERLINEAR
     * INTERLEAVED_COMPARE
     * INTERLEAVED
     *
     *
     * @param mainBook      the main book
     * @param extraVersions the extra versions
     * @param interlinearMode
     * @return the best interlinear mode.
     */
    InterlinearMode getBestInterlinearMode(String mainBook, List<String> extraVersions, final InterlinearMode interlinearMode);

    /**
     *
     * @param version the version/book we are querying
     * @param options the options that we want to assess
     * @return true if the book supports all options provided
     */
    boolean supportsFeature(String version, LookupOption... options);
}
