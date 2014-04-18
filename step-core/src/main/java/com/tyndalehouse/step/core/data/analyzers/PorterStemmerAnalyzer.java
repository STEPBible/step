package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.LowerCaseTokenizer;
import org.apache.lucene.analysis.PorterStemFilter;
import org.apache.lucene.analysis.TokenStream;

import java.io.Reader;

/**
 * porter stemmer only with lower casing and stop words
 */
public class PorterStemmerAnalyzer extends Analyzer {
    /**
     * Constructs a filter with stop filter, lower case filter and porter stem filter
     *
     * @param fieldName the name of the field
     * @param reader    the reader of the input string
     * @return the token stream, with the appropriate filters
     */
    @Override
    public final TokenStream tokenStream(final String fieldName, final Reader reader) {
        TokenStream result = new LowerCaseTokenizer(reader);

        result = new LowerCaseFilter(result);
        result = new PorterStemFilter(result);
        return result;
    }
}
