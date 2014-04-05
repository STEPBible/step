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
    protected BooleanQuery getQuery(final List<String> tokenItems, final boolean exact) {
        final BooleanQuery masterQuery = new BooleanQuery();
        for (String form : tokenItems) {
            if (isHebrewText(form) || GreekUtils.isGreekText(form)) {
                masterQuery.add(getExactOrPrefixQuery(exact, new Term("accentedUnicode", form)), BooleanClause.Occur.SHOULD);
            } else if (isGreekOrHebrewStrong(form)) {
                masterQuery.add(getExactOrPrefixQuery(exact, new Term(OriginalWordUtils.STRONG_NUMBER_FIELD, form.toUpperCase())), BooleanClause.Occur.SHOULD);
            } else {
                
                final String unmarkedUpTranslit = StringConversionUtils.adaptForTransliterationForIndexing(form,
                        greek);
                addAncientMatchClauses(exact, masterQuery, unmarkedUpTranslit);
                
                try {
                // assume transliteration - at this point suggestionType is not going to be MEANING
                final String simplifiedTransliterationClause = OriginalWordSuggestionServiceImpl.getSimplifiedTransliterationClause(
                        greek, form, !exact);
                    masterQuery.add(getReader().getQueryParser("strongNumber").parse(simplifiedTransliterationClause), BooleanClause.Occur.SHOULD);
                } catch(ParseException ex) {
                    throw new StepInternalException(ex.getMessage(), ex);
                }
            }
        }
        return masterQuery;
    }

    private void addAncientMatchClauses(final boolean exact, final BooleanQuery masterQuery, final String form) {
        masterQuery.add(getExactOrPrefixQuery(exact, new Term("betaAccented", form)), BooleanClause.Occur.SHOULD);
        masterQuery.add(getExactOrPrefixQuery(exact, new Term("stepTransliteration", form)), BooleanClause.Occur.SHOULD);
        masterQuery.add(getExactOrPrefixQuery(exact, new Term("twoLetter", form)), BooleanClause.Occur.SHOULD);
        masterQuery.add(getExactOrPrefixQuery(exact, new Term("otherTransliteration", form)), BooleanClause.Occur.SHOULD);
    }


    private boolean isGreekOrHebrewStrong(final String form) {
        if (form.length() < 2) {
            return false;
        }

        //check we're running the right kind of lookup, and then match the pattern
        return (greek && form.charAt(0) == 'g' ||
                !greek && form.charAt(0) == 'h') &&
                PART_STRONG.matcher(form).matches();
    }

    protected Sort getSort(boolean popular) {
        return popular ? POPULAR_TRANSLITERATION_SORT : TRANSLITERATION_SORT;
    }
}
