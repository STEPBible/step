package com.tyndalehouse.step.core.data.tokenizers;

import org.apache.lucene.analysis.WhitespaceTokenizer;

import java.io.Reader;

public class CommaDelimitedTokenizer extends WhitespaceTokenizer {
    /**
     * delegates to super constructor
     * 
     * @param in the reader
     */
    public CommaDelimitedTokenizer(final Reader in) {
        super(in);
    }

    @Override
    protected boolean isTokenChar(final char c) {
        return c == ',' || super.isTokenChar(c);
    }
}
