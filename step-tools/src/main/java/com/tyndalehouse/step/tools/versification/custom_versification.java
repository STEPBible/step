package com.tyndalehouse.step.tools.versification;

import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.passage.NoSuchKeyException;

import java.io.File;
import java.io.IOException;

public class custom_versification {
    public static void main(final String[] args) throws NoSuchKeyException, BookException, IOException {

        CustomVersification cv = new CustomVersification();
        cv.loadFromJSON( new File("C:\\tmp\\osis2mod_work\\canon_nrsv.json"));
    }
}
