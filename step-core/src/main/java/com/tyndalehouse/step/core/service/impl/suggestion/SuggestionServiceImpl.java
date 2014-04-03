package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.SearchToken;
import com.tyndalehouse.step.core.models.SingleSuggestionsSummary;
import com.tyndalehouse.step.core.models.SuggestionsSummary;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;
import com.tyndalehouse.step.core.service.SuggestionService;
import org.apache.lucene.search.TopFieldCollector;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Suggestion server, helping the auto suggestion search dropdown.
 *
 * @author chrisburrell
 */
public class SuggestionServiceImpl implements SuggestionService {
    //subjects (1)
    //original word searches (5)
    //references (1)
    private static final int MAX_RESULTS = 3;
    private final Map<String, SingleTypeSuggestionService> queryProviders;

    @Inject
    public SuggestionServiceImpl(final HebrewAncientMeaningServiceImpl hebrewAncientMeaningService,
                                 final GreekAncientMeaningServiceImpl greekAncientMeaningService,
                                 final HebrewAncientLanguageServiceImpl hebrewAncientLanguageService,
                                 final GreekAncientLanguageServiceImpl greekAncientLanguageService,
                                 final MeaningSuggestionServiceImpl meaningSuggestionService,
                                 final SubjectSuggestionServiceImpl subjectSuggestionService
    ) {
        queryProviders = new LinkedHashMap<String, SingleTypeSuggestionService>();
        queryProviders.put(SearchToken.HEBREW_MEANINGS, hebrewAncientMeaningService);
        queryProviders.put(SearchToken.GREEK_MEANINGS, greekAncientMeaningService);
        queryProviders.put(SearchToken.GREEK, greekAncientLanguageService);
        queryProviders.put(SearchToken.HEBREW, hebrewAncientLanguageService);
        queryProviders.put(SearchToken.MEANINGS, meaningSuggestionService);
        queryProviders.put(SearchToken.SUBJECT_SEARCH, subjectSuggestionService);
    }

    @Override
    public SuggestionsSummary getTopSuggestions(final String term) {
        final SuggestionsSummary summary = new SuggestionsSummary();
        final List<SingleSuggestionsSummary> results = new ArrayList<SingleSuggestionsSummary>();
        summary.setSuggestionsSummaries(results);

        //go through each search type
        for (Map.Entry<String, SingleTypeSuggestionService> query : queryProviders.entrySet()) {
            final SingleTypeSuggestionService searchService = query.getValue();

            //run exact query against index
            Object[] docs = searchService.getExactTerms(term, MAX_RESULTS);

            //how many do we need to collect
            int leftToCollect = docs.length < MAX_RESULTS ? MAX_RESULTS - docs.length : 0;

            //create collector to collect some more results, if required, but also the total hit count
            Object o = searchService.getNewCollector(leftToCollect);
            final Object[] extraDocs = searchService.collectNonExactMatches(o, term, docs, leftToCollect);
            final List<? extends PopularSuggestion> suggestions = searchService.convertToSuggestions(docs, extraDocs);

            final SingleSuggestionsSummary singleTypeSummary = new SingleSuggestionsSummary();
            fillInTotalHits(o, extraDocs.length, singleTypeSummary);
            singleTypeSummary.setPopularSuggestions(suggestions);
            singleTypeSummary.setSearchType(query.getKey());
            results.add(singleTypeSummary);
        }

        //return results
        return summary;
    }

    private void fillInTotalHits(final Object collector, int alreadyCollected, final SingleSuggestionsSummary singleTypeSummary) {
        if (collector instanceof TopFieldCollector) {
            singleTypeSummary.setMoreResults(((TopFieldCollector) collector).getTotalHits() - alreadyCollected);
        } else if (collector instanceof TermsAndMaxCount) {
            singleTypeSummary.setMoreResults(((TermsAndMaxCount) collector).getTotalCount() - alreadyCollected);
        } else {
            throw new StepInternalException("Unsupported collector");
        }
    }


    @Override
    public SuggestionsSummary getFirstNSuggestions(final String searchType, final String term) {
        final SuggestionsSummary summary = new SuggestionsSummary();
        final List<SingleSuggestionsSummary> results = new ArrayList<SingleSuggestionsSummary>();
        summary.setSuggestionsSummaries(results);

        final SingleTypeSuggestionService searchService = queryProviders.get(searchType);
        Object[] docs = searchService.getExactTerms(term, MAX_RESULTS);

        //create collector to collect some more results, if required, but also the total hit count
        Object o = searchService.getNewCollector(MAX_RESULTS_NON_GROUPED - docs.length);
        final Object[] extraDocs = searchService.collectNonExactMatches(o, term, docs, MAX_RESULTS_NON_GROUPED);
        final List<? extends PopularSuggestion> suggestions = searchService.convertToSuggestions(docs, extraDocs);

        final SingleSuggestionsSummary singleTypeSummary = new SingleSuggestionsSummary();
        fillInTotalHits(o, extraDocs.length, singleTypeSummary);
        singleTypeSummary.setPopularSuggestions(suggestions);
        singleTypeSummary.setSearchType(searchType);
        results.add(singleTypeSummary);

        //return results
        return summary;
    }
}
