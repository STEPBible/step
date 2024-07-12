package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.create.ModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import org.crosswire.jsword.book.sword.state.OpenFileStateManager;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.io.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;
import static java.lang.Integer.parseInt;

/**
 * Strong augmentation service to provide better context/definitions to the end user.
 */
public class StrongAugmentationServiceImpl implements StrongAugmentationService {

    private class ordinalAndOccurrencesInVerse implements Comparable<ordinalAndOccurrencesInVerse> {
        short ordinal;
        short occurrencesInVerse;
        public int compareTo(ordinalAndOccurrencesInVerse ordAndOccur) {
            int comparison = this.ordinal - ordAndOccur.ordinal;
            if (comparison == 0)
                return this.occurrencesInVerse - ordAndOccur.occurrencesInVerse;
            return comparison;
        }
    }
    public class OrdinalStrong {
        public TreeMap<Short, String> OTOHB = new TreeMap<>();
        public TreeMap<Short, String> OTRSV = new TreeMap<>();
        public TreeMap<Short, String> OTGreek = new TreeMap<>();
        public TreeMap<Short, String> NTRSV = new TreeMap<>();
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(StrongAugmentationServiceImpl.class);
    private static final short NT_OFFSET = 24114; // First ordinal of NT (Matthew).  It is the same as otMaxOrdinal + 2 in Jsword
    private final JSwordVersificationService versificationService;

    @Inject
    public StrongAugmentationServiceImpl(final JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
    }

    private int convertOSIS2Ordinal(final String OSIS, final Versification curVersification) {
        try {
            Verse key = VerseFactory.fromString(curVersification, OSIS);
            if (key == null) return -1;
            int ordinal = key.getOrdinal();
            if (ordinal > 0)
                return ordinal;
        } catch (NoSuchVerseException e) {
            System.out.println("Aug strong processing, convertOSIS2Ordinal. Unable to look up OSIS id: " + OSIS);
            throw new StepInternalException("\"Unable to look up strongs for \" + OSIS ", e);
        }
        return -1;
    }

