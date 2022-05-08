package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.AugDStrongService;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.versification.Testament;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Strong augmentation service to provide better context/definitions to the end user.
 */
public class StrongAugmentationServiceImpl implements StrongAugmentationService {
    public static final String AS_REFERENCES = "references";
    private static final Logger LOGGER = LoggerFactory.getLogger(StrongAugmentationServiceImpl.class);
    private final EntityIndexReader augmentedStrongs;
    private final JSwordVersificationService versificationService;
    private final AugDStrongService augDStrong;
    @Inject
    public StrongAugmentationServiceImpl(final EntityManager manager, final JSwordVersificationService versificationService, final AugDStrongService augDStrong) {
        this.versificationService = versificationService;
        this.augmentedStrongs = manager.getReader("augmentedStrongs");
        this.augDStrong = augDStrong;
    }

    @Override
    public String[] augment(final String version, final String verseRef, final String unAugmentedStrongNumbers) {
        return augment(version, verseRef, StringUtils.split(unAugmentedStrongNumbers));
    }

    @Override
    public String[] augment(final String version, final String reference, final String[] keys) {
        if (StringUtils.isBlank(version) || StringUtils.isBlank(reference) || (version.startsWith("LXX")))
            return keys;
        if (reference.indexOf("-") > -1) {
            System.out.println("StrongAugmentationServices augment. Unexpected - character in reference");
            return keys;
        }
        int ordinal;
        Versification sourceVersification = this.versificationService.getVersificationForVersion(version);
        String versificationName = sourceVersification.getName();
        if ((versificationName.equals("NRSVA")) || (versificationName.equals("KJVA")))
            sourceVersification = this.versificationService.getVersificationForVersion("ESV");
        versificationName = sourceVersification.getName();
        boolean useNRSVVersification = false;
        if ((versificationName.equals("NRSV")) || (versificationName.equals("KJV"))) {
            ordinal = augDStrong.convertOSIS2Ordinal(reference, sourceVersification);
            useNRSVVersification = true;
            if (((keys[0].charAt(0) == 'G') || (keys[0].charAt(0) == 'g')) && (sourceVersification.getTestament(ordinal).equals(Testament.OLD)))
                return keys; // There are no augmented Strong for Greek in the Old Testament
        }
        else if (versificationName.equals(JSwordPassageService.OT_BOOK)) {
            ordinal = augDStrong.convertOSIS2Ordinal(reference, sourceVersification);
        }
        else {
            ordinal  = this.versificationService.convertReferenceGetOrdinal(reference, sourceVersification, this.versificationService.getVersificationForVersion(JSwordPassageService.OT_BOOK));
        }
        String[] result = new String[0];
        if (ordinal > -1) {
            if (keys.length == 1) { // most of the calls to this method only has one key.  Create a shorter code to reduce processing time.
                result = new String[] {keys[0]};
                if (isNonAugmented(keys[0]))
                    result[0] = augDStrong.getAugStrongWithStrongAndOrdinal(keys[0], ordinal, useNRSVVersification);
            }
            else {
                Set<String> deDupKeys = new HashSet<>();
                Collections.addAll(deDupKeys, keys);
                result = new String[deDupKeys.size()];
                int k = 0;
                for (int j = 0; j < keys.length; j ++ ) {
                    if (deDupKeys.contains(keys[j])) {
                        if (isNonAugmented(keys[j]))
                            result[k] = augDStrong.getAugStrongWithStrongAndOrdinal(keys[j], ordinal, useNRSVVersification);
                        else result[k] = keys[j];
                        k ++;
                        deDupKeys.remove(keys[j]);
                    }
                }
            }
        }
        if (reference.split(" ").length > 1) System.out.println("More than one ref: " + reference + " key " + String.join(",", keys));
        return result;
    }

    public boolean isNonAugmented(final String key) {
        char prefix = key.charAt(0);
        return (prefix == 'H' || prefix == 'G' || prefix == 'h' || prefix == 'g') && Character.isDigit(key.charAt(key.length() - 1));
    }

    @Override
    public Character getAugmentedStrongSuffix(final String strong) {
        char lastChar = strong.charAt(strong.length() - 1);
        return Character.isLetter(lastChar) ? lastChar : null;
    }

    @Override
    public Key getVersesForAugmentedStrong(final String augmentedStrong) {
        final EntityDoc[] entityDocs = this.augmentedStrongs.searchExactTermBySingleField("augmentedStrong", 1, augmentedStrong);
        if (entityDocs.length == 0) {
            return PassageKeyFactory.instance().createEmptyKeyList(getOTBookVersification());
        }

        //otherwise we have some
        if (entityDocs.length > 1) {
            LOGGER.warn("Too many augmented strongs in the index for strong: [{}]", augmentedStrong);
        }

        try {
            if ((augmentedStrong.charAt(0) == 'G') || (augmentedStrong.charAt(0) == 'g'))
                return PassageKeyFactory.instance().getKey(getESVBookVersification(), entityDocs[0].get(AS_REFERENCES));
            else
                return PassageKeyFactory.instance().getKey(getOTBookVersification(), entityDocs[0].get(AS_REFERENCES));
        } catch (NoSuchKeyException e) {
            throw new StepInternalException("Unable to parse references for some of the entries in the augmented strongs data", e);
        }
    }

    @Override
    public String reduce(final String augmentedStrong) {
        final char firstChar = augmentedStrong.charAt(0);
        if ((firstChar == 'H' || firstChar == 'h' || firstChar == 'G' || firstChar == 'g') && Character.isLetter(augmentedStrong.charAt(augmentedStrong.length() -1))) {
            return augmentedStrong.substring(0, augmentedStrong.length() - 1);
        }
        return augmentedStrong;
    }

    /**
     * @return * @return the versification for the OT OSMHB book
     */
    private Versification getOTBookVersification() {
        return this.versificationService.getVersificationForVersion(JSwordPassageServiceImpl.OT_BOOK);
    }

    /**
     * @return * @return the versification for ESV which should be NRSV versification
     */
    private Versification getESVBookVersification() {
        return this.versificationService.getVersificationForVersion("ESV");
    }

}
