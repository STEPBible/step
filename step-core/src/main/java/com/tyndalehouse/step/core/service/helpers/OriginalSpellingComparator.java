package com.tyndalehouse.step.core.service.helpers;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.unAccent;

import java.util.Comparator;

import com.tyndalehouse.step.core.data.entities.lexicon.Definition;

/**
 * Compares a definition by gloss
 * 
 * @author chrisburrell
 * 
 */
public class OriginalSpellingComparator implements Comparator<Definition> {
    @Override
    public int compare(final Definition o1, final Definition o2) {
        final String spelling1 = o1.getAccentedUnicode();
        final String spelling2 = o2.getAccentedUnicode();

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
