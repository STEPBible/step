package com.tyndalehouse.step.core.data.entities.impl;

import static org.apache.lucene.util.Version.LUCENE_30;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.tyndalehouse.step.core.data.common.TermsAndMaxCount;
import com.tyndalehouse.step.core.utils.LuceneUtils;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.TermAttribute;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryParser.MultiFieldQueryParser;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryParser.QueryParser.Operator;
import org.apache.lucene.search.*;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.store.MMapDirectory;
import org.slf4j.Logger;

import com.tyndalehouse.step.core.data.AllResultsCollector;
import com.tyndalehouse.step.core.data.AnalyzedPrefixSearchQueryParser;
import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.utils.IOUtils;

/**
 * Reads an entity
 *
 * @author chrisburrell
 */
public class EntityIndexReaderImpl implements EntityIndexReader {
    private static final Logger LOGGER = org.slf4j.LoggerFactory.getLogger(EntityIndexReaderImpl.class);
    private IndexSearcher searcher;
    private Directory directory;
    private final EntityConfiguration config;
    private boolean memoryMapped;

    /**
     * Entity reader
     *
     * @param config       the config about the reader
     * @param memoryMapped true to indicate index should be stored in memory
     */
    public EntityIndexReaderImpl(final EntityConfiguration config, final boolean memoryMapped) {
        this.config = config;
        this.memoryMapped = memoryMapped;
        initialise();
    }

    /**
     * Entity reader - does not initialise it entirely - careful when using this.
     *
     * @param config the config about the reader
     */
    EntityIndexReaderImpl(final EntityConfiguration config) {
        this.config = config;
    }

    @Override
    public Analyzer getAnalyzer() {
        return this.config.getAnalyzerInstance();
    }

    /**
     * Initialises the index reader
     */
    private void initialise() {
        try {
            openDirectory(this.config, this.memoryMapped);
            if (this.directory != null) {
                this.searcher = new IndexSearcher(this.directory, true);
            }
        } catch (final IOException e) {
            LOGGER.warn("Index not readable - it may not yet have been created.");
            LOGGER.trace("Trace for exception:", e);
        }
    }

    @Override
    public void refresh() {
        close();
        initialise();
    }

    @Override
    public void close() {
        IOUtils.closeQuietly(this.searcher);
        IOUtils.closeQuietly(this.directory);
    }

    /**
     * Gets the best implementation of the directory
     *
     * @param configuration      config
     * @param memoryMapDirectory memory mapped directories
     */
    private void openDirectory(final EntityConfiguration configuration, final boolean memoryMapDirectory) {
        try {
            final URI entityIndexPath = configuration.getLocation();
            final File path = new File(entityIndexPath);
            if (!path.exists()) {
                return;
            }

            if (memoryMapDirectory) {
                this.directory = MMapDirectory.open(path);
            }

            this.directory = FSDirectory.open(path);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read directory", e);
        }
    }

    @Override
    public EntityDoc[] searchExactTermBySingleField(final String fieldName, final int max,
                                                    final String... values) {
        final Query query = getQuery(fieldName, values);
        return search(query, max, null, null);
    }

