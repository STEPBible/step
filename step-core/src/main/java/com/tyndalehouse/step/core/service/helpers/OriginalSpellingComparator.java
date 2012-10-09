package com.tyndalehouse.step.core.service.helpers;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.unAccent;

import java.util.Comparator;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * Compares a definition by gloss
 * 
 * @author chrisburrell
 * 
 */
public class OriginalSpellingComparator implements Comparator<EntityDoc> {
    @Override
    public int compare(final EntityDoc o1, final EntityDoc o2) {
        final String spelling1 = o1.get("accentedUnicode");
        final String spelling2 = o2.get("accentedUnicode");

        if (spelling1 == null && spelling2 == null) {
            return 0;
        } else if (spelling1 == null) {
            return 1;
        } else if (spelling2 == null) {
            return -1;
        }

        return unAccent(spelling1).compareTo(unAccent(spelling2));
    }
}
