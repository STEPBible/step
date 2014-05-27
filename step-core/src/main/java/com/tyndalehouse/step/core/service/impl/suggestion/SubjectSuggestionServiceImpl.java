package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.search.SubjectSuggestion;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import com.tyndalehouse.step.core.service.impl.SearchType;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.utils.LuceneUtils;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.tartarus.snowball.ext.PorterStemmer;

import javax.inject.Inject;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.TreeMap;

/**
 * @author chrisburrell
 */
public class SubjectSuggestionServiceImpl extends AbstractIgnoreMergedListSuggestionServiceImpl<SubjectSuggestion> {
    private final EntityIndexReader naves;
    private final JSwordSearchService jSwordSearchService;

    @Inject
    public SubjectSuggestionServiceImpl(final EntityManager entityManager, JSwordSearchService jSwordSearchService) {
        this.jSwordSearchService = jSwordSearchService;
        naves = entityManager.getReader("nave");
    }

    @Override
    public SubjectSuggestion[] getExactTerms(final SuggestionContext context, final int max, final boolean popularSort) {
        final Map<String, SubjectSuggestion> suggestions = new TreeMap<String, SubjectSuggestion>();
        final PorterStemmer stemmer = new PorterStemmer();

        //add the full term
        final String input = context.getInput();
        addSubjectTerms(suggestions, stemmer, LuceneUtils.getAllTermsPrefixedWith(false, false, this.jSwordSearchService.getIndexSearcher(JSwordPassageService.REFERENCE_BOOK),
                LuceneIndex.FIELD_HEADING, input, max).getTerms(), SearchType.SUBJECT_SIMPLE);
        addSubjectTerms(suggestions, stemmer, this.naves.findSetOfTerms(true, input, max, "root"), SearchType.SUBJECT_EXTENDED);
        addSubjectTerms(suggestions, stemmer, this.naves.findSetOfTerms(true, input, max, "fullTerm"), SearchType.SUBJECT_FULL);
        return suggestions.values().toArray(new SubjectSuggestion[suggestions.size()]);
    }

    @Override
    public SubjectSuggestion[] collectNonExactMatches(final TermsAndMaxCount<SubjectSuggestion> collector,
                                                      final SuggestionContext context,
                                                      final SubjectSuggestion[] alreadyRetrieved,
                                                      final int leftToCollect) {
        final Map<String, SubjectSuggestion> suggestions = new TreeMap<String, SubjectSuggestion>();
        final PorterStemmer stemmer = new PorterStemmer();
        addExistingMappings(suggestions, stemmer, alreadyRetrieved);

        final String input = context.getInput();
        final TermsAndMaxCount termsFromHeadings = LuceneUtils.getAllTermsPrefixedWith(false, false, this.jSwordSearchService.getIndexSearcher(JSwordPassageService.REFERENCE_BOOK),
                LuceneIndex.FIELD_HEADING, input, leftToCollect);
        final TermsAndMaxCount termsFromSimpleNave = this.naves.findSetOfTermsWithCounts(false, true, input, leftToCollect, "root");
        final TermsAndMaxCount termsFromFullNave = this.naves.findSetOfTermsWithCounts(false, true, input, leftToCollect, "fullTerm");

        termsFromHeadings.setTotalCount(termsFromHeadings.getTotalCount() - addSubjectTerms(suggestions, stemmer, termsFromHeadings.getTerms(), SearchType.SUBJECT_SIMPLE));
        termsFromSimpleNave.setTotalCount(termsFromSimpleNave.getTotalCount() - addSubjectTerms(suggestions, stemmer, termsFromSimpleNave.getTerms(), SearchType.SUBJECT_EXTENDED));
        termsFromFullNave.setTotalCount(termsFromFullNave.getTotalCount() - addSubjectTerms(suggestions, stemmer, termsFromFullNave.getTerms(), SearchType.SUBJECT_FULL));

        TermsAndMaxCount countsAndResults = new TermsAndMaxCount();
        countsAndResults.setTerms(new HashSet<SubjectSuggestion>(suggestions.values()));
        collector.setTotalCount(termsFromHeadings.getTotalCount() + termsFromSimpleNave.getTotalCount() + termsFromFullNave.getTotalCount());
        return suggestions.values().toArray(new SubjectSuggestion[countsAndResults.getTerms().size()]);
    }

    /**
     * Adds the existing mappings back in
     * @param suggestions a list of suggestions
     * @param stemmer the stemmer itself
     * @param alreadyRetrieved the existing entries
     */
    private void addExistingMappings(final Map<String, SubjectSuggestion> suggestions, final PorterStemmer stemmer, final SubjectSuggestion[] alreadyRetrieved) {
        if(alreadyRetrieved == null) {
            return;
        }
        
        for(SubjectSuggestion s : alreadyRetrieved) {
            stemmer.setCurrent(s.getValue());
            stemmer.stem();
            String stem = stemmer.getCurrent();
            suggestions.put(stem, s);
        }
    }
    
    /**
     * @param suggestions the suggestions
     * @param stemmer     the stemmer
     * @param naveTerms   the nave terms
     * @param searchType  the search type
     * @return the actual number that was added, rather than marked as also available in a different search
     */
    private int addSubjectTerms(final Map<String, SubjectSuggestion> suggestions,
                                final PorterStemmer stemmer,
                                final Collection<String> naveTerms,
                                final SearchType searchType) {
        int added = 0;
        for (String s : naveTerms) {
            stemmer.setCurrent(s);
            stemmer.stem();
            String stem = stemmer.getCurrent();

            SubjectSuggestion suggestion = suggestions.get(stem);
            if (suggestion == null) {
                added++;
                suggestion = new SubjectSuggestion();
                suggestion.setValue(s);
                suggestion.addSearchType(searchType);
                suggestions.put(stem, suggestion);
            } else if (!suggestion.getSearchTypes().contains(searchType)) {
                suggestion.addSearchType(searchType);
                
                //if the suggestion's value is longer, then replace with the short value
                if(suggestion.getValue().length() > s.length()) {
                    suggestion.setValue(s);
                }
            }
        }
        return added;
    }
}
