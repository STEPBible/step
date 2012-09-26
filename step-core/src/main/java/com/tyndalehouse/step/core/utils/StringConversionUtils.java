/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.utils;

import java.text.Normalizer;
import java.text.Normalizer.Form;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A collection of utility methods enabling us to convert Strings, references one way or another.
 * 
 * @author chrisburrell
 */
public final class StringConversionUtils {
    private static final Pattern BETA_UPPER_CASE_SYMBOLS = Pattern.compile("[*]");
    private static final Pattern BETA_ACCENTS = Pattern.compile("[()/=+|&'*\\\\]");
    private static final String GREEK_BREATHING = "h";
    private static final int ETNAHTA = 0x0591;
    private static final int DAGESH_GAP = 0xFB44 - 0x05e3;
    private static final int ALEPH = 0x05D0;
    private static final int TAV = 0x05EA;
    private static final char KEY_SEPARATOR = ':';
    private static final String STRONG_PREFIX = "strong:";
    private static final String UPPER_STRONG_PREFIX = "STRONG:";
    private static final int STRONG_PREFIX_LENGTH = STRONG_PREFIX.length();
    private static final int LANGUAGE_INDICATOR = STRONG_PREFIX_LENGTH;
    private static final Logger LOGGER = LoggerFactory.getLogger(StringConversionUtils.class);
    private static final char ALEPH_LAMED = 0xFB4F;

    /**
     * hiding implementation
     */
    private StringConversionUtils() {
        // hiding implementation
    }

    /**
     * Not all bibles encode strong numbers as strong:[HG]\d+ unfortunately, so instead we cope for strong:
     * and strong:H.
     * 
     * In essence we chop off any of the following prefixes: strong:G, strong:H, strong:, H, G. We don't use a
     * regular expression, since this will be much quicker
     * 
     * @param strong strong key
     * @return the key containing just the digits
     */
    public static String getStrongKey(final String strong) {
        if (strong.startsWith(STRONG_PREFIX)) {
            final char c = strong.charAt(LANGUAGE_INDICATOR);
            if (c == 'H' || c == 'G') {
                return strong.substring(LANGUAGE_INDICATOR + 1);
            }
            return strong.substring(LANGUAGE_INDICATOR);
        }

        final char c = strong.charAt(0);
        if (c == 'H' || c == 'G') {
            return strong.substring(1);
        }

        // perhaps some passages encode just the number
        return strong;
    }

    /**
     * in this case, we assume that a key starts shortly after the last ':' with a number
     * 
     * @param potentialKey a key that can potentially be shortened
     * @return the shortened key
     */
    public static String getAnyKey(final String potentialKey) {
        return getAnyKey(potentialKey, true);
    }

    /**
     * Strips off strong: if present, to yield Gxxxx - Assumes strong prefix is upperCase, i.e. STRONG:
     * 
     * @param key key to change
     * @return the key without the prefix
     */
    public static String getStrongLanguageSpecificKey(final String key) {
        if (key.startsWith(UPPER_STRONG_PREFIX)) {
            return key.substring(STRONG_PREFIX_LENGTH);
        }
        return null;
    }

    /**
     * pads the strong number according to its size, to an optional letter followed by 4 digits
     * 
     * @param key the key to the strong number
     * @return the strong number, padded
     */
    public static String getStrongPaddedKey(final String key) {
        if (key == null) {
            return "";
        }

        final StringBuilder sb = new StringBuilder(key.length());
        final String[] split = key.toUpperCase().split(" ");
        for (final String s : split) {
            final String strongNumber = getStrongLanguageSpecificKey(s);

            if (strongNumber == null) {
                continue;
            }

            final int length = strongNumber.length();
            if (sb.length() > 0) {
                // add a space separator
                sb.append(' ');
            }

            // check we have G or H
            final char firstChar = strongNumber.charAt(0);
            if (firstChar == 'G' || firstChar == 'H') {
                switch (length) {
                    case 1:
                        sb.append(strongNumber);
                        break;
                    case 2:
                        sb.append(firstChar);
                        sb.append('0');
                        sb.append('0');
                        sb.append('0');
                        sb.append(strongNumber.charAt(1));
                        break;
                    case 3:
                        sb.append(firstChar);
                        sb.append('0');
                        sb.append('0');
                        sb.append(strongNumber.charAt(1));
                        sb.append(strongNumber.charAt(2));
                        break;
                    case 4:
                        sb.append(firstChar);
                        sb.append('0');
                        sb.append(strongNumber.charAt(1));
                        sb.append(strongNumber.charAt(2));
                        sb.append(strongNumber.charAt(3));
                        break;
                    case 6:
                        if (strongNumber.charAt(1) == '0') {
                            sb.append(firstChar);
                            sb.append(strongNumber.charAt(2));
                            sb.append(strongNumber.charAt(3));
                            sb.append(strongNumber.charAt(4));
                            sb.append(strongNumber.charAt(5));
                            break;
                        }

                        sb.append(strongNumber);
                        break;
                    default:
                        sb.append(strongNumber);
                        break;
                }
            } else {
                // we only have the numbers so do our best
                switch (length) {
                    case 1:
                        sb.append('0');
                        sb.append('0');
                        sb.append('0');
                        sb.append(strongNumber.charAt(0));
                        break;
                    case 2:
                        sb.append('0');
                        sb.append('0');
                        sb.append(strongNumber.charAt(0));
                        sb.append(strongNumber.charAt(1));
                        break;
                    case 3:
                        sb.append('0');
                        sb.append(strongNumber.charAt(0));
                        sb.append(strongNumber.charAt(1));
                        sb.append(strongNumber.charAt(2));
                        break;
                    default:
                        sb.append(strongNumber);
                        break;
                }
            }
        }
        return sb.toString().trim();
    }

