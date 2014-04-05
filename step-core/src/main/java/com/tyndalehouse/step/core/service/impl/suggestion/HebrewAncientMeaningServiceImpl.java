package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;

import javax.inject.Inject;

/**
 * Provides terms for Greek and Hebrew glosses
 * 
 * @author chrisburrell
 */
public class HebrewAncientMeaningServiceImpl extends AncientMeaningSuggestionServiceImpl {
    @Inject
    public HebrewAncientMeaningServiceImpl(final EntityManager entityManager) {
        super(false, entityManager);
    }
}
