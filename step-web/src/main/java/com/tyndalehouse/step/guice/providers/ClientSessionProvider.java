package com.tyndalehouse.step.guice.providers;

import com.google.inject.Inject;
import com.google.inject.servlet.RequestScoped;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;
import com.tyndalehouse.step.models.WebSessionImpl;

import javax.inject.Named;
import javax.inject.Provider;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.Set;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

/**
 * This object is request-scoped, meaning it is new for every request. It is a way to return the jsessionId at
 * runtime
 */
@RequestScoped
public class ClientSessionProvider implements Provider<ClientSession> {
    private static final String COOKIE_REQUEST_PARAM = "lang";
    private final HttpSession session;
    private final HttpServletRequest request;
    private final Set<String> availableLanguages;

    /**
     * We inject the HttpSession in so that we can reference the jSessionId in the cookie
     * 
     * @param request the http request
     * @param session the http session containing the jSessionId
     * @param availableLanguages the languages the user interface is available in
     */
    @Inject
    public ClientSessionProvider(final HttpServletRequest request, final HttpSession session,
                                 @Named("app.languages.available") final String availableLanguages) {
        this.request = request;
        this.session = session;
        this.availableLanguages = new HashSet<String>(Arrays.asList(split(availableLanguages, ",")));
    }

    @Override
    public ClientSession get() {
        final Locale locale = getLocale();
        final String remoteAddr = this.request.getRemoteAddr();
        final String id = this.session.getId();
        try {
            return new WebSessionImpl(id, locale.getISO3Language(), remoteAddr, locale, this.request);
        } catch(MissingResourceException ex) {
            //attemping to set to unsupported Locale... So let's instead set to english
            return new WebSessionImpl(id, Locale.ENGLISH.getISO3Language(), remoteAddr, Locale.ENGLISH, this.request);
        }
    }

    /**
     * Gets the locale.
     * 
     * @return the locale
     */
    private Locale getLocale() {
        if (isNotBlank(this.request.getParameter(COOKIE_REQUEST_PARAM))) {
            return ContemporaryLanguageUtils
                    .getLocaleFromTag(this.request.getParameter(COOKIE_REQUEST_PARAM));
        }

        // take from session next
        if (this.session != null) {
            final Cookie[] cookies = this.request.getCookies();
            if (cookies != null) {
                for (final Cookie c : cookies) {
                    if (COOKIE_REQUEST_PARAM.equals(c.getName())) {
                        return ContemporaryLanguageUtils.getLocaleFromTag(c.getValue());
                    }
                }
            }
        }

        // otherwise the first browser language we have a translation for, e.g. "ca, es" gives "es"
        for (final Locale browserLocale : Collections.list(this.request.getLocales())) {
            if (isAvailable(browserLocale)) {
                return browserLocale;
            }
        }
        return Locale.ENGLISH;
    }

    private boolean isAvailable(final Locale locale) {
        String language = locale.getLanguage();
        if ("iw".equals(language)) {
            language = "he";
        } else if ("in".equals(language)) {
            language = "id";
        }
        return this.availableLanguages.contains(language) ||
                this.availableLanguages.contains(language + "_" + locale.getCountry());
    }
}
