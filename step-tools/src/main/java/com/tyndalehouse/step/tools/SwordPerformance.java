package com.tyndalehouse.step.tools;

import org.crosswire.jsword.book.Books;

public class SwordPerformance {
    public static void main(final String[] args) throws InterruptedException {
        Thread.sleep(30000);
        final long l = System.nanoTime();
        Books.installed();
        System.out.println((System.nanoTime() - l) / 1000000);
        Thread.sleep(30000);
    }
}
