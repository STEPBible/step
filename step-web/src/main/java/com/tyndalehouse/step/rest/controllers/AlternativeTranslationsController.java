package com.tyndalehouse.step.rest.controllers;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.meanings.VersionsData;
import com.tyndalehouse.step.core.service.impl.AlternativeTranslationsServiceImpl;

/**
 * The Class AlternativeTranslationsController.
 */
@Singleton
public class AlternativeTranslationsController {
    private final AlternativeTranslationsServiceImpl alternativeTranslations;

    /**
     * Instantiates a new alternative translations controller.
     * 
     * @param alternativeTranslations the alternative translations
     */
    @Inject
    public AlternativeTranslationsController(final AlternativeTranslationsServiceImpl alternativeTranslations) {
        this.alternativeTranslations = alternativeTranslations;
    }

    /**
     * Gets the.
     * 
     * @param passage the passage
     * @return the versions data
     */
    public VersionsData get(final String passage) {
        return this.alternativeTranslations.get(passage);
    }
}
