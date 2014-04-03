package com.tyndalehouse.step.core.data.common;

import java.util.Set;

/**
 * Holds a set of matching terms, with the total potential count of all terms
 * @param <T> the type of term that is held here.
 * @author chrisburrell
 */
public class TermsAndMaxCount<T> {
    private Set<T> terms;
    private int totalCount;

    public Set<T> getTerms() {
        return terms;
    }

    public void setTerms(final Set<T> terms) {
        this.terms = terms;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(final int totalCount) {
        this.totalCount = totalCount;
    }
}
