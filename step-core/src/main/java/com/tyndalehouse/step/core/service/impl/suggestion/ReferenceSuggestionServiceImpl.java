package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;

import java.util.List;

/**
 * @author chrisburrell
 */
public class ReferenceSuggestionServiceImpl implements SingleTypeSuggestionService<BookName, TermsAndMaxCount<BookName>> {
    @Override
    public BookName[] getExactTerms(final String form, final int max, final boolean popularSort) {
        return new BookName[0];
    }

    @Override
    public BookName[] collectNonExactMatches(final TermsAndMaxCount<BookName> collector, final String form, final BookName[] alreadyRetrieved, final int leftToCollect) {
        return new BookName[0];
    }

    @Override
    public List<? extends PopularSuggestion> convertToSuggestions(final BookName[] docs, final BookName[] extraDocs) {
        return null;
    }

    @Override
    public TermsAndMaxCount<BookName> getNewCollector(final int leftToCollect, final boolean popularSort) {
        return null;
    }
}
