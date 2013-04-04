package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.LexiconSuggestion;

import java.util.Map;
import java.util.Set;

/**
 * Defines the contract for getting lexicon definitions out of Lucene
 * @author chrisburrell
 */
public interface LexiconDefinitionService {
    /**
     * Looks up a set of strong numbers by returning lexicon suggestions, keyed by strong numbers
     * @param strongNumbers the strong numbers to be looked up
     * @return a map from strong numbers to the found lexical entries.
     */
    Map<String,LexiconSuggestion> lookup(Set<String> strongNumbers);
}
