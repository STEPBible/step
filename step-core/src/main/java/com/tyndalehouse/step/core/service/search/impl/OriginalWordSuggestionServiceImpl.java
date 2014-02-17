package com.tyndalehouse.step.core.service.search.impl;

import static com.tyndalehouse.step.core.models.search.LexicalSuggestionType.GREEK;
import static com.tyndalehouse.step.core.models.search.LexicalSuggestionType.HEBREW;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.STRONG_NUMBER_FIELD;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.convertToSuggestion;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.getFilter;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.markUpFrequentSuggestions;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptTransliterationForQuerying;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static com.tyndalehouse.step.core.utils.language.HebrewUtils.isHebrewText;

import java.io.IOException;
import java.io.Serializable;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.helpers.OriginalWordUtils;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryParser.QueryParser.Operator;
import org.apache.lucene.search.*;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.LexicalSuggestionType;
import com.tyndalehouse.step.core.service.search.OriginalWordSuggestionService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.language.GreekUtils;
import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Runs all original word searches
 *
 * @author chrisburrell
 */
@Singleton
public class OriginalWordSuggestionServiceImpl implements OriginalWordSuggestionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(OriginalWordSuggestionServiceImpl.class);
    private static final String SIMPLIFIED_TRANSLITERATION = "simplifiedStepTransliteration:";
    private static final Sort TRANSLITERATION_SORT = new Sort(new SortField("stepTransliteration",
            SortField.STRING_VAL));
    private static final Pattern PART_STRONG = Pattern.compile("(g|h)\\d\\d+");
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

        String searchableForm = form.toLowerCase();
        switch (suggestionType) {
            case MEANING:
                return getMeaningSuggestions(searchableForm);
            case HEBREW_MEANING:
                return getMeaningSuggestionsForAncientLanguage(searchableForm, false);
            case GREEK_MEANING:
                return getMeaningSuggestionsForAncientLanguage(searchableForm, true);
            default:
                if (includeAllForms) {
                    return getMatchingAllForms(suggestionType, searchableForm);
                }
                return getMatchingFormsFromLexicon(suggestionType, searchableForm);
        }
    }

    /**
     * Autocompletes the meaning search
     *
     * @param form the form that we are looking for
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMeaningSuggestionsForAncientLanguage(final String form, boolean isGreek) {
        List<String> tokenItems = this.definitions.getAnalyzedTokens("stepGloss", form, true);

        BooleanQuery masterQuery = new BooleanQuery();
        for (int ii = 0; ii < tokenItems.size(); ii++) {
            final Term stepGlossTerm = new Term("stepGloss", tokenItems.get(ii));
            final Term translationTerm = new Term("translations", tokenItems.get(ii));

            Query stepGloss;
            Query translations;
            if (ii != tokenItems.size() - 1) {
                stepGloss = new TermQuery(stepGlossTerm);
                translations = new TermQuery(translationTerm);
            } else {
                stepGloss = new PrefixQuery(stepGlossTerm);
                translations = new PrefixQuery(translationTerm);
            }
            BooleanQuery subQuery = new BooleanQuery();
            subQuery.add(new BooleanClause(stepGloss, BooleanClause.Occur.SHOULD));
            subQuery.add(new BooleanClause(translations, BooleanClause.Occur.SHOULD));
            masterQuery.add(new BooleanClause(subQuery, BooleanClause.Occur.MUST));
        }
        masterQuery.add(new BooleanClause(new PrefixQuery(new Term("strongNumber", isGreek ? "G" : "H")), BooleanClause.Occur.MUST));

        final EntityDoc[] results = this.definitions.search(masterQuery);
        return convertDefinitionDocsToSuggestion(results);
    }

    /**
     * Autocompletes the meaning search
     *
     * @param form the form that we are looking for
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMeaningSuggestions(final String form) {
        final Set<String> meaningTerms = this.definitions.findSetOfTermsStartingWith(form, "stepGloss", "translations");
        List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        for (String term : meaningTerms) {
            final LexiconSuggestion suggestion = new LexiconSuggestion();
            suggestion.setGloss(term);
            suggestions.add(suggestion);
        }

        return suggestions;
    }

    /**
     * retrieves forms from the lexicon
     *
     * @param suggestionType indicates greek/hebrew look ups
     * @param form           the form
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingFormsFromLexicon(final LexicalSuggestionType suggestionType,
                                                                final String form) {

        final EntityDoc[] results;
        if (isHebrewText(form) || GreekUtils.isGreekText(form)) {
            results = this.definitions.search(new String[]{"accentedUnicode", "strongNumber"},
                    QueryParser.escape(form) + '*', getStrongFilter(suggestionType), TRANSLITERATION_SORT,
                    true, SearchService.MAX_SUGGESTIONS);
        } else if (isGreekOrHebrewStrong(suggestionType, form)) {
            results = this.definitions.search(new PrefixQuery(new Term(OriginalWordUtils.STRONG_NUMBER_FIELD, QueryParser.escape(form.toUpperCase()))),
                    SearchService.MAX_SUGGESTIONS, TRANSLITERATION_SORT, getStrongFilter(suggestionType));
        } else {
            // assume transliteration - at this point suggestionType is not going to be MEANING
            final String simplifiedTransliteration = getSimplifiedTransliterationClause(
                    suggestionType == GREEK, form, true);
            final String unmarkedUpTranslit = StringConversionUtils.adaptForTransliterationForIndexing(form,
                    suggestionType == GREEK);

            results = this.definitions.search(new String[]{"betaAccented", "stepTransliteration",
                    "twoLetter", "otherTransliteration"}, QueryParser.escape(unmarkedUpTranslit) + '*',
                    getStrongFilter(suggestionType), TRANSLITERATION_SORT, true, simplifiedTransliteration,
                    SearchService.MAX_SUGGESTIONS);
        }
        return convertDefinitionDocsToSuggestion(results);
    }

    private boolean isGreekOrHebrewStrong(final LexicalSuggestionType suggestionType, final String form) {
        if (form.length() < 3) {
            return false;
        }

        //check we're running the right kind of lookup, and then match the pattern
        return (suggestionType == GREEK && form.charAt(0) == 'g' ||
                suggestionType == HEBREW && form.charAt(0) == 'h') &&
                PART_STRONG.matcher(form).matches();
    }

    /**
     * @param isGreek true if greek, false for hebrew
     * @param form    the form
     * @param prefix  true to append '*' on each field
     * @return a clause to use in the query
     */
    public static String getSimplifiedTransliterationClause(final boolean isGreek, final String form,
                                                            final boolean prefix) {
        final List<TransliterationOption> translits = adaptTransliterationForQuerying(form, isGreek);
        final StringBuilder simplifiedTransliteration = new StringBuilder(translits.size()
                * (form.length() + 3) + SIMPLIFIED_TRANSLITERATION.length() * translits.size() + 2);

        simplifiedTransliteration.append('(');
        for (final TransliterationOption option : translits) {
            simplifiedTransliteration.append(SIMPLIFIED_TRANSLITERATION);
            simplifiedTransliteration.append(QueryParser.escape(option.getOption().toString()));
            if (prefix) {
                simplifiedTransliteration.append('*');
            }
            simplifiedTransliteration.append(' ');
        }
        simplifiedTransliteration.append(')');
        return simplifiedTransliteration.toString();
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
     * @param form           form in lower case, containing a % if appropriate
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingAllForms(final LexicalSuggestionType suggestionType,
                                                        final String form) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        final EntityDoc[] results;

        // search by unicode or translit?
        if (isHebrewText(form) || GreekUtils.isGreekText(form)) {
            results = this.specificForms.search(new String[]{"accentedUnicode"},
                    QueryParser.escape(form) + '*', getStrongFilter(suggestionType), TRANSLITERATION_SORT,
                    true, SearchService.MAX_SUGGESTIONS);
        } else {
            // assume transliteration - at this point suggestionType is not going to be MEANING
            final String simplifiedTransliteration = getSimplifiedTransliterationClause(
                    suggestionType == GREEK, form, true);

            results = this.specificForms.search(new String[]{"simplifiedStepTransliteration"},
                    simplifiedTransliteration, getStrongFilter(suggestionType), TRANSLITERATION_SORT, true,
                    simplifiedTransliteration, SearchService.MAX_SUGGESTIONS);
        }

        for (final EntityDoc f : results) {
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
