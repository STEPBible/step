package com.tyndalehouse.step.core.utils.language;

import com.tyndalehouse.step.core.utils.language.hebrew.*;
import com.tyndalehouse.step.core.utils.language.transliteration.StringToStringRule;
import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationRule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Utilities for doing Hebrew transliteration
 *
 * @author chrisburrell
 */
public final class HebrewUtils {
    private static final Logger LOGGER = LoggerFactory.getLogger(HebrewUtils.class);
    public static final char HYPHEN = '.';
    public static final char MAQAF_HYPHEN = '-';
    private static transient List<TransliterationRule> transliterationRules;

    private static final char CLOSED_QUOTE = '\u2019';
    private static final char OPEN_QUOTE = '\u2018';
    private static final char K_WITH_LINE = '\u1e35';
    private static final char T_WITH_DOT = '\u1e6d';
    private static final char H_WITH_DOT = '\u1e25';
    private static final char B_WITH_LINE = '\u1E07';

    private static final char QAMATS_QATAN = 0x5C7;

    private static final char SHEVA = 0x05B0;
    private static final char HATAF_SEGOL = 0x5B1;
    private static final char HATAF_PATAH = 0x5B2;
    private static final char HATAF_QAMATS = 0x5B3;
    private static final char HIRIQ = 0x5B4;
    private static final char TSERE = 0x5B5;
    private static final char SEGOL = 0x5B6;
    private static final char PATAH = 0x5B7;
    private static final char QAMATS = 0x5B8;
    private static final char HOLAM = 0x5B9;
    private static final char HOLAM_HASER = 0x5BA;
    private static final char QUBUTS = 0x5BB;
    private static final char DAGESH = 0x5BC;
    private static final char METEG = 0x05BD;


    private static final char SHIN_DOT = 0x05C1;
    private static final int ETNAHTA = 0x0591;
    private static final char GERESH = 0x059C;
    private static final char GERESH_MUQDAM = 0x059D;
    private static final int ZINOR = 0x05AE;
    
    private static final int DAGESH_GAP = 0xFB44 - 0x05e3;
    private static final int ALEPH = 0x05D0;
    private static final char ALEPH_LAMED = 0xFB4F;
    private static final char BET = 0x5D1;
    private static final char GIMEL = 0x5D2;
    private static final char DALET = 0x5D3;
    private static final int HE = 0x5D4;
    private static final char VAV = 0x5D5;
    private static final int ZAYIN = 0x5D6;
    private static final char HET = 0x5D7;
    private static final int TET = 0x5D8;
    private static final char YOD = 0x5D9;
    private static final char FINAL_KAF = 0x5DA;
    private static final char KAF = 0x5DB;
    private static final char LAMED = 0x5DC;
    private static final int FINAL_MEM = 0x5DD;
    private static final int MEM = 0x5DE;
    private static final int FINAL_NUN = 0x5DF;
    private static final int NUN = 0x5E0;
    private static final int SAMEKH = 0x5E1;
    private static final int AYIN = 0x5E2;
    private static final int FINAL_PE = 0x5E3;
    private static final char PE = 0x5E4;
    private static final int FINAL_TSADI = 0x5E5;
    private static final int TSADI = 0x5E6;
    private static final char QOF = 0x5E7;
    private static final char RESH = 0x5E8;
    private static final int SIN = 0x5E9;
    private static final char TAV = 0x5EA;
    private static final char MAQAF = 0x05BE;
    private static final char HEBREW_COMBINED_RANGE_START = 0xFB1D;

    /**
     * prevent instantiation
     */
    private HebrewUtils() {
        // do nothing
    }

    /**
     * @param rawForm the raw form of the word
     * @return true if it is hebrew text
     */
    public static boolean isHebrewText(final String rawForm) {
        final int firstCharacter = rawForm.charAt(0);
        return isHebrewCharacter(firstCharacter);
    }

    /**
     * @param firstCharacter the character that we are testing
     * @return true to indicate we are dealing with the Hebrew set of characters
     */
    public static boolean isHebrewCharacter(final int firstCharacter) {
        return (firstCharacter > 0x590 && firstCharacter < 0x600)
                || (firstCharacter > 0xFB10 && firstCharacter < 0xFB50);
    }


//    /**
//     * @param word text with pointing
//     * @return text without pointing
//     */
//    public static String unPoint(final String word) {
//        return unPoint(word, true);
//    }
    
    /**
     * @param word text with pointing
     * @param unpointVowels true to indicate we also want to exclude vowels
     * @return text without pointing
     */
    public static String unPoint(final String word, boolean unpointVowels) {
        char endChar = unpointVowels ? ALEPH : SHEVA;
        
        final StringBuilder sb = new StringBuilder(word);
        int i = 0;
        while (i < sb.length()) {
            final char currentChar = sb.charAt(i);
            //ignore characters outside of the Hebrew character set
            if(currentChar < ETNAHTA || currentChar > ALEPH_LAMED   || currentChar == MAQAF) {
                i++;
            } else if (currentChar < endChar) {
                sb.deleteCharAt(i);
            } else if (currentChar >= HEBREW_COMBINED_RANGE_START && currentChar < ALEPH_LAMED) {
                sb.setCharAt(i, (char) (currentChar - DAGESH_GAP));
                i++;
            } else {
                i++;
            }
        }
        return sb.toString();
    }

