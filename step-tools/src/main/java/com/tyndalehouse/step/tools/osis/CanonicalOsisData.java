package com.tyndalehouse.step.tools.osis;

import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.NoSuchKeyException;

/**
 * @author chrisburrell
 */
public class CanonicalOsisData {
    public static void main(String[] args) throws BookException, NoSuchKeyException {
        final Book kjv = Books.installed().getBook("KJV");
        BookData data = new BookData(kjv, kjv.getKey("John 7"));
        System.out.println(OSISUtil.getCanonicalText(data.getOsisFragment()));
    }
}
