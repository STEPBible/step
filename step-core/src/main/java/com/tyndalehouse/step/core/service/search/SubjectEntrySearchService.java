package com.tyndalehouse.step.core.service.search;

import java.util.List;

import com.tyndalehouse.step.core.models.OsisWrapper;

/**
 * Searches for a specific subject
 */
public interface SubjectEntrySearchService {

    /**
     * @param root the root word
     * @param fullHeader the full header
     * @param version the version to be used for the lookups
     * @param reference
     * @param context the context to use to expand the verse references
     * @return the first verse of each range
     */
    com.tyndalehouse.step.core.models.search.SubjectEntries getSubjectVerses(String root, String fullHeader,
                                                                             String version, String reference, int context);

}
