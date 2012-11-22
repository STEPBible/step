package com.tyndalehouse.step.core.service.search;

import java.util.List;

import com.tyndalehouse.step.core.models.OsisWrapper;

/**
 * Searches for a specific subject
 * 
 * @author chrisburrell
 * 
 */
public interface SubjectEntrySearchService {

    /**
     * @param root the root word
     * @param fullHeader the full header
     * @param version TODO
     * @return the first verse of each range
     */
    List<OsisWrapper> getSubjectVerses(String root, String fullHeader, String version);

}
