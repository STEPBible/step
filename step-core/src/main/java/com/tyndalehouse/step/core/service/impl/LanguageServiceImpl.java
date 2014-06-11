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

import java.awt.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.Language;
import com.tyndalehouse.step.core.service.LanguageService;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;

/**
 * A simple service that returns all the languages that are available
 */
@Singleton
public class LanguageServiceImpl implements LanguageService {
    private final Map<Locale, List<Language>> languages = new HashMap<Locale, List<Language>>();
    private final Set<String> languageCodes;
    private final Provider<ClientSession> clientSessionProvider;
    private final Set<String> completedLanguages;
    private final Set<String> partialLanguages;

    /**
     * Instantiates a new language service impl.
     * 
     * @param languageCodes the languages
     * @param clientSessionProvider the client session provider
     */
    @Inject
    public LanguageServiceImpl(
            @Named("app.languages.available") final String languageCodes,
            @Named("app.languages.completed") final String completedLanguages,
            @Named("app.languages.partial") final String partialLanguages,
            final Provider<ClientSession> clientSessionProvider) {
        this.languageCodes = getLanguageCodes(languageCodes);
        this.completedLanguages = getLanguageCodes(completedLanguages);
        this.partialLanguages = getLanguageCodes(partialLanguages);
        this.clientSessionProvider = clientSessionProvider;
    }

    private Set<String> getLanguageCodes(final String languageCodes) {
        if(StringUtils.isBlank(languageCodes)) {
            return new HashSet<String>();
        } else {

            return new HashSet<String>(Arrays.asList(StringUtils.split(languageCodes, ",")));
        }
    }

    /**
     * Gets the available languages.
     * 
     * @return the available languages
     */
    @Override
    public List<Language> getAvailableLanguages() {
        return getLanguagesForSession();
    }

    @Override
    public boolean isSupported(final String langParam, final String country) {
        if(langParam.equalsIgnoreCase("iw")) {
            return this.languageCodes.contains("he");
        } else if(langParam.equalsIgnoreCase("in")) {
             return this.languageCodes.contains("id");
        } else {
            return this.languageCodes.contains(langParam) || this.languageCodes.contains(StringUtils.isNotBlank(country) ? langParam + "-" + country : langParam);
        }
    }

    @Override
    public boolean isCompleted(final String langParam) {
        return this.completedLanguages.contains(langParam);
    }


    /**
     * Sets up the languages.
     * 
     * @return the list
     */
    private List<Language> getLanguagesForSession() {
        final Locale currentLocale = this.clientSessionProvider.get().getLocale();

        List<Language> configuredLanguages = this.languages.get(currentLocale);
        if(configuredLanguages == null) {
            synchronized (this) {
                configuredLanguages = new ArrayList<Language>(64);

                Language currentLanguage = null;
                for (final String code : this.languageCodes) {
                    final Locale locale = ContemporaryLanguageUtils.getLocaleFromTag(code);
                    final Language l = new Language();
                    l.setCode(code);

                    // attempt to make first letter upper case
                    l.setUserLocaleLanguageName(getLanguageName(currentLocale, locale));
                    l.setOriginalLanguageName(getLanguageName(locale, locale));
                    l.setComplete(this.completedLanguages.contains(code));
                    l.setPartial(this.partialLanguages.contains(code));
                    configuredLanguages.add(l);

                    if (currentLocale.equals(locale)) {
                        currentLanguage = l;
                    }
                }

                sortLanguages(configuredLanguages);
                this.languages.put(currentLocale, configuredLanguages);
            }
        }
        return configuredLanguages;
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
        
        if("bfo".equalsIgnoreCase(locale.getLanguage())) {
            return "Birifor";
        }

        if (!"".equals(locale.getCountry())) {
            if ("TW".equals(locale.getCountry())) {
                extra = "Traditional";
            } else if("bfo".equalsIgnoreCase(locale.getISO3Language())) {
                
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
     * @param languages a list of languages to be sorted
     */
    private void sortLanguages(final List<Language> languages) {
        // sort list of languages
        Collections.sort(languages, new Comparator<Language>() {

            @Override
            public int compare(final Language o1, final Language o2) {
                return o1.getUserLocaleLanguageName().compareTo(o2.getUserLocaleLanguageName());
            }
        });
    }
}