    /**
     * Cleans up a String so that it can be indexed properly
     *
     * @param stepTransliteration the transliteration to be cleaned up
     * @return the new transliteration
     */
    public static String removeHebrewTranslitMarkUpForIndexing(final String stepTransliteration) {
        final StringBuilder sb = new StringBuilder(stepTransliteration);

        // also remove double letters...
        char lastLetter = 0x0;
        for (int ii = 0; ii < sb.length(); ) {
            final char currentLetter = sb.charAt(ii);
            switch (currentLetter) {
                case '.':
                case '-':
                case '\'':
                case '*':
                case CLOSED_QUOTE:
                case OPEN_QUOTE:
                    sb.deleteCharAt(ii);
                    continue;
                case K_WITH_LINE:
                    sb.setCharAt(ii, 'k');
                    break;
                case T_WITH_DOT:
                    sb.setCharAt(ii, 't');
                    break;
                case H_WITH_DOT:
                    sb.setCharAt(ii, 'h');
                    break;
                case B_WITH_LINE:
                    sb.setCharAt(ii, 'b');
                    break;
                case 'é':
                    sb.setCharAt(ii, 'e');
                    break;
                default:
                    break;
            }

            if (currentLetter == lastLetter) {
                sb.deleteCharAt(ii);
                continue;
            }

            lastLetter = currentLetter;
            ii++;
        }

        return sb.toString();
    }

    /**
     * @return gives the hebrew list of transliteration rules
     */
    public static List<TransliterationRule> getTransliterationRules() {
        ensureTransliterationRules();
        return transliterationRules;
    }

    /**
     * creates the transliteration rules lazily, on first time
     */
    private static void ensureTransliterationRules() {
        if (transliterationRules != null) {
            return;
        }

        createTransliterationRules();
    }

    /**
     * creates the rules, this is synchronized so that no-two threads are creating it at any point of time
     */
    private static synchronized void createTransliterationRules() {
        // check again if it has been initialized, as we may be coming second
        if (transliterationRules == null) {
            final List<TransliterationRule> rules = new ArrayList<>();
            rules.add(new StringToStringRule("b", new String[]{"v"}));
            rules.add(new StringToStringRule("v", new String[]{"b", "w"}));
            rules.add(new StringToStringRule("w", new String[]{"v" }));
            rules.add(new StringToStringRule("h", new String[]{"ch", "chch"}));
            rules.add(new StringToStringRule("ch", new String[]{"h", "chch"}));
            rules.add(new StringToStringRule("j", new String[]{"y"}));
            rules.add(new StringToStringRule("x", new String[]{"h", "ch", "chch" }));
            rules.add(new StringToStringRule("+", new String[]{"t"}));
            rules.add(new StringToStringRule("$", new String[]{"s"}));
            rules.add(new StringToStringRule("s", new String[]{"sh", "ts", "shsh", "tsts"}));
            rules.add(new StringToStringRule("sh", new String[]{"shsh"}));
            rules.add(new StringToStringRule("gh", new String[]{"g"}));
            rules.add(new StringToStringRule("kh", new String[]{"k"}));
            rules.add(new StringToStringRule("k", new String[]{"kh" }));
            rules.add(new StringToStringRule("dh", new String[]{"d"}));
            rules.add(new StringToStringRule("th", new String[]{"t"}));
            rules.add(new StringToStringRule("ph", new String[]{"p" }));
            rules.add(new StringToStringRule("p", new String[]{"ph"}));
            rules.add(new StringToStringRule("tz", new String[]{"ts", "tsts" }));
            rules.add(new StringToStringRule("y", new String[]{""}));
            rules.add(new StringToStringRule("a", new String[]{""}));
            rules.add(new StringToStringRule("e", new String[]{""}));
            rules.add(new StringToStringRule("é", new String[]{"e"}));

            transliterationRules = rules;
        }
    }

    /**
     * vowel-based hebrew transliteration
     *
     * @param inputString the input string
     * @return the transliteration
     */
    public static String transliterateHebrew(final String inputString) {
        final HebrewLetter[] letters = new HebrewLetter[inputString.length()];
        final char[] input = inputString.toCharArray();
        try {

            // iterate through looking for Yods
            for (int ii = 0; ii < input.length; ii++) {
                if (isHebrewConsonant(input[ii])) {
                    processHebrewConsonant(letters, input, ii);
                    processForteDagesh(input, ii, letters);
                } else if (isHebrewVowel(input[ii])) {
                    processHebrewVowel(letters, input, ii);
                } else if (input[ii] != DAGESH) {
                    processNonDagesh(letters, input, ii);
                } else {
                    // dagesh
                    letters[ii] = new HebrewLetter(input[ii]);
                }
            }

            boolean stressedWord = firstPass(letters, input);
            secondPass(letters, input);
            thirdPass(letters, input);


            String transliteration = transliterate(input, letters, stressedWord);
            if (LOGGER.isTraceEnabled()) {
                outputAnalysis(letters, inputString, transliteration);
            }

            return transliteration;
            // CHECKSTYLE:OFF
        } catch (final RuntimeException ex) {
            // output the error analysis
            LOGGER.error("==================================================================");
            // output the letters first
            for (int ii = 0; ii < input.length; ii++) {
                final HebrewLetter hl = letters[ii];
                LOGGER.error("[{}]: c:[{}]", ii, input[ii]);
                if (hl != null) {
                    LOGGER.error(
                            "char=[0x{}]\tletter=[{}]\tconsonant=[{}]\tvLength[{}]\tvStress[{}]\tsounding[{}]",
                            Integer.toString(hl.getC(), 16), hl.getHebrewLetterType(),
                            hl.getConsonantType(), hl.getVowelLengthType(), hl.getVowelStressType(),
                            hl.getSoundingType());
                }
            }
            LOGGER.error("Error occured during Hebrew transliteration. Analysis is above", ex);
            throw ex;
        }
        // CHECKSTYLE:ON
    }