    private void sortAndMarkAugStrongWithoutRef(int numOfRefs, ordinalAndOccurrencesInVerse[] refArrayIn,
                                               TreeMap<Short, String> ordinalStrong, final String augStrong, Versification versificationToUse) {
        ordinalAndOccurrencesInVerse[] refArray = null;
        if (numOfRefs == refArrayIn.length)
            refArray = refArrayIn;
        else {
            refArray = new ordinalAndOccurrencesInVerse[numOfRefs];
            System.arraycopy(refArrayIn, 0, refArray, 0, numOfRefs);
        }
        Arrays.sort(refArray);
        for (int i = 0, j = 0; i < numOfRefs; i++, j++) {
            short temp = refArray[j].ordinal;
            String augStrongToAdd = augStrong.substring(1);
            boolean multiOccurrence = false;
            if (refArray[j].occurrencesInVerse != 0) {
                augStrongToAdd += ';';
                if ((refArray[j].occurrencesInVerse & 0x0001) > 0) augStrongToAdd += "1";
                if ((refArray[j].occurrencesInVerse & 0x0002) > 0) augStrongToAdd += "2";
                if ((refArray[j].occurrencesInVerse & 0x0004) > 0) augStrongToAdd += "3";
                if ((refArray[j].occurrencesInVerse & 0x0008) > 0) augStrongToAdd += "4";
                if ((refArray[j].occurrencesInVerse & 0x0010) > 0) augStrongToAdd += "5";
                if ((refArray[j].occurrencesInVerse & 0x0020) > 0) augStrongToAdd += "6";
                if ((refArray[j].occurrencesInVerse & 0x0040) > 0) augStrongToAdd += "7";
                if ((refArray[j].occurrencesInVerse & 0x0080) > 0) augStrongToAdd += "8";
                if ((refArray[j].occurrencesInVerse & 0x0100) > 0) augStrongToAdd += "9";
                multiOccurrence = true;
            }
            if (ordinalStrong != null) {
                if (ordinalStrong.containsKey(temp)) {
                    String listOfStrongAlreadyAdded = ordinalStrong.get(temp);
                    if (listOfStrongAlreadyAdded.length() >= augStrong.length() - 1) { // augStrong has the H or G prefix so need to minus 1 from the length before compare
                        String lastWord = listOfStrongAlreadyAdded.substring(listOfStrongAlreadyAdded.lastIndexOf(" ") + 1);
                        if (multiOccurrence) {
                            String firstPart = augStrongToAdd.split(";")[0];
                            if (lastWord.equals(firstPart)) {
                                listOfStrongAlreadyAdded = listOfStrongAlreadyAdded.substring(0, listOfStrongAlreadyAdded.length() - firstPart.length()).trim();
                            }
                        } else {
                            String tmpStr = augStrong.substring(0, augStrong.length() - 1);
                            if (lastWord.equals(augStrongToAdd)) {
                                listOfStrongAlreadyAdded = listOfStrongAlreadyAdded.substring(0, listOfStrongAlreadyAdded.length() - augStrongToAdd.length()).trim();
                            }
                            else if (tmpStr.equals(lastWord.substring(0, lastWord.length()-1))) {
                                int tmpOrdinal = (augStrong.charAt(0) == 'G') ? temp + NT_OFFSET : temp;
                                String passage = versificationToUse.decodeOrdinal(tmpOrdinal).getOsisRef();
                                System.out.println("Duplicate augstrong: " + augStrong + " " + lastWord + " " + passage + " ordinal: " + temp);
                            }
                        }
                    }
                    ordinalStrong.put(temp, listOfStrongAlreadyAdded + " " + augStrongToAdd);
                } else
                    ordinalStrong.put(temp, augStrongToAdd);
            }
        }
    }

