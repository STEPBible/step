package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.Language;

import java.util.List;

/**
 * The Class LanguageService.
 */
public interface LanguageService {

    /**
     * Gets the available languages, which are at least partly translated
     *
     * @return the available languages
     */
    List<Language> getAvailableLanguages();

    /**
     * true if a language is supported. This method is faster than getAvailableLanguages().contains(en)
     *
     * @param langParam the language parameter
     * @param country   the country that is associated with the locale
     * @return true to indicate it is supported.
     */
    boolean isSupported(String langParam, String country);

    /**
     * @param langParam the language parameter
     * @return true if the language has bee completed
     */
    boolean isCompleted(String langParam);
}
