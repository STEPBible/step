package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import org.apache.lucene.search.Sort;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * @author chrisburrell
 */
public class MeaningSuggestionServiceImpl implements SingleTypeSuggestionService<String, TermsAndMaxCount<String>> {
    private static final String[] ANCIENT_MEANING_FIELDS = new String[]{"stepGloss", "translations"};
    private final EntityIndexReader definitions;

    @Inject
    public MeaningSuggestionServiceImpl(final EntityManager entityManager) {
        definitions = entityManager.getReader("definition");
    }

    @Override
    public String[] getExactTerms(final SuggestionContext context, final int max, final boolean popularSort) {
        final Set<String> meaningTerms = this.definitions.findSetOfTerms(true, context.getInput(), max, ANCIENT_MEANING_FIELDS);
        return meaningTerms.toArray(new String[meaningTerms.size()]);
    }

    @Override
    public String[] collectNonExactMatches(final TermsAndMaxCount<String> collector, 
                                           final SuggestionContext context, 
                                           final String[] alreadyRetrieved, final int leftToCollect) {
        TermsAndMaxCount countsAndResults = this.definitions.findSetOfTermsWithCounts(false, true, context.getInput(), collector.getTotalCount(), ANCIENT_MEANING_FIELDS);
        final Set<String> resultTerms = countsAndResults.getTerms();

        collector.setTotalCount(countsAndResults.getTotalCount());
        collector.setTerms(countsAndResults.getTerms());
        return resultTerms.toArray(new String[resultTerms.size()]);
    }

    @Override
    public List<? extends PopularSuggestion> convertToSuggestions(final String[] meaningTerms, final String[] extraDocs) {
        List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        convertTermsToSuggestions(meaningTerms, suggestions);
        convertTermsToSuggestions(extraDocs, suggestions);
        return suggestions;
    }

    private void convertTermsToSuggestions(final String[] meaningTerms, final List<LexiconSuggestion> suggestions) {
        if (meaningTerms != null) {
            for (String term : meaningTerms) {
                final LexiconSuggestion suggestion = new LexiconSuggestion();
                suggestion.setGloss(term);
                suggestions.add(suggestion);
            }
        }
    }

    @Override
    public TermsAndMaxCount getNewCollector(final int leftToCollect, boolean popular) {
        final TermsAndMaxCount<String> termsAndMaxCount = new TermsAndMaxCount<String>();
        termsAndMaxCount.setTotalCount(leftToCollect);
        return termsAndMaxCount;
    }
}