    private void addToRefArray(TreeMap<Short, String> ordinalStrong, final Versification versification,
                               final TreeMap<String, String> sortedAugStrong, byte[] defaultAugment,
                               final short[] strongsWithAugments, final boolean useSecondReference) {
        for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
            String augStrong = entry.getKey();
            int augStrongIndex = binarySearchOfStrong(augStrong, strongsWithAugments);
            if (augStrongIndex < 0) {
                LOGGER.error("Error in AugStrongServiceImpl addToRefArray, cannot find augstrong of " + augStrong);
                System.exit(405);
            }
            if (augStrong.charAt(augStrong.length() - 1) == defaultAugment[augStrongIndex])
                continue; // Do not need to process the default augment.
            String refs = entry.getValue().trim();
            String[] arrOfRef = refs.split(" ");
            ordinalAndOccurrencesInVerse[] ordinalOccurrencesArray = new ordinalAndOccurrencesInVerse[arrOfRef.length];
            int index = 0;
            for (String currentRef: arrOfRef) {
                currentRef = currentRef.trim();
                if (currentRef.equals(""))
                    continue;
                String mainRef = currentRef;
                int startOfLeftParanthesis = -1;
                startOfLeftParanthesis = currentRef.indexOf('(');
                int endOfLeftParanthesis = currentRef.indexOf(')');
                if ((startOfLeftParanthesis > 0) && (endOfLeftParanthesis > 1)) {
                    if (useSecondReference)
                        mainRef = mainRef.substring(0, mainRef.indexOf('.') + 1) + // Name of the book e.g.: Gen.
                                currentRef.substring(startOfLeftParanthesis + 1, endOfLeftParanthesis); // Chapter and verse e.g: 1.1
                    else
                        mainRef = currentRef.substring(0, startOfLeftParanthesis);

                }
                int lastCharIndex = 1;
                char lastCharOfRef = currentRef.toUpperCase().charAt(currentRef.length() - lastCharIndex);
                ordinalAndOccurrencesInVerse curRefOrdinalAndOccurrences = new ordinalAndOccurrencesInVerse();
                curRefOrdinalAndOccurrences.occurrencesInVerse = 0;
                while ((lastCharOfRef >= 65) && (lastCharOfRef <= 73)) { // 65 is A, 73 is I, only has 15 bits to store the information
                    curRefOrdinalAndOccurrences.occurrencesInVerse |= 1 << (lastCharOfRef - 65);
                    lastCharIndex++;
                    lastCharOfRef = currentRef.toUpperCase().charAt(currentRef.length() - lastCharIndex);
                }
                if (lastCharIndex > 1) {
                    if (lastCharOfRef != 45) // character is a minus sign
                        lastCharIndex--;
                    else // If there is a minus sign, it means it is NOT any of the word positions listed after the minus sign.
                        curRefOrdinalAndOccurrences.occurrencesInVerse = (short) ~curRefOrdinalAndOccurrences.occurrencesInVerse; // flip bits 0 to 1 and 1 to 0
                    if (startOfLeftParanthesis == -1) // If the reference has the "(" and ")" (e.g.: Exod.22.6(22.7)B), the reference does not have the character for the occurrence.
                        mainRef = mainRef.substring(0, mainRef.length() - lastCharIndex);
                }
                short refOrdinal = (short) convertOSIS2Ordinal(mainRef, versification);
                if (refOrdinal < 0) {
                    System.out.println("Cannot find ordinal for " + mainRef);
                    continue; // cannot process it because it cannot find the ordinal.
                }
                if ((!versification.getName().equals("MT")) && (refOrdinal > NT_OFFSET))
                    refOrdinal -= NT_OFFSET;
                curRefOrdinalAndOccurrences.ordinal = refOrdinal;
                ordinalOccurrencesArray[index] = curRefOrdinalAndOccurrences;
                index++;
            }
            sortAndMarkAugStrongWithoutRef(index, ordinalOccurrencesArray, ordinalStrong, augStrong, versification);
        }
    }

