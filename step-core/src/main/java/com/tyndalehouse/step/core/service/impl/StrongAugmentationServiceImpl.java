package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.service.AugDStrongService;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
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
    public AugmentedStrongs augment(final String version, final String verseRef, final String unAugmentedStrongNumbers) {
        return augment(version, verseRef, StringUtils.split(unAugmentedStrongNumbers));
    }

    @Override
    public AugmentedStrongs augment(final String version, final String reference, final String[] keys) {
        final Map<String, String> augmentedStrongs = new HashMap<>((keys.length + 4) * 2);
        if(StringUtils.isBlank(version) || StringUtils.isBlank(reference)) {
            //won't be able to resolve so just return the keys as is
            for(String k : keys) {
                augmentedStrongs.put(k, k);
            }
            return new AugmentedStrongs(keys, new EntityDoc[0]);
        }

//        final long currentTimeNanos = System.nanoTime();
        //for each key, we see if there is an augment strong number
        final StringBuilder query = new StringBuilder(keys.length * 10 + 16);
        query.append("(");
        boolean hebrew = false;
        int ordinal = -1;
        for (int i = 0; i < keys.length; i++) {
            if ((keys[i].charAt(0) == 'H') || (keys[i].charAt(0) == 'h')) hebrew = true;
            if (isNonAugmented(keys[i])) {
                //then we're looking at Hebrew, so look up the augmentedStrongs data
                //and we're looking for the first of any strong number
                //build the lucene query...
                query.append(StringConversionUtils.getStrongPaddedKey(keys[i]));
//                query.append("~ "); // changed from ? to ~ because white space analyzer which does not accept ?
                query.append("? "); // changed from ? to ~ because white space analyzer which does not accept ?
            } else {
                //add directly to the augmented list
                augmentedStrongs.put(keys[i], keys[i]);
            }
        }

        final EntityDoc[] docs;
        String[] individualVerses = null;
        if (query.length() > 1) {

            //add the reference in the query. We may have several due to versifications mapping, so we're going to look for documents where at least 1 of the verses is in the doc
            query.append(") AND (");
            boolean foundDigit = false;
            for (int i = reference.length() - 1; i > 1; i--) { // Check to see if there are chapter or verse number
                if (Character.isDigit(reference.charAt(i))) {
                    foundDigit = true;
                    break;
                }
            }
            if ((foundDigit) && (hebrew)) {
                KeyWrapper k = this.versificationService.convertReference(reference, version, JSwordPassageService.OT_BOOK);
                individualVerses = StringUtils.split(k.getKey().getOsisID());
            }
            else { // If there are no chapter or verse number, the query does not need to list all the verses in the book.
                individualVerses = new String[1];
                individualVerses[0] = reference;
            }
            //a single chapter can be optimized, also JSword returns the key as Gen.1 rather than expanded
            boolean queryAppended = false;
            if(individualVerses.length == 1) {
                int countSeparators = 0;
                for(int ii = 0; ii < individualVerses[0].length() && countSeparators < 2; ii++) {
                    if(individualVerses[0].charAt(ii) == '.') {
                        countSeparators++;
                    }
                }
                if(countSeparators < 2) {
                    query.append("references:");
                    query.append(individualVerses[0]);
                    query.append(".*");
                    query.append(' ');
                    queryAppended = true;
                }
            }

            if(!queryAppended) {
                for (String v : individualVerses) {
                    query.append("references:");
                    query.append(v);
                    query.append(' ');
                }
            }
            query.append(")");

            //run the query for the hebrew words and add them to the list
            docs = this.augmentedStrongs.search("augmentedStrong", query.toString());
            for (EntityDoc d : docs) {
                final String augmentedStrong = d.get("augmentedStrong");
                for (String k: keys) {
                    if (k.equals(augmentedStrong.substring(0, augmentedStrong.length() - 1)))
                        augmentedStrongs.put(augmentedStrong.substring(0, augmentedStrong.length() - 1), augmentedStrong);
                }
            }

            //now we need to work out which strongs were not augmented and add them to the list
            //check which strongs didn't make it
            for (String k : keys) {
                final String keyingStrong = StringConversionUtils.getStrongPaddedKey(k); // .toLowerCase();
                if (!augmentedStrongs.containsKey(keyingStrong)) {
                    augmentedStrongs.put(keyingStrong, k);
                }
            }
        } else {
            docs = new EntityDoc[0];
        }
//        LOGGER.info("Old method took [{}] nano-seconds", System.nanoTime() - currentTimeNanos);
//        final long currentTimeNanos2 = System.nanoTime();

        final Versification sourceVersification = this.versificationService.getVersificationForVersion(version);
        String versificationName = sourceVersification.getName();
        boolean useNRSVVersification = false;
        if ((versificationName.equals("NRSV")) || (versificationName.equals("KJV"))) {
            ordinal = augDStrong.cnvrtOSIS2Ordinal(reference, sourceVersification);
            useNRSVVersification = true;
        }
        else if (versificationName.equals(JSwordPassageService.OT_BOOK)) {
            ordinal = augDStrong.cnvrtOSIS2Ordinal(reference, sourceVersification);
        }
        else {
            ordinal  = this.versificationService.convertReferenceGetOrdinal(reference, sourceVersification, this.versificationService.getVersificationForVersion(JSwordPassageService.OT_BOOK));
        }
        String[] result = new String[0];
        if (ordinal > -1) {
            if (keys.length == 1) { // most of the calls to this method only has one key.  Create a shorter code to reduce processing time.
                result = new String[] {keys[0]};
                if (isNonAugmented(keys[0])) {
                    String dStrong = augDStrong.getAugStrongWithStrongAndOrdinal(keys[0], ordinal, useNRSVVersification);
                    result[0] = dStrong;
                    if (!augmentedStrongs.containsValue(dStrong))
                        System.out.println("dStrong " + dStrong + " " + augmentedStrongs + " " + reference);
                }
            }
            else {
                Set<String> deDupKeys = new HashSet<String>();
                for (String s : keys) {
                    deDupKeys.add(s); // This will not add duplicate keys
                }
                result = deDupKeys.toArray(new String[0]);
                for (int j = 0; j < result.length; j ++ ) {
                    if (isNonAugmented(keys[0])) {
                        result[j] = augDStrong.getAugStrongWithStrongAndOrdinal(result[j], ordinal, useNRSVVersification);
                        if (!augmentedStrongs.containsValue(result[j]))
                            System.out.println("dStrong " + result[j] + " " + augmentedStrongs + " " + reference);
                    }
                }
            }
            // return result;
        }
        else {
            System.out.println("null individualVerses " + version + " " + " reference " + reference + " key " + String.join(",", keys));
        }
//        LOGGER.info("New method took [{}] nano-seconds", System.nanoTime() - currentTimeNanos2);
        if (result.length != augmentedStrongs.size()) System.out.println("different size of keys " + String.join(",", keys) + " & augmentedStrongs " + augmentedStrongs);
        if (reference.split(" ").length > 1) System.out.println("More than one ref: " + reference + " key " + String.join(",", keys));
        final String[] augmented = new String[augmentedStrongs.size()];
        return new AugmentedStrongs(augmentedStrongs.values().toArray(augmented), docs);
    }

    private boolean isNonAugmented(final String key) {
        return (key.charAt(0) == 'H' || key.charAt(0) == 'G' || key.charAt(0) == 'h' || key.charAt(0) == 'g') && Character.isDigit(key.charAt(key.length() - 1));
    }

    @Override
    public Character getAugmentedStrongSuffix(final String strong) {
        char lastChar = strong.charAt(strong.length() - 1);
        return Character.isLetter(lastChar) ? Character.valueOf(lastChar) : null;
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
