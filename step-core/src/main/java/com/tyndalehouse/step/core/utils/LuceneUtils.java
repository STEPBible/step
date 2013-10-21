package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.SearchService;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.PrefixTermEnum;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.joda.time.LocalDateTime;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static java.lang.Long.parseLong;
import static org.joda.time.DateTime.parse;
import static org.joda.time.DateTimeUtils.getInstantMillis;

/**
 * Utilities to help with index reading
 *
 * @author chrisburrell
 */
public final class LuceneUtils {
    /**
     * no op
     */
    private LuceneUtils() {
        // no op
    }

    /**
     * Returns all terms starting with a particular prefix
     *
     * @param searchTerm the search term
     * @param fieldName  the name of the fields
     * @return the list of terms matching searchTerm as a prefix
     */
    public static List<String> getAllTermsPrefixedWith(IndexSearcher searcher,
                                                       final String fieldName,
                                                       final String searchTerm) {


        final String lastTerm = getLastTerm(searchTerm);
        if (StringUtils.isBlank(lastTerm)) {
            return new ArrayList<String>(0);
        }

        List<String> results = new ArrayList<String>(SearchService.MAX_SUGGESTIONS);
        try {
            PrefixTermEnum tagsEnum = new PrefixTermEnum(searcher.getIndexReader(),
                    new Term(fieldName, QueryParser.escape(lastTerm.toLowerCase().trim())));
            int count = 0;
            if (tagsEnum.term() == null) {
                return results;
            }

            do {
                results.add(tagsEnum.term().text());
            } while (tagsEnum.next() && ++count < SearchService.MAX_SUGGESTIONS);
        } catch (IOException ex) {
            throw new StepInternalException(ex.getMessage(), ex);
        }
        return results;
    }

    /**
     * Obtains the last word in the list
     *
     * @param fullTerm the full term as entered by the user
     * @return the last term in the input string
     */
    private static String getLastTerm(String fullTerm) {
        final String trimmedUserEntry = fullTerm.toLowerCase();
        int lastWordStart = trimmedUserEntry.indexOf(' ');
        return lastWordStart != -1 ? trimmedUserEntry.substring(lastWordStart + 1) : trimmedUserEntry;
    }
}
