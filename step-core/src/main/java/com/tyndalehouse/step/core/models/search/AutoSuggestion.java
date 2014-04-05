package com.tyndalehouse.step.core.models.search;

import java.util.List;

/**
 * @author chrisburrell
 */
public class AutoSuggestion {
    private String itemType;
    private Object suggestion;
    private boolean grouped = false;
    private boolean maxReached = false;
    private int count;
    private List<PopularSuggestion> extraExamples;

    public String getItemType() {
        return itemType;
    }

    public void setItemType(final String itemType) {
        this.itemType = itemType;
    }

    public Object getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(final Object suggestion) {
        this.suggestion = suggestion;
    }

    public boolean isGrouped() {
        return grouped;
    }

    public void setGrouped(final boolean grouped) {
        this.grouped = grouped;
    }

    public int getCount() {
        return count;
    }

    public void setCount(final int count) {
        this.count = count;
    }

    public boolean isMaxReached() {
        return maxReached;
    }

    public void setMaxReached(final boolean maxReached) {
        this.maxReached = maxReached;
    }

    public List<PopularSuggestion> getExtraExamples() {
        return extraExamples;
    }

    public void setExtraExamples(final List<PopularSuggestion> extraExamples) {
        this.extraExamples = extraExamples;
    }
}
