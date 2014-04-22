package com.tyndalehouse.step.core.models.search;

/**
 * @author chrisburrell
 */
public class SyntaxSuggestion extends TextSuggestion implements PopularSuggestion {
    private String value;

    public String getValue() {
        return value;
    }

    public void setValue(final String value) {
        this.value = value;
    }
}
