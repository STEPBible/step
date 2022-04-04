package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.service.AugDStrongService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;


import com.tyndalehouse.step.core.data.create.ModuleLoader;

import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
//import javafx.util.Pair;
import org.crosswire.jsword.passage.NoSuchVerseException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseFactory;
import org.crosswire.jsword.versification.Versification;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.*;
import java.nio.charset.Charset;
import java.util.*;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;
import static java.lang.Integer.parseInt;

@Singleton
public class AugDStrongServiceImpl implements AugDStrongService {

    private String bookNames[] = {"1Chr", "1Cor", "1John", "1Kgs", "1Pet", "1Sam",
            "1Thess", "1Tim", "2Chr", "2Cor", "2John", "2Kgs", "2Pet", "2Sam",
            "2Thess", "2Tim", "3John", "Acts", "Amos", "Col", "Dan", "Deut",
            "Eccl", "Eph", "Esth", "Exod", "Ezek", "Ezra", "Gal", "Gen",
            "Hab", "Hag", "Heb", "Hos", "Isa", "Jas", "Jer", "Job", "Joel",
            "John", "Jonah", "Josh", "Jude", "Judg", "Lam", "Lev", "Luke",
            "Mal", "Mark", "Matt", "Mic", "Nah", "Neh", "Num", "Obad", "Phil",
            "Phlm", "Prov", "Ps", "Rev", "Rom", "Ruth", "Song", "Titus", "Zech",
            "Zeph"};
    private short bookOrder[] = {12, 45, 61, 10, 59, 8,
            51, 53, 13, 46, 62, 11, 60, 9,
            52, 54, 63, 43, 29, 50, 26, 4,
            20, 48, 16,  1, 25, 14, 47, 0,
            34, 36, 57, 27, 22, 58, 23, 17, 28,
            42, 31,  5, 64,  6, 24,  2, 41,
            38, 40, 39, 32, 33, 15,  3, 30, 49,
            56, 19, 18, 65, 44,  7, 21, 55, 37,
            35};

    private String bookNames2[] = {"Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs",
            "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam",
            "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal",
            "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess",
            "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude",
            "Rev"};

    private static int numOfStrongGrk;
	private static int numOfAugStrong;
    private static short[] strongs;
    private static short[] strong2AugStrongPtr;
    private static int[] augStrong2RefPtr;
    private static int[] ref;
    private JSwordVersificationService versificationService;

@Inject
    public AugDStrongServiceImpl(JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
    }

    public int cnvrtOSIS2int(final String OSIS, final Versification curVersification) {
          try {
            Verse key = VerseFactory.fromString(curVersification, OSIS);
            int ordinal = key.getOrdinal();
            if ((ordinal > 0) && (ordinal <= 32767)) return ordinal;
        } catch (NoSuchVerseException e) {
            throw new StepInternalException("\"Unable to look up strongs for \" + OSIS ", e);
        }
        return -1;
    }

    private int addToAugStrong2Ref(int refIndex, String augStrong) {
        int result = augStrong.charAt(augStrong.length() - 1);
        if ((result < 65) || (result > 122)) { // 65 is A 121 is z
            System.out.println("suffix of augmented Strong " + augStrong + " is outside of range of expected characters: " + augStrong.charAt(augStrong.length() - 1) + " " + result);
            System.exit(4);
        }
        result = (result << 24) | refIndex;
        return result;
    }

    private int addToRefArray(int refIndex, String augStrong, String refs, final Versification versificationForOT, final Versification versificationForESV, FileWriter myWriter) {
        String[] arrOfRef = refs.split(" ");
        int startIndex = refIndex;
        Versification curVersification;
        boolean hebrew = false;
        if  (Character.compare(augStrong.charAt(0), 'H') == 0) {
            curVersification = versificationForOT;
            hebrew = true;
        }
        else curVersification = versificationForESV;
        StringBuilder updatedRef = new StringBuilder(refs.length() * 2);

        for (int i = 0; i < arrOfRef.length; i++) {
            int refInInt = cnvrtOSIS2int(arrOfRef[i], curVersification);
            if (refInInt > 0) {
                ref[refIndex] = refInInt;
                if (updatedRef.length() > 0) updatedRef.append(" ");
                updatedRef.append(arrOfRef[i]);
                if (hebrew) {
                    String altReference = "";
                    try {
                        KeyWrapper altKey = this.versificationService.convertReference(arrOfRef[i], JSwordPassageService.OT_BOOK, JSwordPassageService.REFERENCE_BOOK);
                        altReference = altKey.getOsisKeyId();
                    } catch (Exception e) {
                        throw new StepInternalException("Error in convert reference to ESV versification " + augStrong + " " + arrOfRef[i], e);
                    }
                    if (!altReference.equals(arrOfRef[i])) {
                        updatedRef.append('(').append(altReference.substring(altReference.indexOf('.') + 1)).append(')');
                    }
                }
                refIndex++;
            }
        }
        try {
            myWriter.write("===============================\n");
            myWriter.write("@AugmentedStrong=\t" + augStrong + "\n");
            myWriter.write("@References=\t" + updatedRef + "\n");
        }
        catch (Exception e) {
            throw new StepInternalException("Unable to output AugStrongKJV file ", e);
        }
        Arrays.sort(ref, startIndex, refIndex);
        return refIndex;
    }

