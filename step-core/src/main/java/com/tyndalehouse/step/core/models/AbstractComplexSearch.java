package com.tyndalehouse.step.core.models;

import com.tyndalehouse.step.core.service.impl.SearchType;

import java.util.List;

/**
 * Parent class sharing to share some common properties between lookups for passages and searches
 */
public abstract class AbstractComplexSearch {
    private String title;
    private long time;
    private String signature;
    private SearchType searchType;
    private String masterVersion;
    private String extraVersions;
    private InterlinearMode interlinearMode;
    private List<SearchToken> searchTokens;
    private long timeTookTotal;

    public void setSearchType(final SearchType searchType) {
        this.searchType = searchType;
    }

    /**
     * @return the type of search
     */
    public SearchType getSearchType() {
        return searchType;
    }
    
    /**
     * @param masterVersion the master version
     */
    public void setMasterVersion(final String masterVersion) {
        this.masterVersion = masterVersion;
    }

    /**
     * @param extraVersions any other versions
     */
    public void setExtraVersions(final String extraVersions) {
        this.extraVersions = extraVersions;
    }

    public String getMasterVersion() {
        return masterVersion;
    }

    public String getExtraVersions() {
        return extraVersions;
    }

    /**
     * @return the searchTokens used to carry out the search (may be more than the user entered)
     */
    public List<SearchToken> getSearchTokens() {
        return this.searchTokens;
    }

    /**
     * @param searchTokens the arguments used to carry out the search, pipe delimited, to match the input
     */
    public void setSearchTokens(final List<SearchToken> searchTokens) {
        this.searchTokens = searchTokens;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(final String signature) {
        this.signature = signature;
    }

    /**
     * @return the interlinear mode used for this search
     */
    public InterlinearMode getInterlinearMode() {
        return interlinearMode;
    }

    /**
     * @param interlinearMode the interlinear mode used for this search
     */
    public void setInterlinearMode(InterlinearMode interlinearMode) {
        this.interlinearMode = interlinearMode;
    }

    public long getTime() {
        return time;
    }

    public void setTime(final long time) {
        this.time = time;
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
     * @return the title of the page
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title of the page
     */
    public void setTitle(final String title) {
        this.title = title;
    }
}
