package com.tyndalehouse.step.core.models.search;

/**
 * @author chrisburrell
 */
public class AutoSuggestion {
    private String itemType;
    private Object suggestion;

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
}
