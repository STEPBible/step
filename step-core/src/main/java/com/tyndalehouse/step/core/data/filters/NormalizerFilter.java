package com.tyndalehouse.step.core.data.filters;

import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;

import java.io.IOException;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.unAccent;

/**
 * Normalizes the String and removes any accents
 */
public class NormalizerFilter extends TokenFilter {
    private final TermAttribute termAtt;

    /**
     * @param input the token stream
     */
    public NormalizerFilter(final TokenStream input) {
        super(input);
        this.termAtt = addAttribute(TermAttribute.class);
    }

    @Override
    public boolean incrementToken() throws IOException {
        if (this.input.incrementToken()) {
            final String unaccentedForm = unAccent(this.termAtt.term());
            this.termAtt.setTermBuffer(unaccentedForm);
            return true;
        } else {
            return false;
        }
    }

}
