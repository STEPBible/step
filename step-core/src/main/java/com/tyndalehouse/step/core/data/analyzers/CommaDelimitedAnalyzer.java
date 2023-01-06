package com.tyndalehouse.step.core.data.analyzers;

import com.tyndalehouse.step.core.data.tokenizers.CommaDelimitedTokenizer;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;

import java.io.Reader;

/**
 * Just uses whitespaces to separate tokens
 */
public class CommaDelimitedAnalyzer extends Analyzer {

    @Override
    public TokenStream tokenStream(final String fieldName, final Reader reader) {
        return new CommaDelimitedTokenizer(reader);
    }
}
