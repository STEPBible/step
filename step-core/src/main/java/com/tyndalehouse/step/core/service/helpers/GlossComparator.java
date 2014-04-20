package com.tyndalehouse.step.core.service.helpers;

import java.util.Comparator;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.analysis.StopAnalyzer;

/**
 * Compares a definition by gloss
 * 
 * @author chrisburrell
 * 
 */
public class GlossComparator implements Comparator<EntityDoc> {

    @Override
    public int compare(final EntityDoc o1, final EntityDoc o2) {
        final String gloss1 = o1.get("stepGloss");
        final String gloss2 = o2.get("stepGloss");
        final String stepGloss1 = prepare(gloss1);
        final String stepGloss2 = prepare(gloss2);
        
        int compare = stepGloss1.compareTo(stepGloss2);
        if(compare != 0) {
            return compare;
        }

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

    /**
     * removes 'stop words' from the gloss, such that closely related English words are next to each other.
     * @param stepGloss the gloss
     * @return the gloss without its stop words
     */
    private String prepare(final String stepGloss) {
        //tokenize, then rebuild to exclude stop list
        final String[] parts = StringUtils.split(stepGloss);
        StringBuilder reconstructed = new StringBuilder(stepGloss.length());
        for(String s : parts) {
            if(!StopAnalyzer.ENGLISH_STOP_WORDS_SET.contains(s)) {
                if(reconstructed.length() > 0) {
                    reconstructed.append(' ');
                }
                reconstructed.append(s);   
            }
        }
        return reconstructed.toString();
    }
}
