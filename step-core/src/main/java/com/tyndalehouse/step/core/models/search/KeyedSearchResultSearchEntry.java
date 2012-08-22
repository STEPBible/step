package com.tyndalehouse.step.core.models.search;

/**
 * Wraps around all heading results kind of searches for Subjects
 */
public class KeyedSearchResultSearchEntry implements SearchEntry {
    private static final long serialVersionUID = -5226707320157394428L;
    private String key;
    private SearchResult searchResult;

    /**
     * @return the key
     */
    public String getKey() {
        return this.key;
    }

    /**
     * @param key the key to set
     */
    public void setKey(final String key) {
        this.key = key;
    }

    /**
     * @return the searchResult
     */
    public SearchResult getSearchResult() {
        return this.searchResult;
    }

    /**
     * @param searchResult the searchResult to set
     */
    public void setSearchResult(final SearchResult searchResult) {
        this.searchResult = searchResult;
    }
}
