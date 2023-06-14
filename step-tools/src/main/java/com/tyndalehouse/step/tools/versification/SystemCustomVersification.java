package com.tyndalehouse.step.tools.versification;

import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.SystemDefault;

public class SystemCustomVersification  extends Versification {

    /* protected */ SystemCustomVersification() {
        super(V11N_NAME, BOOKS_OT, BOOKS_NT, LAST_VERSE_OT, LAST_VERSE_NT);
    }

    public static String V11N_NAME = "";
    static BibleBook[] BOOKS_OT = {
    };

    static BibleBook[] BOOKS_NT = {
    };

    static int[][] LAST_VERSE_OT = {
    };

    static int[][] LAST_VERSE_NT = {
    };

    private static final long serialVersionUID = -1483944788413812511L;
}
