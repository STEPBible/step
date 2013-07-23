package com.tyndalehouse.step.core.utils.language;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import com.tyndalehouse.step.core.utils.language.transliteration.StringToStringRule;
import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationRule;

/**
 * Utilities for doing Hebrew transliteration
 * 
 * @author chrisburrell
 * 
 */
public final class GreekUtils {
    private static final int PERISPOMENI = 0x0342;
    private static final int YOT = 0x03F3;
    private static final Pattern BETA_UPPER_CASE_SYMBOLS = Pattern.compile("[*]");
    private static final Pattern BETA_ACCENTS = Pattern.compile("[()/=+|&'*\\\\]");
    private static final String GREEK_BREATHING = "h";
    private static List<TransliterationRule> transliterationRules;

    /** prevent instantiation */
    private GreekUtils() {
        // do nothing
    }

    /**
     * @param form the word
     * @return true if the normalized form without the diacritics is between PERISPOMENI and YOT, the unicode
     *         range for Greek
     */
    public static boolean isGreekText(final String form) {
        final int firstProper = unAccent(form).charAt(0);
        return firstProper >= PERISPOMENI && firstProper <= YOT;
    }

    /**
     * @param stepTransliteration the step transliteration
     * @return withou the leading H
     */
    public static String removeGreekTranslitMarkUpForIndexing(final String stepTransliteration) {
        if (stepTransliteration.startsWith(GREEK_BREATHING)) {
            return stepTransliteration.substring(1);
        }
        return stepTransliteration;
    }

    /**
     * @param word a word with accents
     * @return a word without accents
     */
    public static String unAccent(final String word) {
        return Normalizer.normalize(word, Normalizer.Form.NFD).replaceAll(
                "[\\p{InCombiningDiacriticalMarks}\u2e00-\u2E3B]*", "");
    }

    /**
     * assumes lower case version of beta, since this is what we search on
     * 
     * @param beta the input string, with '*'
     * @return a version without breathing or *
     */
    public static String toBetaLowercase(final String beta) {
        return BETA_UPPER_CASE_SYMBOLS.matcher(beta).replaceAll("");
    }

    /**
     * Gets rid of breathing and upper case symbols. Does not change the case of the characters
     * 
     * @param beta the input string with breathing and * for capitals
     * @return a version without breathing or *
     */
    public static String toBetaUnaccented(final String beta) {
        if (beta == null) {
            return null;
        }
        return BETA_ACCENTS.matcher(beta).replaceAll("");
    }

