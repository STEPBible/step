package com.tyndalehouse.step.core.models.search;

import com.tyndalehouse.step.core.models.OsisWrapper;

import java.util.List;

/**
 * Wraps the a list of OsisWrappers representing the search results together
 * with a flag to indicate that the master version has been swapped
 */
public class SubjectEntries {
    private final List<OsisWrapper> subjectEntries;
    private final boolean masterVersionSwapped;

    public SubjectEntries(final List<OsisWrapper> subjectEntries, final boolean masterVersionSwapped) {
        this.subjectEntries = subjectEntries;
        this.masterVersionSwapped = masterVersionSwapped;
    }

    public boolean isMasterVersionSwapped() {
        return masterVersionSwapped;
    }

    public List<OsisWrapper> getSubjectEntries() {
        return subjectEntries;
    }
}
