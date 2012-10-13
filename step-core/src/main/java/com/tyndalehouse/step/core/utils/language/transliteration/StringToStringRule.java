package com.tyndalehouse.step.core.utils.language.transliteration;

import java.util.Arrays;
import java.util.List;

/**
 * Replaces a single character with a set of options
 * 
 * @author chrisburrell
 * 
 */
public class StringToStringRule implements TransliterationRule {
    private final char[] s;
    private final String[] options;

    /**
     * @param c the base character
     * @param cs the set of characters to match
     */
    public StringToStringRule(final String c, final String[] cs) {
        this.s = c.toCharArray();
        this.options = cs.clone();
    }

    @Override
    public void expand(final List<TransliterationOption> prefixes, final char[] word, final int position) {
        // do a string comparison, linearly
        if (!isMatched(word, position)) {
            return;
        }

        final int nextPosition = position + this.s.length;
        final int size = prefixes.size();
        for (int ii = 0; ii < size; ii++) {
            final TransliterationOption translitOption = prefixes.get(ii);
            if (translitOption.getNextValidPosition() != position) {
                // pass rule doesn't apply to this case
                continue;
            }

            final StringBuilder currentPrefix = translitOption.getOption();
            // add an option to each prefix
            for (int jj = 0; jj < this.options.length; jj++) {
                // re-use the same string builder if it's the last one
                prefixes.add(new TransliterationOption(nextPosition, new StringBuilder(currentPrefix)
                        .append(this.options[jj])));
            }
        }
    }

    /**
     * @param word the current word
     * @param position the position in the word we're at
     * @return true if we've matched the string
     */
    private boolean isMatched(final char[] word, final int position) {

        if (word.length - position < this.s.length) {
            // the remainder of the word is shorter than the rule match, so no match
            return false;
        }

        int ii = position;
        for (int matchingPosition = 0; matchingPosition < this.s.length; matchingPosition++) {
            if (word[ii++] != this.s[matchingPosition]) {
                // didn't match
                return false;
            }
        }
        return true;
    }

    @Override
    public String toString() {
        final StringBuilder value = new StringBuilder(32);
        value.append("Matches: ");
        value.append(this.s);
        value.append(" expands with ");
        value.append(Arrays.toString(this.options));
        return value.toString();
    }
}
