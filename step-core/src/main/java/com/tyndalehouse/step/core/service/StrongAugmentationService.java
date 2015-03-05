package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.EntityDoc;
import org.crosswire.jsword.passage.Key;

/**
 * Given a strong number, we find the augmented version in order to provide more accurate definitions and context
 */
public interface StrongAugmentationService {
    /**
     * The STEP lexicon contains H0001a, H0002b, etc. where a,b are suffixes for homonyms. As a result,
     * with a reference, we can inform the user a bit more about the specific meaning of the word
     * @param version the version that anchors the reference
     * @param reference the reference
     * @param keys the keys  @return the list of returned / changed keyed
     */
    AugmentedStrongs augment(final String version, String reference, String[] keys);

    /**
     *
     * @param strong the strong that is being examined. The basic check is to see if the strong number finishes with a letter
     * @return the char if it is suffixed
     */
    Character getAugmentedStrongSuffix(String strong);

    /**
     * Given a set of results, we retrieve the expected results and return those that are in both sets of keys
     * @param augmentedStrong the augmented strong of interest
     */
    Key getVersesForAugmentedStrong(String augmentedStrong);

    /**
     * To convert an augmented strong number to a standardised strong number
     * @param augmentedStrong augmented strong
     * @return the normal strong number
     */
    String reduce(String augmentedStrong);

    /**
     * Augments multiple strong numbers from a string. For example H0001 H0002 H0003 may become H0001 H0002a H0003
     * @param version version
     * @param verseRef the reference
     * @param unAugmentedStrongNumbers the unaugmented strong numbers
     * @return the augmented form
     */
    AugmentedStrongs augment(String version, String verseRef, String unAugmentedStrongNumbers);

    public class AugmentedStrongs {
        private final String[] strongList;
        private final EntityDoc[] entityDocs;

        public AugmentedStrongs(final String[] strongList, final EntityDoc[] entityDocs) {
            this.strongList = strongList;
            this.entityDocs = entityDocs;
        }

        public EntityDoc[] getEntityDocs() {
            return entityDocs;
        }

        public String[] getStrongList() {
            return strongList;
        }
    }
}
