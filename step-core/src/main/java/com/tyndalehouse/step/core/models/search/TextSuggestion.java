package com.tyndalehouse.step.core.models.search;

/**
 * @author chrisburrell
 */
public class TextSuggestion implements PopularSuggestion {
    private String text;

    public String getText() {
        return text;
    }

    public void setText(final String text) {
        this.text = text;
    }
}
