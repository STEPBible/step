package com.tyndalehouse.step.tools.osis;

public class Chapter {
    private final int chapNo;
    private final int start;
    private final int stop;
    private final int bookNo;

    /**
     * @param chapNo
     * @param start
     * @param stop
     * @param bookNo
     */
    public Chapter(final int chapNo, final int start, final int stop, final int bookNo) {
        this.chapNo = chapNo;
        this.start = start;
        this.stop = stop;
        this.bookNo = bookNo;
    }

    /**
     * @return the chapNo
     */
    public int getChapNo() {
        return this.chapNo;
    }

    /**
     * @return the start
     */
    public int getStart() {
        return this.start;
    }

    /**
     * @return the stop
     */
    public int getStop() {
        return this.stop;
    }

    /**
     * @return the bookNo
     */
    public int getBookNo() {
        return this.bookNo;
    }

}
