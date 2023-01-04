package com.tyndalehouse.step.core.service.helpers;

/**
 * Holds various information about the context into which a user is typing.
 * For example, a selected version could influence the results of the key/book/ref retrieval
 */
public class SuggestionContext {
    private String masterBook;
    private String input;
    private String searchType;
    boolean exampleData;

    public String getMasterBook() {
        return masterBook;
    }

    public void setMasterBook(final String masterBook) {
        this.masterBook = masterBook;
    }

    public void setInput(final String input) {
        this.input = input;
    }

    public String getInput() {
        return input;
    }

    public String getSearchType() {
        return searchType;
    }

    public void setSearchType(final String searchType) {
        this.searchType = searchType;
    }

    public boolean isExampleData() {
        return exampleData;
    }

    public void setExampleData(final boolean exampleData) {
        this.exampleData = exampleData;
    }
}
