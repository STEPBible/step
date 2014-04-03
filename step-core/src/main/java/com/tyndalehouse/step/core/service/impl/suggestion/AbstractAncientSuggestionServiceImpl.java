package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.models.search.SuggestionType;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.PrefixQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopFieldCollector;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.convertToSuggestion;

/**
 * @author chrisburrell
 */
public abstract class AbstractAncientSuggestionServiceImpl implements SingleTypeSuggestionService<EntityDoc, TopFieldCollector> {
    private final EntityIndexReader reader;
    private Sort sort;
    private Filter filter;

    protected AbstractAncientSuggestionServiceImpl(EntityIndexReader reader, final Filter filter, final Sort sort) {
        this.reader = reader;
        this.filter = filter;
        this.sort = sort;
    }

    @Override
    public EntityDoc[] getExactTerms(final String form, final int max) {
        return getTerms(form, max, true);
    }

    @Override
    public EntityDoc[] collectNonExactMatches(final TopFieldCollector collector, final String form, final EntityDoc[] alreadyRetrieved, final int leftToCollect) {
        final List<String> tokenItems = this.reader.getAnalyzedTokens("stepGloss", form, true);
        final BooleanQuery query = this.getQuery(tokenItems, false);

        if (alreadyRetrieved != null) {
            for (EntityDoc doc : alreadyRetrieved) {
                //make sure we don't retrieve docs that have already been retrieved
                query.add(new TermQuery(new Term("strongNumber", doc.get("strongNumber"))), BooleanClause.Occur.MUST_NOT);
            }
        }

        final EntityDoc[] search = this.reader.search(query, this.filter, collector);
        //we're interested in the results if we wanted more, or if we're retrieving a single result (cos we don't want to display grouping)
        if (leftToCollect > 0 || collector.getTotalHits() == 1) {
            return search;
        }

        //not really interested, just interested in the count
        return new EntityDoc[0];
    }

    @Override
    public List<? extends PopularSuggestion> convertToSuggestions(
            final EntityDoc[] docs,
            final EntityDoc[] extraDocs) {
        final List<LexiconSuggestion> suggestions = this.convertDefinitionDocsToSuggestion(docs);
        suggestions.addAll(this.convertDefinitionDocsToSuggestion(extraDocs));
        return suggestions;
    }

    private EntityDoc[] getTerms(final String form, final int max, boolean exact) {
        final List<String> tokenItems = this.reader.getAnalyzedTokens("stepGloss", form, true);

        if (tokenItems.size() == 0) {
            return new EntityDoc[0];
        }

        final BooleanQuery masterQuery = getQuery(tokenItems, exact);
        return this.reader.search(masterQuery, max, getSort(), this.filter);
    }

    protected Query getExactOrPrefixQuery(final boolean exact, final Term stepGlossTerm) {
        return exact ? new TermQuery(stepGlossTerm) : new PrefixQuery(stepGlossTerm);
    }

    /**
     * Takes EntityDocs representing Definition entities and converts them to a suggestion
     *
     * @param results the results
     * @return true
     */
    private List<LexiconSuggestion> convertDefinitionDocsToSuggestion(final EntityDoc[] results) {
        final List<LexiconSuggestion> suggestions = new ArrayList<LexiconSuggestion>();
        if (results != null) {
            for (final EntityDoc def : results) {
                suggestions.add(convertToSuggestion(def));
            }
        }
        return suggestions;
    }

    protected abstract BooleanQuery getQuery(final List<String> tokenItems, final boolean b);

    @Override
    public Sort getSort() {
        return this.sort;
    }

    @Override
    public TopFieldCollector getNewCollector(int leftToCollect) {
        try {
            return TopFieldCollector.create(getSort(), leftToCollect > 0 ? leftToCollect : 1, false, false, false, false);
        } catch (IOException ex) {
            throw new StepInternalException(ex.getMessage(), ex);
        }
    }

    /**
     * @return the reader associated with this suggestion service
     */
    protected EntityIndexReader getReader() {
        return this.reader;
    }
}
