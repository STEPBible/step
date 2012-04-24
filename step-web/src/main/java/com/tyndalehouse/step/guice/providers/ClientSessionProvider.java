package com.tyndalehouse.step.guice.providers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.servlet.RequestScoped;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.models.WebSessionImpl;

/**
 * This object is request-scoped, meaning it is new for every request. It is a way to return the jsessionId at
 * runtime
 * 
 * @author Chris
 * 
 */
@RequestScoped
public class ClientSessionProvider implements Provider<ClientSession> {
    private final HttpSession session;
    private final HttpServletRequest request;

    /**
     * We inject the HttpSession in so that we can reference the jSessionId in the cookie
     * 
     * @param request the http request
     * @param session the http session containing the jSessionId
     */
    @Inject
    public ClientSessionProvider(final HttpServletRequest request, final HttpSession session) {
        this.request = request;
        this.session = session;
    }

    @Override
    public ClientSession get() {
        // check if this has the IP address in it
        return new WebSessionImpl(this.session.getId(), this.request.getLocale().getISO3Language());
    }
}
