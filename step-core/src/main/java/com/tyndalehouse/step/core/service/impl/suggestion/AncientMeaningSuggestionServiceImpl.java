package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.service.helpers.OriginalWordUtils;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;

/**
 * @author chrisburrell
 */
public abstract class AncientMeaningSuggestionServiceImpl extends FieldBasedMeaningSuggestionServiceImpl {
    public static final Sort GLOSS_SORT = new Sort(new SortField("stepGloss", SortField.STRING_VAL));
    private static final String[] ANCIENT_MEANING_FIELDS = new String[]{"stepGloss", "translations"};

    public AncientMeaningSuggestionServiceImpl(final boolean isGreek, final EntityManager entityManager) {
        super(entityManager.getReader("definition"), OriginalWordUtils.getFilter(isGreek), GLOSS_SORT);
    }

    @Override
    public String[] getFields() {
        return ANCIENT_MEANING_FIELDS;
    }
}