    /**
     * Performs a greek transliteration on a normalised string
     * 
     * @param normalized the normalised string
     * @return the equivalent transliteration
     */
    // CHECKSTYLE:OFF
    public static String transliterateGreek(final String normalized) {
        final StringBuilder sb = new StringBuilder(normalized);
        int position = 0;

        while (position < sb.length()) {
            switch (sb.charAt(position)) {
                case 'α':
                    sb.setCharAt(position++, 'a');
                    break;

                case 'β':
                    sb.setCharAt(position++, 'b');
                    break;

                case 'γ':
                    if (position + 1 < sb.length()) {
                        switch (sb.charAt(position + 1)) {
                            case 'γ':
                                sb.setCharAt(position++, 'n');
                                sb.setCharAt(position++, 'g');
                                break;
                            case 'κ':
                                sb.setCharAt(position++, 'n');
                                sb.setCharAt(position++, 'k');
                                break;
                            case 'χ':
                                sb.setCharAt(position++, 'n');
                                sb.setCharAt(position++, 'c');
                                sb.insert(position++, 'h');
                                break;
                            default:
                                sb.setCharAt(position++, 'g');
                                break;
                        }
                    } else {
                        sb.setCharAt(position++, 'g');
                    }
                    break;

                case 'δ':
                    sb.setCharAt(position++, 'd');
                    break;

                case 'ε':
                    sb.setCharAt(position++, 'e');
                    break;

                case 'ζ':
                    sb.setCharAt(position++, 'z');
                    break;

                case 'η':
                    sb.setCharAt(position++, '\u0113');
                    break;

                case 'θ':
                    sb.setCharAt(position++, 't');
                    sb.insert(position++, 'h');
                    break;

                case 'ι':
                    sb.setCharAt(position++, 'i');
                    break;

                case 'κ':
                    sb.setCharAt(position++, 'k');
                    break;

                case 'λ':
                    sb.setCharAt(position++, 'l');
                    break;

                case 'μ':
                    sb.setCharAt(position++, 'm');
                    break;

                case 'ν':
                    sb.setCharAt(position++, 'n');
                    break;

                case 'ξ':
                    sb.setCharAt(position++, 'x');
                    break;

                case 'ο':
                    sb.setCharAt(position++, 'o');
                    break;

                case 'π':
                    sb.setCharAt(position++, 'p');
                    break;

                case 'ρ':
                    sb.setCharAt(position++, 'r');
                    break;

                case 'ς':
                    sb.setCharAt(position++, 's');
                    break;

                case 'σ':
                    sb.setCharAt(position++, 's');
                    break;

                case 'τ':
                    sb.setCharAt(position++, 't');
                    break;

                case 'υ':
                    sb.setCharAt(position++, 'u');
                    break;

                case 'φ':
                    sb.setCharAt(position++, 'f');
                    break;

                case 'χ':
                    sb.setCharAt(position++, 'c');
                    sb.insert(position++, 'h');
                    break;

                case 'ψ':
                    sb.setCharAt(position++, 'p');
                    sb.insert(position++, 's');
                    break;
                case 'ω':
                    sb.setCharAt(position++, '\u014d');
                    break;

                // leave spaces in, but should never be hit
                case ' ':
                    position++;
                    break;

                // breathing character
                case 0x314:
                    // if the previous character was not a 'r', then we add an 'h'
                    if (!((position == 0 && sb.charAt(1) == 'ρ') || (position > 0 && sb.charAt(0) == 'r'))) {
                        sb.deleteCharAt(position);
                        sb.insert(0, 'h');
                        position++;
                        continue;
                    }
                    sb.deleteCharAt(position);
                    break;
                default:
                    // remove character since not recognised
                    sb.deleteCharAt(position);
                    break;
            }
        }

        return sb.toString();
    }

    // CHECKSTYLE:ON

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
            final List<TransliterationRule> rules = new ArrayList<TransliterationRule>();
            rules.add(new StringToStringRule("gg", new String[] { "ng" }));
            rules.add(new StringToStringRule("gk", new String[] { "nk" }));
            rules.add(new StringToStringRule("gch", new String[] { "nch" }));
            rules.add(new StringToStringRule("q", new String[] { "th" }));
            rules.add(new StringToStringRule("c", new String[] { "x" }));
            rules.add(new StringToStringRule("x", new String[] { "ch" }));
            rules.add(new StringToStringRule("ph", new String[] { "f" }));
            rules.add(new StringToStringRule("y", new String[] { "ps" }));
            rules.add(new StringToStringRule("ow", new String[] { "\u014d" }));
            rules.add(new StringToStringRule("w", new String[] { "\u014d" }));
            rules.add(new StringToStringRule("oo", new String[] { "\u014d" }));
            rules.add(new StringToStringRule("o", new String[] { "\u014d" }));
            rules.add(new StringToStringRule("mb", new String[] { "mp" }));
            rules.add(new StringToStringRule("nd", new String[] { "nt" }));
            rules.add(new StringToStringRule("rh", new String[] { "r" }));
            rules.add(new StringToStringRule("e", new String[] { "\u0113" }));
            rules.add(new StringToStringRule("é", new String[] { "\u0113" }));
            rules.add(new StringToStringRule("h", new String[] { "\u0113" }));

            transliterationRules = rules;
        }
    }
}
