package com.tyndalehouse.step.core.data.analyzers;

import java.io.Reader;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;

import com.tyndalehouse.step.core.data.tokenizers.CommaDelimitedTokenizer;

/**
 * Just uses whitespaces to separate tokens
 */
public class CommaDelimitedAnalyzer extends Analyzer {

    @Override
    public TokenStream tokenStream(final String fieldName, final Reader reader) {
        return new CommaDelimitedTokenizer(reader);
    }
}
