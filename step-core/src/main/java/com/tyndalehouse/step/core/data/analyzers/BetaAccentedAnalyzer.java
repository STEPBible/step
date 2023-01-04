package com.tyndalehouse.step.core.data.analyzers;

import java.io.Reader;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.WhitespaceTokenizer;

import com.tyndalehouse.step.core.data.filters.BetaTransliterationCleaningFilter;

/**
 * An analyzer for transliterations
 */
public class BetaAccentedAnalyzer extends Analyzer {
    @Override
    public TokenStream tokenStream(final String fieldName, final Reader reader) {
        TokenStream stream = new WhitespaceTokenizer(reader);
        stream = new LowerCaseFilter(stream);
        stream = new BetaTransliterationCleaningFilter(stream);
        return stream;
    }
}
