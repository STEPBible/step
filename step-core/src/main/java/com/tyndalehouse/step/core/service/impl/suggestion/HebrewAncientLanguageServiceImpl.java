package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;

import javax.inject.Inject;

/**
 * @author chrisburrell
 */
public class HebrewAncientLanguageServiceImpl extends AncientLanguageSuggestionServiceImpl {
    @Inject
    public HebrewAncientLanguageServiceImpl(final EntityManager entityManager) {
        super(false, entityManager);
    }
}
