package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityIndexReader;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Sort;

import java.util.List;

/**
 * @author chrisburrell
 */
public abstract class FieldBasedMeaningSuggestionServiceImpl extends AbstractAncientSuggestionServiceImpl {
    public FieldBasedMeaningSuggestionServiceImpl(final EntityIndexReader reader, final Filter filter, 
                                                  final Sort sort, final Sort popularSort) {
        super(reader, filter, sort, popularSort);
    }

    @Override
    protected BooleanQuery getQuery(final List<String> tokenItems, final boolean exact) {
        final BooleanQuery masterQuery = new BooleanQuery();
        final String[] fields = getFields();
        for (int ii = 0; ii < tokenItems.size(); ii++) {
            for(int jj = 0 ; jj < fields.length; jj++) {
                final Term term = new Term(fields[jj], tokenItems.get(ii));
                final Query clause = getExactOrPrefixQuery(exact, term);
                masterQuery.add(new BooleanClause(clause, BooleanClause.Occur.SHOULD));
                
            }
        }
        return masterQuery;
    }

    public abstract String[] getFields();
}
