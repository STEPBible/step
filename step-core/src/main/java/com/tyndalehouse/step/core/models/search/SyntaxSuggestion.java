package com.tyndalehouse.step.core.models.search;

public class SyntaxSuggestion extends TextSuggestion implements PopularSuggestion {
    private String value;

    public String getValue() {
        return value;
    }

    public void setValue(final String value) {
        this.value = value;
    }
}
