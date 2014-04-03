package com.tyndalehouse.step.core.models.search;

/**
 * @author chrisburrell
 */
public interface PopularSuggestion {
    /**
     * @return the relative popularity of the term. For example, for a strong number, this would be based on its
     * rough frequency in the Bible.
     */
    int getPopularity();

    /**
     * @param term the term that was searched for
     * @return true to indicate that the term given is an exact match against this
     */
    boolean isExactMatch(String term);
}
