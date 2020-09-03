package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;

/**
 * Strong augmentation service to provide better context/definitions to the end user.
 */
public class StrongAugmentationServiceImpl implements StrongAugmentationService {
    public static final String AS_REFERENCES = "references";
    private static final Logger LOGGER = LoggerFactory.getLogger(StrongAugmentationServiceImpl.class);
    private final EntityIndexReader augmentedStrongs;
    private final JSwordVersificationService versificationService;

    @Inject
    public StrongAugmentationServiceImpl(final EntityManager manager, final JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
        this.augmentedStrongs = manager.getReader("augmentedStrongs");
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

        //for each key, we see if there is an augment strong number
        final StringBuilder query = new StringBuilder(keys.length * 10 + 16);
        query.append("(");
        for (int i = 0; i < keys.length; i++) {
            //if Hebrew and not augmented
            if (isNonAugmentedHebrew(keys[i])) {
                //then we're looking at Hebrew, so look up the augmentedStrongs data
                //and we're looking for the first of any strong number
                //build the lucene query...
                query.append(StringConversionUtils.getStrongPaddedKey(keys[i]));
                query.append("? ");
            } else {
                //add directly to the augmented list
                augmentedStrongs.put(keys[i], keys[i]);
            }
        }

        final EntityDoc[] docs;
        if (query.length() > 1) {

            //add the reference in the query. We may have several due to versifications mapping, so we're going to look for documents where at least 1 of the verses is in the doc
            query.append(") AND (");
            String[] individualVerses;
            boolean foundDigit = false;
            for (int i = reference.length() - 1; i > 1; i--) { // Check to see if there are chapter or verse number
                if (Character.isDigit(reference.charAt(i))) {
                    foundDigit = true;
                    break;
                }
            }
            if (foundDigit) {
                individualVerses = StringUtils.split(this.versificationService.convertReference(reference, version, JSwordPassageService.OT_BOOK).getKey().getOsisID());
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
                augmentedStrongs.put(augmentedStrong.substring(0, augmentedStrong.length() - 1).toLowerCase(), augmentedStrong);
            }

            //now we need to work out which strongs were not augmented and add them to the list
            //check which strongs didn't make it
            for (String k : keys) {
                final String keyingStrong = StringConversionUtils.getStrongPaddedKey(k).toLowerCase();
                if (!augmentedStrongs.containsKey(keyingStrong)) {
                    augmentedStrongs.put(keyingStrong, k);
                }
            }
        } else {
            docs = new EntityDoc[0];
        }
        final String[] augmented = new String[augmentedStrongs.size()];
        return new AugmentedStrongs(augmentedStrongs.values().toArray(augmented), docs);
    }

    private boolean isNonAugmentedHebrew(final String key) {
        return key.charAt(0) == 'H' && Character.isDigit(key.charAt(key.length() - 1));
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
            return PassageKeyFactory.instance().getKey(getOTBookVersification(), entityDocs[0].get(AS_REFERENCES));
        } catch (NoSuchKeyException e) {
            throw new StepInternalException("Unable to parse references for some of the entries in the augmented strongs data", e);
        }
    }

    @Override
    public String reduce(final String augmentedStrong) {
        final char firstChar = augmentedStrong.charAt(0);
        if((firstChar == 'H' || firstChar == 'h') && Character.isLetter(augmentedStrong.charAt(augmentedStrong.length() -1))) {
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
}
