package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.helpers.OriginalWordUtils;
import com.tyndalehouse.step.core.service.search.impl.OriginalWordSuggestionServiceImpl;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.language.GreekUtils;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;

import java.util.List;
import java.util.regex.Pattern;

import static com.tyndalehouse.step.core.utils.language.HebrewUtils.isHebrewText;

/**
 * @author chrisburrell
 */
public abstract class AncientLanguageSuggestionServiceImpl extends AbstractAncientSuggestionServiceImpl {
    private static final Pattern PART_STRONG = Pattern.compile("(g|h)\\d\\d+");
    private static final SortField TRANSLIT_SORT_FIELD = new SortField("stepTransliteration", SortField.STRING_VAL);
    private static final Sort TRANSLITERATION_SORT = new Sort(TRANSLIT_SORT_FIELD);
    private static final Sort POPULAR_TRANSLITERATION_SORT = new Sort(new SortField("popularity", SortField.INT, true), TRANSLIT_SORT_FIELD);
    private final boolean greek;

    public AncientLanguageSuggestionServiceImpl(final boolean isGreek, final EntityManager entityManager) {
        super(entityManager.getReader("definition"), OriginalWordUtils.getFilter(isGreek),
                TRANSLITERATION_SORT, POPULAR_TRANSLITERATION_SORT);
        this.greek = isGreek;
    }

    @Override
    protected BooleanQuery getQuery(final String form, final boolean exact) {
        final BooleanQuery masterQuery = new BooleanQuery();

        if (isHebrewText(form) || GreekUtils.isGreekText(form)) {
            addSearchClause("accentedUnicode", exact, masterQuery, form);
        } else if (isGreekOrHebrewStrong(form)) {
            addSearchClause(OriginalWordUtils.STRONG_NUMBER_FIELD, exact, masterQuery, form.toUpperCase());
        } else {
            final String unmarkedUpTranslit = StringConversionUtils.adaptForTransliterationForIndexing(form,
                    greek);
            addAncientMatchClauses(exact, masterQuery, unmarkedUpTranslit);

            try {
                // assume transliteration - at this point suggestionType is not going to be MEANING
                final String simplifiedTransliterationClause = OriginalWordSuggestionServiceImpl.getSimplifiedTransliterationClause(
                        greek, form, !exact);
                masterQuery.add(getReader().getQueryParser("strongNumber").parse(simplifiedTransliterationClause), BooleanClause.Occur.SHOULD);
            } catch (ParseException ex) {
                throw new StepInternalException(ex.getMessage(), ex);
            }
        }
        return masterQuery;
    }

    private void addAncientMatchClauses(final boolean exact, final BooleanQuery masterQuery, final String form) {
        addSearchClause("betaAccented", exact, masterQuery, form);
        addSearchClause("stepTransliteration", exact, masterQuery, form);
        addSearchClause("twoLetter", exact, masterQuery, form);
        addSearchClause("otherTransliteration", exact, masterQuery, form);
    }

    private void addSearchClause(final String fieldName, final boolean exact, final BooleanQuery masterQuery, final String form) {
        List<String> forms = this.getReader().getAnalyzedTokens(fieldName, form, true);
        for (String input : forms) {
            masterQuery.add(getExactOrPrefixQuery(exact, new Term(fieldName, input)), BooleanClause.Occur.SHOULD);
        }
    }

    private boolean isGreekOrHebrewStrong(final String form) {
        if (form.length() < 2) {
            return false;
        }

        String caseInsensitiveForm = form.toLowerCase();
        //check we're running the right kind of lookup, and then match the pattern
        return (greek && caseInsensitiveForm.charAt(0) == 'g' ||
                !greek && caseInsensitiveForm.charAt(0) == 'h') &&
                PART_STRONG.matcher(caseInsensitiveForm).matches();
    }

    protected Sort getSort(boolean popular) {
        return popular ? POPULAR_TRANSLITERATION_SORT : TRANSLITERATION_SORT;
    }
}
