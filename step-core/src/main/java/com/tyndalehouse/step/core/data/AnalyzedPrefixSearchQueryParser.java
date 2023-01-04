package com.tyndalehouse.step.core.data;

import java.io.IOException;
import java.io.StringReader;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;
import org.apache.lucene.queryParser.MultiFieldQueryParser;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.util.Version;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

public class AnalyzedPrefixSearchQueryParser extends MultiFieldQueryParser {
    /**
     * delegates to super constructor
     * 
     * @param matchVersion the verison of lucene
     * @param fields the fields
     * @param analyzer the analyzer
     */
    public AnalyzedPrefixSearchQueryParser(final Version matchVersion, final String[] fields,
            final Analyzer analyzer) {
        super(matchVersion, fields, analyzer);
    }

    @Override
    protected org.apache.lucene.search.Query getPrefixQuery(final String field, final String termStr)
            throws ParseException {
        TokenStream source;
        final Analyzer analyzer = super.getAnalyzer();
        try {
            source = analyzer.reusableTokenStream(field, new StringReader(termStr));
            source.reset();

            final BooleanQuery query = new BooleanQuery();
            // now need to consume the stream
            while (source.incrementToken()) {
                final TermAttribute attribute = source.getAttribute(TermAttribute.class);
                final String prefixTerm = attribute.term();

                if (prefixTerm.length() != 0) {
                    final org.apache.lucene.search.Query prefixQuery = super
                            .getPrefixQuery(field, prefixTerm);
                    query.add(prefixQuery, Occur.SHOULD);
                }
            }
            return query;
        } catch (final IOException e) {
            throw new StepInternalException("Unable to make a prefix query", e);
        }

    }
}
