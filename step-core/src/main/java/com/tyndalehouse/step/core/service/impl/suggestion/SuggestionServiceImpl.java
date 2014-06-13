package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.SearchToken;
import com.tyndalehouse.step.core.models.SingleSuggestionsSummary;
import com.tyndalehouse.step.core.models.SuggestionsSummary;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;
import com.tyndalehouse.step.core.service.SuggestionService;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import org.apache.lucene.search.TopFieldCollector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Suggestion service, helping the auto suggestion search dropdown.
 *
 * @author chrisburrell
 */
public class SuggestionServiceImpl implements SuggestionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SuggestionServiceImpl.class);

    //show the total number of ungrouped results at any one time.
    private static final int MAX_RESULTS = 3;
    //determines how many values are shown on expanding line 'see 7 more, e.g. abc def'
    private static final int PREVIEW_GROUP = 2;
    private final Map<String, SingleTypeSuggestionService> queryProviders = new LinkedHashMap<String, SingleTypeSuggestionService>();
    private final Map<String, String[]> dependencies = new HashMap<String, String[]>(8);
    private final Map<String, Integer> extraSlots = new HashMap<String, Integer>(4);

    @Inject
    public SuggestionServiceImpl(final HebrewAncientMeaningServiceImpl hebrewAncientMeaningService,
                                 final GreekAncientMeaningServiceImpl greekAncientMeaningService,
                                 final HebrewAncientLanguageServiceImpl hebrewAncientLanguageService,
                                 final GreekAncientLanguageServiceImpl greekAncientLanguageService,
                                 final MeaningSuggestionServiceImpl meaningSuggestionService,
                                 final SubjectSuggestionServiceImpl subjectSuggestionService,
                                 final ReferenceSuggestionServiceImpl referenceSuggestionService,
                                 final TextSuggestionServiceImpl textSuggestionService
    ) {
        queryProviders.put(SearchToken.REFERENCE, referenceSuggestionService);
        queryProviders.put(SearchToken.GREEK_MEANINGS, greekAncientMeaningService);
        queryProviders.put(SearchToken.HEBREW_MEANINGS, hebrewAncientMeaningService);
        queryProviders.put(SearchToken.GREEK, greekAncientLanguageService);
        queryProviders.put(SearchToken.HEBREW, hebrewAncientLanguageService);
        queryProviders.put(SearchToken.MEANINGS, meaningSuggestionService);
        queryProviders.put(SearchToken.SUBJECT_SEARCH, subjectSuggestionService);
        queryProviders.put(SearchToken.TEXT_SEARCH, textSuggestionService);

        //the following lines mean we won't pull extra words for all data sources.
        //e.g. if we have 2 greek meanings, we will only pull 1 one more hebrew meaning 
        //this is not a full map, as processing is dependent on the order set out above
        dependencies.put(SearchToken.HEBREW_MEANINGS, new String[]{SearchToken.GREEK_MEANINGS});
        dependencies.put(SearchToken.GREEK, new String[]{SearchToken.GREEK_MEANINGS, SearchToken.HEBREW_MEANINGS});
        dependencies.put(SearchToken.HEBREW, new String[]{SearchToken.GREEK, SearchToken.GREEK_MEANINGS, SearchToken.HEBREW_MEANINGS});

        //spare capcacity, will fudge the group total. -1 means we will attempt to retrieve 1 less than we could
        //+1 means we will attempt to retrieve 1 more than we should. 
        //for GREEK and HEBREW, we will attempt to retrieve 2+2, rather than 3 and 0
        extraSlots.put(SearchToken.GREEK_MEANINGS, -1);
        extraSlots.put(SearchToken.HEBREW_MEANINGS, 1);

        // for GREEK and Hebrew, we can attempt to retrieve one more, but these won't show if the slots have been taken above
        extraSlots.put(SearchToken.GREEK, 1);
        extraSlots.put(SearchToken.HEBREW, 1);
    }

    @SuppressWarnings("unchecked")
    @Override
    public SuggestionsSummary getTopSuggestions(final SuggestionContext context) {
        final SuggestionsSummary summary = new SuggestionsSummary();
        final Map<String, SingleSuggestionsSummary> results = new LinkedHashMap<String, SingleSuggestionsSummary>();

        //go through each search type
        for (Map.Entry<String, SingleTypeSuggestionService> query : queryProviders.entrySet()) {
            final SingleTypeSuggestionService searchService = query.getValue();

            //run exact query against index
            final int groupTotal = this.getGroupTotal(query.getKey(), results);
            final int totalGroupLeftToRetrieve = MAX_RESULTS - groupTotal + PREVIEW_GROUP;
            Object[] docs = totalGroupLeftToRetrieve > 0 ? searchService.getExactTerms(context, totalGroupLeftToRetrieve, true) : null;
            int docLength = docs != null ? docs.length : 0;

            //how many do we need to collect
            int leftToCollect = docLength < totalGroupLeftToRetrieve ? totalGroupLeftToRetrieve - docLength : 0;

            //create collector to collect some more results, if required, but also the total hit count
            Object o = searchService.getNewCollector(leftToCollect, true);
            final Object[] extraDocs = searchService.collectNonExactMatches(o, context, docs, leftToCollect);
            final List<? extends PopularSuggestion> suggestions = searchService.convertToSuggestions(docs, extraDocs);

            final SingleSuggestionsSummary singleTypeSummary = new SingleSuggestionsSummary();
            setSuggestionsAndExamples(singleTypeSummary, suggestions, groupTotal);
            fillInTotalHits(o, extraDocs.length, singleTypeSummary);

            singleTypeSummary.setSearchType(query.getKey());
            results.put(query.getKey(), singleTypeSummary);
        }

        //return results
        summary.setSuggestionsSummaries(new ArrayList<SingleSuggestionsSummary>(results.values()));
        return summary;
    }

    /**
     * Total number of results retrieved so far in a particular grouping of providers
     *
     * @param searchType   the current type of search
     * @param resultsSoFar the results retrieved so far
     * @return the total number of elements retrieved
     */
    private int getGroupTotal(final String searchType, Map<String, SingleSuggestionsSummary> resultsSoFar) {
        final String[] dependents = this.dependencies.get(searchType);
        if (dependents == null) {
            //no dependencies
            return 0 - getSpareSlotCapacity(searchType);
        }

        int totalDocsRetrieved = 0;
        for (String d : dependents) {
            final SingleSuggestionsSummary singleSuggestionsSummary = resultsSoFar.get(d);
            if (singleSuggestionsSummary == null) {
                LOGGER.warn("Dependencies setup is incorrect");
                continue;
            }
            final int totalMinusGroupExamples = singleSuggestionsSummary.getPopularSuggestions().size();
            totalDocsRetrieved += (totalMinusGroupExamples > 0 ? totalMinusGroupExamples : 0);
        }

        return totalDocsRetrieved - getSpareSlotCapacity(searchType);
    }

    private int getSpareSlotCapacity(final String searchType) {
        final Integer spareCapacity = extraSlots.get(searchType);
        return spareCapacity == null ? 0 : spareCapacity;
    }

    private void fillInTotalHits(final Object collector, int alreadyCollected, final SingleSuggestionsSummary singleTypeSummary) {
        int numExamples = singleTypeSummary.getExtraExamples() != null ? singleTypeSummary.getExtraExamples().size() : 0;

        if (collector instanceof TopFieldCollector) {
            singleTypeSummary.setMoreResults(((TopFieldCollector) collector).getTotalHits() - alreadyCollected + numExamples);
        } else if (collector instanceof TermsAndMaxCount) {
            singleTypeSummary.setMoreResults(((TermsAndMaxCount) collector).getTotalCount() - alreadyCollected + numExamples);
        } else {
            throw new StepInternalException("Unsupported collector");
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public SuggestionsSummary getFirstNSuggestions(SuggestionContext context) {

        final String searchType = context.getSearchType();
        final SingleTypeSuggestionService searchService = queryProviders.get(searchType);
        final Object[] docs = searchService.getExactTerms(context, MAX_RESULTS, false);

        //create collector to collect some more results, if required, but also the total hit count
        final Object collector = searchService.getNewCollector(MAX_RESULTS_NON_GROUPED - docs.length, false);
        final Object[] extraDocs = searchService.collectNonExactMatches(collector, context, docs, MAX_RESULTS_NON_GROUPED);
        final List<? extends PopularSuggestion> suggestions = searchService.convertToSuggestions(docs, extraDocs);

        final SuggestionsSummary summary = new SuggestionsSummary();
        final List<SingleSuggestionsSummary> results = new ArrayList<SingleSuggestionsSummary>();
        summary.setSuggestionsSummaries(results);
        final SingleSuggestionsSummary singleTypeSummary = new SingleSuggestionsSummary();
        fillInTotalHits(collector, extraDocs.length, singleTypeSummary);
        singleTypeSummary.setPopularSuggestions(suggestions);
        singleTypeSummary.setSearchType(searchType);
        results.add(singleTypeSummary);

        //return results
        return summary;
    }

    private void setSuggestionsAndExamples(final SingleSuggestionsSummary singleTypeSummary,
                                           final List<? extends PopularSuggestion> suggestions,
                                           final int groupTotal) {
        //total number of suggestions to keep as suggestions
        final int keep = MAX_RESULTS - groupTotal;

        //set popular suggestions
        List<PopularSuggestion> keepSuggestions = new ArrayList<PopularSuggestion>(3);
        int ii;
        final boolean isReferenceSuggestion = suggestions.size() > 0 && suggestions.get(0) instanceof BookName;
        for (ii = 0; (ii < keep || isReferenceSuggestion) && ii < suggestions.size(); ii++) {
            keepSuggestions.add(suggestions.get(ii));
        }
        singleTypeSummary.setPopularSuggestions(keepSuggestions);

        //set example suggestions
        List<PopularSuggestion> examples = new ArrayList<PopularSuggestion>(2);
        for (; ii < suggestions.size(); ii++) {
            examples.add(suggestions.get(ii));
        }
        singleTypeSummary.setExtraExamples(examples);
    }
}
