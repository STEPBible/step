package com.tyndalehouse.step.core.service.impl;

/**
 * Search query object. Defines all parameters required to execute a search
 * 
 * @author chrisburrell
 * 
 */
public class SearchQuery {
    private static final String JOINING_SEARCH = "=>";
    private final IndividualSearch[] searches;
    private final int pageSize;
    private final int pageNumber;
    private final int context;
    private final boolean ranked;
    private final String originalQuery;

    private int currentSearch = 0;
    private boolean allKeys = false;

    /**
     * @param searchQuery the query to be run
     * @param ranked true to indicate the search results should be ranked
     * @param context how many verses either side to include
     * @param pageNumber the page number required
     * @param pageSize the size of the page to be returned
     */
    public SearchQuery(final String searchQuery, final boolean ranked, final int context,
            final int pageNumber, final int pageSize) {

        this.originalQuery = searchQuery;

        // parse the searches
        final String[] individualSearches = searchQuery.split(JOINING_SEARCH);
        this.searches = new IndividualSearch[individualSearches.length];
        for (int ii = 0; ii < individualSearches.length; ii++) {
            this.searches[ii] = new IndividualSearch(individualSearches[ii]);

        }

        // by default we set all Keys to true if we have several searches to run
        if (this.searches.length > 1) {
            this.allKeys = true;
        }

        // set the other variables
        this.ranked = ranked;
        this.context = context;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;

    }

    /**
     * @return true to indicate we are not refining searches
     */
    public boolean isIndividualSearch() {
        return this.searches.length == 1;
    }

    /**
     * @return the current search
     */
    public IndividualSearch getCurrentSearch() {
        return this.searches[this.currentSearch];
    }

    /**
     * @return the searches
     */
    public IndividualSearch[] getSearches() {
        return this.searches;
    }

    /**
     * @return the pageSize
     */
    public int getPageSize() {
        return this.pageSize;
    }

    /**
     * @return the pageNumber
     */
    public int getPageNumber() {
        return this.pageNumber;
    }

    /**
     * @return the context
     */
    public int getContext() {
        return this.context;
    }

    /**
     * @return the ranked
     */
    public boolean isRanked() {
        return this.ranked;
    }

    /**
     * @return the originalQuery
     */
    public String getOriginalQuery() {
        return this.originalQuery;
    }

    /**
     * Increments and moves on if we have more searches
     * 
     * @return true if the current search is not null
     */
    public boolean hasMoreSearches() {
        final boolean moreSearches = this.currentSearch < this.searches.length - 1;

        if (moreSearches) {
            this.currentSearch++;
        }

        return moreSearches;
    }

    /**
     * increments the pointer to the next search
     */
    public void nextSearch() {
        this.currentSearch++;
    }

    /**
     * @return the last search to be executed
     */
    public IndividualSearch getLastSearch() {
        return this.searches[this.searches.length - 1];
    }

    /**
     * @return the allKeys
     */
    public boolean isAllKeys() {
        return this.allKeys;
    }

    /**
     * @param allKeys the allKeys to set
     */
    public void setAllKeys(final boolean allKeys) {
        this.allKeys = allKeys;
    }
}