    /**
     * Marks Alephs & Ayins as silent
     *
     * @param letters our current set of letters
     * @param input   the input set of letters
     */
    private static void thirdPass(final HebrewLetter[] letters, final char[] input) {
        for (int ii = 0; ii < letters.length; ii++) {
            if (input[ii] == AYIN || input[ii] == ALEPH) {
                //look for vowels until next consonant
                for (int jj = ii + 1; untilEndOfWord(letters, jj); jj++) {
                    if (letters[jj].isConsonant()) {
                        letters[ii].setSoundingType(SoundingType.SILENT);
                        break;
                    } else if (letters[jj].isVowel()) {
                        letters[ii].setSoundingType(SoundingType.SOUNDING);
                        break;
                    }
                }
            }
        }
    }

    /**
     * Processes a hebrew vowel
     *
     * @param letters  the input, strongly typed
     * @param input    the input as a string
     * @param position our current position
     */
    private static void processHebrewVowel(final HebrewLetter[] letters, final char[] input,
                                           final int position) {
        // a vowel or other pointing
        final HebrewLetter letter = new HebrewLetter(input[position]);
        letter.setHebrewLetterType(HebrewLetterType.VOWEL);

        if (isAny(input[position], SHEVA, HATAF_SEGOL, HATAF_PATAH, HATAF_QAMATS)) {
            letter.setVowelLengthType(VowelLengthType.VERY_SHORT);
        } else if (isAny(input[position], TSERE, QAMATS, HOLAM_HASER, HOLAM)) {
            letter.setVowelLengthType(VowelLengthType.LONG);
        } else if (input[position] == HIRIQ && hasAnyPointing(input, position, true, METEG)
                || hasAnyPointing(input, position, false, METEG)) {
            letter.setVowelLengthType(VowelLengthType.LONG);
        } else {
            letter.setVowelLengthType(VowelLengthType.SHORT);
        }
        letters[position] = letter;
    }

    /**
     * Pre-parse processing of a Non-Dagesh character. This gets called if input[ii] character is neither a
     * vowel, nor a consonant, nor a dagesh form
     *
     * @param letters the set of letters found so far. 0-&gt;ii-1 have already been processed. ii-end are yet
     *                to be processed
     * @param input   the input, ii indicating how far through we are
     * @param ii      ii the index of how far through we are
     */
    private static void processNonDagesh(final HebrewLetter[] letters, final char[] input, final int ii) {
        if(input[ii] >= ETNAHTA && input[ii] <= ZINOR || input[ii] == METEG) {
            // accents
            final HebrewLetter letter = new HebrewLetter(input[ii]);
            letters[ii] = letter;
            letter.setHebrewLetterType(HebrewLetterType.ACCENT);
        } else {
            letters[ii] = new HebrewLetter(input[ii]);
        }
    }

    /**
     * Pre-parse processing of a Hebrew consonant, processes the input[ii] character
     *
     * @param letters the set of letters found so far. 0-&gt;ii-1 have already been processed. ii-end are yet
     *                to be processed
     * @param input   the input, ii indicating how far through we are
     * @param ii      ii the index of how far through we are
     */
    private static void processHebrewConsonant(final HebrewLetter[] letters, final char[] input, final int ii) {
        // CHECKSTYLE:OFF
        if (ii >= 2 && processYod(input, letters, ii)) {
            // do nothing
        } else if (processVav(input, letters, ii)) {
            // do nothing
        } else {
            final HebrewLetter letter = new HebrewLetter(input[ii]);
            letter.setHebrewLetterType(HebrewLetterType.CONSONANT);
            letters[ii] = letter;

            if (input[ii] == SIN && hasAnyPointing(input, ii, true, SHIN_DOT)) {
                letter.setIsShin(true);
            }

        }
        // CHECKSTYLE:ON
    }

    /**
     * Outputs the analysis at trace level
     *
     * @param letters         the list of letters
     * @param inputString     the string to be transliterated
     * @param transliteration the transliteration of these letters
     */
    private static void outputAnalysis(final HebrewLetter[] letters, final String inputString, final String transliteration) {
        LOGGER.trace("**********************************");
        LOGGER.trace("ANALYSIS FOR: [{}] => [{}]", inputString, transliteration);
        for (final HebrewLetter hl : letters) {
            LOGGER.trace(
                    "char=[{}],xchar=[0x{}]\tletter=[{}]\tconsonant=[{}]\tvLength[{}]\tvStress[{}]\tsounding[{}]",
                    hl.getC(),
                    Integer.toString(hl.getC(), 16), hl.getHebrewLetterType(),
                    hl.getConsonantType(), hl.getVowelLengthType(), hl.getVowelStressType(),
                    hl.getSoundingType());
        }
        LOGGER.trace("**********************************");
    }

    /**
     * Stresses vowels and corrects vavs with dagesh iterates through all vowels and stresses them
     *
     * @param letters the set of strongly typed letters
     * @param input   the actual characters
     * @return word has a stress
     */
    private static boolean firstPass(final HebrewLetter[] letters, final char[] input) {
        boolean hasStress = false;

        for (int ii = 0; ii < letters.length; ii++) {
            //ignore the SHIN DOT
            if (letters[ii].getC() == SHIN_DOT) {
                continue;
            }

            if (HebrewLetterType.ACCENT.equals(letters[ii].getHebrewLetterType())) {
                if (isNotGeresh(input, ii) || previousConsonant(letters, ii) != 0) {
                    final HebrewLetter letter = getCloseVowel(letters, ii);
                    if (letter == null) continue; // Don't let it run into an exception
                    letter.setVowelStressType(VowelStressType.STRESSED);
                    hasStress = true;
                }
            } else if (letters[ii].getC() == VAV && hasCloseDagesh(input, ii)) {
                letters[ii].setVowelLengthType(VowelLengthType.SHORT);
            }
        }
        return hasStress;
    }

    /**
     * @param input    our input
     * @param position the current position
     * @return true if the letter is not a GERESH MUQDAM and not a GERESH character
     */
    private static boolean isNotGeresh(final char[] input, final int position) {
        return input[position] != GERESH_MUQDAM && input[position] != GERESH;
    }

