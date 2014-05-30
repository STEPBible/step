package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.models.search.TextSuggestion;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Perhaps in the future, we will tie this into an English dictionary. In the interim, we simply return the text as-is
 *
 * @author chrisburrell
 */
public class TextSuggestionServiceImpl extends AbstractIgnoreMergedListSuggestionServiceImpl<TextSuggestion> {
    private static final Pattern INVALID_TEXT = Pattern.compile("[.:]\\d+");

    @Override
    public TextSuggestion[] getExactTerms(final SuggestionContext context, final int max, final boolean popularSort) {
        return new TextSuggestion[0];
    }

    @Override
    public TextSuggestion[] collectNonExactMatches(final TermsAndMaxCount<TextSuggestion> collector,
                                                   final SuggestionContext context, final TextSuggestion[] alreadyRetrieved,
                                                   final int leftToCollect) {
        final String input = context.getInput();
        if(INVALID_TEXT.matcher(input).find()) {
            return new TextSuggestion[0];
        }

        final TextSuggestion textSuggestion = new TextSuggestion();
        textSuggestion.setText(input);
        collector.setTotalCount(0);
        return new TextSuggestion[] { textSuggestion };
    }

    @Override
    public List<? extends PopularSuggestion> convertToSuggestions(final TextSuggestion[] docs, final TextSuggestion[] extraDocs) {
        return new ArrayList<PopularSuggestion>(Arrays.asList(extraDocs));
    }
}
