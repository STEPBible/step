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

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.language.GreekUtils.removeGreekTranslitMarkUpForIndexing;
import static com.tyndalehouse.step.core.utils.language.HebrewUtils.removeHebrewTranslitMarkUpForIndexing;

import java.text.Normalizer;
import java.text.Normalizer.Form;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.utils.language.GreekUtils;
import com.tyndalehouse.step.core.utils.language.HebrewUtils;
import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationOption;
import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationRule;

/**
 * A collection of utility methods enabling us to convert Strings, references one way or another.
 * 
 * @author chrisburrell
 */
public final class StringConversionUtils {
    private static final Logger LOGGER = LoggerFactory.getLogger(StringConversionUtils.class);
    private static final char KEY_SEPARATOR = ':';
    private static final String STRONG_PREFIX = "strong:";
    private static final String UPPER_STRONG_PREFIX = "STRONG:";
    private static final int STRONG_PREFIX_LENGTH = STRONG_PREFIX.length();
    private static final int LANGUAGE_INDICATOR = STRONG_PREFIX_LENGTH;

    /**
     * hiding implementation
     */
    private StringConversionUtils() {
        // hiding implementation
    }

    /**
     * @param strongNumber the strong number to consider, whether to display or not
     * @return true if not G3588 and not null/blank. To be extended later to include other words
     */
    public boolean isDisplayableStrongNumber(final String strongNumber) {
        if (isBlank(strongNumber)) {
            return false;
        }

        return !"G3588".equalsIgnoreCase(strongNumber);
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
        final String[] split = key.toUpperCase(Locale.ENGLISH).split(" ");
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
                padPrefixedStrongNumber(sb, strongNumber, length, firstChar);
            } else {
                padNonPrefixedStrongNumber(sb, strongNumber, length);
            }
        }
        return sb.toString().trim();
    }

    /**
     * Pads any strong number that is not prefixed by a letter such as G or H
     * 
     * @param sb the output buffer
     * @param strongNumber the strong number itself
     * @param length the length of the strong number
     */
    private static void padNonPrefixedStrongNumber(final StringBuilder sb, final String strongNumber,
            final int length) {
        // we only have the numbers so do our best
        for (int ii = length; ii < 4; ii++) {
            sb.append('0');
        }
        sb.append(strongNumber);
    }

    /**
     * @param strongNumber a strong number from length 2 (including prefix) to 6.
     * @return the right padded version for it.
     */
    public static String padPrefixedStrongNumber(final String strongNumber) {
        final StringBuilder b = new StringBuilder(strongNumber.length());
        padPrefixedStrongNumber(b, strongNumber, strongNumber.length(), strongNumber.charAt(0));
        return b.toString();
    }

    /**
     * Pads the given prefixed number, from say G12 to G0012
     * 
     * @param sb the string to build up
     * @param strongNumber the strong number
     * @param length the length of the string
     * @param firstChar the first character, i.e. either G or H
     */
    private static void padPrefixedStrongNumber(final StringBuilder sb, final String strongNumber,
            final int length, final char firstChar) {
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
    }

    /**
     * in this case, we assume that a key starts shortly after the last ':' with a number
     * 
     * @param potentialKey a key that can potentially be shortened
     * @param trimInitial trim initial character after ':'
     * @return the shortened key
     */
    public static String getAnyKey(final String potentialKey, final boolean trimInitial) {
        LOGGER.trace("Looking for key [{}] with trimInitial [{}]", potentialKey, trimInitial);

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
     * @param isGreek true if greek
     * @return the transliteration adapted for unaccented texts)
     */
    public static String adaptForTransliterationForIndexing(final String stepTransliteration,
            final boolean isGreek) {
        if (isGreek) {
            return GreekUtils.removeGreekTranslitMarkUpForIndexing(stepTransliteration);
        }

        // otherwise hebrew, so run the pattern to remove everything...
        return HebrewUtils.removeHebrewTranslitMarkUpForIndexing(stepTransliteration);
    }

    /**
     * Removes the starting H, if present (for greek transliterations only at present time), removes other
     * symbols such as letters with lines or dots, etc. Then runs a set of rules on both transliterations. See
     * TYNSTEP-374 for the rule definitions.
     * 
     * @param stepTransliteration the transliteration
     * @param isGreek true if greek
     * @return the transliteration adapted for unaccented texts)
     */
    public static List<TransliterationOption> adaptTransliterationForQuerying(
            final String stepTransliteration, final boolean isGreek) {
        if (isGreek) {
            return multiplyTranslitOptions(removeGreekTranslitMarkUpForIndexing(stepTransliteration),
                    GreekUtils.getTransliterationRules());
        }

        // otherwise hebrew, so run the pattern to remove everything...
        return multiplyTranslitOptions(removeHebrewTranslitMarkUpForIndexing(stepTransliteration),
                HebrewUtils.getTransliterationRules());
    }

    /**
     * @param baseString a transliteration without any mark-up
     * @param transliterationRules the rules to apply
     * @return all possible transliterations
     */
    public static List<TransliterationOption> multiplyTranslitOptions(final String baseString,
            final List<TransliterationRule> transliterationRules) {
        // it is important to remember that we strip out special characters here, so ensure that the rules
        // below do not conflict with the stripping of the mark-up

        // go letter by letter and apply rules
        // run a rule, and that gives me, a new set of prefixes, keep on running rules iterating through
        final StringBuilder base = new StringBuilder();

        final List<TransliterationOption> options = new ArrayList<TransliterationOption>();
        options.add(new TransliterationOption(0, base));

        final char[] baseChars = baseString.toCharArray();
        for (int ii = 0; ii < baseChars.length; ii++) {
            for (final TransliterationRule r : transliterationRules) {
                r.expand(options, baseChars, ii);
            }

            // update all options that are still on our current position, to bump them up
            for (final TransliterationOption leftBehind : options) {
                if (leftBehind.getNextValidPosition() == ii) {
                    leftBehind.getOption().append(baseChars[ii]);
                    leftBehind.setNextValidPosition(ii + 1);
                }
            }
        }

        return options;
    }

    /**
     * @param rawForm raw form of the word
     * @return the transliteration of the word given
     */
    public static String transliterate(final String rawForm) {
        // decompose characters from breathing and accents and store in StringBuilder

        if (rawForm == null || rawForm.length() == 0) {
            return "";
        }

        if (HebrewUtils.isHebrewText(rawForm)) {
            return HebrewUtils.transliterateHebrew(rawForm);
        }

        // then assume Greek
        return GreekUtils.transliterateGreek(Normalizer.normalize(rawForm.toLowerCase(Locale.ENGLISH),
                Form.NFD));
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
            return GreekUtils.unAccent(word);
        }
        return HebrewUtils.unPoint(word);
    }

    /**
     * Starts with punctuation.
     * 
     * @param s the s
     * @return true, if the first character is a punctuation character
     */
    public static boolean startsWithPunctuation(final String s) {
        if (isEmpty(s)) {
            return false;
        }

        final char c = s.charAt(0);
        switch (c) {
            case ',':
            case '.':
            case '?':
            case '/':
            case ';':
            case ':':
            case '\'':
            case '!':
                return true;
        }
        return false;
    }
}
