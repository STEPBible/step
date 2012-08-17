package com.tyndalehouse.step.core.service.jsword;

import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.search.SearchResult;

/**
 * Searches across jsword modules
 * 
 * @author chrisburrell
 * 
 */
public interface JSwordSearchService {
    /**
     * 
     * @param version the version to search across
     * @param query the query to be run
     * @param ranked whether the results are ranked in order of relevance
     * @param context the amnount of blurring/context given to each search result
     * @param options the list of options used to retrieve the text
     * @return the results
     */
    SearchResult search(String version, String query, boolean ranked, final int context,
            LookupOption... options);
}