    /**
     * Looking for the first previous consonant
     *
     * @param letters         the set of strongly typed letters
     * @param currentPosition the actual position in the cahracter
     * @return position of previous consonant
     */
    private static int previousConsonant(final HebrewLetter[] letters, final int currentPosition) {
        for (int ii = currentPosition - 1; ii >= 0; ii--) {
            if (letters[ii].isConsonant()) {
                return ii;
            }
        }
        return -1;
    }

    /**
     * Marking silent shevas
     *
     * @param letters the set of strongly typed letters
     * @param input   the actual characters
     */
    private static void secondPass(final HebrewLetter[] letters, final char[] input) {
        int previousConsonantPosition = -1;
        int currentConsonantPosition = -1;
        for (int ii = 0; ii < letters.length; ii++) {
            if (letters[ii].isConsonant()) {
                previousConsonantPosition = currentConsonantPosition;
                currentConsonantPosition = ii;
            } else if (letters[ii].getC() == SHEVA) {
                if (!isLastHebrewConsonantInWordWithoutVowel(letters, ii)
                        && (isStartOfWord(letters, currentConsonantPosition) ||
                        !letters[currentConsonantPosition].hasNoDagesh() ||
                        isAfterLongUnstressedVowel(letters, currentConsonantPosition) ||
                        hasAnyPointing(input, previousConsonantPosition, true, SHEVA))
                        && !(isAfterShortUnstressedVowel(letters, currentConsonantPosition)
                        && letters[ii].hasNoDagesh())) {
                    letters[ii].setSoundingType(SoundingType.SOUNDING);

                } else {
                    letters[ii].setSoundingType(SoundingType.SILENT);
                }
            }
        }
    }

    /**
     * Transliterates letters one by one
     *
     *
     *
     * @param letters the list of letters
     * @param stressedWord true to indicate the word has at least one stress  @return the transliterated string
     */
    private static String transliterate(char[] input, final HebrewLetter[] letters,  final boolean stressedWord) {
        final StringBuilder output = new StringBuilder(letters.length + 16);
        for (int ii = 0; ii < letters.length; ii++) {
            transliterate(letters, ii, output, stressedWord);
        }

        doEndings(input, output);
        return output.toString();
    }

    /**
     * Transliterates the given input. This method creates the actual transliteration.
     *
     * @param letter  the array of letters identified so far, after the parsing has occurred.
     * @param output  current output
     * @param current the current position in 'letter' to be processed
     * @param hasStress true to indicate a word has a stress
     */
    public static void transliterate(final HebrewLetter[] letter, final int current,
                                     final StringBuilder output, boolean hasStress) {
        final HebrewLetter currentLetter = letter[current];
        final char c = currentLetter.getC();

//        if (currentLetter.isStressed()) {
//            output.append('*');
//        }

        // hyphenating vowels
        hyphenateSyllables(letter, current, output, hasStress);

        final int sizeBeforeAppending = output.length();

        mapHebrewLetterToTransliteratedLetter(current, output, currentLetter, c);

        doubleHyphenateIfApplicable(output, letter, current, sizeBeforeAppending);
    }

    /**
     * Given the current input, examines the letter and outputs the relevant character to the StringBuilder
     * output.
     *
     * @param current       the current position
     * @param output        the rendered output
     * @param currentLetter the current letter
     * @param c             the char value that we are examining
     */
    // CHECKSTYLE:OFF
    private static void mapHebrewLetterToTransliteratedLetter(final int current, final StringBuilder output,
                                                              final HebrewLetter currentLetter, final char c) {
        switch (c) {
            // consonants
            case ALEPH:
//                output.append(CLOSED_QUOTE);
                break;
            case BET:
                if (currentLetter.hasNoDagesh() && current != 0) {
                    output.append('v');
                } else {
                    output.append('b');
                }
                break;
            case GIMEL:
                output.append('g');
                break;
            case DALET:
                output.append('d');
                break;
            case HE:
                output.append('h');
                break;
            case VAV:
                if (currentLetter.isVowel()) {
                    if (currentLetter.isShureq()) {
                        output.append('u');
                    }
                } else {
                    output.append('v');
                }
                break;
            case ZAYIN:
                output.append('z');
                break;
            case HET:
                output.append("ch");
                break;
            case TET:
                output.append('t');
                break;
            case YOD:
                if (currentLetter.isConsonant()) {
                    output.append('y');
                }
                break;
            case FINAL_KAF:
            case KAF:
                if (currentLetter.hasNoDagesh() && current != 0) {
                    output.append("kh");
                } else {
                    output.append('k');
                }
                break;
            case LAMED:
                output.append('l');
                break;
            case FINAL_MEM:
            case MEM:
                output.append('m');
                break;
            case FINAL_NUN:
            case NUN:
                output.append('n');
                break;
            case SAMEKH:
                output.append('s');
                break;
            case AYIN:
//                output.append(OPEN_QUOTE);
                break;
            case FINAL_PE:
            case PE:
                if (currentLetter.hasNoDagesh() && current != 0) {
                    output.append('p');
                    output.append('h');
                } else {
                    output.append('p');
                }
                break;
            case FINAL_TSADI:
            case TSADI:
                output.append('t');
                output.append('s');
                break;
            case QOF:
                output.append('q');
                break;
            case RESH:
                output.append('r');
                break;
            case SIN:
                output.append('s');
                if (currentLetter.isShin()) {
                    output.append('h');
                }
                break;
            case TAV:
                output.append('t');
                break;

            // vowels
            case SHEVA:
                if (!currentLetter.isSilent()) {
                    output.append('e');
                }
                break;
            case HATAF_SEGOL:
                output.append('e');
                break;
            case HATAF_PATAH:
                output.append('a');
                break;
            case HATAF_QAMATS:
                output.append('o');
                break;
            case HIRIQ:
                output.append('i');
                break;
            case TSERE:
                output.append('e');
                break;
            case SEGOL:
                output.append('e');
                break;
            case PATAH:
                output.append('a');
                break;
            case QAMATS:
                output.append('a');
                break;
            case HOLAM:
                final int length = output.length();
                if (length > 0 && output.charAt(length - 1) == 'w') {
                    output.insert(length - 1, 'o');
                } else {
                    output.append('o');
                }
                break;
            case HOLAM_HASER:
                output.append('o');
                break;
            case QUBUTS:
                output.append('u');
                break;
            case QAMATS_QATAN:
                output.append('o');
                break;
            default:
                break;
        }
    }

