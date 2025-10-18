package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.models.LexiconSuggestion;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class SortingUtilsTest {

    @Test
    public void lexiconComparatorSortsByStrongNumberCaseInsensitive() {
        final List<LexiconSuggestion> suggestions = new ArrayList<>(Arrays.asList(
                suggestionWithStrongNumber("H0003"),
                suggestionWithStrongNumber("h0001"),
                suggestionWithStrongNumber("H0002"),
                suggestionWithStrongNumber(null)
        ));

        Collections.sort(suggestions, SortingUtils.LEXICON_SUGGESTION_COMPARATOR);

        assertNull(suggestions.get(0).getStrongNumber());
        assertEquals("h0001", suggestions.get(1).getStrongNumber());
        assertEquals("H0002", suggestions.get(2).getStrongNumber());
        assertEquals("H0003", suggestions.get(3).getStrongNumber());
    }

    @Test
    public void lexiconComparatorTreatsEqualStrongNumbersAsEqual() {
        final LexiconSuggestion first = suggestionWithStrongNumber("G0001");
        final LexiconSuggestion second = suggestionWithStrongNumber("g0001");

        assertEquals(0, SortingUtils.LEXICON_SUGGESTION_COMPARATOR.compare(first, second));
    }

    private LexiconSuggestion suggestionWithStrongNumber(final String strongNumber) {
        final LexiconSuggestion suggestion = new LexiconSuggestion();
        suggestion.setStrongNumber(strongNumber);
        return suggestion;
    }
}
