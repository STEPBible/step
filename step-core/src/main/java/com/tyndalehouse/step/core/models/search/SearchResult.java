package com.tyndalehouse.step.core.models.search;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * @author chrisburrell
 */
public class SearchResult implements Serializable {
    private static final long serialVersionUID = 5408141957094432935L;
    private String query;
    private boolean maxReached;
    private long timeTookToRetrieveScripture;
    private long timeTookTotal;
    private List<SearchEntry> results;

    /**
     * @return the maxReached
     */
    public boolean isMaxReached() {
        return this.maxReached;
    }

    /**
     * @param maxReached the maxReached to set
     */
    public void setMaxReached(final boolean maxReached) {
        this.maxReached = maxReached;
    }

    /**
     * @return the query
     */
    public String getQuery() {
        return this.query;
    }

    /**
     * @param query the query to set
     */
    public void setQuery(final String query) {
        this.query = query;
    }

    /**
     * @return the results
     */
    public List<SearchEntry> getResults() {
        return this.results;
    }

    /**
     * @param results the results to set
     */
    public void setResults(final List<SearchEntry> results) {
        this.results = results;
    }

    /**
     * @return the timeTookToRetrieveScripture
     */
    public long getTimeTookToRetrieveScripture() {
        return this.timeTookToRetrieveScripture;
    }

    /**
     * @param timeTookToRetrieveScripture the timeTookToRetrieveScripture to set
     */
    public void setTimeTookToRetrieveScripture(final long timeTookToRetrieveScripture) {
        this.timeTookToRetrieveScripture = timeTookToRetrieveScripture;
    }

    /**
     * @return the timeTookTotal
     */
    public long getTimeTookTotal() {
        return this.timeTookTotal;
    }

    /**
     * @param timeTookTotal the timeTookTotal to set
     */
    public void setTimeTookTotal(final long timeTookTotal) {
        this.timeTookTotal = timeTookTotal;
    }

    /**
     * Adds a search entry to the list of results
     * 
     * @param result result to be added
     */
    public void addEntry(final SearchEntry result) {
        if (this.results == null) {
            this.results = new ArrayList<SearchEntry>();
        }

        this.results.add(result);
    }
}
