package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.create.ModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.versification.Testament;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;
import static java.lang.Integer.parseInt;

/**
 * Strong augmentation service to provide better context/definitions to the end user.
 */
public class StrongAugmentationServiceImpl implements StrongAugmentationService {

    private class ordinalAndOccurencesInVerse implements Comparable<ordinalAndOccurencesInVerse> {
        short ordinal;
        short occurencesInVerse;
        public int compareTo(ordinalAndOccurencesInVerse ordAndOccur) {
            int comparison = this.ordinal - ordAndOccur.ordinal;
            if (comparison == 0)
                return this.occurencesInVerse - ordAndOccur.occurencesInVerse;
            return comparison;
        }
    };

    private static final Logger LOGGER = LoggerFactory.getLogger(StrongAugmentationServiceImpl.class);
    private static final short NT_OFFSET = 24116; //First ordinal of NT (Matthew)
    private final JSwordVersificationService versificationService;
    private static AugmentedStrongsData augStrongData = new AugmentedStrongsData();
    private static class AugmentedStrongsData implements Serializable {
        private int numOfGreekStrongWithAugments;
        private int numOfAugStrongInOT;
        private int numOfAugStrongInNT;

        // An array of Strong numbers with augmented strongs.  If a Strong does not have augmented, it will not be in this
        // array.  Each Strong number is a short (15 bits) so Strong numbers cannot be over 32,767.  15 bits should be OK
        // because all Strong with augments are 4 digits.  If 15 bit is not enough, change it from a short[] to int[]
        // This array is sorted so that binary search can be used to speed up the lookup.  Since a lookup is need for every
        // Strong word, it is important the lookup is efficient.
        private short[] strongsWithAugments;

        // The following two arrays are related to strongsWithAugments array.  The same index is used for strongsWithAugments,
        // strong2AugStrongIndex and strong2AugStrongCount.
        // strong2AugStrongIndex has the index to access the array of first augmented Strongs for a Strong number.
        // strong2AugStrongCount has a number of augmented strong for a specific strong.  For example, if H0001 has H0001A and H0001B,
        // strong2AugStrongCount will contain a 2.
        private short[] strong2AugStrongIndex;
        private byte[] strong2AugStrongCount;

        // The following two arrays (one for OT and another for NT) have the index to the references (passages) for an augmented
        // strong.  The first byte contains the last character of an augmented Strong (e.g.: G, A, B, ...)
        // The second to forth bytes has the index to access the references (passages) for an augmented strong.
        // The top bit is on if it is first augmented strong for a strong number.  For example, if we have H0001G and H0001H,
        // The element for H0001G will have the top bit on.
        private int[] augStrong2RefIndexOT;
        private int[] augStrong2RefIndexNT;

        // The following three are arrays of references (passages) for the augmented strongs.  There is one for OHB and one for RSV
        // versification of the Old Testament.  We only store the NRSV versification for the NT.
        // Each element of an array has an ordinal of a passage.
        private short[] refOfAugStrongOTOHB;
        private short[] refOfAugStrongOTRSV;
        private short[] refOfAugStrongNT;
    }

    @Inject
    public StrongAugmentationServiceImpl(final JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
    }

    @Override
    public String[] augment(final String version, final String verseRef, final String unAugmentedStrongNumbers) {
        return augment(version, verseRef, StringUtils.split(unAugmentedStrongNumbers));
    }

