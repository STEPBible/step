package com.tyndalehouse.step.core.service.search.impl;

import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.STRONG_NUMBER_FIELD;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.convertToSuggestion;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.getFilter;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.markUpFrequentSuggestions;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryParser.QueryParser.Operator;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.LexicalSuggestionType;
import com.tyndalehouse.step.core.service.search.OriginalWordSuggestionService;

/**
 * Runs all original word searches
 * 
 * @author chrisburrell
 * 
 */
public class OriginalWordSuggestionServiceImpl implements OriginalWordSuggestionService {
    private static final Sort TRANSLITERATION_SORT = new Sort(new SortField("stepTransliteration",
            SortField.STRING));
    private static final int MAX_SUGGESTIONS = 50;
    private final EntityIndexReader definitions;
    private final EntityIndexReader specificForms;

    /**
     * @param entityManager the manager of all kinds of entities
     */
    @Inject
    public OriginalWordSuggestionServiceImpl(final EntityManager entityManager) {
        this.definitions = entityManager.getReader("definition");
        this.specificForms = entityManager.getReader("specificForm");
    }

    @Override
    public List<LexiconSuggestion> getLexicalSuggestions(final LexicalSuggestionType suggestionType,
            final String form, final boolean includeAllForms) {
        if (isEmpty(form)) {
            return new ArrayList<LexiconSuggestion>();
        }

        if (suggestionType == LexicalSuggestionType.MEANING) {
            return getMeaningSuggestions(form);
        }

        if (includeAllForms) {
            return getMatchingAllForms(suggestionType, form);
        } else {
            return getMatchingFormsFromLexicon(suggestionType, form);
        }
    }

    /**
     * Autocompletes the meaning search
     * 
     * @param form the form that we are looking for
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMeaningSuggestions(final String form) {
        // add leading wildcard to last word
        final String[] split = split(form);
        final StringBuilder sb = new StringBuilder(form.length() + 2);
        for (int ii = 0; ii < split.length; ii++) {
            if (ii == split.length - 1) {
                sb.append('*');
            }
            sb.append(split[ii]);
            if (ii == split.length - 1) {
                sb.append('*');
            }
        }

        final EntityDoc[] results = this.definitions.searchSingleColumn("translations", sb.toString(),
                Operator.AND, true);
        return convertDefinitionDocsToSuggestion(results);
    }

    /**
     * retrieves forms from the lexicon
     * 
     * @param suggestionType indicates greek/hebrew look ups
     * @param form the form
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingFormsFromLexicon(final LexicalSuggestionType suggestionType,
            final String form) {

        final EntityDoc[] results = this.definitions.search(
                new String[] { "accentedUnicode", "betaAccented", "stepTransliteration",
                        "simplifiedStepTransliteration", "twoLetter", "otherTransliteration" },
                QueryParser.escape(form) + '*', getStrongFilter(suggestionType), TRANSLITERATION_SORT, true,
                MAX_SUGGESTIONS);

        return convertDefinitionDocsToSuggestion(results);
    }

    /**
     * Takes EntityDocs representing Definition entities and converts them to a suggestion
     * 
     * @param results the results
     * @return true
     */
    private List<LexiconSuggestion> convertDefinitionDocsToSuggestion(final EntityDoc[] results) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        for (final EntityDoc def : results) {
            suggestions.add(convertToSuggestion(def));
        }
        return suggestions;
    }

    /**
     * retrieves forms from the lexicon
     * 
     * @param suggestionType indicates greek/hebrew look ups
     * @param form form in lower case, containing a % if appropriate
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingAllForms(final LexicalSuggestionType suggestionType,
            final String form) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();

        // TODO make into re-usable cache
        final EntityDoc[] searchResults = this.specificForms.search(new String[] { "accentedUnicode",
                "simplifiedStepTransliteration" }, QueryParser.escape(form) + '*',
                getStrongFilter(suggestionType), TRANSLITERATION_SORT, true, MAX_SUGGESTIONS);

        for (final EntityDoc f : searchResults) {
            final LexiconSuggestion suggestion = convertToSuggestionFromSpecificForm(f);
            if (suggestion != null) {
                suggestions.add(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * Filters the query by strong number
     * 
     * @param suggestionType the type of suggestion
     * @return a greek or hebrew filter
     */
    private Filter getStrongFilter(final LexicalSuggestionType suggestionType) {
        return getFilter(suggestionType == LexicalSuggestionType.GREEK);
    }

    /**
     * @param specificForm the specific form to be converted
     * @return the suggestion
     */
    private LexiconSuggestion convertToSuggestionFromSpecificForm(final EntityDoc specificForm) {
        final String strongNumber = specificForm.get(STRONG_NUMBER_FIELD);
        final EntityDoc[] results = this.definitions.searchExactTermBySingleField(STRONG_NUMBER_FIELD, 1,
                strongNumber);

        if (results.length > 0) {
            final LexiconSuggestion suggestion = new LexiconSuggestion();
            suggestion.setStrongNumber(strongNumber);
            suggestion.setGloss(results[0].get("stepGloss"));
            suggestion.setMatchingForm(specificForm.get("accentedUnicode"));
            suggestion.setStepTransliteration(specificForm.get("stepTransliteration"));
            markUpFrequentSuggestions(results[0], suggestion);
            return suggestion;
        }

        return null;
    }

}
