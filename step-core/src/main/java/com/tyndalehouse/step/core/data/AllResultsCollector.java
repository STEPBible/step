package com.tyndalehouse.step.core.data;

import org.apache.lucene.index.IndexReader;
import org.apache.lucene.search.Collector;
import org.apache.lucene.search.Scorer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Simply accepts all results into a list
 */
public class AllResultsCollector extends Collector {
    private final List<Integer> docIds = new ArrayList<Integer>(32);

    @Override
    public void setScorer(final Scorer scorer) throws IOException {
        // no scorer implementation
    }

    @Override
    public void collect(final int doc) throws IOException {
        this.docIds.add(doc);
    }

    @Override
    public void setNextReader(final IndexReader reader, final int docBase) throws IOException {
        // not implemented
    }

    @Override
    public boolean acceptsDocsOutOfOrder() {
        return true;
    }

    /**
     * @return the docIds
     */
    public List<Integer> getDocIds() {
        return this.docIds;
    }
}
