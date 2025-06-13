package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;
import com.tyndalehouse.step.core.service.SuggestionService;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import org.apache.lucene.search.TopFieldCollector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;

import java.util.*;

/**
 * Suggestion service, helping the auto suggestion search dropdown.
 */
public class SuggestionServiceImpl implements SuggestionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SuggestionServiceImpl.class);

    //show the total number of ungrouped results at any one time.
    private static final int MAX_RESULTS = 4;
    //determines how many values are shown on expanding line 'see 7 more, e.g. abc def'
    private static final int PREVIEW_GROUP = 2;
    private final Map<String, SingleTypeSuggestionService> queryProviders = new LinkedHashMap<String, SingleTypeSuggestionService>();
    private final Map<String, String[]> dependencies = new HashMap<String, String[]>(8);
    private final Map<String, Integer> extraSlots = new HashMap<String, Integer>(4);
    private static String stepTypes;
    private static String pluralStepTypes;

    @Inject
    public SuggestionServiceImpl(@Named("search.name_types") final String stepTypes,
                                 @Named("search.plural_name_types") final String pluralStepTypes,
                                 final HebrewAncientMeaningServiceImpl hebrewAncientMeaningService,
                                 final GreekAncientMeaningServiceImpl greekAncientMeaningService,
                                 final HebrewAncientLanguageServiceImpl hebrewAncientLanguageService,
                                 final GreekAncientLanguageServiceImpl greekAncientLanguageService,
                                 final MeaningSuggestionServiceImpl meaningSuggestionService,
                                 final SubjectSuggestionServiceImpl subjectSuggestionService,
                                 final ReferenceSuggestionServiceImpl referenceSuggestionService,
                                 final TextSuggestionServiceImpl textSuggestionService
    ) {
        this.stepTypes = stepTypes;
        this.pluralStepTypes = pluralStepTypes;
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
    public SuggestionsSummary getTopSuggestions(final SuggestionContext context, final String searchLangSelectedByUser) {
        final SuggestionsSummary summary = new SuggestionsSummary();
        final Map<String, SingleSuggestionsSummary> results = new LinkedHashMap<String, SingleSuggestionsSummary>();

        SuggestionContext currentContext = new SuggestionContext();
        currentContext.setMasterBook(context.getMasterBook());
        currentContext.setInput(context.getInput());
        currentContext.setSearchType(context.getSearchType());
        currentContext.setExampleData(context.isExampleData());

        String searchInput = context.getInput();
        Character firstCharacter = searchInput.charAt(0);
        Character lastCharacter = searchInput.charAt(searchInput.length() - 1);
        Boolean isQuoted = firstCharacter == lastCharacter && firstCharacter == '\"';

        //go through each search type
        for (Map.Entry<String, SingleTypeSuggestionService> query : queryProviders.entrySet()) {
            String curQueryKey = query.getKey();
            // If the input is quoted, only process text search
            if (isQuoted && !curQueryKey.equals("text")) {
                continue;
            }
            int maxResult = MAX_RESULTS;
            if (searchLangSelectedByUser != null) {
                if (searchLangSelectedByUser.equals("en")) {
                    if ((!curQueryKey.equals("meanings")) &&
                            (!curQueryKey.equals("subject")) &&
                            (!curQueryKey.equals("greekMeanings")) &&
                            (!curQueryKey.equals("hebrewMeanings")) &&
                            (!curQueryKey.equals("text")))
                        continue;
                    if (curQueryKey.equals("text"))
                        currentContext.setInput(context.getInput()); // reset to original input in case it was previously changed.
                    else { // meaning or subject search
                        String curInput = currentContext.getInput();
                        if (curInput.substring(curInput.length() -1 ).equals("*"))
                            currentContext.setInput(curInput.substring(0, curInput.length() - 1));
                        else if (curInput.substring(curInput.length() -1 ).equals("\"") &&
                                curInput.substring(0, 1).equals("\""))
                            currentContext.setInput(curInput.substring(1, curInput.length() - 2)); // remove leading and trailing "
                    }
                    if (curQueryKey.equals("greekMeanings") || curQueryKey.equals("hebrewMeanings"))
                        maxResult = MAX_RESULTS_NON_GROUPED * 2;
                } else if (searchLangSelectedByUser.equals("he")) {
                    if (curQueryKey.equals("hebrewMeanings"))
                        maxResult = MAX_RESULTS_NON_GROUPED * 2;
                    else if (curQueryKey.equals("hebrew"))
                        maxResult = MAX_RESULTS_NON_GROUPED * 4;
                    else if (curQueryKey.equals("text")) {
                        currentContext.setInput(context.getInput()); // reset to original input in case it was previously changed.
                        // if (!isQuoted)
                        //     continue;
                    } else
                        continue;
                } else if (searchLangSelectedByUser.equals("gr")) {
                    if (curQueryKey.equals("greekMeanings"))
                        maxResult = MAX_RESULTS_NON_GROUPED * 2;
                    else if (curQueryKey.equals("greek"))
                        maxResult = MAX_RESULTS_NON_GROUPED * 4;
                    else if (curQueryKey.equals("text")) {
                        // if (!isQuoted)
                        //     continue;
                    } else
                        continue;
                }
            }
            final SingleTypeSuggestionService searchService = query.getValue();

            //run exact query against index
            final int groupTotal = this.getGroupTotal(curQueryKey, results);
            final int totalGroupLeftToRetrieve = maxResult - groupTotal + PREVIEW_GROUP;
            Object[] docs = totalGroupLeftToRetrieve > 0 ? searchService.getExactTerms(currentContext, totalGroupLeftToRetrieve, false) : null;
            int docLength = docs != null ? docs.length : 0;

            //how many do we need to collect
            int leftToCollect = docLength < totalGroupLeftToRetrieve ? totalGroupLeftToRetrieve - docLength : 0;

            //create collector to collect some more results, if required, but also the total hit count
            Object o = searchService.getNewCollector(leftToCollect, true);
            final Object[] extraDocs = searchService.collectNonExactMatches(o, currentContext, docs, leftToCollect);
            final List<? extends PopularSuggestion> suggestions = searchService.convertToSuggestions(docs, extraDocs);
            if ((searchLangSelectedByUser != null) && searchLangSelectedByUser.equals("en") &&
                    (curQueryKey.equals("greekMeanings") || curQueryKey.equals("hebrewMeanings")) ) {
                for (int i = suggestions.size() - 1; i > -1; i--) {
                    if (!this.stepTypes.contains('"' + ((LexiconSuggestion) suggestions.get(i)).getType() + '"'))
                        suggestions.remove(i);
                }
            }
            final SingleSuggestionsSummary singleTypeSummary = new SingleSuggestionsSummary();
            setSuggestionsAndExamples(singleTypeSummary, suggestions, groupTotal, maxResult);
            fillInTotalHits(o, extraDocs.length, singleTypeSummary);

            singleTypeSummary.setSearchType(query.getKey());
            results.put(query.getKey(), singleTypeSummary);
        }
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
                //LOGGER.warn("Dependencies setup is incorrect");
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
                                           final int groupTotal,
                                           final int maxResults) {
        //total number of suggestions to keep as suggestions
        final int keep = maxResults - groupTotal;

        //set popular suggestions
        List<PopularSuggestion> keepSuggestions = new ArrayList<PopularSuggestion>(maxResults);
        int ii;
        final boolean isReferenceSuggestion = suggestions.size() > 0 && suggestions.get(0) instanceof BookName;
        for (ii = 0; (ii < keep || isReferenceSuggestion) && ii < suggestions.size(); ii++) {
            keepSuggestions.add(suggestions.get(ii));
        }
        singleTypeSummary.setPopularSuggestions(keepSuggestions);

        //set example suggestions
        List<PopularSuggestion> examples = new ArrayList<PopularSuggestion>(2);
        for (int count = ii; (count < suggestions.size()) && (count - ii < 3); count++) {
            examples.add(suggestions.get(count));
        }
        singleTypeSummary.setExtraExamples(examples);
    }
}
