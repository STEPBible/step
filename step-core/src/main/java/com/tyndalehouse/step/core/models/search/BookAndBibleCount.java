package com.tyndalehouse.step.core.models.search;

/**
 * The Class OTAndBibleCount.
 */
public class BookAndBibleCount {
    private int book;
    private int bible;

    /**
     * Instantiates a new count holder model
     */
    public BookAndBibleCount() {
    }

    /**
     * Gets the book.
     * 
     * @return the book
     */
    public int getBook() {
        return this.book;
    }

    /**
     * Gets the number of occurrences within the whole Bible.
     * 
     * @return the bible
     */
    public int getBible() {
        return this.bible;
    }

    /**
     * @param book the book to set
     */
    public void setBook(final int book) {
        this.book = book;
    }

    /**
     * @param bible the bible to set
     */
    public void setBible(final int bible) {
        this.bible = bible;
    }
}
