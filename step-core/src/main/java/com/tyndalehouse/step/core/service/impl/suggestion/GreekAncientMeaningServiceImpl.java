package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;

import javax.inject.Inject;

/**
 * Provides terms for Greek unicode or transliterations
 * 
 * @author chrisburrell
 */
public class GreekAncientMeaningServiceImpl extends AncientMeaningSuggestionServiceImpl {
    @Inject
    public GreekAncientMeaningServiceImpl(final EntityManager entityManager) {
        super(true, entityManager);
    }
}
