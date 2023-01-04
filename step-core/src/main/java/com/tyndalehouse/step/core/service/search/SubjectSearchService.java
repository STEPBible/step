package com.tyndalehouse.step.core.service.search;

import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectSuggestion;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.impl.SearchType;
import org.crosswire.jsword.passage.Key;

import java.util.List;

/**
 * Searches for a specific subject
 */
public interface SubjectSearchService {
    /**
     * Runs a subject search
     * 
     * @param sq the search query to run
     * @return the results obtained by carrying out the search
     */
    SearchResult search(SearchQuery sq);

    /**
     * Returns the search keys for this search, i.e. not the topical/headings
     * @param sq the search query to run
     * @return the key
     */
    Key getKeys(SearchQuery sq);

    /**
     * Search by a referenceQuerySyntax, or references if separated by a space.
     * 
     * @param referenceQuerySyntax the referenceQuerySyntax or a Lucene query syntax to be looked up in the expanded references fields
     * @return the search result a list of topics that match.
     */
    SearchResult searchByReference(String referenceQuerySyntax);

    /**
     * First resolves the reference and expands it to its full form (e.g. Gen.1.1-3 goes to Gen.1.1 Gen.1.2
     * Gen 1.3), Then carries out a search against all subjects.
     * 
     *
     * @param version the version
     * @param references the references
     * @return the search result
     */
    SearchResult searchByMultipleReferences(String[] version, String references);


}