    // CHECKSTYLE:ON

    /**
     * Adds the hyphens in for doubled letters
     *
     * @param output              the output rendered so far
     * @param letters             the letters under examination
     * @param currentPosition     position
     * @param sizeBeforeAppending the size of the output, prior to process the currentLetter.
     */
    private static void doubleHyphenateIfApplicable(final StringBuilder output, HebrewLetter[] letters,
                                                    int currentPosition, final int sizeBeforeAppending) {
        final HebrewLetter currentLetter = letters[currentPosition];
        // doubling and hyphenating
        if (currentLetter.isDoubled() && !isStartOfWord(letters, currentPosition)) {
            output.append(HYPHEN);
            // copy to the end, and discount the already added -
            final int endOfDoubleLetter = output.length() - 1;
            for (int ii = sizeBeforeAppending; ii < endOfDoubleLetter; ii++) {
                output.append(output.charAt(ii));
            }
        }
    }

    /**
     * Marks the syllables
     *
     * @param letters set of letters
     * @param current the current position
     * @param output  the current output
     * @param hasStress true to indicate a word has a stress
     */
    private static void hyphenateSyllables(final HebrewLetter[] letters, final int current,
                                           final StringBuilder output, boolean hasStress) {

        if (letters[current].getC() == MAQAF) {
            output.append(MAQAF_HYPHEN);
            return;
        }

        if (letters[current].getC() == ' ') {
            output.append(' ');
            return;
        }


        //if previous was a maqaf, then we're not going to hyphenate
        if (current - 1 >= 0 && (letters[current - 1].getC() == MAQAF || letters[current - 1].getC() == ' ')) {
            return;
        }

        if (isStartOfWord(letters, current) || !letters[current].isConsonant()
                || isLastHebrewConsonantInWordWithoutVowel(letters, current)) {
            return;
        }

        //if the previous output was a syllable marker, then we're not going to do anything
        if (output.length() > 0 && (
                output.charAt(output.length() - 1) == HYPHEN ||
                        output.charAt(output.length() - 1) == MAQAF_HYPHEN ||
                        output.charAt(output.length() - 1) == ' ')
                ) {
            //then don't output
            return;
        }

        // look for vowels
        boolean foundLongVowel = false;
        boolean foundStressedVowel = false;
        for (int ii = current - 1; ii > 0 && !letters[ii].isConsonant(); ii--) {
            if (letters[ii].isVowel()) {
                if (letters[ii].getC() == HATAF_PATAH || letters[ii].getC() == HATAF_QAMATS
                        || letters[ii].getC() == HATAF_SEGOL || letters[ii].getC() == SHEVA) {
                    output.append(HYPHEN);
                    return;
                }

                if (letters[ii].isLong()) {
                    foundLongVowel = true;
                }

                if (letters[ii].isStressed()) {
                    foundStressedVowel = true;
                }

                if (hasStress && foundLongVowel && !foundStressedVowel) {
                    output.append(HYPHEN);
                    return;
                }
            }
        }

        if (letters[current].isDoubled()) {
            return;
        }
        for (int ii = current + 1; untilEndOfWord(letters, ii) && !letters[ii].isConsonant(); ii++) {
            if (letters[ii].getC() == SHEVA && letters[ii].isSilent()) {
                return;
            }
        }

        if (letters[current].isConsonant() && letters[current].isSilent()) {
            return;
        }

        output.append(HYPHEN);
    }

