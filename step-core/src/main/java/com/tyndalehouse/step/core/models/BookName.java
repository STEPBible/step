package com.tyndalehouse.step.core.models;

import java.io.Serializable;

/**
 * Gives info on a book name (short and long names)
 * 
 * @author chrisburrell
 * 
 */
public class BookName implements Serializable {
    private static final long serialVersionUID = 2406197083965523605L;
    private String shortName;
    private String fullName;
    private boolean wholeBook;

    /**
     * wraps around a book name, giving the abbreviation and the full name
     * 
     * @param shortName the short name
     * @param fullName the full name
     * @param isWholeBook true to indicate the option refers to a whole book
     */
    public BookName(final String shortName, final String fullName, final boolean isWholeBook) {
        this.shortName = shortName;
        this.fullName = fullName;
        this.wholeBook = isWholeBook;
    }

    /**
     * @return the shortName
     */
    public String getShortName() {
        return this.shortName;
    }

    /**
     * @param shortName the shortName to set
     */
    public void setShortName(final String shortName) {
        this.shortName = shortName;
    }

    /**
     * @return the fulllName
     */
    public String getFullName() {
        return this.fullName;
    }

    /**
     * @param fulllName the fulllName to set
     */
    public void setFullName(final String fulllName) {
        this.fullName = fulllName;
    }

    /**
     * @return the isWholeBook
     */
    public boolean isWholeBook() {
        return this.wholeBook;
    }

    /**
     * @param isWholeBook the isWholeBook to set
     */
    public void setWholeBook(final boolean isWholeBook) {
        this.wholeBook = isWholeBook;
    }
}
