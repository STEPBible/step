package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.Language;
import com.tyndalehouse.step.core.service.LanguageService;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;
import java.util.*;

import static com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils.capitaliseFirstLetter;

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
        } else if(langParam.equalsIgnoreCase("aa")) {
            return true;
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
                return o1.getOriginalLanguageName().compareTo(o2.getOriginalLanguageName());
            }
        });
    }
}
