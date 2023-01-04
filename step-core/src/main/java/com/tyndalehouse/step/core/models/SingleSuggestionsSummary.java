package com.tyndalehouse.step.core.models;

import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.models.search.SuggestionType;

import java.util.List;

public class SingleSuggestionsSummary {
    private String searchType;
    private List<? extends PopularSuggestion> popularSuggestions;
    private int moreResults;
    private List<PopularSuggestion> extraExamples;

    public String getSearchType() {
        return searchType;
    }

    public void setSearchType(final String searchType) {
        this.searchType = searchType;
    }

    public List<? extends PopularSuggestion> getPopularSuggestions() {
        return popularSuggestions;
    }

    public void setPopularSuggestions(final List<? extends PopularSuggestion> popularSuggestions) {
        this.popularSuggestions = popularSuggestions;
    }

    public int getMoreResults() {
        return moreResults;
    }

    public void setMoreResults(final int moreResults) {
        this.moreResults = moreResults;
    }

    public List<PopularSuggestion> getExtraExamples() {
        return extraExamples;
    }

    public void setExtraExamples(final List<PopularSuggestion> extraExamples) {
        this.extraExamples = extraExamples;
    }
}
