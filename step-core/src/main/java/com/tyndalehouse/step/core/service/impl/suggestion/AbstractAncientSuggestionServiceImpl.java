package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.PopularSuggestion;
import com.tyndalehouse.step.core.service.SingleTypeSuggestionService;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Filter;
import org.apache.lucene.search.PrefixQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopFieldCollector;

import javax.swing.text.Highlighter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.List;

import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.convertToSuggestion;

/**
 * @author chrisburrell
 */
public abstract class AbstractAncientSuggestionServiceImpl implements SingleTypeSuggestionService<EntityDoc, TopFieldCollector> {
    private final EntityIndexReader reader;
    private final Sort popularSort;
    private final Sort sort;
    private final Filter filter;


    protected AbstractAncientSuggestionServiceImpl(EntityIndexReader reader, final Filter filter, final Sort sort, final Sort popularSort) {
        this.reader = reader;
        this.filter = filter;
        this.sort = sort;
        this.popularSort = popularSort;
    }

    @Override
    public EntityDoc[] getExactTerms(SuggestionContext context, final int max, final boolean popularSort) {
        return context.getInput().indexOf(' ') != -1 ? new EntityDoc[0] : getTerms(context.getInput(), max, true, popularSort);
    }

    @Override
    public EntityDoc[] collectNonExactMatches(final TopFieldCollector collector, final SuggestionContext context, final EntityDoc[] alreadyRetrieved,
                                              final int leftToCollect) {
        if(context.getInput().indexOf(' ') != -1) {
            return new EntityDoc[0];
        }


        final BooleanQuery query = this.getQuery(context.getInput(), false);

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

    private EntityDoc[] getTerms(final String form, final int max, boolean exact, final boolean popularSort) {

        final BooleanQuery masterQuery = getQuery(form, exact);
        return this.reader.search(masterQuery, max, getSort(popularSort), this.filter);
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
                suggestions.add(convertToSuggestion(def, null));
            }
        }
        return suggestions;
    }

    protected abstract BooleanQuery getQuery(String form, boolean exact);

    protected Sort getSort(boolean popular) {
        return popular ? this.popularSort : this.sort;
    }

    @Override
    public TopFieldCollector getNewCollector(final int leftToCollect, final boolean popularSort) {
        try {
            return TopFieldCollector.create(getSort(popularSort), leftToCollect > 0 ? leftToCollect : 1, false, false, false, false);
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
