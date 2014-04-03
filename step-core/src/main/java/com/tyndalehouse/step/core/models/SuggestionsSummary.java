package com.tyndalehouse.step.core.models;

import java.util.List;

/**
 * 
 * @author chrisburrell
 */
public class SuggestionsSummary {
    private List<SingleSuggestionsSummary> suggestionsSummaries;

    public List<SingleSuggestionsSummary> getSuggestionsSummaries() {
        return suggestionsSummaries;
    }

    public void setSuggestionsSummaries(final List<SingleSuggestionsSummary> suggestionsSummaries) {
        this.suggestionsSummaries = suggestionsSummaries;
    }
}