    /**
     * Checks whether the letter is the last Hebrew letter in a word, doesn't check past a MAQAF
     *
     * @param letters  the set of letters
     * @param position our current position
     * @return true if it last without vowel, false if it's last with vowel OR not last consonant
     */
    private static boolean isLastHebrewConsonantInWordWithoutVowel(final HebrewLetter[] letters, final int position) {
        final boolean isLastHebrewConsonant = isLastHebrewConsonantInWord(letters, position);

        if (isLastHebrewConsonant) {
            for (int ii = position + 1; untilEndOfWord(letters, ii); ii++) {
                if (letters[ii].isVowel() && !letters[ii].isSilent()) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    /**
     * Looks until the end of the word, and stops early if it hits a MAQAF (hebrew hyphen).
     *
     * @param letters the hebrew letters
     * @param ii      the current position in the (usually) loop
     * @return true if we should continue
     */
    private static boolean untilEndOfWord(final HebrewLetter[] letters, final int ii) {
        return isNotMaqafOrSpacing(letters, ii);
    }

    /**
     * @param letters out hebrew letters
     * @param ii      current position
     * @return true if ii is 0 or precedecing character is spacing/maqaf etc.
     */
    private static boolean isStartOfWord(final HebrewLetter[] letters, final int ii) {
        return ii == 0 || !isNotMaqafOrSpacing(letters, ii - 1);
    }

    /**
     * @param letters the current set of letters
     * @param ii      our current position
     * @return true if it is not a maqaf or spacing
     */
    private static boolean isNotMaqafOrSpacing(final HebrewLetter[] letters, final int ii) {
        return ii < letters.length && letters[ii].getC() != MAQAF && letters[ii].getC() != ' ';
    }

    /**
     * Checks whether it is the last hebrew consonant up to a MAQAF
     *
     * @param letters  the set of letters
     * @param position our current position
     * @return true if no other consonants are found after the position
     */
    private static boolean isLastHebrewConsonantInWord(final HebrewLetter[] letters, final int position) {
        boolean vowelReturnsConsonant = false;

        for (int ii = position + 1; untilEndOfWord(letters, ii); ii++) {
            if (vowelReturnsConsonant && letters[ii].isVowel()) {
                return false;
            }

            if (letters[ii].isConsonant()) {

                //check if it is an Aleph or a AYIN - if so we continue looking unless we hit a vowel
                if (letters[ii].getC() != AYIN && letters[ii].getC() != ALEPH) {
                    //no aleph/ayin, so definitely not the last consonant
                    return false;
                }

                //if we encounter a vowel, then we're going to return false
                vowelReturnsConsonant = true;
            }
        }

        return true;
    }

    /**
     * Swaps letters round if they finish in a particular order:
     * <p/>
     * <pre>
     *  ha => ah,
     *  cha = ach,
     *  (a => a(,
     * </pre>
     *
     * @param letters
     * @param output the output which may need letters swapped
     */
    private static void doEndings(final char[] letters, final StringBuilder output) {
        //find last consonant
        int lastConsonant = getLastConsonantPosition(letters);
        if(lastConsonant == -1 || (letters[lastConsonant] != HET && letters[lastConsonant] != HE)) {
            return;
        }
        
        //we've got a he or a het
        if(!hasAnyPointing(letters, lastConsonant, true, PATAH)) {
            return;
        }
        
        // check last character if a
        final int last = output.length() - 1;
        final int secondLast = last - 1;

        if (secondLast < 0) {
            return;
        }

        // ends with a
        if (output.charAt(last) == 'a') {
            // ends with ha
            final char secondChar = output.charAt(secondLast);
            if (output.charAt(secondLast) == 'h' || secondChar == H_WITH_DOT) {
                if (secondLast > 0 && output.charAt(secondLast - 1) == 'c') {
                    output.setCharAt(last, 'h');
                    output.setCharAt(secondLast, 'c');
                    output.setCharAt(secondLast - 1, 'a');
                } else {
                    // ends only with ha
                    output.setCharAt(secondLast, 'a');
                    output.setCharAt(last, secondChar);
                }
            } else if (secondChar == OPEN_QUOTE) {
                // ends with (a
                output.setCharAt(last, 'a');
                output.setCharAt(secondLast, OPEN_QUOTE);
            }
        }

    }

    /**
     * Gets the last consonant in the Hebrew word
     * @param letters the letters in the word
     * @return the index of the last consonant
     */
    private static int getLastConsonantPosition(final char[] letters) {
        for(int ii = letters.length - 1; ii >= 0; ii--) {
            if(isHebrewConsonant(letters[ii])) {
                return ii;
            }
        }
        return -1;
    }

    /**
     * looks for the previous letter and works out whether it is long and unstressed
     *
     * @param letters           the set of letters
     * @param consonantPosition the current position
     * @return true if after a long unstressed vowel
     */
    private static boolean isAfterLongUnstressedVowel(final HebrewLetter[] letters,
                                                      final int consonantPosition) {
        return isAfterAnUnstressedVowel(letters, consonantPosition, true);
    }

    /**
     * looks for the previous letter and works out whether it is short and unstressed
     *
     * @param letters           the set of letters
     * @param consonantPosition the current position
     * @return true if after a long unstressed vowel
     */
    private static boolean isAfterShortUnstressedVowel(final HebrewLetter[] letters, final int consonantPosition) {
        return isAfterAnUnstressedVowel(letters, consonantPosition, false);
    }


    /**
     * looks for the previous letter and works out whether it is long and unstressed
     *
     * @param letters           the set of letters
     * @param consonantPosition the current position
     * @return true if after a long unstressed vowel
     */
    private static boolean isAfterAnUnstressedVowel(final HebrewLetter[] letters,
                                                    final int consonantPosition, boolean lookingForLong) {
        // look for first letter we have
        int ii = consonantPosition - 1;

        while (ii >= 0 && !letters[ii].isConsonant()) {
            boolean isCorrectLength = lookingForLong ? letters[ii].isLong() : letters[ii].getVowelLengthType() == VowelLengthType.SHORT;
//            boolean isSheva = letters[ii].getC() == SHEVA;

            if ((letters[ii].isVowel() && isCorrectLength && !letters[ii].isStressed())) {
                return true;
            }

            ii--;
        }
        return false;
    }

    /**
     * @param input           input string
     * @param currentPosition the current position
     * @return True if the glyph contains a DAGESH after the VAV or other consonant - only looks forward
     */
    private static boolean hasCloseDagesh(final char[] input, final int currentPosition) {
        return hasAnyPointing(input, currentPosition, true, DAGESH);
    }

    /**
     * Looks backwards to the consonant, then forwards to the beginning of the next consonant, then works
     * backwards until it hits a vowel
     *
     * @param letters         the set of letters
     * @param currentPosition out current position
     * @return the closest vowel found in the sequence of hebrew letters
     */
    private static HebrewLetter getCloseVowel(final HebrewLetter[] letters, final int currentPosition) {
        HebrewLetter vowel = getCloseVowel(letters, currentPosition, false);
        if (vowel != null) {
            return vowel;

        }

        vowel = getCloseVowel(letters, currentPosition, true);
        if (vowel != null) {
            return vowel;

        }

        for (int ii = currentPosition; ii >= 0; ii--) {
            if (letters[ii].isVowel()) {
                return letters[ii];
            }
        }

        return vowel;
    }

    /**
     * Returns the closest vowel, looking forwards or backwards depending on the parameters passed in
     *
     * @param letters         the input
     * @param currentPosition our current position in the input
     * @param forwards        true for looking ahead, false for looking backwards
     * @return the Hebrew vowel, or null if not found
     */
    private static HebrewLetter getCloseVowel(final HebrewLetter[] letters, final int currentPosition,
                                              final boolean forwards) {
        final int increment = forwards ? 1 : -1;

        for (int ii = currentPosition + increment; ii > 0 && untilEndOfWord(letters, ii); ii = ii + increment) {
            if (letters[ii].isVowel()) {
                return letters[ii];
            } else if (letters[ii].isConsonant()) {
                break;
            }
        }

        // not found
        return null;
    }

    /**
     * @param c the character
     * @return true to indicate a vowel
     */
    private static boolean isHebrewVowel(final char c) {
        return c >= SHEVA && c <= QAMATS_QATAN && c != DAGESH && c != SHIN_DOT;
    }

    /**
     * Dagesh processing for length of vowels
     *
     * @param input           input string
     * @param currentPosition the current position
     * @param letters         the set of letters
     */
    private static void processForteDagesh(final char[] input, final int currentPosition,
                                           final HebrewLetter[] letters) {
        if (!HebrewLetterType.CONSONANT.equals(letters[currentPosition].getHebrewLetterType())) {
            return;
        }

        if (!hasAnyPointing(input, currentPosition, true, DAGESH)) {
            letters[currentPosition].setConsonantType(ConsonantType.NO_DAGESH);
            return;
        }

        // first character is always single
        if (isStartOfWord(letters, currentPosition) || isLastLetterInWord(input, currentPosition)) {
            letters[0].setConsonantType(ConsonantType.SINGLE);
            return;
        }

        final char consonant = input[currentPosition];
        if (isAny(consonant, BET, GIMEL, DALET, KAF, PE, TAV)
                && hasAnyPointing(input, currentPosition, false, SHEVA, HATAF_SEGOL, HATAF_PATAH, HATAF_QAMATS)) {
            // not dagesh forte if any of those letters
            letters[currentPosition].setConsonantType(ConsonantType.SINGLE);
            return;
        }
        letters[currentPosition].setConsonantType(ConsonantType.DOUBLE);
    }

    /**
     * @param input           input string
     * @param currentPosition the current position
     * @return true to indicate a letter
     */
    private static boolean isLastLetterInWord(final char[] input, final int currentPosition) {
        for (int ii = currentPosition + 1; ii < input.length && input[ii] != MAQAF && input[ii] != ' '; ii++) {
            if (isHebrewConsonant(input[ii])) {
                //aleph or AYIN with no vowels
                if (input[ii] == ALEPH || input[ii] == AYIN) {
                    return !hasAnyPointing(input, currentPosition, true, QAMATS_QATAN, SHEVA,
                            HATAF_SEGOL, HATAF_PATAH, HATAF_QAMATS, HIRIQ, TSERE, SEGOL, PATAH,
                            QAMATS, HOLAM, HOLAM_HASER, QUBUTS);
                }

                return false;
            }
        }

        return true;
    }

    /**
     * @param charAt our current char
     * @return true if it is a consonant
     */
    private static boolean isHebrewConsonant(final char charAt) {
        return charAt >= ALEPH && charAt <= TAV;
    }

    /**
     * checks if consonant is contained in consonants
     *
     * @param letter          the one we are looking for
     * @param matchingLetters the possibilities
     * @return true if found in the list of consonants provided
     */
    private static boolean isAny(final char letter, final char... matchingLetters) {
        for (char matchingLetter : matchingLetters) {
            if (letter == matchingLetter) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param inputString     input string
     * @param letters         the letters found in the word so far
     * @param currentPosition the current position
     * @return found a vowel
     */
    private static boolean processVav(final char[] inputString, final HebrewLetter[] letters,
                                      final int currentPosition) {
        final boolean isVav = inputString[currentPosition] == VAV;
        if (isVav) {
            if (isVavConsonant(inputString, currentPosition, letters)) {
                final HebrewLetter letter = new HebrewLetter(VAV);
                letter.setHebrewLetterType(HebrewLetterType.CONSONANT);
                letters[currentPosition] = letter;
            } else {
                final HebrewLetter letter = new HebrewLetter(VAV);
                letter.setHebrewLetterType(HebrewLetterType.VOWEL);

                if (hasAnyPointing(inputString, currentPosition, true, DAGESH)) {
                    letter.setShureq(true);
                }

                // next consonant has a dagesh?
                final int position = nextHebrewConsonant(inputString, currentPosition);
                if (position != -1 && hasAnyPointing(inputString, position, true, DAGESH)) {
                    letter.setVowelLengthType(VowelLengthType.SHORT);
                } else {
                    letter.setVowelLengthType(VowelLengthType.LONG);
                }
                letters[currentPosition] = letter;
            }
            return true;
        }
        return false;
    }

    /**
     * Finds where the next Hebrew consonant is
     *
     * @param inputString     the input
     * @param currentPosition our current position in the input
     * @return the position of the next hebrew consonant
     */
    private static int nextHebrewConsonant(final char[] inputString, final int currentPosition) {
        int ii = currentPosition + 1;
        while (ii < inputString.length && !isHebrewConsonant(inputString[ii])) {
            ii++;
        }

        return ii == inputString.length ? -1 : ii;
    }

    /**
     * searches for any letters provided
     *
     * @param inputString the input string
     * @param position    the current position in the string
     * @param after       true to indicate to look after, false for before
     * @param otherMarks  the unicode characters we are look for
     * @return true if all marks were matched
     */
    public static boolean hasAnyPointing(final char[] inputString, final int position, final boolean after,
                                         final char... otherMarks) {
        return hasPointing(inputString, position, after, false, false, otherMarks);
    }

    /**
     * searches for all letters provided
     *
     * @param inputString the input string
     * @param position    the current position in the string
     * @param after       true to indicate to look after, false for before
     * @param otherMarks  the unicode characters we are look for
     * @return true if all marks were matched
     */
    public static boolean hasAllPointing(final char[] inputString, final int position, final boolean after,
                                         final char... otherMarks) {
        return hasPointing(inputString, position, after, true, false, otherMarks);
    }

    /**
     * searches for all letters provided
     *
     * @param inputString the input string
     * @param position    the current position in the string
     * @param after       true to indicate to look after, false for before
     * @param otherMarks  the unicode characters we are look for
     * @return true if all marks were matched
     */
    public static boolean hasAllPointingIncludingVav(final char[] inputString, final int position,
                                                     final boolean after, final char... otherMarks) {
        return hasPointing(inputString, position, after, true, true, otherMarks);

    }

    /**
     * searches for all letters provided
     *
     * @param inputString   the input string
     * @param position      the current position in the string
     * @param after         true to indicate to look after, false for before
     * @param hasAllLetters true to include all letters
     * @param includeVav    true to include searching passed the Vav letter
     * @param otherMarks    the unicode characters we are look for
     * @return true if all marks were matched
     */
    public static boolean hasPointing(final char[] inputString, final int position, final boolean after,
                                      final boolean hasAllLetters, final boolean includeVav, final char... otherMarks) {
        final boolean[] foundAll = new boolean[otherMarks.length];
        final int increment = after ? 1 : -1;

        for (int ii = position + increment; ii < inputString.length; ii = ii + increment) {
            final char newChar = inputString[ii];
            if (newChar >= ALEPH || (includeVav && newChar != VAV)) {
                break;
            }

            for (int jj = 0; jj < otherMarks.length; jj++) {
                if (newChar == otherMarks[jj]) {
                    // has any letters? and we found one, so no need to go further
                    if (!hasAllLetters) {
                        return true;
                    }

                    foundAll[jj] = true;
                }
            }
        }

        return areAllTrue(foundAll);
    }

    /**
     * @param inputString     the input string
     * @param currentPosition the current position
     * @param letters
     * @return true if vav is a consonant
     */
    private static boolean isVavConsonant(final char[] inputString, final int currentPosition, final HebrewLetter[] letters) {
        final boolean hasDagesh = hasAnyPointing(inputString, currentPosition, true, DAGESH);
        if (isStartOfWord(letters, currentPosition)) {
            return !hasDagesh;
        }

        if (isLastLetterInWord(inputString, currentPosition)) {
            return !hasDagesh && !hasAnyPointing(inputString, currentPosition, true, HOLAM);
        }

        if (hasDagesh) {
            if (hasAnyPointing(inputString, currentPosition, true, HIRIQ, TSERE, SEGOL, SHEVA, PATAH, QAMATS,
                    QUBUTS, QAMATS_QATAN)) {
                return true;
            }

            return hasAllPointingIncludingVav(inputString, currentPosition, true, VAV, HOLAM);
        }

        if (hasAllPointing(inputString, currentPosition, true, QAMATS, HOLAM)) {
            return true;
        }

        //if we follow a vowel, then we want to be a consonant
        return isFollowingVowel(currentPosition, letters);
    }

    /**
     * True to indicate we are following a vowel - stops at the first consonant/start of word
     *
     * @param currentPosition the current position
     * @param letters         the letters
     * @return true if following a vowel
     */
    private static boolean isFollowingVowel(final int currentPosition, final HebrewLetter[] letters) {
        for (int ii = currentPosition - 1; ii > 0 && !letters[ii].isConsonant() && !isStartOfWord(letters, ii); ii--) {
            if (letters[ii].isVowel()) {
                return true;
            }
        }
        return false;
    }

    /**
     * If it's a yod, adds the letter to the array
     *
     * @param inputString     the input string
     * @param letters         the set of letters
     * @param currentPosition our current position in the input string
     * @return true if a yod was found
     */
    private static boolean processYod(final char[] inputString, final HebrewLetter[] letters,
                                      final int currentPosition) {
        final boolean isYod = inputString[currentPosition] == YOD;
        if (isYod) {
            final HebrewLetter letter = new HebrewLetter(YOD);

            if (isYodVowel(inputString, currentPosition, letters)) {
                letter.setHebrewLetterType(HebrewLetterType.VOWEL);
                letter.setVowelLengthType(VowelLengthType.LONG);
                letters[currentPosition] = letter;
                return true;
            } else {
                letter.setHebrewLetterType(HebrewLetterType.CONSONANT);
                letters[currentPosition] = letter;
                return true;
            }
        }

        return false;
    }

    /**
     * @param inputString     the input string
     * @param currentPosition the current position in the string
     * @param letters
     * @return true if yod is a vowel
     */
    private static boolean isYodVowel(final char[] inputString, final int currentPosition, final HebrewLetter[] letters) {
        return hasAnyPointing(inputString, currentPosition, false, HIRIQ, TSERE, SEGOL, QAMATS, HOLAM_HASER)
                && !hasAnyPointing(inputString, currentPosition, true, QAMATS_QATAN, SHEVA, HATAF_SEGOL,
                HATAF_PATAH, HATAF_QAMATS, HIRIQ, TSERE, SEGOL, PATAH, QAMATS, HOLAM, HOLAM_HASER,
                QUBUTS, DAGESH);
    }

    /**
     * True if all are true
     *
     * @param foundAll the list of boolean flags
     * @return true if all booleans passed are true
     */
    private static boolean areAllTrue(final boolean[] foundAll) {
        for (boolean b : foundAll) {
            if (!b) {
                return false;
            }
        }
        return true;
    }
}
