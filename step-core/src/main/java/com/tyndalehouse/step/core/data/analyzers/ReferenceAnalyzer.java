package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.WhitespaceTokenizer;

import java.io.Reader;

/**
 * @author chrisburrell
 */
public class ReferenceAnalyzer extends Analyzer {
    @Override
    public TokenStream tokenStream(final String fieldName, final Reader reader) {
        return new LowerCaseFilter(new WhitespaceTokenizer(reader));
    }
}
