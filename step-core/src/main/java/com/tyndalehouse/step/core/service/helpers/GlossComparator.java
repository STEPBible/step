package com.tyndalehouse.step.core.service.helpers;

import com.tyndalehouse.step.core.data.EntityDoc;

import java.util.Comparator;

/**
 * Compares a definition by gloss
 */
public class GlossComparator implements Comparator<EntityDoc> {

    @Override
    public int compare(final EntityDoc o1, final EntityDoc o2) {
        final String gloss1 = o1.get("stepGloss");
        final String gloss2 = o2.get("stepGloss");

        if (gloss1 == null && gloss2 == null) {
            return 0;
        } else if (gloss1 == null) {
            return 1;
        } else if (gloss2 == null) {
            return -1;
        }

        //they are equal, so put the stop words back in
        return gloss1.compareTo(gloss2);
    }

}
