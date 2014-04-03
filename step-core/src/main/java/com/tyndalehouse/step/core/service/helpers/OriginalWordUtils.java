package com.tyndalehouse.step.core.service.helpers;

import com.tyndalehouse.step.core.models.search.SuggestionType;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.CachingWrapperFilter;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.PrefixFilter;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.models.LexiconSuggestion;

/**
 * Static helper methods used by various services
 * 
 * @author chrisburrell
 * 
 */
public final class OriginalWordUtils {
    /** strong number field */
    public static final String STRONG_NUMBER_FIELD = "strongNumber";
    private static final Filter GREEK_FILTER = new CachingWrapperFilter(new PrefixFilter(new Term(
            STRONG_NUMBER_FIELD, "G")));
    private static final Filter HEBREW_FILTER = new CachingWrapperFilter(new PrefixFilter(new Term(
            STRONG_NUMBER_FIELD, "H")));

    /** no implementation */
    private OriginalWordUtils() {
        // no implementation
    }

    /**
     * converts a definition to a suggested form
     * 
     * @param def the definition
     * @return the suggestion
     */
    public static LexiconSuggestion convertToSuggestion(final EntityDoc def) {
        final LexiconSuggestion suggestion = new LexiconSuggestion();
        suggestion.setGloss(def.get("stepGloss"));
        suggestion.setMatchingForm(def.get("accentedUnicode"));
        suggestion.setStepTransliteration(def.get("stepTransliteration"));
        suggestion.setStrongNumber(def.get(STRONG_NUMBER_FIELD));

        markUpFrequentSuggestions(def, suggestion);
        return suggestion;
    }

    /**
     * Adds a marker for frequent suggestions
     * 
     * @param def the definition
     * @param suggestion the suggestion
     */
    public static void markUpFrequentSuggestions(final EntityDoc def, final LexiconSuggestion suggestion) {
        final String stopWord = def.get("stopWord");
        if ("true".equals(stopWord)) {
            suggestion.setMatchingForm(suggestion.getMatchingForm() + " [too frequent]");
        }
    }

    /**
     * Filters the query by strong number
     * 
     * @param isGreek true for greek, false for hebrew
     * @return the filter for greek or hebrew
     */
    public static Filter getFilter(final boolean isGreek) {
        return isGreek ? GREEK_FILTER : HEBREW_FILTER;
    }
}