    /**
     * in this case, we assume that a key starts shortly after the last ':' with a number
     * 
     * @param potentialKey a key that can potentially be shortened
     * @param trimInitial trim initial character after ':'
     * @return the shortened key
     */
    public static String getAnyKey(final String potentialKey, final boolean trimInitial) {
        LOGGER.debug("Looking for key [{}] with trimInitial [{}]", potentialKey, trimInitial);

        // find first colon and start afterwards, -1 yields 0, which is the beginning of the string
        // so we can work with that.
        int start = potentialKey.lastIndexOf(KEY_SEPARATOR) + 1;

        // start at the first char after the colon
        // int start = lastColon + 1;
        if (trimInitial) {
            final char protocol = potentialKey.charAt(start);
            if (protocol == 'G' || protocol == 'H') {
                start++;
            }

            // finally, we may have 0s:
            while (start < potentialKey.length() && potentialKey.charAt(start) == '0') {
                start++;
            }
        }

        return potentialKey.substring(start);
    }

    /**
     * Takes accents and other punctuation off the word - less performant
     * 
     * @param word the word to be processed
     * @return the unaccented form
     */
    public static String unAccent(final String word) {
        return unAccent(unAccent(word, true), false);
    }

    /**
     * Removes the starting H, if present (for greek transliterations only at present time)
     * 
     * @param stepTransliteration the transliteration
     * @return the transliteration adapted for unaccented texts)
     */
    public static String adaptForUnaccentedTransliteration(final String stepTransliteration) {
        if (stepTransliteration.startsWith(GREEK_BREATHING)) {
            return stepTransliteration.substring(1);
        }
        return stepTransliteration;
    }

    /**
     * @param rawForm raw form of the word
     * @return the transliteration of the word given
     */
    public static String transliterate(final String rawForm) {
        // decompose characters from breathing and accents and store in StringBuilder

        if (rawForm == null) {
            return "";
        }

        final String normalized = Normalizer.normalize(rawForm.toLowerCase(), Form.NFD);
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
                    sb.setCharAt(position++, 'é');
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
                    sb.setCharAt(position++, 'u');
                    sb.insert(position++, 'w');
                    break;
                //

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
                    }

                    position++;
                    break;
                default:
                    // remove character since not recognised
                    sb.deleteCharAt(position);
                    break;
            }
        }

        final String s = sb.toString();
        return s;
    }

    /**
     * takes accents and other punctuation off the word
     * 
     * @param word the word to be processed
     * @param isGreek true for greek, false for hebrew
     * @return the unaccented form
     */
    public static String unAccent(final String word, final boolean isGreek) {
        if (isGreek) {
            return Normalizer.normalize(word, Normalizer.Form.NFD).replaceAll(
                    "\\p{InCombiningDiacriticalMarks}+", "");
        } else {
            final StringBuilder sb = new StringBuilder(word);
            int i = 0;
            while (i < sb.length()) {
                final char currentChar = sb.charAt(i);
                if (currentChar < ALEPH && currentChar >= ETNAHTA) {
                    sb.deleteCharAt(i);
                } else if (currentChar > TAV && currentChar < ALEPH_LAMED) {
                    sb.setCharAt(i, (char) (currentChar - DAGESH_GAP));
                    i++;
                } else {
                    i++;
                }
            }
            return sb.toString();
        }
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
}
