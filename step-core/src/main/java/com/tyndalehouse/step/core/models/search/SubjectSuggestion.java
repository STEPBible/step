package com.tyndalehouse.step.core.models.search;

import com.tyndalehouse.step.core.service.impl.SearchType;

import java.util.ArrayList;
import java.util.List;

/**
 * @author chrisburrell
 */
public class SubjectSuggestion implements PopularSuggestion {
    private String value;
    private List<SearchType> searchTypes;

    public String getValue() {
        return value;
    }

    public void setValue(final String value) {
        this.value = value;
    }

    public List<SearchType> getSearchTypes() {
        return searchTypes;
    }

    public void setSearchTypes(final List<SearchType> searchTypes) {
        this.searchTypes = searchTypes;
    }

    /**
     * @param searchType search type
     */
    public void addSearchType(final SearchType searchType) {
        if(searchTypes == null) {
            searchTypes = new ArrayList<SearchType>(4);
        }
        searchTypes.add(searchType);
    }

    @Override
    public int getPopularity() {
        return 0;
    }

    @Override
    public boolean isExactMatch(final String term) {
        return term != null && term.equalsIgnoreCase(value);
    }
}
