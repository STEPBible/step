package com.tyndalehouse.step.core.service.helpers;

import com.tyndalehouse.step.core.models.search.SuggestionType;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.CachingWrapperFilter;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.MultiTermQueryWrapperFilter;
import org.apache.lucene.search.PrefixFilter;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import org.apache.lucene.search.PrefixQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.QueryWrapperFilter;
import org.apache.lucene.search.TermQuery;

/**
 * Static helper methods used by various services
 * 
 * @author chrisburrell
 * 
 */
public final class OriginalWordUtils {
    /** strong number field */
    public static final String STRONG_NUMBER_FIELD = "strongNumber";
    private static final Filter GREEK_FILTER = new CachingWrapperFilter(getStrongFilter("G"));
    private static final Filter HEBREW_FILTER = new CachingWrapperFilter(getStrongFilter("H"));

    private static Filter getStrongFilter(String prefix) {
        BooleanQuery query  = new BooleanQuery();
        query.add(new PrefixQuery(new Term(STRONG_NUMBER_FIELD, prefix)), BooleanClause.Occur.MUST);
        query.add(new TermQuery(new Term("stopWord", "true")), BooleanClause.Occur.MUST_NOT);
        return new QueryWrapperFilter(query);
    }

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

        return suggestion;
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
