package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.models.search.SubjectSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A abstract implementation that assumes the first list (exact matches) have been merged
 * already, so we will only ever return the second list.
 * @author chrisburrell
 */
public abstract class AbstractIgnoreMergedListSuggestionServiceImpl<T extends  PopularSuggestion> implements SingleTypeSuggestionService<T, TermsAndMaxCount<T>> {
    /**
     * Returns a simple collector for collecting counts and such like
     * @param leftToCollect
     * @param popular
     * @return
     */
    public TermsAndMaxCount getNewCollector(final int leftToCollect, boolean popular) {
        final TermsAndMaxCount<T> termsAndMaxCount = new TermsAndMaxCount<T>();
        termsAndMaxCount.setTotalCount(leftToCollect);
        return termsAndMaxCount;
    }

    @Override
    public List<? extends PopularSuggestion> convertToSuggestions(final T[] subjectSuggestions,
                                                                  final T[] extraDocs) {
        final List<T> returnList = new ArrayList<T>();
        //we ignore the first list, as we may have merged it previously
        returnList.addAll(Arrays.asList(extraDocs));
        return returnList;
    }
}
