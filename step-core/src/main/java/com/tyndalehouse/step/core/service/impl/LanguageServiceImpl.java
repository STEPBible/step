/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils.capitaliseFirstLetter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.Language;
import com.tyndalehouse.step.core.service.LanguageService;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;
import com.yammer.metrics.annotation.Timed;

/**
 * A simple service that returns all the languages that are available
 */
@Singleton
public class LanguageServiceImpl implements LanguageService {
    private final String languageCodes;
    private final Provider<ClientSession> clientSessionProvider;

    /**
     * Instantiates a new language service impl.
     * 
     * @param languageCodes the languages
     * @param clientSessionProvider the client session provider
     */
    @Inject
    public LanguageServiceImpl(@Named("app.languages.available") final String languageCodes,
            final Provider<ClientSession> clientSessionProvider) {
        this.languageCodes = languageCodes;
        this.clientSessionProvider = clientSessionProvider;
    }

    /**
     * Gets the available languages.
     * 
     * @return the available languages
     */
    @Override
    @Timed(name = "language-list-creation", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public List<Language> getAvailableLanguages() {
        return init();
    }

    /**
     * Sets up the languages.
     * 
     * @return the list
     */
    private List<Language> init() {
        final List<Language> languages = new ArrayList<Language>(128);
        final String[] codes = StringUtils.split(this.languageCodes, ",");
        final Locale currentLocale = this.clientSessionProvider.get().getLocale();
        Language currentLanguage = null;

        for (final String code : codes) {
            final Locale locale = ContemporaryLanguageUtils.getLocaleFromTag(code);
            final Language l = new Language();
            l.setCode(code);

            // attempt to make first letter upper case
            l.setUserLocaleLanguageName(getLanguageName(currentLocale, locale));
            l.setOriginalLanguageName(getLanguageName(locale, locale));
            languages.add(l);

            if (currentLocale.equals(locale)) {
                currentLanguage = l;
            }
        }

        sortLanguages(currentLanguage, languages);
        return languages;
    }

    /**
     * Gets the language name, with the country if applicable
     * 
     * @param currentLocale the current locale
     * @param locale the locale
     * @return the language name
     */
    private String getLanguageName(final Locale currentLocale, final Locale locale) {
        String extra = "";
        if (!"".equals(locale.getCountry())) {
            if ("TW".equals(locale.getCountry())) {
                extra = "Traditional";
            } else {
                extra = locale.getDisplayCountry(currentLocale);
            }

            return String.format("%s, %s", capitaliseFirstLetter(locale.getDisplayLanguage(currentLocale)),
                    capitaliseFirstLetter(extra));
        }

        return capitaliseFirstLetter(locale.getDisplayLanguage(currentLocale));
    }

    /**
     * Sort languages by their original language name, and puts the current locale language at the top.
     * 
     * @param currentLanguage the current language
     * @param languages
     */
    private void sortLanguages(final Language currentLanguage, final List<Language> languages) {
        // sort list of languages
        Collections.sort(languages, new Comparator<Language>() {

            @Override
            public int compare(final Language o1, final Language o2) {
                // CHECKSTYLE:OFF
                if (o1.equals(currentLanguage)) {
                    return -1;
                }
                // CHECKSTYLE:ONE

                return o1.getOriginalLanguageName().compareTo(o2.getOriginalLanguageName());
            }
        });
    }
}
