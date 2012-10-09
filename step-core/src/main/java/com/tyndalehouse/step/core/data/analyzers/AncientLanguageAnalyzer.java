package com.tyndalehouse.step.core.data.analyzers;

import java.io.Reader;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.WhitespaceTokenizer;

import com.tyndalehouse.step.core.data.filters.NormalizerFilter;

/**
 * Analyzer to remove the accents and other marks that make it difficult for a user to search
 * 
 * @author chrisburrell
 * 
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
