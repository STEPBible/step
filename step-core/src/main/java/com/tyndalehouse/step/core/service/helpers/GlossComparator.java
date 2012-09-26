package com.tyndalehouse.step.core.service.helpers;

import java.util.Comparator;

import com.tyndalehouse.step.core.data.entities.lexicon.Definition;

/**
 * Compares a definition by gloss
 * 
 * @author chrisburrell
 * 
 */
public class GlossComparator implements Comparator<Definition> {

    @Override
    public int compare(final Definition o1, final Definition o2) {
        final String stepGloss1 = o1.getStepGloss();
        final String stepGloss2 = o2.getStepGloss();

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