    public int binarySearchOfStrong(final short arr[], final int numOfStrongGrk, final String augStrong) {
        int first = 0;
        int last = arr.length - 1;
        if ((Character.compare(augStrong.charAt(0), 'G') == 0)) {
            last = numOfStrongGrk - 1;
        }
        else {
            first = numOfStrongGrk;
        }
        int key = cnvrtStrong2Short(augStrong);
        int mid = (first + last) / 2;
        while( first <= last ){
            if ( arr[mid] < key ){
                first = mid + 1;
            }
            else if ( arr[mid] == key ) {
                return mid;
            }
            else{
                last = mid - 1;
            }
            mid = (first + last)/2;
        }
        System.out.println("Element is not found!");
        return -1;
    }

    private void verifyAugStrongPattern(final String augStrong) {
        char prefix = augStrong.charAt(0);
        if ( ((Character.compare(prefix, 'G') != 0)) && (Character.compare(prefix, 'H') != 0)) {
            System.out.println("augmented strong does not start with H or G: " + augStrong);
            System.exit(404);
        }
        char suffix = augStrong.charAt(augStrong.length() - 1);
        if (Character.isDigit(suffix)) {
            System.out.println("Last character of this strong is numeric: " + augStrong);
            System.exit(404);
        }
    }

    public int cnvrtStrong2Short(final String strong) {
        char prefix = strong.charAt(0);
        int startPos = 1;
        if (Character.isDigit(prefix)) startPos = 0;
        int endPos = strong.length() - 1;
        char suffix = strong.charAt(endPos);
        if (Character.isDigit(suffix)) endPos++;
        int num = parseInt(strong.substring(startPos, endPos));
        if (num > 32767) {
            System.out.println("Strong number has too many digits: " + strong);
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

//    private Pair<Character, Integer> getSuffixAndIdx(int num) {
//        num = num & 0x7fffffff; // Turn off top bit.  We don't care if this is the first augmented Strong of the Strong number.
//        Character suffix = (char) (num >> 24);
//        int index = num & 0x00FFFFFF;
//        return new Pair<Character, Integer>(suffix, index);
//    }

    public String getBibleVerse(final int reference) {
//        final Verse s;
//        String result = curVersification.decodeOrdinal(ordinal);
//        return result;

        int verse = reference & 0x000000FF;
        int chapter = (reference >>> 8) & 0x000000FF;
        int bookIndex = (reference >>> 16) & 0x000000FF;
        if ((bookIndex < 0) || (bookIndex >= (bookNames.length))) {
            System.out.println("Cannot find book " + bookIndex);
            System.exit(4);
        }
        if ((chapter < 1) || (chapter > 150)) {
            System.out.println("Chapter number seems to be invalid " + chapter);
            System.exit(4);
        }
        if ((verse < 1) || (verse > 176)) {
            System.out.println("Verse number seems to be invalid " + verse);
            System.exit(4);
        }
//        return result.append(bookNames2[bookIndex]).append(".").append(chapter).append(".").append(verse);
        return bookNames[bookIndex] + "." + chapter + "." + verse;
    }

    public String getBibleVerses(int ref[], int curAugStrongfirstIdx, final int length) {
        String result = "";
        int nextAugStrongIdx = curAugStrongfirstIdx + length;
        for (; curAugStrongfirstIdx < nextAugStrongIdx; curAugStrongfirstIdx ++) {
            result = result + getBibleVerse(ref[curAugStrongfirstIdx]);
            if (curAugStrongfirstIdx < nextAugStrongIdx - 1) result = result + " ";
        }
        return result;
    }

    public int[] getIdx2VersesOfAugStrong(String strong) {
        int index1 = binarySearchOfStrong(strongs, numOfStrongGrk, strong);
        if (index1 < 0) return null;
        short index2 = strong2AugStrongPtr[index1];
        if ((index2 < 0) || (index2 > numOfAugStrong)) return null;
        int suffixInt = (strong.charAt(strong.length() - 1) & 0x000000ff) << 24;
        int curPtr = augStrong2RefPtr[index2];
        curPtr = curPtr & 0x7fffffff; // Turn off top bit in case it is on
        int checkSuffix = curPtr & 0x7f000000;  // Don't copy over the sign bit
        while ((curPtr & 0x80000000) == 0) { // Top bit is on
            if (checkSuffix == suffixInt) {
                int result[] = new int[2];
                result[0] = curPtr & 0x00ffffff;
                curPtr = augStrong2RefPtr[index2 + 1];
                result[1] = (curPtr & 0x00ffffff) - result[0];
                return result;
            }
            index2++;
            curPtr = augStrong2RefPtr[index2];
            checkSuffix = curPtr & 0x7f000000; // Don't copy over the sign bit
        }
        return null;
    }

//    public String getAugStrongWithStrongAndVerse(String strong, String reference, final Versification versificationForOT, final Versification versificationForESV) {
//        int index1 = binarySearchOfStrong(strongs, numOfStrongGrk, strong);
//        if (index1 < 0) return "";
//        short index2 = strong2AugStrongPtr[index1];
//        if ((index2 < 0) || (index2 > numOfAugStrong)) return "";
//        // Get Versification
//        Versification curVersification;
//        if  (Character.compare(strong.charAt(0), 'H') == 0) curVersification = versificationForOT;
//        else curVersification = versificationForESV;
//        int refInt = cnvrtOSIS2int(reference, curVersification);
//        if (refInt < 0) return "";
//        int curPtr = augStrong2RefPtr[index2] & 0x7fffffff; // Turn off top bit to mark the first augStrong to reference Ptr.  This will allow it to go into the while loop below
//        //Pair<Character, Integer> r = getSuffixAndIdx(curPtr);
//        char firstSuffix = r.getKey();
//        while ((curPtr & 0x80000000) == 0)  { // Top bit must be turn off to continue
//            char curSuffix = r.getKey();
//            int curIndex = r.getValue();
//            index2 ++;
//            curPtr = augStrong2RefPtr[index2];
//            r = getSuffixAndIdx(curPtr);
//            for (; curIndex < r.getValue(); curIndex ++) {
//                if (ref[curIndex] == refInt) {
//                    return strong + curSuffix;
//                }
//            }
//        }
//        return "";
//    }

	public void readAndLoad(final String augStrongFile) {
        Reader fileReader = null;
        InputStream stream = null;
        BufferedInputStream bufferedStream = null;
        String curAugStrong = "";
        String curReferences = "";
        int numOfReferences = 0;
        HashMap<Integer, Integer> strong2AugCountGrk = new HashMap<Integer, Integer>();
        HashMap<Integer, Integer> strong2AugCountHbr = new HashMap<Integer, Integer>();
        HashMap<String, String> augStrongRef = new HashMap<String, String>();
        try {
            stream = ModuleLoader.class.getResourceAsStream(augStrongFile);
            if (stream == null) {
                throw new StepInternalException("Unable to read resource: " + augStrongFile);
            }
            bufferedStream = new BufferedInputStream(stream);
            fileReader = new InputStreamReader(bufferedStream, Charset.forName("UTF-8"));
            final BufferedReader bufferedReader = new BufferedReader(fileReader);
            String data = null;
            try {
                while ((data = bufferedReader.readLine()) != null) {
                    if (data.endsWith("=======================")) {
                        if (curAugStrong != "") {
                            System.out.println("unexpected order at around " + curAugStrong);
                            System.exit(401);
                        }
                        else if (curReferences != "") {
                            System.out.println("unexpected order at around " + curReferences);
                            System.exit(401);
                        }
                    }
                    else if (data.startsWith("@AugmentedStrong=\t")) {
                        if (curAugStrong != "") {
                            System.out.println("unexpected order at around " + curAugStrong);
                            System.exit(403);
                        }
                        curAugStrong = data.substring(18);
                        verifyAugStrongPattern(curAugStrong);
                        int num = cnvrtStrong2Short(curAugStrong);
                        if ((Character.compare(curAugStrong.charAt(0), 'G') == 0)) {
                            addStrongToHashMap(strong2AugCountGrk, num);
                        }
                        else {
                            addStrongToHashMap(strong2AugCountHbr, num);
                        }
                    }
                    else if (data.startsWith("@References=\t")) {
                        if (curReferences != "") {
                            System.out.println("unexpected order at around " + curReferences);
                            System.exit(401);
                        }
                        curReferences = data.substring(13);
                        if (augStrongRef.containsKey(curAugStrong)) {
                            System.out.println("duplicate augmented strong " + curAugStrong);
                            continue;
                        }
                        augStrongRef.put(curAugStrong, curReferences);
                        String[] arrOfRef = curReferences.split(" ");
                        //if (!firstAugOfStrong)
                        numOfReferences = numOfReferences + arrOfRef.length;
                        curAugStrong = ""; curReferences = "";
                    }
                }
            } catch (final IOException e) {
                throw new StepInternalException("Unable to read a line from the source file ", e);
            }
            numOfStrongGrk = strong2AugCountGrk.size();
            int numOfStrong = numOfStrongGrk + strong2AugCountHbr.size();
            numOfAugStrong = augStrongRef.size();
            strongs=new short[numOfStrong];
            strong2AugStrongPtr=new short[numOfStrong];
            augStrong2RefPtr=new int[numOfAugStrong+1];
            ref=new int[numOfReferences];
            TreeMap<Integer, Integer> sortedStrongGrk = new TreeMap<>();
            sortedStrongGrk.putAll(strong2AugCountGrk);
            int counter = 0;
            for (Map.Entry<Integer, Integer> entry : sortedStrongGrk.entrySet()) {
                strongs[counter] = entry.getKey().shortValue();
                counter ++;
            }
            TreeMap<Integer, Integer> sortedStrongHbr = new TreeMap<>();
            sortedStrongHbr.putAll(strong2AugCountHbr);
            for (Map.Entry<Integer, Integer> entry : sortedStrongHbr.entrySet()) {
                strongs[counter] = entry.getKey().shortValue();
                counter ++;
            }
            TreeMap<String, String> sortedAugStrong = new TreeMap<>();
            sortedAugStrong.putAll(augStrongRef);
            int strong2AugStrongIndex = 0;
            int refIndex = 0;
            int lastStrong = 32767;
            final Versification versificationForOT = this.versificationService.getVersificationForVersion(JSwordPassageServiceImpl.OT_BOOK);
            final Versification versificationForESV = this.versificationService.getVersificationForVersion("ESV");
            FileWriter myWriter;
            try {
                myWriter = new FileWriter("augStrongWithKJV.txt");
            }
            catch (Exception e) {
                throw new StepInternalException("Unable to output AugStrongKJV file ", e);
            }
            for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                String augStrong = entry.getKey();
                verifyAugStrongPattern(augStrong);
                int curStrongNum = cnvrtStrong2Short(augStrong);
                augStrong2RefPtr[strong2AugStrongIndex] = addToAugStrong2Ref(refIndex, augStrong);
                if (lastStrong != curStrongNum) {
                    augStrong2RefPtr[strong2AugStrongIndex] = augStrong2RefPtr[strong2AugStrongIndex] | 0x80000000; // Turn on top bit to mark the first augmented Strong of a Strong number
                    int index = binarySearchOfStrong(strongs, numOfStrongGrk, augStrong);
                    strong2AugStrongPtr[index] = (short) strong2AugStrongIndex;
                    lastStrong = curStrongNum;
                }
                strong2AugStrongIndex ++;
                refIndex = addToRefArray(refIndex, entry.getKey(), entry.getValue(), versificationForOT, versificationForESV, myWriter);
                //System.out.println("key: " + entry.getKey() + ", value: " + entry.getValue() + " " + counter);
                counter ++;
            }
            try {
                myWriter.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            augStrong2RefPtr[strong2AugStrongIndex] = refIndex | 0x80000000; // Turn on top bit to mark the first augmented Strong of a Strong number.  In this case it is a marker for the end of the array
        } finally {
            closeQuietly(fileReader);
            // closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
	}

}
