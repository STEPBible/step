package com.tyndalehouse.step.core.service;

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
    String[] augment(final String version, String reference, String[] keys);

    /**
     *
     * @param strong the strong that is being examined. The basic check is to see if the strong number finishes with a letter
     * @return the char if it is suffixed
     */
    Character getAugmentedStrongSuffix(String strong);


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
     * @return array of String
     */
    String[] augment(String version, String verseRef, String unAugmentedStrongNumbers);

    boolean isNonAugmented(final String key);

    void readAndLoad(final String augStrongFile, final String installFilePath);

    void loadFromSerialization(final String installFilePath);

    void updatePassageKeyWithAugStrong(String strong, Key reference);

    AugmentedStrongsForSearchCount getRefIndexWithStrong(final String strong);

    boolean isVerseInAugStrong(final String reference, final String strong, final AugmentedStrongsForSearchCount arg);

    class AugmentedStrongsForSearchCount {
        public final int startIndex;
        public final int endIndex;
        public final boolean defaultAugStrong;
        public short[] refArray;

        public AugmentedStrongsForSearchCount(final int startIndex, final int endIndex, final boolean defaultAugStrong,
                                              short[] refArray) {
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.defaultAugStrong = defaultAugStrong;
            this.refArray = refArray;
        }
    }
}
