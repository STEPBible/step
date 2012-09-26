package com.tyndalehouse.step.core.models.search;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.tyndalehouse.step.core.models.LexiconSuggestion;

/**
 * 
 * @author chrisburrell
 */
public class SearchResult implements Serializable {
    private static final long serialVersionUID = 5408141957094432935L;
    private String query;
    private int total;
    private long timeTookToRetrieveScripture;
    private long timeTookTotal;
    private List<SearchEntry> results;
    private List<String> strongHighlights;
    private String order;
    private List<LexiconSuggestion> definitions;

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

    /**
     * @return the total
     */
    public int getTotal() {
        return this.total;
    }

    /**
     * @param total the total to set
     */
    public void setTotal(final int total) {
        this.total = total;
    }

    /**
     * @return the strongHighlights
     */
    public List<String> getStrongHighlights() {
        return this.strongHighlights;
    }

    /**
     * @param strongHighlights the strongHighlights to set
     */
    public void setStrongHighlights(final List<String> strongHighlights) {
        this.strongHighlights = strongHighlights;
    }

    /**
     * @return the order
     */
    public String getOrder() {
        return this.order;
    }

    /**
     * @param order the order to set
     */
    public void setOrder(final String order) {
        this.order = order;
    }

    /**
     * @return the definitions
     */
    public List<LexiconSuggestion> getDefinitions() {
        return this.definitions;
    }

    /**
     * @param definitions the definitions to set
     */
    public void setDefinitions(final List<LexiconSuggestion> definitions) {
        this.definitions = definitions;
    }
}
