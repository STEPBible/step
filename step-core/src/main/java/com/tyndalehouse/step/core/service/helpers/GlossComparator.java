package com.tyndalehouse.step.core.service.helpers;

import java.util.Comparator;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * Compares a definition by gloss
 * 
 * @author chrisburrell
 * 
 */
public class GlossComparator implements Comparator<EntityDoc> {

    @Override
    public int compare(final EntityDoc o1, final EntityDoc o2) {
        final String stepGloss1 = o1.get("stepGloss");
        final String stepGloss2 = o2.get("stepGloss");

        if (stepGloss1 == null && stepGloss2 == null) {
            return 0;
        } else if (stepGloss1 == null) {
            return 1;
        } else if (stepGloss2 == null) {
            return -1;
        }

        return stepGloss1.compareTo(stepGloss2);
    }
}