    private int binarySearchOfStrong(final String augStrong, final short[] strongsWithAugments) {
        int first = 0;
        int last = strongsWithAugments.length - 1;
        int key = convertStrong2Short(augStrong);
        int mid = (first + last) / 2;
        while( first <= last ) {
            if ( strongsWithAugments[mid] < key ) first = mid + 1;
            else if ( strongsWithAugments[mid] == key ) return mid;
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

    private int convertStrong2Short(final String strong) {
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

    private short[] buildArrayOfStrongsWithAugments(TreeMap<Integer, Integer> strong2AugCount) {
        short[] strongsWithAugments = new short[strong2AugCount.size()];
        int counter = 0;
        for (Map.Entry<Integer, Integer> entry : strong2AugCount.entrySet()) {
            strongsWithAugments[counter] = entry.getKey().shortValue();
            counter ++;
        }
        return strongsWithAugments;
    }

    private void addDefaultAugment(final int strongNumUnderReview, final String augStrongWithMostReferences,
                                   byte[] defaultAugment, final short[] strongsWithAugments) {
        if (strongNumUnderReview > -1) {
            int index = binarySearchOfStrong(augStrongWithMostReferences, strongsWithAugments);
            if (index < 0) {
                LOGGER.error("Error in AugStrongServiceImpl, cannot find augstrong of " + augStrongWithMostReferences);
                System.exit(405);
            }
            defaultAugment[index] = (byte) augStrongWithMostReferences.charAt(augStrongWithMostReferences.length() - 1);
        }
    }

    private void buildAugStringWithMostReferences(final TreeMap<String, String> sortedAugStrong,
                                                 byte[] defaultAugment,
                                                 final short[] strongsWithAugments) {
        int strongNumUnderReview = -1;
        String augStrongWithMostReferences = "";
        int mostReferencesWithinAugStrongs = 0;
        try {
            for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                String augStrong = entry.getKey();
                String references = entry.getValue().trim();
                int curStrongNumWithoutAugment = convertStrong2Short(augStrong);
                if (strongNumUnderReview != curStrongNumWithoutAugment) { // New Strong numbers
                    addDefaultAugment(strongNumUnderReview, augStrongWithMostReferences, defaultAugment, strongsWithAugments);
                    strongNumUnderReview = curStrongNumWithoutAugment; // update variables for new Strong numbers
                    augStrongWithMostReferences = "";
                    mostReferencesWithinAugStrongs = 0;
                }
                final int bigNumber = 99999999;
                int numOfReferences = 0;
                if (references.indexOf("*") > -1) {
                    if (mostReferencesWithinAugStrongs == bigNumber) {
                        System.out.println("The * for reference is used twice for Strong number at " + augStrong);
                        System.exit(404);
                    }
                    numOfReferences = bigNumber;
                }
                else
                    numOfReferences = references.split(" ").length;
                if (mostReferencesWithinAugStrongs < numOfReferences) {
                    mostReferencesWithinAugStrongs = numOfReferences;
                    augStrongWithMostReferences = augStrong;
                }
            }
            addDefaultAugment(strongNumUnderReview, augStrongWithMostReferences, defaultAugment, strongsWithAugments);
        } catch (Exception i) {
            LOGGER.error("Something wrong in StrongAugmentationServices");
            i.printStackTrace();
        }
    }

    public void loadFromSerialization(final String installFilePath) {
        String installFileFolder = "";
        int pos = installFilePath.lastIndexOf('\\');
        if (pos == -1)
            pos = installFilePath.lastIndexOf('/');
        if (pos > 1)
            installFileFolder = installFilePath.substring(0, pos+1);
        try {
            FileInputStream fileIn = new FileInputStream(installFileFolder + "ordinal_strongs.dat");
            ObjectInputStream in = new ObjectInputStream(fileIn);
            OpenFileStateManager.OrdinalStrongArray osArray = (OpenFileStateManager.OrdinalStrongArray) in.readObject();
            OpenFileStateManager.addOrdinalStrong(osArray);
            in.close();
            fileIn.close();
        } catch (IOException i) {
            i.printStackTrace();
        } catch (ClassNotFoundException c) {
            System.out.println("augmented strong class not found");
            c.printStackTrace();
        }
    }

    private byte[] compactStrongsString(final String strongsInString) {
        String[] augStrongs = strongsInString.trim().split(" ");
        int len = 0;
        for (int i = 0; i < augStrongs.length; i++) {
            String[] partsOfStrong = augStrongs[i].split(";");
            if (partsOfStrong.length > 1)
                len += 4;
            else
                len += 3;
        }
        byte[] result = new byte[len];

        int pos = 0;
        for (int i = 0; i < augStrongs.length; i++) {
            String[] partsOfStrong = augStrongs[i].split(";");
            short strongNum = Short.valueOf(partsOfStrong[0].substring(0, 4));
            if (partsOfStrong.length > 1)
                strongNum = (short) (strongNum * -1);
            ByteBuffer buffer = ByteBuffer.allocate(2).putShort(strongNum);
            System.arraycopy(buffer.array(), 0, result, pos, 2);
            pos += 2;
            result[pos] = (byte) (partsOfStrong[0].charAt(4));
            pos ++;
            if (partsOfStrong.length > 1) {
                for (int j = 0; j < partsOfStrong[1].length(); j++) {
                    char currentChar = partsOfStrong[1].charAt(j);
                    int shiftByBits = currentChar - '1';
                    if (shiftByBits == 8) // '9', 9th occurrence
                        result[pos-1] = (byte) (result[pos-1] * -1); // Make the augment a negative number to indicate the 9th occurrence is a match
                    else if (shiftByBits <= 7) { // 1st to 8th occurrences
                        byte mask = (byte) (0x01 << shiftByBits);
                        result[pos] = (byte) (result[pos] | mask);
                    }
                }
                pos ++;
            }
        }
        return result;
    }


    private int calculateLength(final TreeMap<Short, String> ordinalStrong, HashMap<String, Integer> augStrongsForEachOrdinal) {
        int totalLength = 0;
        for (Map.Entry<Short, String> entry : ordinalStrong.entrySet()) {
            String strongsInString = entry.getValue();
            byte[] packedStrongs = compactStrongsString(strongsInString);
            if (!augStrongsForEachOrdinal.containsKey(strongsInString)) {
                augStrongsForEachOrdinal.put(strongsInString, 0);
                totalLength += packedStrongs.length + 1;
            }
        }
        return totalLength;
    }

    private int copyOrdinalStrong(int position, final TreeMap<Short, String> ordinalStrong,
                                  HashMap<String, Integer> augStrongsForEachOrdinal,
                                  int[] ordinalPtr2AugStrong, byte[] augStrongByteArray) {
        for (Map.Entry<Short, String> entry : ordinalStrong.entrySet()) {
            short currentOrdinal = entry.getKey();
            String strongsInString = entry.getValue();
            byte[] packedStrongs = compactStrongsString(strongsInString);
            int posOfStrongsAlreadyInAugStrongByteArray = augStrongsForEachOrdinal.get(strongsInString);
            if (posOfStrongsAlreadyInAugStrongByteArray == 0) {
                ordinalPtr2AugStrong[currentOrdinal] = position;
                augStrongsForEachOrdinal.put(strongsInString, position);
                int len = packedStrongs.length;
                augStrongByteArray[position] = (byte) (len);
                position ++;
                System.arraycopy(packedStrongs, 0, augStrongByteArray, position, len);
                position += len;
            } else
                ordinalPtr2AugStrong[currentOrdinal] = posOfStrongsAlreadyInAugStrongByteArray;
        }
        return position;
    }


    public void readAndLoad(final String augStrongFile, final String installFilePath) {
        Reader fileReader = null;
        BufferedInputStream bufferedStream = null;
        String curAugStrong = "";
        TreeMap<Integer, Integer> strong2AugCountHbr = new TreeMap<>();
        TreeMap<Integer, Integer> strong2AugCountOTGrk = new TreeMap<>();
        TreeMap<Integer, Integer> strong2AugCountNTGrk = new TreeMap<>();
        TreeMap<String, String> sortedAugStrongHbr  = new TreeMap<>();
        TreeMap<String, String> sortedAugStrongOTGreek  = new TreeMap<>();
        TreeMap<String, String> sortedAugStrongNTGreek  = new TreeMap<>();

        String installFileFolder = "";
        int pos = installFilePath.lastIndexOf('\\');
        if (pos == -1)
            pos = installFilePath.lastIndexOf('/');
        if (pos > 1)
            installFileFolder = installFilePath.substring(0, pos+1);
        InputStream stream = null;
        try {
            stream = ModuleLoader.class.getResourceAsStream(augStrongFile);
            if (stream == null)
                throw new StepInternalException("Unable to read resource: " + augStrongFile);
            bufferedStream = new BufferedInputStream(stream);
            fileReader = new InputStreamReader(bufferedStream, StandardCharsets.UTF_8);
            final BufferedReader bufferedReader = new BufferedReader(fileReader);
            String data;
            try {
                while ((data = bufferedReader.readLine()) != null) {
                    if (data.endsWith("=======================")) {
                        curAugStrong = "";
                    }
                    else if (data.startsWith("@AugmentedStrong=\t")) {
                        if (!curAugStrong.equals(""))
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", unexpected order at around " + curAugStrong);
                        curAugStrong = data.substring(18);
                        verifyAugStrongPattern(curAugStrong);
                    }
                    else if (data.startsWith("@References=\t")) {
                        String curReferences = data.substring(13);
                        int num = convertStrong2Short(curAugStrong);
                        if (curAugStrong.charAt(0) == 'H') {
                            strong2AugCountHbr.put(num, 1);
                            if (sortedAugStrongHbr.containsKey(curAugStrong))
                                throw new StepInternalException("readAndLoad: " + augStrongFile + ", duplicate augmented strong " + curAugStrong);
                            sortedAugStrongHbr.put(curAugStrong, curReferences);
                        }
                        else {
                            strong2AugCountNTGrk.put(num, 1);
                            if (sortedAugStrongNTGreek.containsKey(curAugStrong))
                                throw new StepInternalException("readAndLoad: " + augStrongFile + ", duplicate augmented strong " + curAugStrong);
                            sortedAugStrongNTGreek.put(curAugStrong, curReferences);
                        }
                    }
                    else if (data.startsWith("@LXXRefs=\t")) {
                        String curReferences = data.substring(10);
                        int num = convertStrong2Short(curAugStrong);
                        if (curAugStrong.charAt(0) != 'G')
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", Non Greek DStrong for LXXRefs " + curAugStrong);
                        strong2AugCountOTGrk.put(num, 1);
                        if (sortedAugStrongOTGreek.containsKey(curAugStrong))
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", duplicate augmented strong " + curAugStrong);
                        sortedAugStrongOTGreek.put(curAugStrong, curReferences);
                    }
                    else {
                        System.out.println("unrecognized line in augmented_strongs.txt file: " + data);
                    }
                }
            } catch (final IOException e) {
                LOGGER.error("Unable to read a line from the augmented strongs file");
                throw new StepInternalException("Unable to read a line from the augmented strongs file ", e);
            }
            OpenFileStateManager.OrdinalStrongArray osArray = new OpenFileStateManager.OrdinalStrongArray();

            osArray.defaultAugmentOTHebrew = new byte[strong2AugCountHbr.size()];
            osArray.defaultAugmentOTGreek = new byte[strong2AugCountOTGrk.size()];
            osArray.defaultAugmentNTGreek = new byte[strong2AugCountNTGrk.size()];

            // An array of Strong numbers with augmented strongs.  If a Strong does not have augmented, it will not be in this
            // array.  Each Strong number is a short (15 bits) so Strong numbers cannot be over 32,767.  15 bits should be OK
            // because all Strong with augments are 4 digits.  If 15 bit is not enough, change it from a short[] to int[]
            // This array is sorted so that binary search can be used to speed up the lookup.  Since a lookup is need for every
            // Strong word, it is important the lookup is efficient.
            osArray.strongsWithAugmentsOTHebrew = buildArrayOfStrongsWithAugments(strong2AugCountHbr);
            osArray.strongsWithAugmentsOTGreek = buildArrayOfStrongsWithAugments(strong2AugCountOTGrk);
            osArray.strongsWithAugmentsNTGreek = buildArrayOfStrongsWithAugments(strong2AugCountNTGrk);

            final Versification versificationForOT = this.versificationService.getVersificationForVersion(JSwordPassageServiceImpl.OT_BOOK);
            final Versification versificationForESV = this.versificationService.getVersificationForVersion("ESV");

            OrdinalStrong ordinalStrong = new OrdinalStrong();
            // This section of code is to create a hash for augStrongWithMostReferencesStrongNum
            buildAugStringWithMostReferences(sortedAugStrongHbr, osArray.defaultAugmentOTHebrew, osArray.strongsWithAugmentsOTHebrew);
            addToRefArray(ordinalStrong.OTOHB, versificationForOT,
                    sortedAugStrongHbr, osArray.defaultAugmentOTHebrew,
                    osArray.strongsWithAugmentsOTHebrew, false);
            addToRefArray(ordinalStrong.OTRSV, versificationForESV,
                    sortedAugStrongHbr, osArray.defaultAugmentOTHebrew,
                    osArray.strongsWithAugmentsOTHebrew, true);

            buildAugStringWithMostReferences(sortedAugStrongNTGreek, osArray.defaultAugmentNTGreek, osArray.strongsWithAugmentsNTGreek);
            addToRefArray(ordinalStrong.NTRSV, versificationForESV,
                    sortedAugStrongNTGreek, osArray.defaultAugmentNTGreek,
                    osArray.strongsWithAugmentsNTGreek, false);

            buildAugStringWithMostReferences(sortedAugStrongOTGreek, osArray.defaultAugmentOTGreek, osArray.strongsWithAugmentsOTGreek);
            addToRefArray(ordinalStrong.OTGreek, versificationForESV,
                    sortedAugStrongOTGreek, osArray.defaultAugmentOTGreek,
                    osArray.strongsWithAugmentsOTGreek, false);

            osArray.ordinalOTHebrewOHB = new int[24183]; // To do: get this number at run time
            osArray.ordinalOTHebrewRSV = new int[24116];
            osArray.ordinalOTGreek = new int[24116];
            osArray.ordinalNT = new int[8248];
            HashMap<String, Integer> augStrongsForEachOrdinal  = new HashMap<>();
            int totalLength = calculateLength(ordinalStrong.OTOHB, augStrongsForEachOrdinal);
            totalLength += calculateLength(ordinalStrong.OTRSV, augStrongsForEachOrdinal);
            osArray.hebrewAugStrong = new byte[totalLength+1];
            int position = 1; // position 0 means no entry so start at position 1;
            position = copyOrdinalStrong(position, ordinalStrong.OTOHB, augStrongsForEachOrdinal,
                    osArray.ordinalOTHebrewOHB, osArray.hebrewAugStrong);
            copyOrdinalStrong(position, ordinalStrong.OTRSV, augStrongsForEachOrdinal,
                    osArray.ordinalOTHebrewRSV, osArray.hebrewAugStrong);
            augStrongsForEachOrdinal.clear();
            totalLength = calculateLength(ordinalStrong.NTRSV, augStrongsForEachOrdinal);
            totalLength += calculateLength(ordinalStrong.OTGreek, augStrongsForEachOrdinal);
            osArray.greekAugStrong = new byte[totalLength+1];
            position = 1; // position 0 means no entry so start at position 1;
            position = copyOrdinalStrong(position, ordinalStrong.NTRSV, augStrongsForEachOrdinal,
                    osArray.ordinalNT, osArray.greekAugStrong);
            copyOrdinalStrong(position, ordinalStrong.OTGreek, augStrongsForEachOrdinal,
                    osArray.ordinalOTGreek, osArray.greekAugStrong);

            OpenFileStateManager.addOrdinalStrong(osArray);

            ordinalStrong = null;
            sortedAugStrongOTGreek = null;
            sortedAugStrongHbr = null;
            sortedAugStrongNTGreek = null;
            strong2AugCountNTGrk = null;
            strong2AugCountHbr = null;
            strong2AugCountOTGrk = null;
            augStrongsForEachOrdinal = null;

            try {
                FileOutputStream fileOut =
                        new FileOutputStream(installFileFolder + "ordinal_strongs.dat");
                ObjectOutputStream out = new ObjectOutputStream(fileOut);
                out.writeObject(osArray);
                out.close();
                fileOut.close();
                LOGGER.info("Serialized data is saved in " + installFileFolder + "ordinal_strongs.dat");
            } catch (IOException i) {
                LOGGER.error("Serialized data cannot be saved in " + installFileFolder + "ordinal_strongs.dat");
                i.printStackTrace();
            }

            System.gc(); // Free memory that will not be used after the initial load.  This like is probably unnecessary but just in case.
        } finally {
            closeQuietly(fileReader);
            closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
    }
}
