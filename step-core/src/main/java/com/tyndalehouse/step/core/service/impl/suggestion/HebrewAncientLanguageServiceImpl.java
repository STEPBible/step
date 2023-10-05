package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;

import javax.inject.Inject;

public class HebrewAncientLanguageServiceImpl extends AncientLanguageSuggestionServiceImpl {
    @Inject
    public HebrewAncientLanguageServiceImpl(final EntityManager entityManager) {
        super(false, entityManager);
    }
}