    @Override
    public EntityDoc[] searchUniqueBySingleField(final String fieldName, final String userLanguage, final String... values) {
        final Query query = getQuery(fieldName, values);
        return search(query, values.length, null, null);
    }

    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value) {
        return search(fieldNames, value, null, null, false, null, null);
    }

    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value, final Sort sort) {
        return search(fieldNames, value, null, sort, false, null, null);
    }

    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value, final Filter filter,
                              final Sort sort, final boolean analyzePrefix) {
        return search(fieldNames, value, filter, sort, analyzePrefix, null, null);
    }

    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value, final Filter strongFilter,
                              final Sort transliterationSort, final boolean analyzePrefix, final Integer maxResults) {
        return search(fieldNames, value, strongFilter, transliterationSort, analyzePrefix, null, maxResults);
    }

    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value, final Filter filter,
                              final Sort sort, final boolean analyzePrefix, final String queryRemainder) {
        return search(fieldNames, value, filter, sort, analyzePrefix, queryRemainder, null);
    }

    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value, final Filter filter,
                              final Sort sort, final boolean analyzePrefix, final String queryRemainder,
                              final Integer maxResults) {
        return search(fieldNames, value, filter, sort, analyzePrefix, queryRemainder, maxResults, true);
    }

    @Override
    public EntityDoc[] search(final String[] fields, final String query, final boolean useOrOperator) {
        return search(fields, query, null, null, false, null, null, useOrOperator);
    }

    @Override
    public EntityDoc[] search(String[] fields, String query, boolean useOrOperator, Sort sort) {
        return search(fields, query, null, sort, false, null, null, useOrOperator);
    }

    // CHECKSTYLE:OFF
    @Override
    public EntityDoc[] search(final String[] fieldNames, final String value, final Filter filter,
                              final Sort sort, final boolean analyzePrefix, final String queryRemainder,
                              final Integer maxResults, final boolean useOrOperatorBetweenValues) {
        // CHECKSTYLE:ON
        final AllResultsCollector collector = new AllResultsCollector();
        Query parsed = null;
        QueryParser parser;
        if (analyzePrefix) {
            parser = new AnalyzedPrefixSearchQueryParser(LUCENE_30, fieldNames,
                    this.config.getAnalyzerInstance());
        } else {
            parser = new MultiFieldQueryParser(LUCENE_30, fieldNames, this.config.getAnalyzerInstance());
        }

        parser.setDefaultOperator(useOrOperatorBetweenValues ? Operator.OR : Operator.AND);

        try {
            if (queryRemainder != null) {
                final StringBuilder sb = new StringBuilder(value.length() + queryRemainder.length() + 1);
                sb.append(value);
                sb.append(' ');
                sb.append(queryRemainder);
                parsed = parser.parse(sb.toString());
            } else {
                parsed = parser.parse(value);
            }

            LOGGER.debug("Search query is [{}]", parsed);

            if (sort != null) {
                final TopFieldDocs search = this.searcher.search(parsed, filter,
                        maxResults == null ? Integer.MAX_VALUE : maxResults, sort);

                return extractDocIds(search);

            } else {
                this.searcher.search(parsed, filter, collector);
                return extractDocIds(collector);
            }
        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query", e);
        } catch (final IOException e) {
            throw new StepInternalException(
                    "Unable to search given query: " + parsed != null ? parsed.toString() : "<unknown>", e);
        }
    }

    @Override
    public Set<String> findSetOfTerms(final boolean exact, String searchTerm, int maxReturned, final String... fieldNames) {
        return findSetOfTermsWithCounts(exact, false, searchTerm, maxReturned, fieldNames).getTerms();
    }

    @Override
    public TermsAndMaxCount findSetOfTermsWithCounts(final boolean exact, final boolean trackMax, String searchTerm, int maxReturned, final String... fieldNames) {
        TermsAndMaxCount hits = new TermsAndMaxCount();
        if (fieldNames.length == 0) {
            hits.setTerms(new HashSet<String>(0));
            return hits;
        }

        if (fieldNames.length == 1) {
            return LuceneUtils.getAllTermsPrefixedWith(exact, trackMax, this.searcher, fieldNames[0], searchTerm, maxReturned);
        }

        hits.setTerms(new HashSet<String>(32));
        for (int ii = 0; ii < fieldNames.length; ii++) {
            final TermsAndMaxCount termsByField = LuceneUtils.getAllTermsPrefixedWith(exact, trackMax, this.searcher, fieldNames[ii], searchTerm, maxReturned);
            hits.getTerms().addAll(termsByField.getTerms());
            hits.setTotalCount(hits.getTotalCount() + termsByField.getTotalCount());
        }

        //total count, is count - the existing ters
        hits.setTotalCount(hits.getTotalCount() - hits.getTerms().size());
        return hits;
    }

    /**
     * Extracts all the results
     *
     * @param results the results that have been collected
     * @return the results
     */
    private EntityDoc[] extractDocIds(final TopDocs results) {
        try {
            final ScoreDoc[] scoreDocs = results.scoreDocs;
            final EntityDoc[] docs = new EntityDoc[scoreDocs.length];
            for (int ii = 0; ii < scoreDocs.length; ii++) {
                docs[ii] = new EntityDoc(this.searcher.doc(scoreDocs[ii].doc));
            }
            return docs;
        } catch (final IOException e) {
            throw new StepInternalException("Unable to extract results", e);
        }

    }

    @Override
    public EntityDoc[] search(final String defaultField, final String querySyntax) {
        final QueryParser parser = getQueryParser(defaultField);
        try {
            return this.search(parser.parse(querySyntax));
        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query " + querySyntax, e);
        }
    }

    @Override
    public QueryParser getQueryParser(final String defaultField) {
        return new QueryParser(LUCENE_30, defaultField, getAnalyzer());
    }

    @Override
    public EntityDoc[] search(final Query query) {
        final AllResultsCollector collector = new AllResultsCollector();
        try {
            LOGGER.debug("Search query is [{}], with filter [{}]", query);
            this.searcher.search(query, collector);
            return extractDocIds(collector);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to search", e);
        }
    }

    /**
     * Extracts the query results into an entity doc
     *
     * @param collector the collector with the results
     * @return all the entity documents
     */
    private EntityDoc[] extractDocIds(final AllResultsCollector collector) {
        try {
            final List<Integer> docIds = collector.getDocIds();
            final EntityDoc[] docs = new EntityDoc[docIds.size()];
            for (int ii = 0; ii < docIds.size(); ii++) {
                docs[ii] = new EntityDoc(this.searcher.doc(docIds.get(ii)));
            }
            return docs;
        } catch (final IOException e) {
            throw new StepInternalException("Unable to extract results from query", e);
        }
    }

    @Override
    public EntityDoc[] search(final Query query, final int max, final Sort sortField, final Filter filter) {
        LOGGER.debug("Search query is [{}]", query);
        try {
            final TopDocs search;
            if (sortField != null) {
                search = this.searcher.search(query, filter, max, sortField);
            } else {
                search = this.searcher.search(query, filter, max);
            }

            final EntityDoc[] results = new EntityDoc[search.scoreDocs.length];
            for (int ii = 0; ii < search.scoreDocs.length; ii++) {
                results[ii] = new EntityDoc(this.searcher.doc(search.scoreDocs[ii].doc));
            }

            return results;
        } catch (final IOException e) {
            throw new StepInternalException("Failed to search", e);
        }
    }

    /**
     * Returns a query that matches the provided terms
     *
     * @param fieldName the field name
     * @param values    the values passed in
     * @return query
     */
    private Query getQuery(final String fieldName, final String... values) {
        if (values.length == 1) {
            return new TermQuery(new Term(fieldName, values[0]));
        }
        final Term t = new Term(fieldName);
        final Term[] ts = new Term[values.length];
        for (int ii = 0; ii < ts.length; ii++) {
            ts[ii] = t.createTerm(values[ii]);
        }

        final BooleanQuery booleanQuery = new BooleanQuery();
        for (final Term term : ts) {
            booleanQuery.add(new TermQuery(term), Occur.SHOULD);
        }

        return booleanQuery;
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String querySyntax,
                                          final Filter filter) {
        return searchSingleColumn(fieldName, querySyntax, Operator.OR, false, null, filter);
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String querySyntax, final Sort sort) {
        return searchSingleColumn(fieldName, querySyntax, Operator.OR, false, sort);
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String querySyntax,
                                          final Operator op, final boolean allowLeadingWildcard) {
        return searchSingleColumn(fieldName, querySyntax, op, allowLeadingWildcard, null);
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String query,
                                          final boolean useOrOperator, Sort sort) {
        return searchSingleColumn(fieldName, query, useOrOperator ? Operator.OR : Operator.AND, false, sort);
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String querySyntax) {
        return searchSingleColumn(fieldName, querySyntax, Operator.OR, false);
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String querySyntax,
                                          final Operator op, final boolean allowLeadingWildcard, final Sort sort) {
        return searchSingleColumn(fieldName, querySyntax, op, allowLeadingWildcard, sort, null);
    }

    @Override
    public EntityDoc[] searchSingleColumn(final String fieldName, final String querySyntax,
                                          final Operator op, final boolean allowLeadingWildcard, final Sort sort, final Filter filter) {
        final QueryParser parser = new QueryParser(LUCENE_30, fieldName, this.getAnalyzer());
        parser.setDefaultOperator(op);
        parser.setAllowLeadingWildcard(allowLeadingWildcard);

        try {
            final Query query = parser.parse(querySyntax);
            return search(query, Integer.MAX_VALUE, sort, filter);

        } catch (final ParseException e) {
            throw new StepInternalException("Unable to parse query", e);
        }
    }

    @Override
    public List<String> getAnalyzedTokens(final String fieldName, final String input, boolean escapeToken) {
        final TokenStream tokens = this.getAnalyzer().tokenStream(fieldName, new StringReader(input));

        //construct query to search for both stepGloss and translations - the last word gets a trailing wildcard
        //query will be in the form of +(gloss:a trans:a) +(gloss:b* trans:b*) +strong:H*
        List<String> tokenItems = new ArrayList<String>(2);
        try {
            tokens.reset();
            TermAttribute termAttribute = tokens.getAttribute(TermAttribute.class);
            while (tokens.incrementToken()) {
                String term = termAttribute.term();
                if (escapeToken) {
                    term = QueryParser.escape(term);
                }
                tokenItems.add(term);
            }
        } catch (IOException e) {
            throw new StepInternalException("Unable to parse query", e);
        } finally {
            try {
                tokens.end();
                tokens.close();
            } catch (IOException e) {
                LOGGER.trace("Unable to properly close stream.");
            }
        }
        return tokenItems;
    }

    @Override
    public EntityDoc[] search(BooleanQuery query, Filter filter, TopFieldCollector collector) {
        try {
            this.searcher.search(query, filter, collector);
            return extractDocIds(collector.topDocs());
        } catch (IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    @Override
    public QueryParser getQueryParser(final boolean analyzePrefix, final boolean useOrOperatorBetweenValues, final String... defaultFields) {
        QueryParser parser;
        if (analyzePrefix) {
            parser = new AnalyzedPrefixSearchQueryParser(LUCENE_30, defaultFields,
                    this.config.getAnalyzerInstance());
        } else if (defaultFields.length == 1) {
            parser = new QueryParser(LUCENE_30, defaultFields[0], this.config.getAnalyzerInstance());
        } else {
            parser = new MultiFieldQueryParser(LUCENE_30, defaultFields, this.config.getAnalyzerInstance());
        }
        parser.setDefaultOperator(useOrOperatorBetweenValues ? Operator.OR : Operator.AND);
        return parser;
    }

    /**
     * @param searcher the searcher to set
     */
    void setSearcher(final IndexSearcher searcher) {
        this.searcher = searcher;
    }
}
