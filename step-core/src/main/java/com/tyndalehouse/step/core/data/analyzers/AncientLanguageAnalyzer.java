package com.tyndalehouse.step.core.data.analyzers;

import com.tyndalehouse.step.core.data.filters.NormalizerFilter;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.WhitespaceTokenizer;

import java.io.Reader;

/**
 * Analyzer to remove the accents and other marks that make it difficult for a user to search
 */
public class AncientLanguageAnalyzer extends Analyzer {

    @Override
    public TokenStream tokenStream(final String fieldName, final Reader reader) {
        TokenStream stream = new WhitespaceTokenizer(reader);
        stream = new LowerCaseFilter(stream);
        stream = new NormalizerFilter(stream);
        return stream;
    }

}
