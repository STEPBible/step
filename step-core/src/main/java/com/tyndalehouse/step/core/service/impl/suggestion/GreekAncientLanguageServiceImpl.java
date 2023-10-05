package com.tyndalehouse.step.core.service.impl.suggestion;

import com.tyndalehouse.step.core.data.EntityManager;

import javax.inject.Inject;

public class GreekAncientLanguageServiceImpl extends AncientLanguageSuggestionServiceImpl {
    @Inject
    public GreekAncientLanguageServiceImpl(final EntityManager entityManager) {
        super(true, entityManager);
    }
}
