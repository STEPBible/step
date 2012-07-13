package com.tyndalehouse.step.core.models.search;

import java.util.List;

public class AggregatedVerseSearchEntries implements SearchEntry {
    private List<String> searchKeys;
    private String results;

    /**
     * @return the searchKeys
     */
    public List<String> getSearchKeys() {
        return this.searchKeys;
    }

    /**
     * @param searchKeys the searchKeys to set
     */
    public void setSearchKeys(final List<String> searchKeys) {
        this.searchKeys = searchKeys;
    }

    /**
     * @return the results
     */
    public String getResults() {
        return this.results;
    }

    /**
     * @param results the results to set
     */
    public void setResults(final String results) {
        this.results = results;
    }
}
