package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.SearchService;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.TermEnum;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.FilteredTermEnum;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.PrefixTermEnum;
import org.apache.lucene.search.SingleTermEnum;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.joda.time.LocalDateTime;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    public static String safeEscape(final String userTerm) {
        if (userTerm == null) {
            return null;
        }

        final String term = QueryParser.escape(userTerm);
        if (term.indexOf(' ') != -1) {
            return "\"" + term.replace("\"", "\\\"") + "\"";
        }
        return term;
    }

    /**
     * Returns all terms starting with a particular prefix
     *
     * @param exact      indicates we want 'exact' matches only
     * @param fieldName  the name of the fields
     * @param searchTerm the search term
     * @return the list of terms matching searchTerm as a prefix
     */
    public static TermsAndMaxCount getAllTermsPrefixedWith(final boolean exact,
                                                           final boolean trackMax,
                                                           IndexSearcher searcher,
                                                           final String fieldName,
                                                           final String searchTerm,
                                                           final int max) {
        final String lastTerm = getLastTerm(searchTerm);
        if (StringUtils.isBlank(lastTerm)) {
            return getBlankTermsAndMaxCount();
        }

        TermEnum termEnum = null;
        try {
            final Term term = new Term(fieldName, QueryParser.escape(lastTerm.toLowerCase().trim()));
            termEnum = exact ? new SingleTermEnum(searcher.getIndexReader(), term) : new PrefixTermEnum(searcher.getIndexReader(),
                    term);
            int count = 0;
            if (termEnum.term() == null) {
                return getBlankTermsAndMaxCount();
            }

            final Set<String> terms = new HashSet<String>();
            do {
                if (count < max) {
                    //when inexact, don't include exact terms
                    final String termValue = termEnum.term().text();
                    if (!exact && termValue.equalsIgnoreCase(searchTerm)) {
                        // we didn't really find a term after all, since it's the exact same term
                        count--;
                    } else {
                        terms.add(termValue);
                    }
                }
                count++;
                //we continue round the loop until we've got enough, or in case we're wanting to keep track of the total number
            } while (termEnum.next() && ((count < max) || trackMax));

            //finalise and return
            TermsAndMaxCount termsAndMaxCount = new TermsAndMaxCount();
            termsAndMaxCount.setTotalCount(count);
            termsAndMaxCount.setTerms(terms);
            return termsAndMaxCount;
        } catch (IOException ex) {
            throw new StepInternalException(ex.getMessage(), ex);
        } finally {
            IOUtils.closeQuietly(termEnum);
        }
    }

    private static TermsAndMaxCount getBlankTermsAndMaxCount() {
        TermsAndMaxCount termsAndMaxCount = new TermsAndMaxCount();
        termsAndMaxCount.setTerms(new HashSet<String>());
        return termsAndMaxCount;
    }

    /**
     * Obtains the last word in the list
     *
     * @param fullTerm the full term as entered by the user
     * @return the last term in the input string
     */
    private static String getLastTerm(String fullTerm) {
        final String trimmedUserEntry = fullTerm.toLowerCase();
        int lastWordStart = trimmedUserEntry.lastIndexOf(' ');
        return lastWordStart != -1 ? trimmedUserEntry.substring(lastWordStart + 1) : trimmedUserEntry;
    }
}