    @Override
    public String[] augment(final String version, String reference, final String[] keys) {
        if (StringUtils.isBlank(version) || StringUtils.isBlank(reference) || (version.startsWith("LXX")) ||
                (keys.length == 0))
            return keys;
        short wordPositionOfMultiOccurrencesInOneVerse = 0;
        char lastCharOfRef = reference.toUpperCase().charAt(reference.length() - 1);
        if ((lastCharOfRef >= 65) && (lastCharOfRef <= 73)) { // 65 is A, 73 is I, only has 15 bits to store the information
            reference = reference.substring(0, reference.length() - 1);
            wordPositionOfMultiOccurrencesInOneVerse |= 1 << (lastCharOfRef - 65);
        }
        if (reference.contains("-")) {
            System.out.println("StrongAugmentationServices augment. Unexpected - character in reference");
            return keys;
        }
        int ordinal;
        Versification sourceVersification = this.versificationService.getVersificationForVersion(version);
        String versificationName = sourceVersification.getName();
        if ((versificationName.equals("NRSVA")) || (versificationName.equals("KJVA")) || (versificationName.equals("KJV"))) {
            sourceVersification = this.versificationService.getVersificationForVersion("ESV");
            versificationName = sourceVersification.getName();
        }
        boolean useNRSVVersification = false;
        boolean hebrew = (keys[0].charAt(0) == 'H') || (keys[0].charAt(0) == 'h');
        if (versificationName.equals("NRSV")) {
            ordinal = convertOSIS2Ordinal(reference, sourceVersification);
            useNRSVVersification = true;
            if ((!hebrew) && (sourceVersification.getTestament(ordinal).equals(Testament.OLD)))
                return keys; // There are no augmented Strong for Greek in the Old Testament
        }
        else {
            if (versificationName.equals("MT")) {
                sourceVersification = this.versificationService.getVersificationForVersion(JSwordPassageService.OT_BOOK);
                versificationName = "Leningrad";
            }
            if (versificationName.equals("Leningrad")) {
                ordinal = convertOSIS2Ordinal(reference, sourceVersification);
            }
            else {
                if (!hebrew) System.out.println("Something wrong, OT with greek?" + keys);
                ordinal = this.versificationService.convertReferenceGetOrdinal(reference, sourceVersification, this.versificationService.getVersificationForVersion(JSwordPassageService.OT_BOOK));
            }
        }
        String[] result = new String[0];
        if (ordinal > -1) {
            if (keys.length == 1) { // most of the calls to this method only has one key.  Create a shorter code to reduce processing time.
                result = new String[] {keys[0]};
                if (isNonAugmented(keys[0]))
                    result[0] = getAugStrongWithStrongAndOrdinal(keys[0], ordinal, wordPositionOfMultiOccurrencesInOneVerse, useNRSVVersification);
                    result[0] = result[0].substring(0, result[0].length() - 1); // remove the last character.
            }
            else {
                Set<String> deDupKeys = new HashSet<>();
//                Collections.addAll(deDupKeys, keys);
                short[] wordPositions = new short[keys.length];
                for (int firstLoopCounter = 0; firstLoopCounter < keys.length; firstLoopCounter++) {
                    boolean flagForDuplicate = deDupKeys.add(keys[firstLoopCounter]);
                    if ((!flagForDuplicate) && (isNonAugmented(keys[firstLoopCounter]))) {
                        int count = 0;
                        for (int secondLoopCounter = 0; secondLoopCounter < keys.length; secondLoopCounter++) {
                            if (keys[firstLoopCounter].equals(keys[secondLoopCounter])) {
                                if (wordPositions[secondLoopCounter] != 0) // already processed this strong number
                                    break;
                                wordPositions[secondLoopCounter] = (short) (1 << count);;
                                count ++;
                                if (count > 8) // The maximum of multiple occurrence words that is in the augmented strong file only has 8.
                                    break;
                            }
                        }
                    }
                }
                int k = 0;
                result = new String[keys.length];
                for (int i = 0; i < keys.length; i++) {
                    if (deDupKeys.contains(keys[i])) {
                        if (isNonAugmented(keys[i])) {
                            String resultFromgetAugStrong = getAugStrongWithStrongAndOrdinal(keys[i], ordinal, wordPositions[i], useNRSVVersification);
                            if (resultFromgetAugStrong.charAt(resultFromgetAugStrong.length() -1) == '*') {
                                resultFromgetAugStrong = resultFromgetAugStrong.substring(0, resultFromgetAugStrong.length() - 1);
                                boolean alreadyIncludedInResult = false;
                                for (int count = 0; count < k; count++) {
                                    if (result[count].equals(resultFromgetAugStrong)) {
                                        alreadyIncludedInResult = true;
                                        break;
                                    }
                                }
                                if (!alreadyIncludedInResult) {
                                    result[k] = resultFromgetAugStrong;
                                    k++;
                                }
                            }
                            else {
                                deDupKeys.remove(keys[i]); // Multiple occurrences of this word is not recorded in the augmented_strong.txt
                                result[k] = resultFromgetAugStrong.substring(0, resultFromgetAugStrong.length() - 1);
                                k++;
                            }
                        }
                        else {
                            deDupKeys.remove(keys[i]);
                            result[k] = keys[i];
                            k++;
                        }
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
    public String reduce(final String augmentedStrong) {
        final char firstChar = augmentedStrong.charAt(0);
        if ((firstChar == 'H' || firstChar == 'h' || firstChar == 'G' || firstChar == 'g') && Character.isLetter(augmentedStrong.charAt(augmentedStrong.length() -1))) {
            return augmentedStrong.substring(0, augmentedStrong.length() - 1);
        }
        return augmentedStrong;
    }

    private int convertOSIS2Ordinal(final String OSIS, final Versification curVersification) {
        try {
            Verse key = VerseFactory.fromString(curVersification, OSIS);
            if (key == null) return -1;
            int ordinal = key.getOrdinal();
            if (ordinal > 0)
                return ordinal;
        } catch (NoSuchVerseException e) {
            throw new StepInternalException("\"Unable to look up strongs for \" + OSIS ", e);
        }
        return -1;
    }

    private int addToAugStrong2Ref(int refIndex, String augStrong, int lenOfRef) {
        int result = augStrong.charAt(augStrong.length() - 1);
        if ((result < 65) || ((result > 90) && (result < 97)) || (result > 122)) { // Not A-Z or a-z
            System.out.println("suffix of augmented Strong " + augStrong + " is outside of range of expected characters: " + augStrong.charAt(augStrong.length() - 1) + " " + result);
            System.exit(4);
        }
        result = result << 24; // the top byte of the integer is the suffix of the augmented strong.  The other 3 byte of the integer is the index to the reference array
        if (lenOfRef == 0) return result; // if there are no reference, then there is no index to the reference array
        return result | refIndex;
    }

    private int sortAndMarkAugStrongWithoutRef(short[] refOfAugStrong, int startIndex, int refIndex, Set<Integer> ordinalsInRefNotStored, ordinalAndOccurencesInVerse[] refArray) {
        Arrays.sort(refArray); //, startIndex, refIndex);
        short previousOrdinal = 0;
        for (int i = startIndex, j = 0; i < refIndex; i++, j++) {
            if (previousOrdinal != refArray[j].ordinal) {
                refOfAugStrong[i] = refArray[j].ordinal;
                previousOrdinal = refArray[j].ordinal;
                if (ordinalsInRefNotStored.contains((int) refOfAugStrong[i]))
                    refOfAugStrong[i] = (short) (refOfAugStrong[i] | 0x8000);
                if (refArray[j].occurencesInVerse != 0) {
                    i++;
                    refIndex++;
                    refOfAugStrong[i] = (short) (refArray[j].occurencesInVerse | 0xE000); // The top (16th) to 14th bits are on for an entry a word position with multiple occurrences in a verse
                    // ordinal for OT is from 0 to 24114 (ESV) or 0 to 24182 (OHB).  When the 15th bit is on, the 14th bit is not on.
                    // ordinal for NT is subtracted by 24116 (first ordinal for the book of Matthew).
                    // ordinal for Revelation 22:21 is 32361
                    // Therefore the NT range is from 0 to about 8245.  In that number range, 15th bit will never be on for an NT ordinal.
                    // OT has some that will turn on 15th bit, but not 14th bit.
                    // There are no numbers in that NT or OT range that will turn on both 14th and 15th bits.
                    // When this scheme no longer works, expand the array of ordinals from short to int.
                    // An entry in the refArray with the 16, 15 and 14 bit turn on is an entry for a word position with multiple occurences in a verse.
                }
            }
            else {
                i--;
                refIndex--;
                if (refArray[j].occurencesInVerse > 0) {
                    if ((refOfAugStrong[i] & 0xE000) == 0xE000) // 16th to 14th bits are on so it is an entry of a word position with multiple occurrences in a verse
                        refOfAugStrong[i] |= refArray[j].occurencesInVerse;
                    else {
                        System.out.println("Unexpected duplicate of references in the augmented strong file.  The duplicate has one without and one with multiple occurrences of a word in a verse.");
                        System.exit(412);
                    }
                }
            }
        }
        return refIndex; // will need to add some entries for the multi-verse in the near future
    }

    private int addToRefArray(int refIndex, final boolean hebrew, final String augStrong, final String refs, final Versification versificationForOT,
                              final Versification versificationForNRSV, final HashMap<String, String> augStrongWithMostReferencesHash) {
        if (refs.equals("")) return refIndex;
        // Convert String Array to List
        String[] arrOfRefNotStored = augStrongWithMostReferencesHash.get(augStrong.substring(0, augStrong.length()-1)).split(" ");
        List<String> listRefNotStored  = Arrays.asList(arrOfRefNotStored);
        String[] arrOfRef = refs.split(" ");
        int startIndex = refIndex;
        final Set<Integer> ordinalsInRefNotStored1 = new HashSet<>(arrOfRefNotStored.length/2);
        final Set<Integer> ordinalsInRefNotStored2 = new HashSet<>(arrOfRefNotStored.length/2);
        ordinalAndOccurencesInVerse[] refArray = new ordinalAndOccurencesInVerse[arrOfRef.length];
        ordinalAndOccurencesInVerse[] refArrayOHB = new ordinalAndOccurencesInVerse[0];
        if (hebrew)
            refArrayOHB = new ordinalAndOccurencesInVerse[arrOfRef.length];
        int index = 0;
        for (String s : arrOfRef) {
            int start = s.indexOf('(');
            int end = s.indexOf(')');
            String aRef = s;
            String NRSVRef = s;
            if ((start > 0) && (end > 1)) {
                aRef = s.substring(0, start);
                NRSVRef = aRef.substring(0, aRef.indexOf('.')+1) + s.substring(start+1, end);
            }

            int lastCharIndex = 1;
            refArray[index] = new ordinalAndOccurencesInVerse();
            refArray[index].occurencesInVerse = 0;
            char lastCharOfRef = aRef.toUpperCase().charAt(aRef.length() - lastCharIndex);
            while ((lastCharOfRef >= 65) && (lastCharOfRef <= 73)) { // 65 is A, 73 is I, only has 15 bits to store the information
                refArray[index].occurencesInVerse |= 1 << (lastCharOfRef - 65);
                lastCharIndex ++;
                lastCharOfRef = aRef.toUpperCase().charAt(aRef.length() - lastCharIndex);
            }
            if (lastCharIndex > 1) {
                if (lastCharOfRef != 45)
                    lastCharIndex --;
                else // If there is a minus sign, it means it is NOT any of the word positions listed after the minus sign.
                    refArray[index].occurencesInVerse = (short) ~refArray[index].occurencesInVerse; // flip bits 0 to 1 and 1 to 0

                aRef = aRef.substring(0, aRef.length() - lastCharIndex);
                NRSVRef = NRSVRef.substring(0, NRSVRef.length() - lastCharIndex);
            }
            boolean addToOrdinalNotStored = listRefNotStored.contains(aRef);
            short refOrdinal = (hebrew) ? (short) convertOSIS2Ordinal(aRef, versificationForOT) : (short) (convertOSIS2Ordinal(NRSVRef, versificationForNRSV) - NT_OFFSET);
            if (addToOrdinalNotStored) ordinalsInRefNotStored1.add((int) refOrdinal);
            if (refOrdinal > -1) {
                if (hebrew) {
//                    augStrongData.refOfAugStrongOTOHB[refIndex] = refOrdinal;
                    refArrayOHB[index] = new ordinalAndOccurencesInVerse();
                    refArrayOHB[index].ordinal = refOrdinal;
                    refOrdinal = (short) convertOSIS2Ordinal(NRSVRef, versificationForNRSV);
                    if (refOrdinal > -1) {
//                        augStrongData.refOfAugStrongOTRSV[refIndex] = refOrdinal;
                        refArray[index].ordinal = refOrdinal;
                        if (addToOrdinalNotStored) ordinalsInRefNotStored2.add((int) refOrdinal);
                        // The following 3 lines are for testing to verify that there is no need to convert MT to Leningrad versification
//                        String refInTHOT = this.versificationService.convertReference(s, "OSMHB", "THOT").getOsisKeyId();
//                        if ((!refInTHOT.equalsIgnoreCase(s)))
//                            System.out.println(augStrong + " OSMHB and THOT different at " + s + " " + refInTHOT);
                    }
                } else {
//                    augStrongData.refOfAugStrongNT[refIndex] = refOrdinal;
                    refArray[index].ordinal = refOrdinal;
                }
                index ++;
                refIndex++;
            }
        }
        if (hebrew) {
            int updatedNum = sortAndMarkAugStrongWithoutRef(augStrongData.refOfAugStrongOTOHB, startIndex, refIndex, ordinalsInRefNotStored1, refArrayOHB);
            refIndex = sortAndMarkAugStrongWithoutRef(augStrongData.refOfAugStrongOTRSV, startIndex, refIndex, ordinalsInRefNotStored2, refArray);
        } else
            refIndex = sortAndMarkAugStrongWithoutRef(augStrongData.refOfAugStrongNT, startIndex, refIndex, ordinalsInRefNotStored1, refArray);
        return refIndex;
    }

    private int binarySearchOfStrong(final String augStrong) {
        int first = 0;
        int last = augStrongData.strongsWithAugments.length - 1;
        if (augStrong.charAt(0) == 'G') {
            last = augStrongData.numOfGreekStrongWithAugments - 1;
        }
        else {
            first = augStrongData.numOfGreekStrongWithAugments;
        }
        int key = cnvrtStrong2Short(augStrong);
        int mid = (first + last) / 2;
        while( first <= last ) {
            if ( augStrongData.strongsWithAugments[mid] < key ) first = mid + 1;
            else if ( augStrongData.strongsWithAugments[mid] == key ) return mid;
            else last = mid - 1;
            mid = (first + last) / 2;
        }
        return -1;
    }

    private void verifyAugStrongPattern(final String augStrong) {
        char prefix = augStrong.charAt(0);
        if ( (prefix != 'H') && (prefix != 'G') && (prefix != 'h') && (prefix != 'g') ) {
            System.out.println("augmented strong does not start with H or G: " + augStrong);
            System.exit(404);
        }
        char suffix = augStrong.charAt(augStrong.length() - 1);
        if (Character.isDigit(suffix)) {
            System.out.println("Last character of this strong is numeric: " + augStrong);
            System.exit(404);
        }
    }

    private int cnvrtStrong2Short(final String strong) {
        int startPos = 1;
        int endPos = strong.length() - 1;
        char suffix = strong.charAt(endPos);
        if (Character.isDigit(suffix)) endPos++;
        int num;
        try {
            num = parseInt(strong.substring(startPos, endPos)); // If the augmented Strong file has issue, it will run into an exception.
        } catch (NumberFormatException e) {
            LOGGER.error("Strong number is not numeric at the expected positions: " + strong + " Something wrong with the augmented Strong file.");
            return -1;
        }

        if (num > 32767) {
            LOGGER.error("Strong number has too many digits: " + strong + " Something wrong with the augmented Strong file.");
            return -1;
        }
        return num;
    }

    private void addStrongToHashMap(HashMap<Integer, Integer> strong2AugCount, final int num) {
        if (strong2AugCount.containsKey(num)) {
            strong2AugCount.put(num, strong2AugCount.get(num) + 1);
        } else {
            strong2AugCount.put(num, 1);
        }
    }

    private ImmutablePair<Character, Integer> getSuffixAndIdx(int num) {
        Character suffix = (char) (num >> 24);
        int index = num & 0x00FFFFFF;
        return new ImmutablePair<>(suffix, index);
    }

    public void updatePassageKeyWithAugStrong(String strong, Key key) {
        String trimmedStrong = strong.trim();
        boolean isAugStrong = !Character.isDigit(trimmedStrong.charAt(trimmedStrong.length() - 1)); // Last character of augmented strong should not be digit
        if (!isAugStrong) return; // No need to update the key
        final Versification sourceVersification = ((RocketPassage) key).getVersification();
        String versificationName = sourceVersification.getName();
        char prefix = trimmedStrong.charAt(0);
        boolean hebrew = (prefix == 'H') || (prefix == 'h');
        short[] ref = (hebrew) ? augStrongData.refOfAugStrongOTRSV : augStrongData.refOfAugStrongNT;
        Versification versificationForConversion = null;
        if (versificationName.equals("Leningrad")) ref = augStrongData.refOfAugStrongOTOHB;
        else if (versificationName.equals("MT")) {
            ref = augStrongData.refOfAugStrongOTOHB;
            versificationForConversion = this.versificationService.getVersificationForVersion("OHB");
        }
        else if ((!versificationName.equals("NRSV"))) // && (!versificationName.equals("NRSVA")) && (!versificationName.equals("KJV"))  && (!versificationName.equals("KJVA")))
            versificationForConversion = this.versificationService.getVersificationForVersion("ESV");
        int[] index = getIndexes2OrdinalOfAugStrong(trimmedStrong);
        if (index == null) return;
        final int index2Ref = index[0];
        final int numOfRef = index[1];
        final boolean emptyRef = index[2] == 0;
        BitSet store = ((RocketPassage) key).store;
        BitSet tmpStore = null;
        if (!emptyRef) tmpStore = new BitSet(store.size());
        for (int i = 0; i < numOfRef; i ++) {
            short ordinalShort = ref[index2Ref + i];
            if ((ordinalShort & 0xE000) == 0xE000) // It is an entry for words which occurs more than one time in a verse, not an ordinal.
                continue;
            boolean existsInAugStrongWithRefNotStore = false;
            if (ordinalShort < 0) {
                existsInAugStrongWithRefNotStore = true;
                ordinalShort = (short) (ordinalShort & 0x7FFF);
            }
            int ordinal = ordinalShort;
            if (!hebrew)
                ordinal += NT_OFFSET;
            if (versificationForConversion != null) { // Need to change versification
                String reference = versificationForConversion.decodeOrdinal(ordinal).getOsisRef();
                ordinal = convertOSIS2Ordinal(reference, sourceVersification);
                if (ordinal < 0)
                    continue;
                String checkReference = sourceVersification.decodeOrdinal(ordinal).getOsisRef();
                if (!reference.equals(checkReference)) {
                    if ((checkReference.endsWith(".0")) && (reference.endsWith(".1"))) {
                        if (!emptyRef) {
                            if (store.get(ordinal)) tmpStore.set(ordinal);
                        }
                        else if (!existsInAugStrongWithRefNotStore) store.clear(ordinal);
                        ordinal ++;
                    }
                    else System.out.println("unequal reference" + versificationName + " " + reference + " " + checkReference);
                }
            }
            if (!emptyRef) {
                if (store.get(ordinal)) tmpStore.set(ordinal);
            }
            else if (!existsInAugStrongWithRefNotStore) store.clear(ordinal);
        }
        if (!emptyRef) ((RocketPassage) key).store = tmpStore;
    }

    private int getNonZeroIndexToRefArray(final int[] augStrong2RefIdx, int numOfAugStrong, final int index) {
        int i = index;
        while (i <= numOfAugStrong) {
            int index2RefArray = augStrong2RefIdx[i] & 0x00ffffff;
            if (index2RefArray > 0) return index2RefArray;
            i ++;
        }
        System.out.println("getNonZeroIndexToRefArray cannot find non zero index!");
        return 0;
    }

    private int[] getIndexes2OrdinalOfAugStrong(String strong) {
        int index1 = binarySearchOfStrong(strong);
        if (index1 < 0) return null;
        short index2 = augStrongData.strong2AugStrongIndex[index1];
        if (index2 < 0) return null;
        int[] augStrong2RefIdx;
        char prefix = strong.charAt(0);
        int numOfReferences;
        if ((prefix == 'H') || (prefix == 'h')) {
            if (index2 > augStrongData.numOfAugStrongInOT) return null;
            augStrong2RefIdx = augStrongData.augStrong2RefIndexOT;
            numOfReferences = augStrongData.refOfAugStrongOTOHB.length;
        }
        else {
            if (index2 > augStrongData.numOfAugStrongInNT) return null;
            augStrong2RefIdx = augStrongData.augStrong2RefIndexNT;
            numOfReferences = augStrongData.refOfAugStrongNT.length;
        }
        final int numOfAugStrongWithSameStrong = augStrongData.strong2AugStrongCount[index1];
        char lastCharOfStrong = strong.charAt(strong.length() - 1);
        int suffixInt = (lastCharOfStrong & 0x000000ff) << 24;
        int[] result = new int[3];
        for (int i = index2 + numOfAugStrongWithSameStrong - 1; i >= index2; i--) {
            int curPtr = augStrong2RefIdx[i];
            int checkSuffix = curPtr & 0x7f000000;  // Don't copy over the sign bit
            if (checkSuffix == suffixInt) {
                result[0] = curPtr & 0x00ffffff; // index to list of ordinal (verse) for aug strong
                if (result[0] == 0) {
                    result[0] = getNonZeroIndexToRefArray(augStrong2RefIdx, numOfReferences, index2); // augStrong2RefIdx[index2] & 0x00ffffff; // index to list of ordinal (verse) for aug strong
                    result[1] = getNonZeroIndexToRefArray(augStrong2RefIdx, numOfReferences, index2 + numOfAugStrongWithSameStrong) - result[0]; // length
                    return result;
                }
                result[1] = getNonZeroIndexToRefArray(augStrong2RefIdx, numOfReferences, i + 1) - result[0]; // length
                result[2] = 1;
                return result;
            }
        }
        return null;
    }

    public AugmentedStrongsForSearchCount getRefIndexWithStrong(final String strong) {
        char prefix = strong.charAt(0);
        boolean hebrew = ((prefix == 'H') || (prefix == 'h'));
        int index1 = binarySearchOfStrong(strong);
        if (index1 < 0) return null;
        short index2 = augStrongData.strong2AugStrongIndex[index1];
        int[] augStrong2RefIdx;
        short[] refArray;
        int numOfReferences;
        if (hebrew) {
            if ((index2 < 0) || (index2 > augStrongData.numOfAugStrongInOT)) return null;
            augStrong2RefIdx = augStrongData.augStrong2RefIndexOT;
            refArray = augStrongData.refOfAugStrongOTOHB;
            numOfReferences = augStrongData.refOfAugStrongOTOHB.length;
        } else if ((prefix == 'G') || (prefix == 'g')) {
            if ((index2 < 0) || (index2 > augStrongData.numOfAugStrongInNT)) return null;
            augStrong2RefIdx = augStrongData.augStrong2RefIndexNT;
            refArray = augStrongData.refOfAugStrongNT;
            numOfReferences = augStrongData.refOfAugStrongNT.length;
        } else return null;
        int numOfAugStrongWithSameStrong = augStrongData.strong2AugStrongCount[index1];
        char suffix = strong.charAt(strong.length()-1);
        for (int i = 0; i < numOfAugStrongWithSameStrong; i++) {
            ImmutablePair<Character, Integer> r = getSuffixAndIdx(augStrong2RefIdx[index2 + i]);
            char curSuffix = r.getLeft();
            if (curSuffix == suffix) {
                int curIndex = r.getRight();
                boolean defaultAugStrong = false;
                int augStrong2RefIdxNextIdx ;
                int start;
                if (curIndex == 0) {
                    defaultAugStrong = true;
                    start = getNonZeroIndexToRefArray(augStrong2RefIdx, numOfReferences, index2);
                    augStrong2RefIdxNextIdx = index2 + numOfAugStrongWithSameStrong;
                }
                else {
                    start = r.getRight();
                    augStrong2RefIdxNextIdx = index2 + i + 1;
                }
                int endIndexOfCurrentAugStrongRef = getNonZeroIndexToRefArray(augStrong2RefIdx, numOfReferences, augStrong2RefIdxNextIdx);
                endIndexOfCurrentAugStrongRef --;
                return new AugmentedStrongsForSearchCount(start, endIndexOfCurrentAugStrongRef, defaultAugStrong, refArray);
            }
        }
        return null;
    }

    public boolean isVerseInAugStrong(final String reference, final String strong, final AugmentedStrongsForSearchCount arg) {
        int ordinal;
        char prefix = strong.charAt(0);
        if ((prefix == 'H') || prefix == 'h')
            ordinal = convertOSIS2Ordinal(reference, this.versificationService.getVersificationForVersion(JSwordPassageService.OT_BOOK));
        else
            ordinal = convertOSIS2Ordinal(reference, this.versificationService.getVersificationForVersion("ESV")) - NT_OFFSET;
        for (int i = arg.startIndex; i <= arg.endIndex; i ++) {
            short curOrdinalFromRefArray = arg.refArray[i];
            int ordinalInRefArrayWithoutSignBit = (curOrdinalFromRefArray & 0x7FFF);
            if (ordinalInRefArrayWithoutSignBit == ordinal) {
                return (!arg.defaultAugStrong) || (curOrdinalFromRefArray < 0);
            }
        }
        return arg.defaultAugStrong;
    }

    private String getAugStrongWithStrongAndOrdinal(final String strong, int ordinal, short wordPositionOfMultiOccurrencesInOneVerse, final boolean useNRSVVersification) {
        if ((ordinal < 0) || (ordinal > 32767)) return " ";
        int index1 = binarySearchOfStrong(strong);
        if (index1 < 0) return strong + " ";
        short index2 = augStrongData.strong2AugStrongIndex[index1];
        int[] augStrong2RefIdx;
        char prefix = strong.charAt(0);
        short[] refArray;
        if ((prefix == 'H') || (prefix == 'h')) {
            if ((index2 < 0) || (index2 > augStrongData.numOfAugStrongInOT)) return " ";
            augStrong2RefIdx = augStrongData.augStrong2RefIndexOT;
            refArray = (useNRSVVersification) ? augStrongData.refOfAugStrongOTRSV : augStrongData.refOfAugStrongOTOHB;
        } else if ((prefix == 'G') || (prefix == 'g')) {
            if ((index2 < 0) || (index2 > augStrongData.numOfAugStrongInNT)) return " ";
            augStrong2RefIdx = augStrongData.augStrong2RefIndexNT;
            refArray = augStrongData.refOfAugStrongNT;
            ordinal -= NT_OFFSET;
        } else return " ";
        int numOfAugStrongWithSameStrong = augStrongData.strong2AugStrongCount[index1];
        int index2LastAugStrongWithSameStrong = index2 + numOfAugStrongWithSameStrong - 1;
        int augStrong2RefIdxNextIdx = index2LastAugStrongWithSameStrong;
        int endIndexOfCurrentStrongRef = 0;
        while (endIndexOfCurrentStrongRef == 0) {
            augStrong2RefIdxNextIdx ++;
            int index2FirstAugStrongWithNextStrong = augStrong2RefIdx[augStrong2RefIdxNextIdx];
            endIndexOfCurrentStrongRef = getSuffixAndIdx(index2FirstAugStrongWithNextStrong).getRight(); // Next entry in augStrong2RefPtr
        }
        int endIndexOfCurrentAugStrongRef = endIndexOfCurrentStrongRef - 1;
        char suffixWithNoRefs = ' ';
        boolean foundRecordOfMultiVerse = false;
        for (int i = index2LastAugStrongWithSameStrong; i >= index2; i--) {
            ImmutablePair<Character, Integer> r = getSuffixAndIdx(augStrong2RefIdx[i]);
            char curSuffix = r.getLeft();
            int curIndex = r.getRight();
            if (curIndex == 0)
                suffixWithNoRefs = curSuffix;
            else {
                for (int x = curIndex; x <= endIndexOfCurrentAugStrongRef; x++) {
                    // the array of reference (in ordinal) are sorted.  When it reaches an ordinal in the reference array which is larger, that ordinal does not exist in the reference array.
                    // breaking out of the for loop will reduce unnecessary processing
                    if ((refArray[x] & 0xE000) == 0xE000) // it is an entry for position of words with multi occurrences in a verse
                        continue;
                    short ordinalInRefArrayWithoutSignBit = (short) (refArray[x] & 0x7FFF);
                    if (ordinalInRefArrayWithoutSignBit > ordinal) break; // array is sorted os if it is greater than the one being searched, it is not in this array.
                    if (ordinalInRefArrayWithoutSignBit == ordinal) {
                        if (wordPositionOfMultiOccurrencesInOneVerse == 0)
                            return strong + curSuffix + " ";
                        if ((refArray[x+1] & 0xE000) == 0xE000) {
                            // The maximum number of occurrences of a word in a verse is 9. 9 bits are required so an
                            // 0x1F mask is used.
                            foundRecordOfMultiVerse = true;
                            if ((refArray[x+1] & 0x001F & wordPositionOfMultiOccurrencesInOneVerse) > 0)
                                return strong + curSuffix + "*";
                            x++;
                        }
                        else return strong + curSuffix + " "; // The augmented strong file does not have multiple occurences for this word.
                    }
                }
            }
            if (curIndex != 0) endIndexOfCurrentAugStrongRef = curIndex - 1; // End of the reference for the next aug strong.  If curIndex is 0, use the previous endIndexOfCurrentAugStrongRef
        }
        if (suffixWithNoRefs != ' ') {
            if ((wordPositionOfMultiOccurrencesInOneVerse > 0) && (foundRecordOfMultiVerse))
                return strong + suffixWithNoRefs + "*";
            return strong + suffixWithNoRefs + " ";
        }
        return strong + " ";
    }

    public void loadFromSerialization(final String installFilePath) {
        String installFileFolder = "";
        int pos = installFilePath.lastIndexOf('\\');
        if (pos == -1)
            pos = installFilePath.lastIndexOf('/');
        if (pos > 1)
            installFileFolder = installFilePath.substring(0, pos+1);
        try {
            FileInputStream fileIn = new FileInputStream(installFileFolder + "augmented_strongs.dat");
            ObjectInputStream in = new ObjectInputStream(fileIn);
            augStrongData = (AugmentedStrongsData) in.readObject();
            in.close();
            fileIn.close();
        } catch (IOException i) {
            i.printStackTrace();
        } catch (ClassNotFoundException c) {
            System.out.println("augmented strong class not found");
            c.printStackTrace();
        }
    }

    public void readAndLoad(final String augStrongFile, final String installFilePath) {
        Reader fileReader = null;
        BufferedInputStream bufferedStream = null;
        String curAugStrong = "";
        String curReferences = "";
        int numOfOTReferences = 1;
        int numOfNTReferences = 1;
        HashMap<Integer, Integer> strong2AugCountGrk = new HashMap<>();
        HashMap<Integer, Integer> strong2AugCountHbr = new HashMap<>();
        HashMap<String, String> augStrongRefOT = new HashMap<>();
        HashMap<String, String> augStrongRefNT = new HashMap<>();
        String installFileFolder = "";
        int pos = installFilePath.lastIndexOf('\\');
        if (pos == -1)
            pos = installFilePath.lastIndexOf('/');
        if (pos > 1)
            installFileFolder = installFilePath.substring(0, pos+1);
        InputStream stream = null;
        try {
            stream = ModuleLoader.class.getResourceAsStream(augStrongFile);
            if (stream == null) {
                throw new StepInternalException("Unable to read resource: " + augStrongFile);
            }
            bufferedStream = new BufferedInputStream(stream);
            fileReader = new InputStreamReader(bufferedStream, StandardCharsets.UTF_8);
            final BufferedReader bufferedReader = new BufferedReader(fileReader);
            String data;
            try {
                boolean hebrew = false;
                while ((data = bufferedReader.readLine()) != null) {
                    if (data.endsWith("=======================")) {
                        if (!curAugStrong.equals("")) {
                            System.out.println("unexpected order at around " + curAugStrong);
                            System.exit(401);
                        }
                        else if (!curReferences.equals("")) {
                            System.out.println("unexpected order at around " + curReferences);
                            System.exit(401);
                        }
                    }
                    else if (data.startsWith("@AugmentedStrong=\t")) {
                        if (!curAugStrong.equals("")) {
                            System.out.println("unexpected order at around " + curAugStrong);
                            System.exit(403);
                        }
                        curAugStrong = data.substring(18);
                        verifyAugStrongPattern(curAugStrong);
                        int num = cnvrtStrong2Short(curAugStrong);
                        if (curAugStrong.charAt(0) == 'H') {
                            addStrongToHashMap(strong2AugCountHbr, num);
                            hebrew = true;
                        }
                        else {
                            addStrongToHashMap(strong2AugCountGrk, num);
                            hebrew = false;
                        }
                    }
                    else if (data.startsWith("@References=\t")) {
                        if (!curReferences.equals("")) {
                            System.out.println("unexpected order at around " + curReferences);
                            System.exit(401);
                        }
                        curReferences = data.substring(13);
                        if (hebrew) {
                            if (augStrongRefOT.containsKey(curAugStrong)) {
                                System.out.println("duplicate augmented strong " + curAugStrong);
                                continue;
                            }
                            augStrongRefOT.put(curAugStrong, curReferences);
                        }
                        else {
                            if (augStrongRefNT.containsKey(curAugStrong)) {
                                System.out.println("duplicate augmented strong " + curAugStrong);
                                continue;
                            }
                            augStrongRefNT.put(curAugStrong, curReferences);
                        }
                        if (!curReferences.equals("")) {
                            String[] arrOfRef = curReferences.split(" ");
                            int wordsOccurMoreThanOnceInAVerse = 0;
                            for (int i = 0; i < arrOfRef.length; i ++) {
                                char last = arrOfRef[i].charAt(arrOfRef[i].length() - 1);
                                if( (last >= 'A' && last <= 'Z') || (last >= 'a' && last <= 'z'))
                                    wordsOccurMoreThanOnceInAVerse ++;
                            }
                            if (hebrew) numOfOTReferences += arrOfRef.length + wordsOccurMoreThanOnceInAVerse;
                            else numOfNTReferences += arrOfRef.length + wordsOccurMoreThanOnceInAVerse;
                        }
                        curAugStrong = ""; curReferences = ""; hebrew = false;
                    }
                }
            } catch (final IOException e) {
                LOGGER.error("Unable to read a line from the augmented strongs file");
                //throw new StepInternalException("Unable to read a line from the augmented strongs file ", e);
                System.exit(404);
            }
            augStrongData.numOfGreekStrongWithAugments = strong2AugCountGrk.size();
            int numOfStrong = augStrongData.numOfGreekStrongWithAugments + strong2AugCountHbr.size();
            augStrongData.numOfAugStrongInOT = augStrongRefOT.size();
            augStrongData.numOfAugStrongInNT = augStrongRefNT.size();
            augStrongData.strongsWithAugments = new short[numOfStrong];
            augStrongData.strong2AugStrongIndex = new short[numOfStrong];
            augStrongData.strong2AugStrongCount= new byte[numOfStrong];
            augStrongData.augStrong2RefIndexOT = new int[augStrongData.numOfAugStrongInOT+1];
            augStrongData.augStrong2RefIndexNT = new int[augStrongData.numOfAugStrongInNT +1];
            TreeMap<Integer, Integer> sortedStrongGrk = new TreeMap<>(strong2AugCountGrk);
            int counter = 0;
            for (Map.Entry<Integer, Integer> entry : sortedStrongGrk.entrySet()) {
                augStrongData.strongsWithAugments[counter] = entry.getKey().shortValue();
                augStrongData.strong2AugStrongCount[counter] = entry.getValue().byteValue();
                counter ++;
            }
            TreeMap<Integer, Integer> sortedStrongHbr = new TreeMap<>(strong2AugCountHbr);
            for (Map.Entry<Integer, Integer> entry : sortedStrongHbr.entrySet()) {
                augStrongData.strongsWithAugments[counter] = entry.getKey().shortValue();
                augStrongData.strong2AugStrongCount[counter] = entry.getValue().byteValue();
                counter ++;
            }
            TreeMap<String, String> sortedAugStrong = new TreeMap<>();
            sortedAugStrong.putAll(augStrongRefNT);
            sortedAugStrong.putAll(augStrongRefOT);
            int strong2AugStrongIndexOT = 0;
            int strong2AugStrongIndexNT = 0;
            int lastStrong = 32767;
            final Versification versificationForOT = this.versificationService.getVersificationForVersion(JSwordPassageServiceImpl.OT_BOOK);
            final Versification versificationForESV = this.versificationService.getVersificationForVersion("ESV");
            int strongNumWithMostReferences = -1;
            String augStrongWithMostReferences = "";
            int mostReferencesWithinAugStrongs = 0;
            HashMap<String, String> augStrongWithMostReferencesHash = new HashMap<>();
            for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                String augStrong = entry.getKey();
                int curStrongNum = cnvrtStrong2Short(augStrong);
                if (strongNumWithMostReferences != curStrongNum) {
                    if (strongNumWithMostReferences > -1) {
                        String refs = sortedAugStrong.get(augStrongWithMostReferences).replaceAll("(\\d)[A-Ia-i\\-]+($|\\s)", "$1 ");
                        augStrongWithMostReferencesHash.put(augStrongWithMostReferences.substring(0, augStrongWithMostReferences.length()-1), refs);
                        sortedAugStrong.put(augStrongWithMostReferences, "");
                        char prefix = augStrongWithMostReferences.charAt(0);
                        if ((prefix == 'H') || (prefix == 'h'))
                            numOfOTReferences -= refs.split(" ").length;
                        else numOfNTReferences -= refs.split(" ").length;
                    }
                    strongNumWithMostReferences = curStrongNum;
                    augStrongWithMostReferences = "";
                    mostReferencesWithinAugStrongs = 0;
                }
                String references = entry.getValue();
                String[] arrOfRef = references.split(" ");
                if (mostReferencesWithinAugStrongs < arrOfRef.length) {
                    mostReferencesWithinAugStrongs = arrOfRef.length;
                    augStrongWithMostReferences = augStrong;
                }
            }
            if (strongNumWithMostReferences > -1) {
                String refs = sortedAugStrong.get(augStrongWithMostReferences);
                augStrongWithMostReferencesHash.put(augStrongWithMostReferences.substring(0, augStrongWithMostReferences.length()-1), refs);
                sortedAugStrong.put(augStrongWithMostReferences, "");
                char prefix = augStrongWithMostReferences.charAt(0);
                if ((prefix == 'H') || (prefix == 'h')) {
                    numOfOTReferences -= refs.split(" ").length;
                } else numOfNTReferences -= refs.split(" ").length;
            }
            augStrongData.refOfAugStrongOTOHB = new short[numOfOTReferences];
            augStrongData.refOfAugStrongOTRSV = new short[numOfOTReferences];
            augStrongData.refOfAugStrongNT = new short[numOfNTReferences];
            int refIndexOT = 1; // don't use the first one because a zero index means it is the aug strong with the most references and the references are not stored in memory
            int refIndexNT = 1;
            try {
            for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                String augStrong = entry.getKey();
                String references = entry.getValue().trim();
                int curStrongNum = cnvrtStrong2Short(augStrong);
                boolean hebrew = false;
                char prefix = augStrong.charAt(0);
                if ((prefix == 'H') || (prefix == 'h')) {
                    augStrongData.augStrong2RefIndexOT[strong2AugStrongIndexOT] = addToAugStrong2Ref(refIndexOT, augStrong, references.length());
                    hebrew = true;
                    } else {
                    augStrongData.augStrong2RefIndexNT[strong2AugStrongIndexNT] = addToAugStrong2Ref(refIndexNT, augStrong, references.length());
                }
                if (lastStrong != curStrongNum) {
                    int index = binarySearchOfStrong(augStrong);
                    if (index < 0) {
                        LOGGER.error("Error in AugStrongServiceImpl, cannot find augstrong of " + augStrong);
                        System.exit(405);
                    }
                    augStrongData.strong2AugStrongIndex[index] = (hebrew) ? (short) strong2AugStrongIndexOT : (short) strong2AugStrongIndexNT;
                    lastStrong = curStrongNum;
                }
                if (hebrew) {
                    strong2AugStrongIndexOT ++;
                        refIndexOT = addToRefArray(refIndexOT, true, augStrong, references, versificationForOT, versificationForESV, augStrongWithMostReferencesHash);
                    } else {
                    strong2AugStrongIndexNT ++;
                        refIndexNT = addToRefArray(refIndexNT, false, augStrong, references, versificationForOT, versificationForESV, augStrongWithMostReferencesHash);
                }
            }
            } catch (Exception i) {
                LOGGER.error("Something wrong");
                i.printStackTrace();
            }

            augStrongData.augStrong2RefIndexOT[strong2AugStrongIndexOT] = refIndexOT;
            augStrongData.augStrong2RefIndexNT[strong2AugStrongIndexNT] = refIndexNT;
            strong2AugCountGrk = null;
            strong2AugCountHbr = null;
            augStrongRefOT = null;
            augStrongRefNT = null;
            sortedStrongGrk = null;
            sortedStrongHbr = null;
            sortedAugStrong = null;
            augStrongWithMostReferencesHash = null;
            System.gc(); // Free memory that will not be used after the initial load.  This like is probably unnecessary but just in case.
            try {
                FileOutputStream fileOut =
                        new FileOutputStream(installFileFolder + "augmented_strongs.dat");
                ObjectOutputStream out = new ObjectOutputStream(fileOut);
                out.writeObject(augStrongData);
                out.close();
                fileOut.close();
                LOGGER.info("Serialized data is saved in " + installFileFolder + "augmented_strong.dat");
            } catch (IOException i) {
                LOGGER.error("Serialized data cannot be saved in " + installFileFolder + "augmented_strong.dat");
                i.printStackTrace();
            }
        } finally {
            closeQuietly(fileReader);
            closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
    }
}
