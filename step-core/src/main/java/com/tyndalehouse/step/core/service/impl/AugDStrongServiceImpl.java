package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.AugDStrongService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;

import com.tyndalehouse.step.core.data.create.ModuleLoader;

import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.crosswire.jsword.passage.*;
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
	private static int numOfAugStrongOT;
    private static int numOfAugStrongNT;
    private static short[] strongs;
    private static short[] strong2AugStrongIndx;
    private static byte[] strong2AugStrongCount;
    private static int[] augStrong2RefIdxOT;
    private static int[] augStrong2RefIdxNT;
    public static short[] refOfAugStrongOTOHB;
    public static short[] refOfAugStrongOTRSV;
    public static short[] refOfAugStrongNT;
    private JSwordVersificationService versificationService;

@Inject
    public AugDStrongServiceImpl(JSwordVersificationService versificationService) {
        this.versificationService = versificationService;
    }

    public short cnvrtOSIS2Ordinal(final String OSIS, final Versification curVersification) {
        try {
            Verse key = VerseFactory.fromString(curVersification, OSIS);
            int ordinal = key.getOrdinal();
            if ((ordinal > 0) && (ordinal <= 32767)) return (short) ordinal;
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

    private int addToRefArray(int refIndex, boolean hebrew, String refs, final Versification versificationForOT, final Versification versificationForESV) {
        String[] arrOfRef = refs.split(" ");
        int startIndex = refIndex;
        for (int i = 0; i < arrOfRef.length; i++) {
            short refOrdinal = (hebrew) ? cnvrtOSIS2Ordinal(arrOfRef[i], versificationForOT) : cnvrtOSIS2Ordinal(arrOfRef[i], versificationForESV);
            if (refOrdinal > 0) {
                if (hebrew) {
                    refOfAugStrongOTOHB[refIndex] = refOrdinal;
                    refOrdinal  = (short) this.versificationService.convertReferenceGetOrdinal(arrOfRef[i], versificationForOT, versificationForESV);
                    if (refOrdinal > 0)
                        refOfAugStrongOTRSV[refIndex] = refOrdinal;
                }
                else
                    refOfAugStrongNT[refIndex] = refOrdinal;
                refIndex++;
            }
        }
        if (hebrew) {
            Arrays.sort(refOfAugStrongOTOHB, startIndex, refIndex);
            Arrays.sort(refOfAugStrongOTRSV, startIndex, refIndex);
        }
        else Arrays.sort(refOfAugStrongNT, startIndex, refIndex);
        return refIndex;
    }

    public int binarySearchOfStrong(final String augStrong) {
        int first = 0;
        int last = strongs.length - 1;
        if ((Character.compare(augStrong.charAt(0), 'G') == 0)) {
            last = numOfStrongGrk - 1;
        }
        else {
            first = numOfStrongGrk;
        }
        int key = cnvrtStrong2Short(augStrong);
        int mid = (first + last) / 2;
        while( first <= last ) {
            if ( strongs[mid] < key ) first = mid + 1;
            else if ( strongs[mid] == key ) return mid;
            else last = mid - 1;
            mid = (first + last) / 2;
        }
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

    private ImmutablePair<Character, Integer> getSuffixAndIdx(int num) {
        num = num & 0x7fffffff; // Turn off top bit.  We don't care if this is the first augmented Strong of the Strong number.
        Character suffix = (char) (num >> 24);
        int index = num & 0x00FFFFFF;
        return new ImmutablePair<Character, Integer>(suffix, index);
    }

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
        return bookNames[bookIndex] + "." + chapter + "." + verse;
    }

    public void updateWithDStrong(String strong, Key key, String version) {
        String trimmedStrong = strong.trim();
        boolean isAugStrong = !Character.isDigit(trimmedStrong.charAt(trimmedStrong.length() - 1)); // Last character of augmented strong should not be digit
        int[] index = getIndexes2OrdinalOfAugStrong(trimmedStrong, isAugStrong);
        if (index == null) return;
        final Versification sourceVersification = this.versificationService.getVersificationForVersion(version);
        Key updatedKey = PassageKeyFactory.instance().createEmptyKeyList(sourceVersification);
        String versificationName = sourceVersification.getName();
        boolean useNRSVVersification = false;
        boolean useOHBVersification = false;
        if ((versificationName.equals("NRSV")) || (versificationName.equals("KJV"))) useNRSVVersification = true;
        else if (versificationName.equals(JSwordPassageService.OT_BOOK)) useOHBVersification = true;
//        else ordinal = this.versificationService.convertReferenceGetOrdinal(reference, sourceVersification, this.versificationService.getVersificationForVersion(JSwordPassageService.OT_BOOK));
        int numOfKey = key.getCardinality();
        for (int i = 0; i < numOfKey; i ++) {
            int curOrdinal = ((Verse) key.get(i)).getOrdinal();

        }
        return;
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

    private int[] getIndexes2OrdinalOfAugStrong(String trimmedStrong, boolean isAugStrong) {
        int index1 = binarySearchOfStrong(trimmedStrong);
        if (index1 < 0) return null;
        short index2 = strong2AugStrongIndx[index1];
        if (index2 < 0) return null;
        int[] augStrong2RefIdx;
        if ((Character.compare(trimmedStrong.charAt(0), 'H') == 0)) {
            if (index2 > numOfAugStrongOT) return null;
            augStrong2RefIdx = augStrong2RefIdxOT;
        }
        else {
            if (index2 > numOfAugStrongNT) return null;
            augStrong2RefIdx = augStrong2RefIdxNT;
        }
        int numOfAugStrongWithSameStrong = strong2AugStrongCount[index1];
        char lastCharOfStrong = trimmedStrong.charAt(trimmedStrong.length() - 1);
        if (isAugStrong) {
            int suffixInt = (lastCharOfStrong & 0x000000ff) << 24;
            for (int i = index2 + numOfAugStrongWithSameStrong - 1; i >= index2; i--) {
                int curPtr = augStrong2RefIdx[i] & 0x7fffffff; // Turn off top bit in case it is on
                int checkSuffix = curPtr & 0x7f000000;  // Don't copy over the sign bit
                int check = checkSuffix >> 24;
                System.out.println("getIndex2Ord " + lastCharOfStrong + " " + check);
                if (checkSuffix == suffixInt) {
                    int result[] = new int[2];
                    result[0] = curPtr & 0x00ffffff; // index to list of ordinal (verse) for aug strong
                    curPtr = augStrong2RefIdx[i + 1];
                    result[1] = (curPtr & 0x00ffffff) - result[0]; // length
                    return result;
                }
            }
        }
        else {
            int result[] = new int[3];
            result[0] = augStrong2RefIdx[index2] & 0x00ffffff; // index to list of ordinal (verse) for aug strong
            result[1] = (augStrong2RefIdx[index2 + numOfAugStrongWithSameStrong] & 0x00ffffff) - result[0]; // length
            result[2] = numOfAugStrongWithSameStrong;
            return result;
        }
        return null;
    }

    public String getAugStrongWithStrongAndOrdinal(final String strong, final int ordinal, final boolean useNRSVVersification) {
        if ((ordinal < 0) || (ordinal > 32767)) return "";
        int index1 = binarySearchOfStrong(strong);
        if (index1 < 0) return strong;
        short index2 = strong2AugStrongIndx[index1];
        int[] augStrong2RefIdx;
        if ((Character.compare(strong.charAt(0), 'H') == 0)) {
            if ((index2 < 0) || (index2 > numOfAugStrongOT)) return "";
            augStrong2RefIdx = augStrong2RefIdxOT;
        }
        else {
            if ((index2 < 0) || (index2 > numOfAugStrongNT)) return "";
            augStrong2RefIdx = augStrong2RefIdxNT;
        }
        int numOfAugStrongWithSameStrong = strong2AugStrongCount[index1];
        int indx2LastAugStrongWithSameStrong = index2 + numOfAugStrongWithSameStrong - 1;
        int indx2FirstAugStrongWithNextStrong = augStrong2RefIdx[indx2LastAugStrongWithSameStrong+1];
        int nextIndex = getSuffixAndIdx(indx2FirstAugStrongWithNextStrong).getRight(); // Next entry in augStrong2RefPtr
        for (int i = indx2LastAugStrongWithSameStrong; i >= index2; i--) {
            int curPtr = augStrong2RefIdx[i] & 0x7fffffff; // Turn off top bit to mark the first augStrong to reference Ptr.  This will allow it to go into the while loop below
            ImmutablePair<Character, Integer> r = getSuffixAndIdx(curPtr);
            char curSuffix = r.getLeft();
            int curIndex = r.getRight();
//            System.out.println("getAugStrongWithStrongAndOrdinal " + strong + " " + curSuffix);
            for (; curIndex < nextIndex; curIndex ++) {
                if (useNRSVVersification) {
                    if (refOfAugStrongOTRSV[curIndex] == ordinal)
                        return strong + curSuffix;
                }
                else if (refOfAugStrongOTOHB[curIndex] == ordinal) {
                    return strong + curSuffix;
                }
            }
            nextIndex = curIndex;
        }
        return strong;
    }

    public String getAugStrongWithStrongAndVerse(String strong, String reference, final Versification versificationForOT, final Versification versificationForESV) {
        int index1 = binarySearchOfStrong(strong);
        if (index1 < 0) return "";
        short index2 = strong2AugStrongIndx[index1];
        if ((index2 < 0) || (index2 > numOfAugStrongOT)) return "";
        // Get Versification
        Versification curVersification;
        if  (Character.compare(strong.charAt(0), 'H') == 0) curVersification = versificationForOT;
        else curVersification = versificationForESV;
        short refInt = cnvrtOSIS2Ordinal(reference, curVersification);
        if (refInt < 0) return "";
        int[] augStrong2RefIdx = ((Character.compare(strong.charAt(0), 'H') == 0)) ? augStrong2RefIdxOT : augStrong2RefIdxNT;
        int curPtr = augStrong2RefIdx[index2] & 0x7fffffff; // Turn off top bit to mark the first augStrong to reference Ptr.  This will allow it to go into the while loop below
        ImmutablePair<Character, Integer> r = getSuffixAndIdx(curPtr);
        char firstSuffix = r.getKey();
        while ((curPtr & 0x80000000) == 0)  { // Top bit must be turn off to continue
            char curSuffix = r.getKey();
            int curIndex = r.getValue();
            index2 ++;
            curPtr = augStrong2RefIdx[index2];
            r = getSuffixAndIdx(curPtr);
            for (; curIndex < r.getValue(); curIndex ++) {
                if (refOfAugStrongOTOHB[curIndex] == refInt) {
                    return strong + curSuffix;
                }
            }
        }
        return "";
    }

	public void readAndLoad(final String augStrongFile) {
        Reader fileReader = null;
        InputStream stream = null;
        BufferedInputStream bufferedStream = null;
        String curAugStrong = "";
        String curReferences = "";
        int numOfOTReferences = 0;
        int numOfNTReferences = 0;
        HashMap<Integer, Integer> strong2AugCountGrk = new HashMap<Integer, Integer>();
        HashMap<Integer, Integer> strong2AugCountHbr = new HashMap<Integer, Integer>();
        HashMap<String, String> augStrongRefOT = new HashMap<String, String>();
        HashMap<String, String> augStrongRefNT = new HashMap<String, String>();
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
                boolean hebrew = false;
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
                        if ((Character.compare(curAugStrong.charAt(0), 'H') == 0)) {
                            addStrongToHashMap(strong2AugCountHbr, num);
                            hebrew = true;
                        }
                        else {
                            addStrongToHashMap(strong2AugCountGrk, num);
                            hebrew = false;
                        }
                    }
                    else if (data.startsWith("@References=\t")) {
                        if (curReferences != "") {
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
                        String[] arrOfRef = curReferences.split(" ");
                        if (hebrew) numOfOTReferences += arrOfRef.length;
                        else numOfNTReferences += arrOfRef.length;
                        curAugStrong = ""; curReferences = ""; hebrew = false;
                    }
                }
            } catch (final IOException e) {
                throw new StepInternalException("Unable to read a line from the source file ", e);
            }
            numOfStrongGrk = strong2AugCountGrk.size();
            int numOfStrong = numOfStrongGrk + strong2AugCountHbr.size();
            numOfAugStrongOT = augStrongRefOT.size();
            numOfAugStrongNT = augStrongRefNT.size();
            strongs=new short[numOfStrong];
            strong2AugStrongIndx=new short[numOfStrong];
            strong2AugStrongCount=new byte[numOfStrong];
            augStrong2RefIdxOT =new int[numOfAugStrongOT+1];
            augStrong2RefIdxNT =new int[numOfAugStrongNT+1];
            refOfAugStrongOTOHB = new short[numOfOTReferences];
            refOfAugStrongOTRSV = new short[numOfOTReferences];
            refOfAugStrongNT = new short[numOfNTReferences];
            TreeMap<Integer, Integer> sortedStrongGrk = new TreeMap<>();
            sortedStrongGrk.putAll(strong2AugCountGrk);
            int counter = 0;
            for (Map.Entry<Integer, Integer> entry : sortedStrongGrk.entrySet()) {
                strongs[counter] = entry.getKey().shortValue();
                strong2AugStrongCount[counter] = entry.getValue().byteValue();
                counter ++;
            }
            TreeMap<Integer, Integer> sortedStrongHbr = new TreeMap<>();
            sortedStrongHbr.putAll(strong2AugCountHbr);
            for (Map.Entry<Integer, Integer> entry : sortedStrongHbr.entrySet()) {
                strongs[counter] = entry.getKey().shortValue();
                strong2AugStrongCount[counter] = entry.getValue().byteValue();
                counter ++;
            }
            TreeMap<String, String> sortedAugStrong = new TreeMap<>();
            sortedAugStrong.putAll(augStrongRefOT);
            sortedAugStrong.putAll(augStrongRefNT);
            int strong2AugStrongIndexOT = 0;
            int strong2AugStrongIndexNT = 0;
            int refIndexOT = 0;
            int refIndexNT = 0;
            int lastStrong = 32767;
            final Versification versificationForOT = this.versificationService.getVersificationForVersion(JSwordPassageServiceImpl.OT_BOOK);
            final Versification versificationForESV = this.versificationService.getVersificationForVersion("ESV");
            for (Map.Entry<String, String> entry : sortedAugStrong.entrySet()) {
                String augStrong = entry.getKey();
                verifyAugStrongPattern(augStrong);
                int curStrongNum = cnvrtStrong2Short(augStrong);
                boolean hebrew = false;
                if (Character.compare(augStrong.charAt(0), 'H') == 0) {
                    augStrong2RefIdxOT[strong2AugStrongIndexOT] = addToAugStrong2Ref(refIndexOT, augStrong);
                    hebrew = true;
                }
                else {
                    augStrong2RefIdxNT[strong2AugStrongIndexNT] = addToAugStrong2Ref(refIndexNT, augStrong);
                }
                if (lastStrong != curStrongNum) {
                    int index = binarySearchOfStrong(augStrong);
                    if (hebrew) {
                        augStrong2RefIdxOT[strong2AugStrongIndexOT] = augStrong2RefIdxOT[strong2AugStrongIndexOT] | 0x80000000; // Turn on top bit to mark the first augmented Strong of a Strong number
                        strong2AugStrongIndx[index] = (short) strong2AugStrongIndexOT;
                    }
                    else {
                        augStrong2RefIdxNT[strong2AugStrongIndexNT] = augStrong2RefIdxNT[strong2AugStrongIndexNT] | 0x80000000; // Turn on top bit to mark the first augmented Strong of a Strong number
                        strong2AugStrongIndx[index] = (short) strong2AugStrongIndexNT;
                    }
                    lastStrong = curStrongNum;
                }
                if (hebrew) {
                    strong2AugStrongIndexOT ++;
                    refIndexOT = addToRefArray(refIndexOT, true, entry.getValue(), versificationForOT, versificationForESV);
                }
                else {
                    strong2AugStrongIndexNT ++;
                    refIndexNT = addToRefArray(refIndexNT, false, entry.getValue(), versificationForOT, versificationForESV);
                }
                //System.out.println("key: " + entry.getKey() + ", value: " + entry.getValue() + " " + counter);
                counter ++;
            }
            augStrong2RefIdxOT[strong2AugStrongIndexOT] = refIndexOT | 0x80000000; // Turn on top bit to mark the first augmented Strong of a Strong number.  In this case it is a marker for the end of the array
            augStrong2RefIdxNT[strong2AugStrongIndexNT] = refIndexNT | 0x80000000; // Turn on top bit to mark the first augmented Strong of a Strong number.  In this case it is a marker for the end of the array
            strong2AugCountGrk = null;
            strong2AugCountHbr = null;
            augStrongRefOT = null;
            augStrongRefNT = null;
            sortedStrongGrk = null;
            sortedStrongHbr = null;
            sortedAugStrong = null;
            System.gc(); // Free memory that will never be used after the initial load.  This like is probably unnecessary but just in case.
        } finally {
            closeQuietly(fileReader);
            // closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
	}

}
