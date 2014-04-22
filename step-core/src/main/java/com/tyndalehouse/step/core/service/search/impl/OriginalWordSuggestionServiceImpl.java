package com.tyndalehouse.step.core.service.search.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.search.OriginalWordSuggestionService;
import com.tyndalehouse.step.core.utils.language.GreekUtils;
import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationOption;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.STRONG_NUMBER_FIELD;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.getFilter;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptTransliterationForQuerying;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.language.HebrewUtils.isHebrewText;

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
    public List<LexiconSuggestion> getExactForms(final String form, final boolean greek) {
        if (isEmpty(form)) {
            return new ArrayList<LexiconSuggestion>();
        }
        return getMatchingAllForms(greek, form);
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
     * retrieves forms from the lexicon
     *
     * @param greek true to indicate greek, false to indicate hebrew
     * @param form  form in lower case, containing a % if appropriate
     * @return the list of suggestions
     */
    private List<LexiconSuggestion> getMatchingAllForms(final boolean greek,
                                                        final String form) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        final EntityDoc[] results;

        // search by unicode or translit?
        if (isHebrewText(form) || GreekUtils.isGreekText(form)) {
            results = this.specificForms.search(new String[]{"accentedUnicode"},
                    QueryParser.escape(form) + '*', getFilter(greek), TRANSLITERATION_SORT,
                    true, SearchService.MAX_SUGGESTIONS);
        } else {
            // assume transliteration - at this point suggestionType is not going to be MEANING
            final String simplifiedTransliteration = getSimplifiedTransliterationClause(
                    greek, form, true);

            results = this.specificForms.search(new String[]{"simplifiedStepTransliteration"},
                    simplifiedTransliteration, getFilter(greek), TRANSLITERATION_SORT, true,
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
            return suggestion;
        }

        return null;
    }

}
