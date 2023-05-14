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
    public class OrdinalStrong implements Serializable {
        public TreeMap<Short, String> OTOHB = new TreeMap<>();
        public TreeMap<Short, Short> OTRSV = new TreeMap<>();
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
            throw new StepInternalException("\"Unable to look up strongs for \" + OSIS ", e);
        }
        return -1;
    }

    private void sortAndMarkAugStrongWithoutRef(int numOfRefs, ordinalAndOccurencesInVerse[] refArray,
                                               TreeMap<Short, String> ordinalStrong, final String augStrong, final String defaultAugStrong, Versification versificationToUse) {
//        if (augStrong.equals(defaultAugStrong))
//            return;
        Arrays.sort(refArray);
        for (int i = 0, j = 0; i < numOfRefs; i++, j++) {
            short temp = refArray[j].ordinal;
            String augStrongToAdd = augStrong;
            boolean multiOccurrence = false;
            if (refArray[j].occurencesInVerse != 0) {
                augStrongToAdd = defaultAugStrong + ';' + augStrong.substring(augStrong.length()-1) + ';';
                if ((refArray[j].occurencesInVerse & 0x0001) > 0) augStrongToAdd += "1";
                if ((refArray[j].occurencesInVerse & 0x0002) > 0) augStrongToAdd += "2";
                if ((refArray[j].occurencesInVerse & 0x0004) > 0) augStrongToAdd += "3";
                if ((refArray[j].occurencesInVerse & 0x0008) > 0) augStrongToAdd += "4";
                if ((refArray[j].occurencesInVerse & 0x0010) > 0) augStrongToAdd += "5";
                if ((refArray[j].occurencesInVerse & 0x0020) > 0) augStrongToAdd += "6";
                if ((refArray[j].occurencesInVerse & 0x0040) > 0) augStrongToAdd += "7";
                if ((refArray[j].occurencesInVerse & 0x0080) > 0) augStrongToAdd += "8";
                if ((refArray[j].occurencesInVerse & 0x0100) > 0) augStrongToAdd += "9";
                multiOccurrence = true;
            }
            if (ordinalStrong != null) {
                if (ordinalStrong.containsKey(temp)) {
                    String listOfStrongAlreadyAdded = ordinalStrong.get(temp);
                    if (listOfStrongAlreadyAdded.length() >= augStrong.length()) {
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

    private void addToRefArray(final boolean hebrew, final String augStrong, final String refs,
                              final Versification versificationForOT, final Versification versificationForNRSV,
                              OrdinalStrong ordinalStrong, final String defaultAugStrong) {
        if (augStrong.equals(defaultAugStrong))
            return;
        String[] arrOfRef = refs.split(" ");
        ordinalAndOccurencesInVerse[] refArray = new ordinalAndOccurencesInVerse[arrOfRef.length];
        ordinalAndOccurencesInVerse[] refArrayOHB = new ordinalAndOccurencesInVerse[0];
        if (hebrew)
            refArrayOHB = new ordinalAndOccurencesInVerse[arrOfRef.length];
        int index = 0;
        Versification versificationToUse = (hebrew) ? versificationForOT : versificationForNRSV;
        for (String s : arrOfRef) {
            String aRef = s;
            String NRSVRef = s;
            String checkString4MultiOccurrencesDStrong = aRef;
            int start = s.indexOf('(');
            int end = s.indexOf(')');
            if ((start > 0) && (end > 1)) {
                aRef = s.substring(0, start);
                NRSVRef = aRef.substring(0, aRef.indexOf('.')+1) + s.substring(start+1, end);
                checkString4MultiOccurrencesDStrong = s;
            }

            int lastCharIndex = 1;
            char lastCharOfRef = checkString4MultiOccurrencesDStrong.toUpperCase().charAt(checkString4MultiOccurrencesDStrong.length() - lastCharIndex);
            refArray[index] = new ordinalAndOccurencesInVerse();
            refArray[index].occurencesInVerse = 0;
            while ((lastCharOfRef >= 65) && (lastCharOfRef <= 73)) { // 65 is A, 73 is I, only has 15 bits to store the information
                refArray[index].occurencesInVerse |= 1 << (lastCharOfRef - 65);
                lastCharIndex ++;
                lastCharOfRef = checkString4MultiOccurrencesDStrong.toUpperCase().charAt(checkString4MultiOccurrencesDStrong.length() - lastCharIndex);
            }
            if (lastCharIndex > 1) {
                if (lastCharOfRef != 45) // character is a minus sign
                    lastCharIndex --;
                else // If there is a minus sign, it means it is NOT any of the word positions listed after the minus sign.
                    refArray[index].occurencesInVerse = (short) ~refArray[index].occurencesInVerse; // flip bits 0 to 1 and 1 to 0
                if (start == -1) {
                    aRef = aRef.substring(0, aRef.length() - lastCharIndex);
                    NRSVRef = NRSVRef.substring(0, NRSVRef.length() - lastCharIndex);
                }
            }
            short refOrdinal = (hebrew) ? (short) convertOSIS2Ordinal(aRef, versificationForOT) : (short) (convertOSIS2Ordinal(NRSVRef, versificationForNRSV) - NT_OFFSET);
            if (refOrdinal > -1) {
                if (hebrew) {
                    refArrayOHB[index] = new ordinalAndOccurencesInVerse();
                    refArrayOHB[index].ordinal = refOrdinal;
                    refArrayOHB[index].occurencesInVerse = refArray[index].occurencesInVerse;
                    refOrdinal = (short) convertOSIS2Ordinal(NRSVRef, versificationForNRSV);
                    short newNRSVOrdinalToSet = refArrayOHB[index].ordinal;
                    if (refOrdinal > -1) {
                        refArray[index].ordinal = refOrdinal;
                        if (ordinalStrong.OTRSV.containsKey(refOrdinal)) {
                            short alreadySetOrdinal = (short) (ordinalStrong.OTRSV.get(refOrdinal) & 0x7fff);;
                            if (alreadySetOrdinal != newNRSVOrdinalToSet) {
                                short secondOrdinal;
                                if (alreadySetOrdinal > newNRSVOrdinalToSet) {
                                    secondOrdinal = alreadySetOrdinal;
                                } else {
                                    secondOrdinal = newNRSVOrdinalToSet;
                                    newNRSVOrdinalToSet = alreadySetOrdinal;
                                }
                                if ((newNRSVOrdinalToSet + 1) != secondOrdinal) {
                                    System.out.println("1st: " + aRef + " " + NRSVRef + " refOrdinal: " + refOrdinal + " " + ordinalStrong.OTRSV.get(refOrdinal) + " " + refArrayOHB[index].ordinal);
                                    System.exit(404);
                                }
                                newNRSVOrdinalToSet = (short) (newNRSVOrdinalToSet | 0x8000);
                            }
                        }
                        ordinalStrong.OTRSV.put(refOrdinal, newNRSVOrdinalToSet);
                    }
                } else {
                    refArray[index].ordinal = refOrdinal;
                }
                index ++;
            }
        }
        if (hebrew) {
            sortAndMarkAugStrongWithoutRef(index, refArrayOHB, ordinalStrong.OTOHB, augStrong, defaultAugStrong, versificationToUse);
        } else
            sortAndMarkAugStrongWithoutRef(index, refArray, ordinalStrong.NTRSV, augStrong, defaultAugStrong, versificationToUse);
    }

    private int binarySearchOfStrong(final String augStrong, final int numOfGreekStrongWithAugments,
                                     final short[] strongsWithAugments) {
        int first = 0;
        int last = strongsWithAugments.length - 1;
        if (augStrong.charAt(0) == 'G') {
            last = numOfGreekStrongWithAugments - 1;
        }
        else {
            first = numOfGreekStrongWithAugments;
        }
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

    public void readAndLoad(final String augStrongFile, final String installFilePath) {
        Reader fileReader = null;
        BufferedInputStream bufferedStream = null;
        String curAugStrong = "";
        String curReferences = "";
        TreeMap<Integer, Integer> strong2AugCountGrk = new TreeMap<>();
        TreeMap<Integer, Integer> strong2AugCountHbr = new TreeMap<>();
        TreeMap<String, String> sortedAugStrong  = new TreeMap<>();
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
                boolean hebrew = false;
                while ((data = bufferedReader.readLine()) != null) {
                    if (data.endsWith("=======================")) {
                        if (!curAugStrong.equals("")) {
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", unexpected order at around " + curAugStrong);
                        }
                        else if (!curReferences.equals("")) {
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", unexpected order at around " + curReferences);
                        }
                    }
                    else if (data.startsWith("@AugmentedStrong=\t")) {
                        if (!curAugStrong.equals("")) {
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", unexpected order at around " + curAugStrong);
                        }
                        curAugStrong = data.substring(18);
                        verifyAugStrongPattern(curAugStrong);
                        int num = convertStrong2Short(curAugStrong);
                        if (curAugStrong.charAt(0) == 'H') {
                            strong2AugCountHbr.put(num, 1);
                            hebrew = true;
                        }
                        else {
                            strong2AugCountGrk.put(num, 1);
                            hebrew = false;
                        }
                    }
                    else if (data.startsWith("@References=\t")) {
                        if (!curReferences.equals("")) {
                            throw new StepInternalException("readAndLoad: " + augStrongFile + ", empty references");
                        }
                        curReferences = data.substring(13);
                        if (hebrew) {
                            if (sortedAugStrong.containsKey(curAugStrong)) {
                                throw new StepInternalException("readAndLoad: " + augStrongFile + ", duplicate augmented strong " + curAugStrong);
                            }
                            sortedAugStrong.put(curAugStrong, curReferences);
                        }
                        else { // If there are augmented_strong for OT, this will need to be updated
                            if (sortedAugStrong.containsKey(curAugStrong)) {
                                throw new StepInternalException("readAndLoad: " + augStrongFile + ", duplicate augmented strong " + curAugStrong);
                            }
                            sortedAugStrong.put(curAugStrong, curReferences);
                        }
                        curAugStrong = ""; curReferences = ""; hebrew = false;
                    }
                }
            } catch (final IOException e) {
                LOGGER.error("Unable to read a line from the augmented strongs file");
                throw new StepInternalException("Unable to read a line from the augmented strongs file ", e);
            }
            OpenFileStateManager.OrdinalStrongArray osArray = new OpenFileStateManager.OrdinalStrongArray();
            osArray.numOfGreekStrongWithAugments = strong2AugCountGrk.size();
            int numOfAugStrong = osArray.numOfGreekStrongWithAugments + strong2AugCountHbr.size();
            osArray.defaultAugment = new byte[numOfAugStrong];
            // An array of Strong numbers with augmented strongs.  If a Strong does not have augmented, it will not be in this
            // array.  Each Strong number is a short (15 bits) so Strong numbers cannot be over 32,767.  15 bits should be OK
            // because all Strong with augments are 4 digits.  If 15 bit is not enough, change it from a short[] to int[]
            // This array is sorted so that binary search can be used to speed up the lookup.  Since a lookup is need for every
            // Strong word, it is important the lookup is efficient.
            osArray.strongsWithAugments = new short[numOfAugStrong];
            int counter = 0;
            for (Map.Entry<Integer, Integer> entry : strong2AugCountGrk.entrySet()) {
                osArray.strongsWithAugments[counter] = entry.getKey().shortValue();
                counter ++;
            }
            for (Map.Entry<Integer, Integer> entry : strong2AugCountHbr.entrySet()) {
                osArray.strongsWithAugments[counter] = entry.getKey().shortValue();
                counter ++;
            }
            final Versification versificationForOT = this.versificationService.getVersificationForVersion(JSwordPassageServiceImpl.OT_BOOK);
            final Versification versificationForESV = this.versificationService.getVersificationForVersion("ESV");

            // This section of code is to create a hash for augStrongWithMostReferencesStrongNum
            HashMap<String, String> augStrongWithMostReferencesStrongNum = new HashMap<>();
            int strongNumUnderReview = -1;
            String augStrongWithMostReferences = "";
            int mostReferencesWithinAugStrongs = 0;
            for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                String augStrong = entry.getKey();
                int curStrongNumWithoutAugment = convertStrong2Short(augStrong);
                if (strongNumUnderReview != curStrongNumWithoutAugment) { // New Strong numbers
                    if (strongNumUnderReview > -1)
                        augStrongWithMostReferencesStrongNum.put(augStrongWithMostReferences.substring(0, augStrongWithMostReferences.length()-1), augStrongWithMostReferences);
                    strongNumUnderReview = curStrongNumWithoutAugment; // update variables for new Strong numbers
                    augStrongWithMostReferences = "";
                    mostReferencesWithinAugStrongs = 0;
                }
                String[] arrOfRef = entry.getValue().split(" ");
                if (mostReferencesWithinAugStrongs < arrOfRef.length) {
                    mostReferencesWithinAugStrongs = arrOfRef.length;
                    augStrongWithMostReferences = augStrong;
                }
            }
            if (strongNumUnderReview > -1) // output the augStrongWithMostReferences for the last Strong number
                augStrongWithMostReferencesStrongNum.put(augStrongWithMostReferences.substring(0, augStrongWithMostReferences.length()-1), augStrongWithMostReferences);

            int lastStrong = 32767;
            OrdinalStrong ordinalStrong = new OrdinalStrong();
            try {
                for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                    String augStrong = entry.getKey();
                    String references = entry.getValue().trim();
                    int curStrongNum = convertStrong2Short(augStrong);
                    char prefix = augStrong.charAt(0);
                    boolean hebrew = ((prefix == 'H') || (prefix == 'h')) ? true : false;
                    String defaultAugStrong = augStrongWithMostReferencesStrongNum.get(augStrong.substring(0, augStrong.length()-1));
                    if (lastStrong != curStrongNum) {
                        int index = binarySearchOfStrong(augStrong, osArray.numOfGreekStrongWithAugments, osArray.strongsWithAugments);
                        if (index < 0) {
                            LOGGER.error("Error in AugStrongServiceImpl, cannot find augstrong of " + augStrong);
                            System.exit(405);
                        }
                        lastStrong = curStrongNum;
                        osArray.defaultAugment[index] = (byte) defaultAugStrong.charAt(defaultAugStrong.length() - 1);
                    }
                    if (hebrew) {
                        addToRefArray(true, augStrong, references, versificationForOT, versificationForESV, ordinalStrong, defaultAugStrong);
                    } else {
                        addToRefArray(false, augStrong, references, versificationForOT, versificationForESV, ordinalStrong, defaultAugStrong);
                    }
                }
            } catch (Exception i) {
                LOGGER.error("Something wrong in StrongAugmentationServices");
                i.printStackTrace();
            }

            int totalLength = 0;
            osArray.OHBOrdinal = new int[24183]; // To do: get this number at run time
            osArray.OTRSVOrdinal = new int[24116];
            osArray.NTRSVOrdinal = new int[8248];
            for (Map.Entry<Short, String> entry : ordinalStrong.OTOHB.entrySet()) {
                totalLength += entry.getValue().length();
            }
            for (Map.Entry<Short, String> entry : ordinalStrong.NTRSV.entrySet()) {
                totalLength += entry.getValue().length();
            }
            osArray.augStrong = new byte[totalLength+1];
            int position = 1; // position 0 means no entry so start at position 1;
            short currentOrdinal = 0;
            for (Map.Entry<Short, String> entry : ordinalStrong.OTOHB.entrySet()) {
                currentOrdinal = entry.getKey();
                osArray.OHBOrdinal[currentOrdinal] = position;
                byte [] b = entry.getValue().getBytes();
                int len = b.length;
                System.arraycopy(b, 0, osArray.augStrong, position, len);
                position += len;
            }
            for (Map.Entry<Short, String> entry : ordinalStrong.NTRSV.entrySet()) {
                currentOrdinal = entry.getKey();
                osArray.NTRSVOrdinal[currentOrdinal] = position;
                byte [] b = entry.getValue().getBytes();
                int len = b.length;
                System.arraycopy(b, 0, osArray.augStrong, position, len);
                position += len;
            }
            for (Map.Entry<Short, Short> entry : ordinalStrong.OTRSV.entrySet()) {
                osArray.OTRSVOrdinal[entry.getKey()] = entry.getValue();
            }
            OpenFileStateManager.addOrdinalStrong(osArray);

            strong2AugCountGrk = null;
            strong2AugCountHbr = null;
            sortedAugStrong = null;
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
            ordinalStrong = null;
            System.gc(); // Free memory that will not be used after the initial load.  This like is probably unnecessary but just in case.
        } finally {
            closeQuietly(fileReader);
            closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
    }
}
