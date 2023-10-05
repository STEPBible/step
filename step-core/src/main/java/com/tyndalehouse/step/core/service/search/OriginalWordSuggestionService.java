package com.tyndalehouse.step.core.service.search;

import com.tyndalehouse.step.core.models.LexiconSuggestion;

import java.util.List;

/**
 * Interface to search for relevant suggestions for a given input, whether unicode or transliterations
 */
public interface OriginalWordSuggestionService {
    /**
     * Retrieves all matching lexical entries for the word typed in
     * 
     * @param form the word that has been typed in so far
     * 
     * @param greek true to indicate greek, false to indicate hebrew
     * @return a list of lexicon suggestions
     */
    List<LexiconSuggestion> getExactForms(String form, boolean greek);

}
