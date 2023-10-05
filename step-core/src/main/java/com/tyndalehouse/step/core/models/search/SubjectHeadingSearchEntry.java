package com.tyndalehouse.step.core.models.search;


/**
 * Wraps around all heading results kind of searches for Subjects
 */
public class SubjectHeadingSearchEntry implements SearchEntry {
    private static final long serialVersionUID = -6209785503678744536L;
    private SearchResult headingsSearch;

    /**
     * @return the headingsSearch
     */
    public SearchResult getHeadingsSearch() {
        return this.headingsSearch;
    }

    /**
     * @param headingsSearch the headingsSearch to set
     */
    public void setHeadingsSearch(final SearchResult headingsSearch) {
        this.headingsSearch = headingsSearch;
    }

}
