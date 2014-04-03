package com.tyndalehouse.step.core.service.search;

import java.util.List;

import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.SuggestionType;

/**
 * Interface to search for relevant suggestions for a given input, whether unicode or transliterations
 * 
 * @author chrisburrell
 * 
 */
public interface OriginalWordSuggestionService {
    /**
     * Retrieves all matching lexical entries for the word typed in
     * 
     * @param suggestionType indicates greek or hebrew
     * @param form the word that has been typed in so far
     * @param includeAllForms true to indicate results should come lexical_form table.
     * 
     * @return a list of lexicon suggestions
     */
    List<LexiconSuggestion> getLexicalSuggestions(SuggestionType suggestionType, String form,
            boolean includeAllForms);

}
